import { Application, Container, Sprite } from "pixi.js"
import type { Point2D } from "./Point2D.js"
import { Side } from "./Side.js"
import type { TilePosition } from "./TilePosition.js"
import { calculateDistance } from "./calculateDistance.js"
import { TILE_HEIGHT, TILE_WIDTH } from "./config.js"
import { findClosest } from "./findClosest.js"
import type { Database } from "./persistence.js"
import { CharacterWithOneSpriteSheet } from "./CharacterWithOneSpritesheet.js"
import { Direction } from "./Direction.js"
import { settings } from "@pixi/tilemap"
import { CompositeTilemap } from "@pixi/tilemap"
import { TileMap } from "./TileMap/TileMap.js"
import * as PIXI from "pixi.js"
import { Location } from "@sanjo/game-engine/Location.js"
import {
  Option,
  Dialog,
  type AskForNumberOptions,
  type AskForNumberReturnType,
} from "@sanjo/game-engine/Dialog.js"

export const numberOfTilesPerRow = 64
export const numberOfTilesPerColumn = 65
export const mapWidth = numberOfTilesPerRow * TILE_WIDTH
export const mapHeight = numberOfTilesPerColumn * TILE_HEIGHT

export class Game<T> {
  server: T
  database: Database
  man: CharacterWithOneSpriteSheet | undefined | null = null
  #objectInHand: Sprite | undefined | null = null
  app: Application
  #walkableInFrom: Side[]
  map: TileMap | null = null
  walkable: Walkable = new Walkable()
  layers: (CompositeTilemap | Container)[] = []
  #canCharacterMove: boolean = true
  money: number = 0
  isInteracting: boolean = false

  constructor(server: T, database: Database) {
    this.server = server
    this.database = database
    this.app = new Application({
      resizeTo: window,
    })

    this.#walkableInFrom = new Array(mapWidth * mapHeight)

    for (let y = 0; y < numberOfTilesPerColumn; y++) {
      for (let x = 0; x < numberOfTilesPerRow; x++) {
        this.#walkableInFrom[this.calculateIndex({ row: y, column: x })] =
          Side.Top | Side.Right | Side.Bottom | Side.Left
      }
    }
  }

  lowerMoneyBy(amount: number) {
    this.money = Math.max(this.money - amount, 0)
  }

  async initialize(): Promise<void> {
    settings.use32bitIndex = true
    this.man = new CharacterWithOneSpriteSheet("character.png", this.app.stage)
    this.man!.x = 32
    this.man!.y = 32
    await this.man.loadSpriteSheet()
    this.layers[3].addChild(this.man.sprite)

    await this.database.saveState(this.app)

    this.updateViewport()
    // this.updateObjectInHandPosition()

    const keyStates = new Map([
      ["ArrowLeft", false],
      ["ArrowRight", false],
      ["ArrowUp", false],
      ["ArrowDown", false],
    ])

    window.addEventListener("keydown", async (event) => {
      if (keyStates.has(event.code)) {
        event.preventDefault()
        keyStates.set(event.code, true)
      }

      if (!this.isInteracting) {
        if (event.code === "Space" || event.code === "Enter") {
          event.preventDefault()
          if (this.#objectInHand) {
            this.#objectInHand = null
          } else {
            const object = this.findClosestInteractableObject()
            if (object) {
              this.isInteracting = true
              await object.interact(this.man!)
              this.isInteracting = false
            }
          }
        }
      }
    })

    window.addEventListener("keyup", function (event) {
      if (keyStates.has(event.code)) {
        keyStates.set(event.code, false)
      }
    })

    this.app.ticker.add((delta) => {
      if (this.#canCharacterMove) {
        const left = keyStates.get("ArrowLeft")
        const right = keyStates.get("ArrowRight")
        const up = keyStates.get("ArrowUp")
        const down = keyStates.get("ArrowDown")

        const isStillPressedInDirection =
          this.man!.direction !== Direction.None &&
          ((this.man!.direction === Direction.Left && left) ||
            (this.man!.direction === Direction.Right && right) ||
            (this.man!.direction === Direction.Up && up) ||
            (this.man!.direction === Direction.Down && down))

        if (
          this.man!.direction === Direction.None ||
          !isStillPressedInDirection
        ) {
          if (down && !up) {
            this.man!.direction = Direction.Down
          } else if (up && !down) {
            this.man!.direction = Direction.Up
          } else if (left && !right) {
            this.man!.direction = Direction.Left
          } else if (right && !left) {
            this.man!.direction = Direction.Right
          }
        }

        const newPosition = { x: this.man!.x, y: this.man!.y }

        if (left && !right) {
          newPosition.x -= delta
        } else if (right && !left) {
          newPosition.x += delta
        }

        if (up && !down) {
          newPosition.y -= delta
        } else if (down && !up) {
          newPosition.y += delta
        }

        const hasYChanged = newPosition.y !== this.man!.y
        const hasPositionChanged = newPosition.x !== this.man!.x || hasYChanged

        if (hasPositionChanged) {
          this.man!.isMoving = true

          let x = newPosition.x
          let y = newPosition.y
          const radius = 12
          if (left && !right) {
            x -= radius
          } else if (right && !left) {
            x += radius
          }
          if (up && !down) {
            y -= radius
          }

          const tile = {
            row: Math.floor(y / this.map!.tileSize.height),
            column: Math.floor(x / this.map!.tileSize.width),
          }

          if (this.walkable.isWalkableAt(tile.row, tile.column)) {
            this.man!.x = newPosition.x
            this.man!.y = newPosition.y
            if (hasYChanged) {
              this.updateManAndObjectInHandIndex()
            }
            this.updateObjectInHandPosition()
            this.updateViewport()
            // this.database.saveObject(this.man!)

            const entityOver = this.map.entities.find(
              (entity) =>
                this.man!.x >= entity.column * this.map!.tileSize.width &&
                this.man!.x <
                  entity.column * this.map!.tileSize.width +
                    this.map!.tileSize.width &&
                this.man!.y >= entity.row * this.map!.tileSize.height &&
                this.man!.y <
                  entity.row * this.map!.tileSize.height +
                    this.map!.tileSize.height,
            )
            if (entityOver) {
              entityOver.onOver.next(null)
            }
          }
        } else {
          this.man!.isMoving = false
        }
      }
    })
  }

  public async loadMap(mapFilePath: string): Promise<void> {
    const response = await fetch(mapFilePath)
    const stream = createDecompressedStream(response.body)
    const content = await readReadableStreamAsUTF8(stream)
    const map = parseJSONTileMap(content)

    const tileSetToTexture = new Map<number, PIXI.Texture>()

    const tileSets = []

    for (const [index, tileSet] of Object.entries(map.tileSets)) {
      const image = await createImage(tileSet.content)
      const baseTexture = new PIXI.BaseTexture(image)
      const texture = new PIXI.Texture(baseTexture)
      tileSets.push(texture)
      tileSetToTexture.set(parseInt(index, 10), texture)
    }

    this.map = map
    this.layers = []
    this.app.stage.removeChildren()

    for (
      let levelNumber = 1;
      levelNumber <= Math.min(map.tiles.length - 1, 2);
      levelNumber++
    ) {
      const level = map.tiles[levelNumber]
      const tileMap = new CompositeTilemap()
      tileMap.tileset(tileSets)
      this.app.stage.addChild(tileMap)
      for (const [position, tile] of level.entries()) {
        if (tile) {
          const texture = tileSetToTexture.get(tile.tileSet)
          const x = Number(position.column) * map.tileSize.width
          const y = Number(position.row) * map.tileSize.height
          const options = {
            u: tile.x,
            v: tile.y,
            tileWidth: map.tileSize.width,
            tileHeight: map.tileSize.height,
          }
          tileMap.tile(texture, x, y, options)
        }
      }
      this.layers[levelNumber] = tileMap
    }

    if (map.tiles.length >= 4) {
      for (
        let levelNumber = 3;
        levelNumber <= map.tiles.length - 1;
        levelNumber++
      ) {
        const level = map.tiles[levelNumber]
        const tileMap = new Container()
        tileMap.sortableChildren = true

        for (const [position, tile] of level.entries()) {
          if (tile) {
            const texture = tileSetToTexture.get(tile.tileSet)!
            const tileTexture = new PIXI.Texture(
              texture,
              new PIXI.Rectangle(
                tile.x,
                tile.y,
                map.tileSize.width,
                map.tileSize.height,
              ),
            )
            const sprite = new Sprite(tileTexture)
            sprite.x = Number(position.column) * map.tileSize.width
            sprite.y = Number(position.row) * map.tileSize.height
            sprite.zIndex = sprite.y + map.tileSize.height
            tileMap.addChild(sprite)
          }
        }
        this.layers[levelNumber] = tileMap
        this.app.stage.addChild(tileMap)
      }
    } else {
      const container = new Container()
      container.sortableChildren = true
      this.layers[3] = container
      this.app.stage.addChild(container)
    }

    const floorLevel = map.tiles[1]
    if (floorLevel) {
      for (const [position, tile] of floorLevel.entries()) {
        if (tile) {
          this.walkable.setIsWalkable(position.row, position.column, true)
        }
      }
    }

    const levelOnCharacterHeight = map.tiles[2]
    if (levelOnCharacterHeight) {
      for (const [position, tile] of levelOnCharacterHeight.entries()) {
        if (tile) {
          this.walkable.setIsWalkable(position.row, position.column, false)
        }
      }
    }

    if (this.man) {
      this.layers[3].addChild(this.man.sprite)
    }
  }

  private canMoveThere(from: Point2D, to: Point2D) {
    return true
  }

  public get objectInHand(): Sprite | undefined | null {
    return this.#objectInHand
  }

  set objectInHand(object: Sprite | null) {
    this.#objectInHand = object
    this.updateObjectInHandPosition()
  }

  public findClosestInteractableObject(): Sprite | null {
    const close = 32
    const manPoint = {
      x: this.man!.x,
      y: this.man!.y,
    }
    return findClosest(
      manPoint,
      this.app.stage.children
        .concat(this.layers[3].children)
        .filter(
          (object) =>
            object.canInteractWith &&
            object.interact &&
            object.canInteractWith(this.man!) &&
            calculateDistance(object, manPoint) <= close,
        ),
    ) as Sprite | null
  }

  public updateObjectInHandPosition(): void {
    if (this.#objectInHand) {
      this.#objectInHand.x = this.man!.x + 5
      this.#objectInHand.y = this.man!.y - 50
      this.database.saveObject(this.#objectInHand)
    }
  }

  public updateManAndObjectInHandIndex() {
    this.layers[3].sortChildren()
  }

  public updateViewport() {
    this.app.stage.x = 0.5 * this.app.view.width - this.man!.x
    this.app.stage.y = 0.5 * this.app.view.height - this.man!.y
  }

  private calculateIndex(tile: TilePosition): number {
    return tile.row * numberOfTilesPerRow + tile.column
  }

  public async teleport(entity: any, location: Location): Promise<void> {
    if (location.mapID) {
      await this.loadMap(location.mapID)
    }
    entity.x = location.x
    entity.y = location.y
    this.updateViewport()
  }

  public async showOptions(options: Option[]): Promise<Option> {
    this.disableMovement()
    const option = await Dialog.showOptions(options)
    this.enableMovement()
    return option
  }

  public async askForNumber(
    options: AskForNumberOptions,
  ): AskForNumberReturnType {
    this.disableMovement()
    const number = await Dialog.askForNumber(options)
    this.enableMovement()
    return number
  }

  public async wait(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration * 1000))
  }

  public disableMovement() {
    this.#canCharacterMove = false
  }

  public enableMovement() {
    this.#canCharacterMove = true
  }
}

export interface EnteringInformation {
  direction: Side
  tile: TilePosition
}

class Walkable {
  #data: Map<number, Map<number, boolean>> = new Map()

  isWalkableAt(row: number, column: number) {
    const row2 = this.#data.get(row)
    if (row2 && row2.has(column)) {
      const isWalkable = row2.get(column)
      return isWalkable
    } else {
      return false
    }
  }

  setIsWalkable(row: number, column: number, isWalkable: boolean) {
    let row2 = this.#data.get(row)
    if (!row2) {
      row2 = new Map()
      this.#data.set(row, row2)
    }
    row2.set(column, isWalkable)
  }
}

function createDecompressedStream(stream: ReadableStream): ReadableStream {
  return stream.pipeThrough(new DecompressionStream("gzip"))
}

async function readReadableStreamAsUTF8(
  stream: ReadableStream,
): Promise<string> {
  const reader = stream.getReader()
  let content = ""
  let result = await reader.read()
  const textDecoder = new TextDecoder()
  while (!result.done) {
    content += textDecoder.decode(result.value)
    result = await reader.read()
  }
  return content
}

function parseJSONTileMap(content: string): TileMap {
  const rawObjectTileMap = JSON.parse(content)
  return TileMap.fromRawObject(rawObjectTileMap)
}

function createImage(content: string) {
  return new Promise((resolve, onError) => {
    const image = new Image()
    image.src = content
    image.onload = function () {
      resolve(image)
    }
    image.onerror = onError
  })
}

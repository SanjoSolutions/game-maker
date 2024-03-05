import { Application, Container, Sprite, Texture } from "pixi.js"
import { Branch } from "./Branch.js"
import { Interactable } from "./Interactable.js"
import type { Point2D } from "./Point2D.js"
import { Side } from "./Side.js"
import type { TilePosition } from "./TilePosition.js"
import { calculateDistance } from "./calculateDistance.js"
import { compareTrees } from "./compareTrees.js"
import { TILE_HEIGHT, TILE_WIDTH } from "./config.js"
import { findClosest } from "./findClosest.js"
import { generateRandomInteger } from "./generateRandomInteger.js"
import { isFlagSet } from "./isFlagSet.js"
import type { Database } from "./persistence.js"
import type { SpriteWithId } from "./serialization.js"
import { CharacterWithOneSpritesheet } from "./CharacterWithOneSpritesheet.js"
import { Direction } from "./Direction.js"
import { settings } from "@pixi/tilemap"

export const numberOfTilesPerRow = 64
export const numberOfTilesPerColumn = 65
export const mapWidth = numberOfTilesPerRow * TILE_WIDTH
export const mapHeight = numberOfTilesPerColumn * TILE_HEIGHT

export class Game {
  entities: Container
  man: CharacterWithOneSpritesheet | undefined | null = null
  #objectInHand: Sprite | undefined | null = null
  app: Application
  database: Database
  #walkableInFrom: Side[]

  constructor(database: Database) {
    this.database = database
    this.app = new Application({
      resizeTo: window,
    })
    this.entities = new Container()
    this.app.stage.addChild(this.entities)

    this.#walkableInFrom = new Array(mapWidth * mapHeight)

    for (let y = 0; y < numberOfTilesPerColumn; y++) {
      for (let x = 0; x < numberOfTilesPerRow; x++) {
        this.#walkableInFrom[this.calculateIndex({ row: y, column: x })] =
          Side.Top | Side.Right | Side.Bottom | Side.Left
      }
    }
  }

  async load(): Promise<void> {
    settings.use32bitIndex = true
    this.man = new CharacterWithOneSpritesheet("character.png", this.app.stage)
    await this.man.loadSpritesheet()
    this.entities.addChild(this.man.sprite)

    await this.database.saveState(this.app)

    this.updateViewport()
    // this.updateObjectInHandPosition()

    const keyStates = new Map([
      ["ArrowLeft", false],
      ["ArrowRight", false],
      ["ArrowUp", false],
      ["ArrowDown", false],
    ])

    window.addEventListener("keydown", function (event) {
      if (keyStates.has(event.code)) {
        event.preventDefault()
        keyStates.set(event.code, true)
      }
    })

    window.addEventListener("keyup", function (event) {
      if (keyStates.has(event.code)) {
        keyStates.set(event.code, false)
      }
    })

    window.addEventListener("keypress", (event) => {
      if (event.code === "Space") {
        event.preventDefault()
        if (this.#objectInHand) {
          this.#objectInHand = null
        } else {
          const object = this.findClosestInteractableObject()
          if (object) {
            this.objectInHand = object
          }
        }
      }
    })

    let elapsed = 0

    this.app.ticker.add((delta) => {
      elapsed += delta
      const threshold = 5
      elapsed %= threshold
      const left = keyStates.get("ArrowLeft")
      const right = keyStates.get("ArrowRight")
      const up = keyStates.get("ArrowUp")
      const down = keyStates.get("ArrowDown")

      let direction = this.man!.direction

      if (
        direction !== Direction.None &&
        ((direction === Direction.Left && !left) ||
          (direction === Direction.Right && !right) ||
          (direction === Direction.Up && !up) ||
          (direction === Direction.Down && !down))
      ) {
        direction = Direction.None
      }

      if (direction === Direction.None) {
        if (down && !up) {
          direction = Direction.Down
        } else if (up && !down) {
          direction = Direction.Up
        } else if (left && !right) {
          direction = Direction.Left
        } else if (right && !left) {
          direction = Direction.Right
        }
      }

      this.man!.direction = direction

      let hasPositionChanged = false

      if (left && !right) {
        this.man!.x -= delta
        hasPositionChanged = true
        this.man!.isMoving = true
      } else if (right && !left) {
        this.man!.x += delta
        hasPositionChanged = true
        this.man!.isMoving = true
      }

      if (up && !down) {
        this.man!.y -= delta
        this.updateManAndObjectInHandIndex()
        hasPositionChanged = true
        this.man!.isMoving = true
      } else if (down && !up) {
        this.man!.y += delta
        this.updateManAndObjectInHandIndex()
        hasPositionChanged = true
        this.man!.isMoving = true
      }

      if (hasPositionChanged) {
        this.updateObjectInHandPosition()
        this.updateViewport()
        // this.database.saveObject(this.man!)
      } else {
        this.man!.isMoving = false
      }
    })
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
    const close = 50
    const manPoint = {
      x: this.man!.x,
      y: this.man!.y - 50,
    }
    return findClosest(
      manPoint,
      this.app.stage.children.filter(
        (object) =>
          object instanceof Interactable &&
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
    this.entities.removeChild(this.man!.sprite)
    if (this.objectInHand) {
      this.entities.removeChild(this.objectInHand)
    }

    let manIndex = 0
    for (let index = 0; index < this.entities.children.length; index++) {
      const entity = this.entities.getChildAt(index)
      if (entity.y <= this.man!.y) {
        manIndex = index + 1
      } else {
        break
      }
    }
    this.entities.addChildAt(this.man!.sprite, manIndex)
    if (this.objectInHand) {
      this.entities.addChildAt(this.objectInHand, manIndex + 1)
    }
  }

  public updateViewport() {
    this.app.stage.x = 0.5 * this.app.view.width - this.man!.x
    this.app.stage.y = 0.5 * this.app.view.height - this.man!.y
  }

  private calculateIndex(tile: TilePosition): number {
    return tile.row * numberOfTilesPerRow + tile.column
  }
}

export interface EnteringInformation {
  direction: Side
  tile: TilePosition
}

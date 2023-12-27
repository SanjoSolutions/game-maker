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
    let direction: Side | null = null

    this.app.ticker.add((delta) => {
      elapsed += delta
      const threshold = 5
      const nextFrame = elapsed >= threshold
      elapsed %= threshold
      const left = keyStates.get("ArrowLeft")
      const right = keyStates.get("ArrowRight")
      const up = keyStates.get("ArrowUp")
      const down = keyStates.get("ArrowDown")
      if (
        (direction === Side.Left && !left) ||
        (direction === Side.Right && !right) ||
        (direction === Side.Top && !up) ||
        (direction === Side.Bottom && !down)
      ) {
        direction = null
      }
      let hasPositionChanged = false
      const from = this.man!
      const isStandingStill = Boolean(
        !this.man!.destinationX && !this.man!.destinationY,
      )
      if (isStandingStill) {
        if ((!direction || direction === Side.Left) && left && !right) {
          const to = {
            x:
              (Math.ceil((this.man!.x - 0.5 * TILE_WIDTH) / TILE_WIDTH) - 1) *
                TILE_WIDTH +
              0.5 * TILE_WIDTH,
            y: this.man!.destinationY ?? this.man!.y,
          }
          if (this.canMoveThere(from, to)) {
            this.man!.destinationX = to.x
            direction = Side.Left
          }
        } else if ((!direction || direction === Side.Right) && right && !left) {
          const to = {
            x:
              (Math.floor((this.man!.x - 0.5 * TILE_WIDTH) / TILE_WIDTH) + 1) *
                TILE_WIDTH +
              0.5 * TILE_WIDTH,
            y: this.man!.destinationY || this.man!.y,
          }
          if (this.canMoveThere(from, to)) {
            this.man!.destinationX = to.x
            direction = Side.Right
          }
        }
        if ((!direction || direction === Side.Top) && up && !down) {
          const to = {
            x: this.man!.destinationX ?? this.man!.x,
            y:
              (Math.ceil((this.man!.y - 0.5 * TILE_HEIGHT) / TILE_HEIGHT) - 1) *
                TILE_HEIGHT +
              0.5 * TILE_HEIGHT,
          }
          if (this.canMoveThere(from, to)) {
            this.man!.destinationY = to.y
            direction = Side.Top
          }
        } else if ((!direction || direction === Side.Bottom) && down && !up) {
          const to = {
            x: this.man!.x,
            y: this.man!.y + TILE_HEIGHT,
          }
          if (this.canMoveThere(from, to)) {
            this.man!.destinationY = to.y
            direction = Side.Bottom
          }
        }
      }

      const isXDifferentFromDestinationX =
        this.man!.destinationX && this.man!.x !== this.man!.destinationX
      const isYDifferentFromDestinationY =
        this.man!.destinationY && this.man!.y !== this.man!.destinationY

      if (isXDifferentFromDestinationX || isYDifferentFromDestinationY) {
        if (isXDifferentFromDestinationX) {
          const delta2 = this.man!.destinationX! > this.man!.x ? delta : -delta
          if (delta2 <= 0) {
            this.man!.direction = Direction.Left
          } else {
            this.man!.direction = Direction.Right
          }
          this.man!.x += delta2
          if (delta2 > 0 && this.man!.x > this.man!.destinationX!) {
            this.man!.x = this.man!.destinationX!
          } else if (delta2 < 0 && this.man!.x < this.man!.destinationX!) {
            this.man!.x = this.man!.destinationX!
          }
          if (this.man!.x === this.man!.destinationX) {
            this.man!.destinationX = null
          }
          hasPositionChanged = true
          this.man!.isMoving = true
        }
        if (isYDifferentFromDestinationY) {
          const delta2 = this.man!.destinationY! > this.man!.y ? delta : -delta
          if (delta2 <= 0) {
            this.man!.direction = Direction.Up
          } else {
            this.man!.direction = Direction.Down
          }
          this.man!.y += delta2
          if (delta2 > 0 && this.man!.y > this.man!.destinationY!) {
            this.man!.y = this.man!.destinationY!
          } else if (delta2 < 0 && this.man!.y < this.man!.destinationY!) {
            this.man!.y = this.man!.destinationY!
          }
          if (this.man!.y === this.man!.destinationY) {
            this.man!.destinationY = null
          }
          this.updateManAndObjectInHandIndex()
          hasPositionChanged = true
          this.man!.isMoving = true
        }

        if (hasPositionChanged) {
          this.updateObjectInHandPosition()
          this.updateViewport()
          // this.database.saveObject(this.man!)
        }
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

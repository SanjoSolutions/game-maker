import { Application, Sprite, Texture } from "pixi.js"
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

export const numberOfTilesPerRow = 64
export const numberOfTilesPerColumn = 65
export const mapWidth = numberOfTilesPerRow * TILE_WIDTH
export const mapHeight = numberOfTilesPerColumn * TILE_HEIGHT

interface Man extends Sprite {
  destinationX?: number | null
  destinationY?: number | null
}

export class Game {
  man: Man | undefined | null = null
  #objectInHand: Sprite | undefined | null = null
  app: Application
  database: Database
  #walkableInFrom: Side[]

  constructor(database: Database) {
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

  async load(): Promise<void> {
    const hasStateBeenLoaded = await this.database.loadState(this)

    if (hasStateBeenLoaded) {
      this.man = this.app.stage.children.find(
        (object) =>
          object instanceof Sprite &&
          object.texture.textureCacheIds.some((name) =>
            name.startsWith("walk_"),
          ),
      ) as SpriteWithId
    } else {
      this.man = Sprite.from("walk_down_0")
      this.man.anchor.set(0.5, 1)
      this.man.x = 0.5 * this.man.width + 0.5 * TILE_WIDTH
      this.man.y = this.man.height + 0.5 * TILE_HEIGHT
      this.app.stage.addChild(this.man)
      this.updateManAndObjectInHandIndex()

      await this.database.saveState(this.app)
    }

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
    let direction: Side = null

    this.app.ticker.add((delta) => {
      elapsed += delta
      const threshold = 5
      const nextFrame = elapsed >= threshold
      elapsed %= threshold
      const left = keyStates.get("ArrowLeft")
      const right = keyStates.get("ArrowRight")
      const up = keyStates.get("ArrowUp")
      const down = keyStates.get("ArrowDown")
      if (direction === Side.Left && !left || direction === Side.Right && !right || direction === Side.Top && !up || direction === Side.Bottom && !down) {
        direction = null
      }
      let hasPositionChanged = false
      const from = this.man!
      const isStandingStill = Boolean(!this.man!.destinationX && !this.man!.destinationY)
      if (isStandingStill) {
        if ((!direction || direction === Side.Left) && left && !right) {
          const to = {
            x: (Math.ceil((this.man!.x - 0.5 * TILE_WIDTH) / TILE_WIDTH) - 1) * TILE_WIDTH + 0.5 * TILE_WIDTH,
            y: this.man!.destinationY ?? this.man!.y,
          }
          if (this.canMoveThere(from, to)) {
            this.man!.destinationX = to.x
            direction = Side.Left
          }
        } else if ((!direction || direction === Side.Right) && right && !left) {
          const to = {
            x: (Math.floor((this.man!.x - 0.5 * TILE_WIDTH) / TILE_WIDTH) + 1) * TILE_WIDTH + 0.5 * TILE_WIDTH,
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
            y: (Math.ceil((this.man!.y - 0.5 * TILE_HEIGHT) / TILE_HEIGHT) - 1) * TILE_HEIGHT + 0.5 * TILE_HEIGHT,
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

      if (this.man!.destinationX && this.man!.x !== this.man!.destinationX) {
        const delta2 = this.man!.destinationX > this.man!.x ? delta : -delta
        if (delta2 <= 0) {
          const match = /^walk_.+?_(\d)$/.exec(
            this.man!.texture.textureCacheIds[0],
          )
          let frameNumber = Number(match![1])
          if (nextFrame) {
            frameNumber = (frameNumber + 1) % 8
          }
          this.man!.texture = Texture.from("walk_left_" + frameNumber)
        } else {
          const match = /^walk_.+?_(\d)$/.exec(
            this.man!.texture.textureCacheIds[0],
          )
          let frameNumber = Number(match![1])
          if (nextFrame) {
            frameNumber = (frameNumber + 1) % 8
          }
          this.man!.texture = Texture.from("walk_right_" + frameNumber)
        }
        this.man!.x += delta2
        if (delta2 > 0 && this.man!.x > this.man!.destinationX) {
          this.man!.x = this.man!.destinationX
        } else if (delta2 < 0 && this.man!.x < this.man!.destinationX) {
          this.man!.x = this.man!.destinationX
        }
        if (this.man!.x === this.man!.destinationX) {
          this.man!.destinationX = null
        }
        hasPositionChanged = true
      }
      if (this.man!.destinationY && this.man!.y !== this.man!.destinationY) {
        const delta2 = this.man!.destinationY > this.man!.y ? delta : -delta
        if (delta2 <= 0) {
          const match = /^walk_.+?_(\d)$/.exec(
            this.man!.texture.textureCacheIds[0],
          )
          let frameNumber = Number(match![1])
          if (!hasPositionChanged && nextFrame) {
            frameNumber = (frameNumber + 1) % 8
          }
          this.man!.texture = Texture.from("walk_up_" + frameNumber)
        } else {
          const match = /^walk_.+?_(\d)$/.exec(
            this.man!.texture.textureCacheIds[0],
          )
          let frameNumber = Number(match![1])
          if (!hasPositionChanged && nextFrame) {
            frameNumber = (frameNumber + 1) % 8
          }
          this.man!.texture = Texture.from("walk_down_" + frameNumber)
        }
        this.man!.y += delta2
        if (delta2 > 0 && this.man!.y > this.man!.destinationY) {
          this.man!.y = this.man!.destinationY
        } else if (delta2 < 0 && this.man!.y < this.man!.destinationY) {
          this.man!.y = this.man!.destinationY
        }
        if (this.man!.y === this.man!.destinationY) {
          this.man!.destinationY = null
        }
        this.updateManAndObjectInHandIndex()
        hasPositionChanged = true
      }

      if (hasPositionChanged) {
        this.updateObjectInHandPosition()
        this.updateViewport()
        this.database.saveObject(this.man!)
      }
    })
  }

  private canMoveThere(from: Point2D, to: Point2D) {
    if (this.isEnteringNewTile(from, to)) {
      const tile = this.retrieveTileEntered(from, to)!
      const enteringFromDirection = this.retrieveEnteringFromDirection(
        from,
        to,
      )!
      return this.canEnterTileFromDirection(tile, enteringFromDirection)
    } else {
      return true
    }
  }

  private isEnteringNewTile(from: Point2D, to: Point2D) {
    return Boolean(this.retrieveEnteringFromDirection(from, to))
  }

  private retrieveTileEntered(from: Point2D, to: Point2D) {
    return this.retrieveEnteringInformation(from, to)?.tile ?? null
  }

  private retrieveEnteringFromDirection(
    from: Point2D,
    to: Point2D,
  ): Side | null {
    return this.retrieveEnteringInformation(from, to)?.direction ?? null
  }

  private retrieveEnteringInformation(
    from: Point2D,
    to: Point2D,
  ): EnteringInformation | null {
    if (isMovingToTheRight(from, to)) {
      const tileA = determineTile({
        x: from.x + 0.5 * this.man!.width,
        y: from.y,
      })
      const tileB = determineTile({
        x: to.x + 0.5 * this.man!.width,
        y: to.y,
      })
      if (areDifferentTiles(tileA, tileB)) {
        return { direction: Side.Left, tile: tileB }
      }
    } else if (isMovingToTheLeft(from, to)) {
      const tileA = determineTile({
        x: from.x - 0.5 * this.man!.width,
        y: from.y,
      })
      const tileB = determineTile({
        x: to.x - 0.5 * this.man!.width,
        y: to.y,
      })
      if (areDifferentTiles(tileA, tileB)) {
        return { direction: Side.Right, tile: tileB }
      }
    }
    if (isMovingToTheTop(from, to)) {
      const tileA = determineTile(from)
      const tileB = determineTile(to)
      if (areDifferentTiles(tileA, tileB)) {
        return { direction: Side.Bottom, tile: tileB }
      }
    } else if (isMovingToTheBottom(from, to)) {
      const tileA = determineTile(from)
      const tileB = determineTile(to)
      if (areDifferentTiles(tileA, tileB)) {
        return { direction: Side.Top, tile: tileB }
      }
    }
    return null
  }

  private canEnterTileFromDirection(tile: TilePosition, direction: Side) {
    // return isFlagSet(this.#walkableInFrom[this.calculateIndex(tile)], direction)
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
    let index = 0
    while (
      index < this.app.stage.children.length - 1 &&
      (this.app.stage.getChildAt(index) === this.man ||
        (this.objectInHand &&
          this.app.stage.getChildAt(index) === this.objectInHand) ||
        this.app.stage.getChildAt(index).y <= this.man!.y)
    ) {
      index++
    }
    this.app.stage.setChildIndex(this.man!, index)
    if (this.objectInHand) {
      this.app.stage.setChildIndex(this.objectInHand, index + 1)
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

function isMovingToTheRight(from: Point2D, to: Point2D): boolean {
  return to.x > from.x
}

function isMovingToTheLeft(from: Point2D, to: Point2D): boolean {
  return to.x < from.x
}

function isMovingToTheTop(from: Point2D, to: Point2D): boolean {
  return to.y < from.y
}

function isMovingToTheBottom(from: Point2D, to: Point2D): boolean {
  return to.y > from.y
}

function determineTile(point: Point2D): TilePosition {
  return {
    row: Math.floor(point.x / TILE_WIDTH),
    column: Math.floor(point.y / TILE_HEIGHT),
  }
}

function areDifferentTiles(a: TilePosition, b: TilePosition): boolean {
  return a.row !== b.row || a.column !== b.column
}

export interface EnteringInformation {
  direction: Side
  tile: TilePosition
}

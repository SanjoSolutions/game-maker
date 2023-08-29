import { Application, Sprite } from "pixi.js"
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

export class Game {
  man: Sprite | undefined | null = null
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
          object.texture.textureCacheIds.includes("man"),
      ) as SpriteWithId
    } else {
      this.plantTrees()

      this.man = Sprite.from("man")
      this.man.anchor.set(0.5, 1)
      this.man.x = 0.5 * this.man.width + 0.5 * TILE_WIDTH
      this.man.y = this.man.height + 0.5 * TILE_HEIGHT
      this.app.stage.addChild(this.man)
      this.updateManAndObjectInHandIndex()

      await this.database.saveState(this.app)
    }

    this.updateViewport()

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

    this.app.ticker.add((delta) => {
      const left = keyStates.get("ArrowLeft")
      const right = keyStates.get("ArrowRight")
      const up = keyStates.get("ArrowUp")
      const down = keyStates.get("ArrowDown")
      let hasPositionChanged = false
      const from = this.man!
      if (left && !right) {
        const to = {
          x: this.man!.x - delta,
          y: this.man!.y,
        }
        if (this.canMoveThere(from, to)) {
          this.man!.x -= delta
          hasPositionChanged = true
        }
      } else if (right && !left) {
        const to = {
          x: this.man!.x + delta,
          y: this.man!.y,
        }
        if (this.canMoveThere(from, to)) {
          this.man!.x += delta
          hasPositionChanged = true
        }
      }
      if (up && !down) {
        const to = {
          x: this.man!.x,
          y: this.man!.y - delta,
        }
        if (this.canMoveThere(from, to)) {
          this.man!.y -= delta
          hasPositionChanged = true
          this.updateManAndObjectInHandIndex()
        }
      } else if (down && !up) {
        const to = {
          x: this.man!.x,
          y: this.man!.y + delta,
        }
        if (this.canMoveThere(from, to)) {
          this.man!.y += delta
          hasPositionChanged = true
          this.updateManAndObjectInHandIndex()
        }
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
    return isFlagSet(this.#walkableInFrom[this.calculateIndex(tile)], direction)
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

  plantTrees() {
    const howMuchOfMapToCoverWithTrees = 0.5
    const mapArea = mapWidth * mapHeight
    const treeForArea = Sprite.from("tree")
    const treeArea = treeForArea.width * treeForArea.height
    const howMany = Math.round(
      (howMuchOfMapToCoverWithTrees * mapArea) / treeArea,
    )

    const trees = new Array(howMany)
    for (let i = 1; i <= howMany; i++) {
      const tree = Sprite.from("tree")
      tree.anchor.set(0.5, 1)
      tree.x = generateRandomInteger(
        0.5 * treeForArea.width + 0.5 * TILE_WIDTH,
        mapWidth - 0.5 * treeForArea.width + 0.5 * TILE_WIDTH,
      )
      tree.y = generateRandomInteger(
        treeForArea.height + 0.5 * TILE_HEIGHT,
        mapHeight - 0.5 * TILE_HEIGHT,
      )
      trees[i - 1] = tree
    }
    trees.sort(compareTrees)
    for (const tree of trees) {
      this.app.stage.addChild(tree)
      if (Math.random() < 0.5) {
        const branch = Branch.from("branch")
        branch.game = this
        branch.x = tree.x + 10
        branch.y = tree.y - 70
        this.app.stage.addChild(branch)
      }
    }
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

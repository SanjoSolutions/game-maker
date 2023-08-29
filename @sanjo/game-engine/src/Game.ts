import { Application, Sprite } from "pixi.js"
import { Branch } from "./Branch.js"
import { Interactable } from "./Interactable.js"
import { calculateDistance } from "./calculateDistance.js"
import { compareTrees } from "./compareTrees.js"
import { TILE_HEIGHT, TILE_WIDTH } from "./config.js"
import { findClosest } from "./findClosest.js"
import { generateRandomInteger } from "./generateRandomInteger.js"
import type { Database } from "./persistence.js"
import type { SpriteWithId } from "./serialization.js"

export const mapWidth = 64 * TILE_WIDTH
export const mapHeight = 64 * TILE_HEIGHT

export class Game {
  man: Sprite | undefined | null = null
  #objectInHand: Sprite | undefined | null = null
  app: Application
  database: Database

  constructor(database: Database) {
    this.database = database
    this.app = new Application({
      resizeTo: window,
    })
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
      if (left && !right) {
        this.man!.x -= delta
        hasPositionChanged = true
      } else if (right && !left) {
        this.man!.x += delta
        hasPositionChanged = true
      }
      if (up && !down) {
        this.man!.y -= delta
        hasPositionChanged = true
        this.updateManAndObjectInHandIndex()
      } else if (down && !up) {
        this.man!.y += delta
        hasPositionChanged = true
        this.updateManAndObjectInHandIndex()
      }
      if (hasPositionChanged) {
        this.updateObjectInHandPosition()
        this.updateViewport()
        this.database.saveObject(this.man!)
      }
    })
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
}

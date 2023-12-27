import { Assets, type Container, type Resource, type Texture } from "pixi.js"
import { createAnimatedSprite } from "./createAnimatedSprite.js"
import { createUniversalSpritesheet } from "./createUniversalSpritesheet.js"
import { Character } from "./Character.js"

export class CharacterWithOneSpritesheet extends Character {
  #spritesheetPath: string
  #hasSpritesheetBeenLoaded: boolean = false
  #spritesheet: any | null = null

  constructor(spritesheetPath: string, container: Container) {
    super(container)

    this.#spritesheetPath = spritesheetPath
  }

  async loadSpritesheet() {
    if (!this.#hasSpritesheetBeenLoaded) {
      Assets.add(this.#spritesheetPath, this.#spritesheetPath)
      const spritesheet = await Assets.load(this.#spritesheetPath)

      this.#spritesheet = await createUniversalSpritesheet(
        this.#spritesheetPath,
        spritesheet,
      )

      this.#hasSpritesheetBeenLoaded = true

      this._determineTextures = this._determineTextures.bind(this)

      this.sprite.addChild(
        createAnimatedSprite(this.#spritesheet.animations.down),
      )
    }
  }

  protected _updateTextures() {
    this._updateTexture(0, this._determineTextures)
  }

  private _determineTextures(): Texture<Resource>[] {
    return this._determineTexture(this.#spritesheet)
  }
}

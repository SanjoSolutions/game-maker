import { Assets, type Container, type Resource, type Texture } from "pixi.js"
import { createAnimatedSprite } from "./createAnimatedSprite.js"
import { createUniversalSpritesheet } from "./createUniversalSpritesheet.js"
import { Character } from "./Character.js"

export class CharacterWithOneSpritesheet extends Character {
  static #hasSpritesheetBeenLoaded: boolean = false
  static #spritesheet: any | null = null

  static async loadSpritesheets() {
    if (!CharacterWithOneSpritesheet.#hasSpritesheetBeenLoaded) {
      Assets.add("Download38592", "Download38592.png")
      const spritesheet = await Assets.load("Download38592")

      CharacterWithOneSpritesheet.#spritesheet =
        await createUniversalSpritesheet("Download38592", spritesheet)

      CharacterWithOneSpritesheet.#hasSpritesheetBeenLoaded = true
    }
  }

  constructor(container: Container) {
    super(container)

    this._determineTextures = this._determineTextures.bind(this)

    this.sprite.addChild(
      createAnimatedSprite(
        CharacterWithOneSpritesheet.#spritesheet.animations.down,
      ),
    )
  }

  protected _updateTextures() {
    this._updateTexture(0, this._determineTextures)
  }

  private _determineTextures(): Texture<Resource>[] {
    return this._determineTexture(CharacterWithOneSpritesheet.#spritesheet)
  }
}

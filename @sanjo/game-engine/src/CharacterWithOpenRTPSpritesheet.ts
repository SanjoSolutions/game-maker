import { Assets, type Container, type Resource, type Texture } from "pixi.js"
import { createAnimatedSprite } from "./createAnimatedSprite.js"
import { createOpenRTPSpritesheet } from "./createOpenRTPSpritesheet.js"
import { Character } from "./Character.js"

export class CharacterWithOpenRTPSpritesheet extends Character {
  #spritesheetPath: string
  #hasSpritesheetBeenLoaded: boolean = false
  #spritesheet: any | null = null
  #basePosition: { x: number; y: number }

  constructor(
    spritesheetPath: string,
    container: Container,
    basePosition: { x: number; y: number },
  ) {
    super(container)

    this.#spritesheetPath = spritesheetPath
    this.#basePosition = basePosition
  }

  async loadSpritesheet() {
    if (!this.#hasSpritesheetBeenLoaded) {
      Assets.add(this.#spritesheetPath, this.#spritesheetPath)
      const spritesheet = await Assets.load(this.#spritesheetPath)

      this.#spritesheet = await createOpenRTPSpritesheet(
        this.#spritesheetPath,
        spritesheet,
        this.#basePosition,
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

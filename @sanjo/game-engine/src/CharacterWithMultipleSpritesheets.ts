import {
  Assets,
  type Container,
  type Resource,
  type Spritesheet,
  type Texture,
} from "pixi.js"
import { createAnimatedSprite } from "./createAnimatedSprite.js"
import { createUniversalSpriteSheet } from "./createUniversalSpriteSheet.js"
import { Character } from "./Character.js"

export class CharacterWithMultipleSpritesheets extends Character {
  static #haveSpritesheetsBeenLoaded: boolean = false
  static #bodySpritesheet: any | null = null
  static #headSpritesheet: any | null = null
  static #hairSpritesheet: any | null = null

  static async loadSpritesheets() {
    if (!CharacterWithMultipleSpritesheets.#haveSpritesheetsBeenLoaded) {
      Assets.add(
        "body",
        "assets/spritesheets/body/bodies/male/universal/light.png",
      )
      Assets.add(
        "head",
        "assets/spritesheets/head/heads/human_male/universal/light.png",
      )
      Assets.add("hair", "assets/spritesheets/hair/afro/male/black.png")
      const {
        body,
        head,
        hair,
      }: {
        body: Texture<Resource>
        head: Texture<Resource>
        hair: Texture<Resource>
        plants: Spritesheet
      } = (await Assets.load(["body", "head", "hair"])) as any

      CharacterWithMultipleSpritesheets.#bodySpritesheet =
        await createUniversalSpriteSheet("body", body)
      CharacterWithMultipleSpritesheets.#headSpritesheet =
        await createUniversalSpriteSheet("head", head)
      CharacterWithMultipleSpritesheets.#hairSpritesheet =
        await createUniversalSpriteSheet("hair", hair)

      CharacterWithMultipleSpritesheets.#haveSpritesheetsBeenLoaded = true
    }
  }

  constructor(container: Container) {
    super(container)

    this._determineBodyTextures = this._determineBodyTextures.bind(this)
    this._determineHeadTextures = this._determineHeadTextures.bind(this)
    this._determineHairTextures = this._determineHairTextures.bind(this)

    this.sprite.addChild(
      createAnimatedSprite(
        CharacterWithMultipleSpritesheets.#bodySpritesheet.animations.down,
      ),
    )
    this.sprite.addChild(
      createAnimatedSprite(
        CharacterWithMultipleSpritesheets.#headSpritesheet.animations.down,
      ),
    )
    this.sprite.addChild(
      createAnimatedSprite(
        CharacterWithMultipleSpritesheets.#hairSpritesheet.animations.down,
      ),
    )
  }

  protected _updateTextures() {
    this._updateTexture(0, this._determineBodyTextures)
    this._updateTexture(1, this._determineHeadTextures)
    this._updateTexture(2, this._determineHairTextures)
  }

  private _determineBodyTextures(): Texture<Resource>[] {
    return this._determineTexture(
      CharacterWithMultipleSpritesheets.#bodySpritesheet,
    )
  }

  private _determineHeadTextures(): Texture<Resource>[] {
    return this._determineTexture(
      CharacterWithMultipleSpritesheets.#headSpritesheet,
    )
  }

  private _determineHairTextures(): Texture<Resource>[] {
    return this._determineTexture(
      CharacterWithMultipleSpritesheets.#hairSpritesheet,
    )
  }
}

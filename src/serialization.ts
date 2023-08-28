import { Sprite } from 'pixi.js'
import { last } from './array.js'

export interface SerializedSprite {
  id?: number
  x: number
  y: number
  texture: string
  anchor: {
    x: number
    y: number
  }
}

export type SpriteWithId = Sprite & {
  id?: number
}

export function serializeSprite(sprite: SpriteWithId): SerializedSprite {
  const serializedSprite: SerializedSprite = {
    x: sprite.x,
    y: sprite.y,
    texture: last(sprite.texture.textureCacheIds),
    anchor: {
      x: sprite.anchor.x,
      y: sprite.anchor.y,
    },
  }
  if (sprite.id) {
    serializedSprite.id = sprite.id
  }
  return serializedSprite
}

export function deserializeSprite(object: SerializedSprite): SpriteWithId {
  const sprite = Sprite.from(object.texture) as SpriteWithId
  sprite.id = object.id
  sprite.anchor.set(object.anchor.x, object.anchor.y)
  sprite.x = object.x
  sprite.y = object.y
  return sprite
}

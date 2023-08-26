import { Sprite } from 'pixi.js'
import { last } from './array'

export function serializeSprite(sprite) {
  return {
    id: sprite.id,
    x: sprite.x,
    y: sprite.y,
    texture: last(sprite.texture.textureCacheIds),
    anchor: {
      x: sprite.anchor.x,
      y: sprite.anchor.y,
    },
  }
}

export function deserializeSprite(object) {
  const sprite = Sprite.from(object.texture)
  sprite.id = object.id
  sprite.anchor.set(object.anchor.x, object.anchor.y)
  sprite.x = object.x
  sprite.y = object.y
  return sprite
}

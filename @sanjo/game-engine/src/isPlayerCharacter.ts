import { Sprite } from "pixi.js"

export function isPlayerCharacter(entity: Sprite): boolean {
  return entity.texture.textureCacheIds.includes("man")
}

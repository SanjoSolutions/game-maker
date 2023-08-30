import { Sprite } from "pixi.js"

export function isPlayerCharacter(entity: Sprite): boolean {
  return entity.texture.textureCacheIds.some((name) => name.startsWith("walk_"))
}

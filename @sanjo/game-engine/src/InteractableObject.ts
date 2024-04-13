import type { Sprite } from "pixi.js"

export interface InteractableObject extends Sprite {
  canInteractWith(object: Object): boolean
  interact(interacter: any): void
}

export function isInteractableObject(
  object: any,
): object is InteractableObject {
  return (
    typeof object.canInteractWith === "function" &&
    typeof object.interact === "function"
  )
}

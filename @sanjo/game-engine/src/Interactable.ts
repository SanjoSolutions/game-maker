import { Sprite } from "pixi.js"

export class Interactable extends Sprite {
  canInteractWith(entity: Sprite): boolean {
    return true
  }

  interact(interacter: Sprite): void {}
}

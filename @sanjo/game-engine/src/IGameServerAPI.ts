import type { Direction } from "./Direction.js"

export interface IGameServerAPI {
  move(direction: {
    facingDirection: Direction
    movingDirection: Direction
  }): void
}

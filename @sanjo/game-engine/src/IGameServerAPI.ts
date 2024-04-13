import type { Subject } from "rxjs"
import type { Direction } from "./Direction.js"

export interface IGameServerAPI {
  stream: Subject<any>

  move(direction: {
    facingDirection: Direction
    movingDirection: Direction
  }): void
}

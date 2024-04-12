import type { Subject } from "rxjs"

export interface IGameServer {
  stream: Subject<any>
}

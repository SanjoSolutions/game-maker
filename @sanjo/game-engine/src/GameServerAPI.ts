import { IGameServerAPI } from "./IGameServerAPI.js"
import { Subject } from "rxjs"

export class GameServerAPI implements IGameServerAPI {
  #webSocket: WebSocket | null = null
  stream: Subject<Message> = new Subject<Message>()

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      this.#webSocket = new WebSocket("ws://localhost:8080")

      this.#webSocket.onerror = console.error

      this.#webSocket.onopen = () => {
        resolve()
      }

      this.#webSocket.onmessage = async (event) => {
        const arrayBuffer = await event.data.arrayBuffer()
        const message = Message.fromBinary(new Uint8Array(arrayBuffer))
        this.stream.next(message)
      }
    })
  }

  move(direction: {
    facingDirection: Direction
    movingDirection: Direction
  }): void
}

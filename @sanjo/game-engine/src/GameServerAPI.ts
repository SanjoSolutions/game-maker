import type { IGameServerAPI } from "./IGameServerAPI.js"
import { Subject } from "rxjs"
import { Message as MessageBase } from "./protos/Message.js"
import type { Direction } from "./Direction.js"
import type { MessageType } from "@protobuf-ts/runtime"

export class GameServerAPI<T> implements IGameServerAPI {
  protected webSocket: WebSocket | null = null
  stream: Subject<T> = new Subject<T>()
  Message: MessageType<any>

  constructor(Message: MessageType<any> = MessageBase) {
    this.Message = Message
  }

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      this.webSocket = new WebSocket("ws://localhost:8080")

      this.webSocket.onerror = console.error

      this.webSocket.onopen = () => {
        resolve()
      }

      this.webSocket.onmessage = async (event) => {
        const arrayBuffer = await event.data.arrayBuffer()
        const message = this.Message.fromBinary(new Uint8Array(arrayBuffer))
        this.stream.next(message)
      }
    })
  }

  move(direction: {
    facingDirection: Direction
    movingDirection: Direction
  }): void {
    // TODO
  }
}

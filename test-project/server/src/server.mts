import { Any } from "./shared/protos/google/protobuf/any.js"
import { RequestMoneyFromMentor } from "./shared/protos/RequestMoneyFromMentor.js"
import { WebSocketServer } from "ws"
import { Error as ErrorProto } from "./shared/protos/Error.js"
import { RequestMoneyFromMentorResponse } from "./shared/protos/RequestMoneyFromMentorResponse.js"
import { SynchronizedState } from "./shared/protos/SynchronizedState.js"
import { Message } from "./shared/protos/Message.js"
import {
  createError,
  createRequestMoneyFromMentorResponse,
  createSynchronizedState,
} from "./shared/clientServerCommunication/messageFactories.js"
import { MessageType } from "./shared/clientServerCommunication/MessageType.js"
import { Subject } from "rxjs"

interface Socket {
  send(data: any): void
}

interface MessageFromSocket {
  message: Message
  socket: Socket
}

class GameServer implements SynchronizedState {
  money: number = 0
  hasMentorGivenMoney: boolean = false
  onConnect: Subject<{ socket: Socket }> = new Subject()
  inStream: Subject<MessageFromSocket> = new Subject()

  constructor() {
    this.onConnect.subscribe(({ socket }: { socket: Socket }) => {
      socket.send(
        Message.toBinary(
          createSynchronizedState({
            money: this.money,
            hasMentorGivenMoney: this.hasMentorGivenMoney,
          }),
        ),
      )
    })

    this.inStream.subscribe(({ message, socket }: MessageFromSocket) => {
      if (message.body.oneofKind === MessageType.RequestMoneyFromMentor) {
        console.log("RequestMoneyFromMentor", message)
        try {
          const updatedState = this.requestMoneyFromMentor()
          socket.send(
            Message.toBinary(
              createRequestMoneyFromMentorResponse(
                RequestMoneyFromMentorResponse.create(updatedState),
              ),
            ),
          )
        } catch (error: any) {
          socket.send(
            Message.toBinary(
              createError(
                ErrorProto.create({
                  message: error.message,
                }),
              ),
            ),
          )
        }
      }
    })
  }

  requestMoneyFromMentor() {
    if (this.hasMentorGivenMoney) {
      throw new Error(
        "The mentor has already given money and only gives money once.",
      )
    } else {
      this.money += 50
      this.hasMentorGivenMoney = true
      return {
        money: this.money,
        hasMentorGivenMoney: this.hasMentorGivenMoney,
      }
    }
  }
}

class GameServerWithWebSocket extends GameServer {
  listen() {
    const webSocketServer = new WebSocketServer({ port: 8080 })

    webSocketServer.on("connection", (webSocket) => {
      webSocket.on("error", console.error)

      webSocket.on("message", (data: Buffer) => {
        console.log("data", data)
        const message = Message.fromBinary(data)
        this.inStream.next({ message, socket: webSocket })
      })

      this.onConnect.next({ socket: webSocket })
    })
  }
}

const server = new GameServerWithWebSocket()
server.listen()

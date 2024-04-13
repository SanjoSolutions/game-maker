import { WebSocketServer } from "ws"
import { Error as ErrorProto } from "@sanjo/test-project-shared/protos/Error.js"
import { RequestMoneyFromMentorResponse } from "@sanjo/test-project-shared/protos/RequestMoneyFromMentorResponse.js"
import type { SynchronizedState } from "@sanjo/test-project-shared/protos/SynchronizedState.js"
import { Message } from "@sanjo/test-project-shared/protos/Message.js"
import {
  createCharacterMessage,
  createError,
} from "@sanjo/game-engine/clientServerCommunication/messageFactories.js"
import {
  createRequestMoneyFromMentorResponse,
  createSynchronizedState,
} from "@sanjo/test-project-shared/clientServerCommunication/messageFactories.js"
import { Subject } from "rxjs"
import { Character } from "@sanjo/test-project-shared/Character.js"
import { ProjectMessageType } from "@sanjo/test-project-shared/clientServerCommunication/MessageType.js"

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
  clients: Socket[] = []

  constructor() {
    this.onConnect.subscribe(({ socket }: { socket: Socket }) => {
      const otherClients = Array.from(this.clients)
      this.clients.push(socket)

      const character = new Character()
      character.x = 32
      character.y = 6 * 32

      this.sendCharacterToClients(character, otherClients)

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
      if (
        message.body.oneofKind === ProjectMessageType.RequestMoneyFromMentor
      ) {
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

  sendCharacterToClients(character: Character, clients: Socket[]) {
    for (const client of clients) {
      this.sendCharacterToClient(character, client)
    }
  }

  sendCharacterToClient(character: Character, client: Socket) {
    client.send(Message.toBinary(createCharacterMessage(character)))
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
        const message = Message.fromBinary(data)
        this.inStream.next({ message, socket: webSocket })
      })

      this.onConnect.next({ socket: webSocket })
    })
  }
}

const server = new GameServerWithWebSocket()
server.listen()

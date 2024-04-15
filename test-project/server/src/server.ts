import { WebSocketServer } from "ws"
import { Error as ErrorProto } from "@sanjo/game-engine/protos/Error.js"
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
import { ProjectMessageType } from "@sanjo/test-project-shared/clientServerCommunication/MessageType.js"
import { MessageType as EngineMessageType } from "@sanjo/game-engine/clientServerCommunication/MessageType.js"
import type { Move } from "@sanjo/game-engine/clientServerCommunication/Move.js"
import { randomUUID } from "node:crypto"
import type { GUID } from "@sanjo/game-engine/GUID.js"
import { createMoveFromServerMessage } from "@sanjo/game-engine/clientServerCommunication/messageFactories.js"
import type { Character } from "@sanjo/game-engine/protos/Character.js"

interface Socket {
  send(data: any): void
}

interface MessageFromSocket {
  message: Message
  socket: Socket
}

interface Client {
  socket: Socket
  characterGUID: GUID
}

class GameServer implements SynchronizedState {
  money: number = 0
  hasMentorGivenMoney: boolean = false
  onConnect: Subject<{ socket: Socket }> = new Subject()
  inStream: Subject<MessageFromSocket> = new Subject()
  clients: Client[] = []
  socketToClient: Map<Socket, Client> = new Map()

  constructor() {
    this.onConnect.subscribe(({ socket }: { socket: Socket }) => {
      const otherClients = Array.from(this.clients)

      const character = {
        GUID: randomUUID(),
        x: 32,
        y: 6 * 32,
      }

      const client = {
        socket,
        characterGUID: character.GUID,
      }

      this.clients.push(client)
      this.socketToClient.set(socket, client)

      this.sendCharacterToClient(
        {
          ...character,
          isPlayed: true,
        },
        client,
      )
      this.sendCharacterToClients(
        {
          ...character,
          isPlayed: false,
        },
        otherClients,
      )

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
                Message,
                ErrorProto.create({
                  message: error.message,
                }),
              ),
            ),
          )
        }
      } else if (message.body.oneofKind === EngineMessageType.Move) {
        console.log("a")
        if (
          message.body.move.GUID ===
          this.socketToClient.get(socket)?.characterGUID
        ) {
          this.sendMoveToClients(message.body.move)
        }
      }
    })
  }

  sendMoveToClients(move: Move) {
    console.log("b")
    for (const client of this.clients) {
      console.log("c")
      this.sendMoveToClient(move, client)
    }
  }

  sendMoveToClient(move: Move, client: Client) {
    client.socket.send(
      Message.toBinary(createMoveFromServerMessage<Message>(Message, move)),
    )
  }

  sendCharacterToClients(character: Character, clients: Client[]) {
    for (const client of clients) {
      this.sendCharacterToClient(character, client)
    }
  }

  sendCharacterToClient(character: Character, client: Client) {
    client.socket.send(
      Message.toBinary(createCharacterMessage(Message, character)),
    )
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
  async listen() {
    return new Promise((resolve, onError) => {
      const webSocketServer = new WebSocketServer({ port: 8080 }, () => {
        resolve(null)
      })

      webSocketServer.once("error", onError)

      webSocketServer.on("connection", (webSocket) => {
        webSocket.on("error", console.error)

        webSocket.on("message", (data: Buffer) => {
          const message = Message.fromBinary(data)
          this.inStream.next({ message, socket: webSocket })
        })

        this.onConnect.next({ socket: webSocket })
      })
    })
  }
}

const server = new GameServerWithWebSocket()
await server.listen()

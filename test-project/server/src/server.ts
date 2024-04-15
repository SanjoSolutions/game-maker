import { WebSocketServer } from "ws"
import { Error as ErrorProto } from "@sanjo/game-engine/protos/Error.js"
import { RequestMoneyFromMentorResponse } from "@sanjo/test-project-shared/protos/RequestMoneyFromMentorResponse.js"
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
import { MessageType } from "@sanjo/test-project-shared/clientServerCommunication/MessageType.js"
import { randomUUID } from "node:crypto"
import type { GUID } from "@sanjo/game-engine/GUID.js"
import { createMoveFromServerMessage } from "@sanjo/game-engine/clientServerCommunication/messageFactories.js"
import type { Character } from "@sanjo/game-engine/protos/Character.js"
import { isFlagSet } from "@sanjo/game-engine/isFlagSet.js"
import { Direction } from "@sanjo/game-engine"
import type { MoveFromServer } from "@sanjo/test-project-shared/protos/MoveFromServer.js"
import { createDisconnectMessage } from "@sanjo/game-engine/clientServerCommunication/messageFactories.js"

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
  character: CharacterOnServer
}

interface CharacterOnServer extends Character {
  hasStartedMovingTime: number
  positionUpdateTime: number
}

class GameServer {
  money: number = 0
  hasMentorGivenMoney: boolean = false
  onConnect: Subject<{ socket: Socket }> = new Subject()
  onDisconnect: Subject<{ socket: Socket }> = new Subject()
  inStream: Subject<MessageFromSocket> = new Subject()
  socketToClient: Map<Socket, Client> = new Map()

  constructor() {
    this.onConnect.subscribe(({ socket }: { socket: Socket }) => {
      const otherClients = Array.from(this.socketToClient.values())

      const character = {
        GUID: randomUUID(),
        x: 32,
        y: 6 * 32,
        isPlayed: false,
        movingDirection: Direction.None,
        facingDirection: Direction.Down,
        isMoving: false,
      }

      const client = {
        socket,
        characterGUID: character.GUID,
        character,
      }

      this.socketToClient.set(socket, client)

      this.sendCharacterToClients(character, otherClients)

      this.updateCharacterPositions()

      socket.send(
        Message.toBinary(
          createSynchronizedState({
            money: this.money,
            hasMentorGivenMoney: this.hasMentorGivenMoney,
            characters: Array.from(this.socketToClient.values()).map(
              (client) =>
                client.socket === socket
                  ? { ...client.character, isPlayed: true }
                  : client.character,
            ),
          }),
        ),
      )
    })

    this.onDisconnect.subscribe(({ socket }: { socket: Socket }) => {
      const client = this.socketToClient.get(socket)
      if (client) {
        this.socketToClient.delete(socket)
        this.sendDisconnect(client.character)
      }
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
                Message,
                ErrorProto.create({
                  message: error.message,
                }),
              ),
            ),
          )
        }
      } else if (message.body.oneofKind === MessageType.Move) {
        const client = this.socketToClient.get(socket)
        const move = message.body.move
        if (client && this.isCharacterOfClient(move.GUID, client)) {
          const character = client.character
          if (character.isMoving) {
            this.updateCharacterPosition(character)
          }
          character.movingDirection = move.movingDirection
          character.facingDirection = move.facingDirection
          character.isMoving = move.movingDirection !== Direction.None
          if (character.isMoving) {
            character.hasStartedMovingTime = Date.now()
          }
          const moveFromServer = {
            GUID: move.GUID,
            facingDirection: character.facingDirection,
            movingDirection: character.movingDirection,
            isMoving: character.isMoving,
          }
          this.sendMoveFromServerToClients(moveFromServer)
        }
      }
    })
  }

  sendDisconnect(character: Character) {
    for (const client of this.socketToClient.values()) {
      this.sendDisconnectToClient(character, client)
    }
  }

  sendDisconnectToClient(character: Character, client: Client) {
    client.socket.send(
      Message.toBinary(createDisconnectMessage<Message>(Message, character)),
    )
  }

  updateCharacterPositions() {
    for (const character of Array.from(this.socketToClient.values()).map(
      (client) => client.character,
    )) {
      this.updateCharacterPosition(character)
    }
  }

  updateCharacterPosition(character: CharacterOnServer) {
    console.log("a", character)
    if (character.isMoving) {
      console.log("b")
      let xFactor
      if (
        isFlagSet(character.movingDirection, Direction.Left) &&
        !isFlagSet(character.movingDirection, Direction.Right)
      ) {
        xFactor = -1
      } else if (
        isFlagSet(character.movingDirection, Direction.Right) &&
        !isFlagSet(character.movingDirection, Direction.Left)
      ) {
        xFactor = 1
      } else {
        xFactor = 0
      }
      let yFactor
      if (
        isFlagSet(character.movingDirection, Direction.Down) &&
        !isFlagSet(character.movingDirection, Direction.Up)
      ) {
        yFactor = 1
      } else if (
        isFlagSet(character.movingDirection, Direction.Up) &&
        !isFlagSet(character.movingDirection, Direction.Down)
      ) {
        yFactor = -1
      } else {
        yFactor = 0
      }
      const time = Date.now()
      const duration =
        time - (character.positionUpdateTime || character.hasStartedMovingTime)
      const speed = 60 / 1000
      character.x += xFactor * duration * speed
      character.y += yFactor * duration * speed
      character.positionUpdateTime = time
    }
  }

  isCharacterOfClient(GUID: GUID, client: Client) {
    return GUID === client.characterGUID
  }

  sendMoveFromServerToClients(moveFromServer: MoveFromServer) {
    for (const client of this.socketToClient.values()) {
      this.sendMoveFromServerToClient(moveFromServer, client)
    }
  }

  sendMoveFromServerToClient(moveFromServer: MoveFromServer, client: Client) {
    client.socket.send(
      Message.toBinary(
        createMoveFromServerMessage<Message>(Message, moveFromServer),
      ),
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

        webSocket.once("close", () => {
          this.onDisconnect.next({ socket: webSocket })
        })

        this.onConnect.next({ socket: webSocket })
      })
    })
  }
}

const server = new GameServerWithWebSocket()
await server.listen()

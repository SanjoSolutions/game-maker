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

class GameServer implements SynchronizedState {
  money: number = 0
  hasMentorGivenMoney: boolean = false

  listen() {
    const webSocketServer = new WebSocketServer({ port: 8080 })

    webSocketServer.on("connection", (webSocket) => {
      webSocket.on("error", console.error)

      webSocket.on("message", (data: Buffer) => {
        console.log("data", data)
        const message = Message.fromBinary(data)

        if (message.body.oneofKind === MessageType.RequestMoneyFromMentor) {
          console.log("RequestMoneyFromMentor", message)
          try {
            const updatedState = this.requestMoneyFromMentor()
            webSocket.send(
              Message.toBinary(
                createRequestMoneyFromMentorResponse(
                  RequestMoneyFromMentorResponse.create(updatedState),
                ),
              ),
            )
          } catch (error: any) {
            webSocket.send(
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

      webSocket.send(
        Message.toBinary(
          createSynchronizedState({
            money: this.money,
            hasMentorGivenMoney: this.hasMentorGivenMoney,
          }),
        ),
      )
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

const server = new GameServer()
server.listen()

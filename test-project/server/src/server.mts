import { Any } from "test-project-shared/protos/google/protobuf/any.js"
import { RequestMoneyFromMentor } from "test-project-shared/protos/RequestMoneyFromMentor.js"
import { WebSocketServer } from "ws"
import { Error as ErrorMessage } from "test-project-shared/protos/Error.js"
import { RequestMoneyFromMentorResponse } from "test-project-shared/protos/RequestMoneyFromMentorResponse.js"
import { SynchronizedState } from "test-project/shared/protos/SynchronizedState.js"

class GameServer implements SynchronizedState {
  money: number = 0
  hasMentorGivenMoney: boolean = false

  listen() {
    const webSocketServer = new WebSocketServer({ port: 8080 })

    webSocketServer.on("connection", (webSocket) => {
      webSocket.on("error", console.error)

      webSocket.on("message", (data: Buffer) => {
        console.log("data", data)
        const deserialized = Any.fromBinary(data)
        if (Any.contains(deserialized, RequestMoneyFromMentor)) {
          const message = Any.unpack(deserialized, RequestMoneyFromMentor)
          console.log("RequestMoneyFromMentor", message)
          try {
            const updatedState = this.requestMoneyFromMentor()
            const response = RequestMoneyFromMentorResponse.create(updatedState)
            webSocket.send(
              Any.toBinary(Any.pack(response, RequestMoneyFromMentorResponse)),
            )
          } catch (error: any) {
            const response = ErrorMessage.create({
              message: error.message,
            })
            webSocket.send(Any.toBinary(Any.pack(response, ErrorMessage)))
          }
        }
      })

      webSocket.send(
        Any.toBinary(
          Any.pack(
            {
              money: this.money,
              hasMentorGivenMoney: this.hasMentorGivenMoney,
            },
            SynchronizedState,
          ),
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

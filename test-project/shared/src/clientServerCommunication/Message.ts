import type { Message as MessageBase } from "@sanjo/game-engine/clientServerCommunication/Message.js"
import type { MessageType } from "./MessageType.js"
import type { RequestMoneyFromMentor } from "../protos/RequestMoneyFromMentor.js"

export type Message =
  | MessageBase
  | {
      type: typeof MessageType.RequestMoneyFromMentor
      body: RequestMoneyFromMentor
    }

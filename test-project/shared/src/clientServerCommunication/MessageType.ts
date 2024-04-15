import { MessageType as EngineMessageType } from "@sanjo/game-engine/clientServerCommunication/MessageType.js"

enum ProjectMessageType {
  RequestMoneyFromMentor = "requestMoneyFromMentor",
  RequestMoneyFromMentorResponse = "requestMoneyFromMentorResponse",
  SynchronizedState = "synchronizedState",
}

export const MessageType = { ...EngineMessageType, ...ProjectMessageType }

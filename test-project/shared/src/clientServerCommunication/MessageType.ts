import type { MessageType as EngineMessageType } from "@sanjo/game-engine/clientServerCommunication/MessageType.js"

export enum ProjectMessageType {
  RequestMoneyFromMentor = "requestMoneyFromMentor",
  RequestMoneyFromMentorResponse = "requestMoneyFromMentorResponse",
  SynchronizedState = "synchronizedState",
}

export type MessageType = EngineMessageType | ProjectMessageType

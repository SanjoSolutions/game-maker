import { Message } from "../protos/Message.js"
import { MessageType } from "./MessageType.js"
import type { RequestMoneyFromMentorResponse } from "../protos/RequestMoneyFromMentorResponse.js"
import type { SynchronizedState } from "../protos/SynchronizedState.js"
import { RequestMoneyFromMentor } from "../protos/RequestMoneyFromMentor.js"
import { convertPositionToUnsignedIntegers } from "@sanjo/game-engine/convertPositionToUnsignedIntegers.js"

export function createRequestMoneyFromMentor(): Message {
  return Message.create({
    body: {
      oneofKind: MessageType.RequestMoneyFromMentor,
      requestMoneyFromMentor: RequestMoneyFromMentor.create(),
    },
  })
}

export function createRequestMoneyFromMentorResponse(
  requestMoneyFromMentorResponse: RequestMoneyFromMentorResponse,
): Message {
  return Message.create({
    body: {
      oneofKind: MessageType.RequestMoneyFromMentorResponse,
      requestMoneyFromMentorResponse,
    },
  })
}

export function createSynchronizedState(
  synchronizedState: SynchronizedState,
): Message {
  return Message.create({
    body: {
      oneofKind: MessageType.SynchronizedState,
      synchronizedState: {
        ...synchronizedState,
        characters: synchronizedState.characters.map(
          convertPositionToUnsignedIntegers,
        ),
      },
    },
  })
}

import { Message } from "../protos/Message.js"
import { ProjectMessageType } from "./MessageType.js"
import type { RequestMoneyFromMentorResponse } from "../protos/RequestMoneyFromMentorResponse.js"
import type { SynchronizedState } from "../protos/SynchronizedState.js"
import { RequestMoneyFromMentor } from "../protos/RequestMoneyFromMentor.js"

export function createRequestMoneyFromMentor(): Message {
  return Message.create({
    body: {
      oneofKind: ProjectMessageType.RequestMoneyFromMentor,
      requestMoneyFromMentor: RequestMoneyFromMentor.create(),
    },
  })
}

export function createRequestMoneyFromMentorResponse(
  requestMoneyFromMentorResponse: RequestMoneyFromMentorResponse,
): Message {
  return Message.create({
    body: {
      oneofKind: ProjectMessageType.RequestMoneyFromMentorResponse,
      requestMoneyFromMentorResponse,
    },
  })
}

export function createSynchronizedState(
  synchronizedState: SynchronizedState,
): Message {
  return Message.create({
    body: {
      oneofKind: ProjectMessageType.SynchronizedState,
      synchronizedState,
    },
  })
}

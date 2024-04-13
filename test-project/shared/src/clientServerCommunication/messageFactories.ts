import { Message } from "../protos/Message"
import { Error as ErrorProto } from "../protos/Error"
import { MessageType } from "./MessageType"
import { RequestMoneyFromMentorResponse } from "../protos/RequestMoneyFromMentorResponse"
import { SynchronizedState } from "../protos/SynchronizedState"
import { RequestMoneyFromMentor } from "../protos/RequestMoneyFromMentor"

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

export function createError(error: ErrorProto): Message {
  return Message.create({
    body: {
      oneofKind: MessageType.Error,
      error,
    },
  })
}

export function createSynchronizedState(
  synchronizedState: SynchronizedState,
): Message {
  return Message.create({
    body: {
      oneofKind: MessageType.SynchronizedState,
      synchronizedState,
    },
  })
}

export function createCharacterMessage(character: Character): Message {
  return Message.create({
    body: {
      oneofKind: MessageType.Character,
      character,
    },
  })
}

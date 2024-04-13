import { Message } from "../protos/Message.js"
import type { Error as ErrorProto } from "../protos/Error.js"
import { MessageType } from "./MessageType.js"
import type { Character } from "../protos/Character.js"

export function createError(error: ErrorProto): Message {
  return Message.create({
    body: {
      oneofKind: MessageType.Error,
      error,
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

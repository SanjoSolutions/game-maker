import type { Message } from "../protos/Message.js"
import type { Error as ErrorProto } from "../protos/Error.js"
import { MessageType } from "./MessageType.js"
import type { Character } from "../protos/Character.js"
import type { MoveFromServer } from "../protos/MoveFromServer.js"

export function createError<T = Message>(message: any, error: ErrorProto): T {
  return message.create({
    body: {
      oneofKind: MessageType.Error,
      error,
    },
  })
}

export function createCharacterMessage<T = Message>(
  message: any,
  character: Character,
): T {
  return message.create({
    body: {
      oneofKind: MessageType.Character,
      character,
    },
  })
}

export function createMoveFromServerMessage<T = Message>(
  message: any,
  moveFromServer: MoveFromServer,
): T {
  console.log("moveFromServer", moveFromServer)
  return message.create({
    body: {
      oneofKind: MessageType.MoveFromServer,
      moveFromServer: moveFromServer,
    },
  })
}

import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { SynchronizedState } from "./SynchronizedState.js";
import { RequestMoneyFromMentorResponse } from "./RequestMoneyFromMentorResponse.js";
import { RequestMoneyFromMentor } from "./RequestMoneyFromMentor.js";
import { MoveFromServer } from "./MoveFromServer.js";
import { Move } from "./Move.js";
import { Character } from "./Character.js";
import { Error } from "./Error.js";
// @generated message type with reflection information, may provide speed optimized methods
class Message$Type extends MessageType {
    constructor() {
        super("Message", [
            { no: 1, name: "error", kind: "message", oneof: "body", T: () => Error },
            { no: 2, name: "character", kind: "message", oneof: "body", T: () => Character },
            { no: 3, name: "move", kind: "message", oneof: "body", T: () => Move },
            { no: 4, name: "moveFromServer", kind: "message", oneof: "body", T: () => MoveFromServer },
            { no: 1000, name: "requestMoneyFromMentor", kind: "message", oneof: "body", T: () => RequestMoneyFromMentor },
            { no: 1001, name: "requestMoneyFromMentorResponse", kind: "message", oneof: "body", T: () => RequestMoneyFromMentorResponse },
            { no: 1002, name: "synchronizedState", kind: "message", oneof: "body", T: () => SynchronizedState }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.body = { oneofKind: undefined };
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* Error error */ 1:
                    message.body = {
                        oneofKind: "error",
                        error: Error.internalBinaryRead(reader, reader.uint32(), options, message.body.error)
                    };
                    break;
                case /* Character character */ 2:
                    message.body = {
                        oneofKind: "character",
                        character: Character.internalBinaryRead(reader, reader.uint32(), options, message.body.character)
                    };
                    break;
                case /* Move move */ 3:
                    message.body = {
                        oneofKind: "move",
                        move: Move.internalBinaryRead(reader, reader.uint32(), options, message.body.move)
                    };
                    break;
                case /* MoveFromServer moveFromServer */ 4:
                    message.body = {
                        oneofKind: "moveFromServer",
                        moveFromServer: MoveFromServer.internalBinaryRead(reader, reader.uint32(), options, message.body.moveFromServer)
                    };
                    break;
                case /* RequestMoneyFromMentor requestMoneyFromMentor */ 1000:
                    message.body = {
                        oneofKind: "requestMoneyFromMentor",
                        requestMoneyFromMentor: RequestMoneyFromMentor.internalBinaryRead(reader, reader.uint32(), options, message.body.requestMoneyFromMentor)
                    };
                    break;
                case /* RequestMoneyFromMentorResponse requestMoneyFromMentorResponse */ 1001:
                    message.body = {
                        oneofKind: "requestMoneyFromMentorResponse",
                        requestMoneyFromMentorResponse: RequestMoneyFromMentorResponse.internalBinaryRead(reader, reader.uint32(), options, message.body.requestMoneyFromMentorResponse)
                    };
                    break;
                case /* SynchronizedState synchronizedState */ 1002:
                    message.body = {
                        oneofKind: "synchronizedState",
                        synchronizedState: SynchronizedState.internalBinaryRead(reader, reader.uint32(), options, message.body.synchronizedState)
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* Error error = 1; */
        if (message.body.oneofKind === "error")
            Error.internalBinaryWrite(message.body.error, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* Character character = 2; */
        if (message.body.oneofKind === "character")
            Character.internalBinaryWrite(message.body.character, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* Move move = 3; */
        if (message.body.oneofKind === "move")
            Move.internalBinaryWrite(message.body.move, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        /* MoveFromServer moveFromServer = 4; */
        if (message.body.oneofKind === "moveFromServer")
            MoveFromServer.internalBinaryWrite(message.body.moveFromServer, writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        /* RequestMoneyFromMentor requestMoneyFromMentor = 1000; */
        if (message.body.oneofKind === "requestMoneyFromMentor")
            RequestMoneyFromMentor.internalBinaryWrite(message.body.requestMoneyFromMentor, writer.tag(1000, WireType.LengthDelimited).fork(), options).join();
        /* RequestMoneyFromMentorResponse requestMoneyFromMentorResponse = 1001; */
        if (message.body.oneofKind === "requestMoneyFromMentorResponse")
            RequestMoneyFromMentorResponse.internalBinaryWrite(message.body.requestMoneyFromMentorResponse, writer.tag(1001, WireType.LengthDelimited).fork(), options).join();
        /* SynchronizedState synchronizedState = 1002; */
        if (message.body.oneofKind === "synchronizedState")
            SynchronizedState.internalBinaryWrite(message.body.synchronizedState, writer.tag(1002, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message Message
 */
export const Message = new Message$Type();
//# sourceMappingURL=Message.js.map
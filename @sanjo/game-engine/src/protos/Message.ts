// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,use_proto_field_name
// @generated from protobuf file "Message.proto" (syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Disconnect } from "./Disconnect.js";
import { SynchronizedState } from "./SynchronizedState.js";
import { MoveFromServer } from "./MoveFromServer.js";
import { Move } from "./Move.js";
import { Character } from "./Character.js";
import { Error } from "./Error.js";
/**
 * @generated from protobuf message Message
 */
export interface Message {
    /**
     * @generated from protobuf oneof: body
     */
    body: {
        oneofKind: "error";
        /**
         * @generated from protobuf field: Error error = 1;
         */
        error: Error;
    } | {
        oneofKind: "character";
        /**
         * @generated from protobuf field: Character character = 2;
         */
        character: Character;
    } | {
        oneofKind: "move";
        /**
         * @generated from protobuf field: Move move = 3;
         */
        move: Move;
    } | {
        oneofKind: "moveFromServer";
        /**
         * @generated from protobuf field: MoveFromServer moveFromServer = 4;
         */
        moveFromServer: MoveFromServer;
    } | {
        oneofKind: "synchronizedState";
        /**
         * @generated from protobuf field: SynchronizedState synchronizedState = 5;
         */
        synchronizedState: SynchronizedState;
    } | {
        oneofKind: "disconnect";
        /**
         * @generated from protobuf field: Disconnect disconnect = 6;
         */
        disconnect: Disconnect;
    } | {
        oneofKind: undefined;
    };
}
// @generated message type with reflection information, may provide speed optimized methods
class Message$Type extends MessageType<Message> {
    constructor() {
        super("Message", [
            { no: 1, name: "error", kind: "message", oneof: "body", T: () => Error },
            { no: 2, name: "character", kind: "message", oneof: "body", T: () => Character },
            { no: 3, name: "move", kind: "message", oneof: "body", T: () => Move },
            { no: 4, name: "moveFromServer", kind: "message", oneof: "body", T: () => MoveFromServer },
            { no: 5, name: "synchronizedState", kind: "message", oneof: "body", T: () => SynchronizedState },
            { no: 6, name: "disconnect", kind: "message", oneof: "body", T: () => Disconnect }
        ]);
    }
    create(value?: PartialMessage<Message>): Message {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.body = { oneofKind: undefined };
        if (value !== undefined)
            reflectionMergePartial<Message>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Message): Message {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* Error error */ 1:
                    message.body = {
                        oneofKind: "error",
                        error: Error.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).error)
                    };
                    break;
                case /* Character character */ 2:
                    message.body = {
                        oneofKind: "character",
                        character: Character.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).character)
                    };
                    break;
                case /* Move move */ 3:
                    message.body = {
                        oneofKind: "move",
                        move: Move.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).move)
                    };
                    break;
                case /* MoveFromServer moveFromServer */ 4:
                    message.body = {
                        oneofKind: "moveFromServer",
                        moveFromServer: MoveFromServer.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).moveFromServer)
                    };
                    break;
                case /* SynchronizedState synchronizedState */ 5:
                    message.body = {
                        oneofKind: "synchronizedState",
                        synchronizedState: SynchronizedState.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).synchronizedState)
                    };
                    break;
                case /* Disconnect disconnect */ 6:
                    message.body = {
                        oneofKind: "disconnect",
                        disconnect: Disconnect.internalBinaryRead(reader, reader.uint32(), options, (message.body as any).disconnect)
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
    internalBinaryWrite(message: Message, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
        /* SynchronizedState synchronizedState = 5; */
        if (message.body.oneofKind === "synchronizedState")
            SynchronizedState.internalBinaryWrite(message.body.synchronizedState, writer.tag(5, WireType.LengthDelimited).fork(), options).join();
        /* Disconnect disconnect = 6; */
        if (message.body.oneofKind === "disconnect")
            Disconnect.internalBinaryWrite(message.body.disconnect, writer.tag(6, WireType.LengthDelimited).fork(), options).join();
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

import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
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
declare class Message$Type extends MessageType<Message> {
    constructor();
    create(value?: PartialMessage<Message>): Message;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Message): Message;
    internalBinaryWrite(message: Message, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message Message
 */
export declare const Message: Message$Type;
export {};
//# sourceMappingURL=Message.d.ts.map
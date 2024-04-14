import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { SynchronizedState } from "./SynchronizedState.js";
import { RequestMoneyFromMentorResponse } from "./RequestMoneyFromMentorResponse.js";
import { RequestMoneyFromMentor } from "./RequestMoneyFromMentor.js";
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
        oneofKind: "requestMoneyFromMentor";
        /**
         * @generated from protobuf field: RequestMoneyFromMentor requestMoneyFromMentor = 1000;
         */
        requestMoneyFromMentor: RequestMoneyFromMentor;
    } | {
        oneofKind: "requestMoneyFromMentorResponse";
        /**
         * @generated from protobuf field: RequestMoneyFromMentorResponse requestMoneyFromMentorResponse = 1001;
         */
        requestMoneyFromMentorResponse: RequestMoneyFromMentorResponse;
    } | {
        oneofKind: "synchronizedState";
        /**
         * @generated from protobuf field: SynchronizedState synchronizedState = 1002;
         */
        synchronizedState: SynchronizedState;
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
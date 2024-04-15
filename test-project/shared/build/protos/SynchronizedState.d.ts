import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Character } from "./Character.js";
/**
 * @generated from protobuf message SynchronizedState
 */
export interface SynchronizedState {
    /**
     * @generated from protobuf field: repeated Character characters = 1;
     */
    characters: Character[];
    /**
     * @generated from protobuf field: uint32 money = 1000;
     */
    money: number;
    /**
     * @generated from protobuf field: bool hasMentorGivenMoney = 1001;
     */
    hasMentorGivenMoney: boolean;
}
declare class SynchronizedState$Type extends MessageType<SynchronizedState> {
    constructor();
    create(value?: PartialMessage<SynchronizedState>): SynchronizedState;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SynchronizedState): SynchronizedState;
    internalBinaryWrite(message: SynchronizedState, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message SynchronizedState
 */
export declare const SynchronizedState: SynchronizedState$Type;
export {};
//# sourceMappingURL=SynchronizedState.d.ts.map
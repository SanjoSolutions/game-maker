import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message Move
 */
export interface Move {
    /**
     * @generated from protobuf field: string GUID = 1 [json_name = "GUID"];
     */
    GUID: string;
    /**
     * @generated from protobuf field: uint32 facingDirection = 2;
     */
    facingDirection: number;
    /**
     * @generated from protobuf field: uint32 movingDirection = 3;
     */
    movingDirection: number;
}
declare class Move$Type extends MessageType<Move> {
    constructor();
    create(value?: PartialMessage<Move>): Move;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Move): Move;
    internalBinaryWrite(message: Move, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message Move
 */
export declare const Move: Move$Type;
export {};
//# sourceMappingURL=Move.d.ts.map
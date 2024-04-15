import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message Character
 */
export interface Character {
    /**
     * @generated from protobuf field: string GUID = 1 [json_name = "GUID"];
     */
    GUID: string;
    /**
     * @generated from protobuf field: int32 x = 2;
     */
    x: number;
    /**
     * @generated from protobuf field: int32 y = 3;
     */
    y: number;
    /**
     * @generated from protobuf field: bool isPlayed = 4;
     */
    isPlayed: boolean;
    /**
     * @generated from protobuf field: uint32 movingDirection = 5;
     */
    movingDirection: number;
    /**
     * @generated from protobuf field: uint32 facingDirection = 6;
     */
    facingDirection: number;
    /**
     * @generated from protobuf field: bool isMoving = 7;
     */
    isMoving: boolean;
}
declare class Character$Type extends MessageType<Character> {
    constructor();
    create(value?: PartialMessage<Character>): Character;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Character): Character;
    internalBinaryWrite(message: Character, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message Character
 */
export declare const Character: Character$Type;
export {};
//# sourceMappingURL=Character.d.ts.map
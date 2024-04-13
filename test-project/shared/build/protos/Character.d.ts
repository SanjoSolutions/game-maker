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
     * @generated from protobuf field: uint32 x = 1;
     */
    x: number;
    /**
     * @generated from protobuf field: uint32 y = 2;
     */
    y: number;
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
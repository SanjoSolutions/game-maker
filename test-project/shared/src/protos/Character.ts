// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies
// @generated from protobuf file "Character.proto" (syntax proto3)
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
// @generated message type with reflection information, may provide speed optimized methods
class Character$Type extends MessageType<Character> {
    constructor() {
        super("Character", [
            { no: 1, name: "x", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "y", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value?: PartialMessage<Character>): Character {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.x = 0;
        message.y = 0;
        if (value !== undefined)
            reflectionMergePartial<Character>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Character): Character {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint32 x */ 1:
                    message.x = reader.uint32();
                    break;
                case /* uint32 y */ 2:
                    message.y = reader.uint32();
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
    internalBinaryWrite(message: Character, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint32 x = 1; */
        if (message.x !== 0)
            writer.tag(1, WireType.Varint).uint32(message.x);
        /* uint32 y = 2; */
        if (message.y !== 0)
            writer.tag(2, WireType.Varint).uint32(message.y);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message Character
 */
export const Character = new Character$Type();

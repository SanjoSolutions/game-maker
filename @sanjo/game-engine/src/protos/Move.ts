// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,use_proto_field_name
// @generated from protobuf file "Move.proto" (syntax proto3)
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
// @generated message type with reflection information, may provide speed optimized methods
class Move$Type extends MessageType<Move> {
    constructor() {
        super("Move", [
            { no: 1, name: "GUID", kind: "scalar", localName: "GUID", jsonName: "GUID", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "facingDirection", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 3, name: "movingDirection", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value?: PartialMessage<Move>): Move {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.GUID = "";
        message.facingDirection = 0;
        message.movingDirection = 0;
        if (value !== undefined)
            reflectionMergePartial<Move>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Move): Move {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string GUID = 1 [json_name = "GUID"];*/ 1:
                    message.GUID = reader.string();
                    break;
                case /* uint32 facingDirection */ 2:
                    message.facingDirection = reader.uint32();
                    break;
                case /* uint32 movingDirection */ 3:
                    message.movingDirection = reader.uint32();
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
    internalBinaryWrite(message: Move, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string GUID = 1 [json_name = "GUID"]; */
        if (message.GUID !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.GUID);
        /* uint32 facingDirection = 2; */
        if (message.facingDirection !== 0)
            writer.tag(2, WireType.Varint).uint32(message.facingDirection);
        /* uint32 movingDirection = 3; */
        if (message.movingDirection !== 0)
            writer.tag(3, WireType.Varint).uint32(message.movingDirection);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message Move
 */
export const Move = new Move$Type();
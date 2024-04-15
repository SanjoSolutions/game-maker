import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
// @generated message type with reflection information, may provide speed optimized methods
class Character$Type extends MessageType {
    constructor() {
        super("Character", [
            { no: 1, name: "GUID", kind: "scalar", localName: "GUID", jsonName: "GUID", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "x", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 3, name: "y", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 4, name: "isPlayed", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 5, name: "movingDirection", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 6, name: "facingDirection", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 7, name: "isMoving", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.GUID = "";
        message.x = 0;
        message.y = 0;
        message.isPlayed = false;
        message.movingDirection = 0;
        message.facingDirection = 0;
        message.isMoving = false;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string GUID = 1 [json_name = "GUID"];*/ 1:
                    message.GUID = reader.string();
                    break;
                case /* int32 x */ 2:
                    message.x = reader.int32();
                    break;
                case /* int32 y */ 3:
                    message.y = reader.int32();
                    break;
                case /* bool isPlayed */ 4:
                    message.isPlayed = reader.bool();
                    break;
                case /* uint32 movingDirection */ 5:
                    message.movingDirection = reader.uint32();
                    break;
                case /* uint32 facingDirection */ 6:
                    message.facingDirection = reader.uint32();
                    break;
                case /* bool isMoving */ 7:
                    message.isMoving = reader.bool();
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
        /* string GUID = 1 [json_name = "GUID"]; */
        if (message.GUID !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.GUID);
        /* int32 x = 2; */
        if (message.x !== 0)
            writer.tag(2, WireType.Varint).int32(message.x);
        /* int32 y = 3; */
        if (message.y !== 0)
            writer.tag(3, WireType.Varint).int32(message.y);
        /* bool isPlayed = 4; */
        if (message.isPlayed !== false)
            writer.tag(4, WireType.Varint).bool(message.isPlayed);
        /* uint32 movingDirection = 5; */
        if (message.movingDirection !== 0)
            writer.tag(5, WireType.Varint).uint32(message.movingDirection);
        /* uint32 facingDirection = 6; */
        if (message.facingDirection !== 0)
            writer.tag(6, WireType.Varint).uint32(message.facingDirection);
        /* bool isMoving = 7; */
        if (message.isMoving !== false)
            writer.tag(7, WireType.Varint).bool(message.isMoving);
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
//# sourceMappingURL=Character.js.map
import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Character } from "./Character.js";
// @generated message type with reflection information, may provide speed optimized methods
class SynchronizedState$Type extends MessageType {
    constructor() {
        super("SynchronizedState", [
            { no: 1, name: "characters", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Character },
            { no: 1000, name: "money", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 1001, name: "hasMentorGivenMoney", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.characters = [];
        message.money = 0;
        message.hasMentorGivenMoney = false;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated Character characters */ 1:
                    message.characters.push(Character.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* uint32 money */ 1000:
                    message.money = reader.uint32();
                    break;
                case /* bool hasMentorGivenMoney */ 1001:
                    message.hasMentorGivenMoney = reader.bool();
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
        /* repeated Character characters = 1; */
        for (let i = 0; i < message.characters.length; i++)
            Character.internalBinaryWrite(message.characters[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* uint32 money = 1000; */
        if (message.money !== 0)
            writer.tag(1000, WireType.Varint).uint32(message.money);
        /* bool hasMentorGivenMoney = 1001; */
        if (message.hasMentorGivenMoney !== false)
            writer.tag(1001, WireType.Varint).bool(message.hasMentorGivenMoney);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message SynchronizedState
 */
export const SynchronizedState = new SynchronizedState$Type();
//# sourceMappingURL=SynchronizedState.js.map
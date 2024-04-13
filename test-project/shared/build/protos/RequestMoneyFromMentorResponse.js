import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
// @generated message type with reflection information, may provide speed optimized methods
class RequestMoneyFromMentorResponse$Type extends MessageType {
    constructor() {
        super("RequestMoneyFromMentorResponse", [
            { no: 1, name: "money", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "hasMentorGivenMoney", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
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
                case /* uint32 money */ 1:
                    message.money = reader.uint32();
                    break;
                case /* bool hasMentorGivenMoney */ 2:
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
        /* uint32 money = 1; */
        if (message.money !== 0)
            writer.tag(1, WireType.Varint).uint32(message.money);
        /* bool hasMentorGivenMoney = 2; */
        if (message.hasMentorGivenMoney !== false)
            writer.tag(2, WireType.Varint).bool(message.hasMentorGivenMoney);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message RequestMoneyFromMentorResponse
 */
export const RequestMoneyFromMentorResponse = new RequestMoneyFromMentorResponse$Type();
//# sourceMappingURL=RequestMoneyFromMentorResponse.js.map
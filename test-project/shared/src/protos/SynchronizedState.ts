// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies
// @generated from protobuf file "SynchronizedState.proto" (syntax proto3)
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
 * @generated from protobuf message SynchronizedState
 */
export interface SynchronizedState {
    /**
     * @generated from protobuf field: uint32 money = 1;
     */
    money: number;
    /**
     * @generated from protobuf field: bool hasMentorGivenMoney = 2;
     */
    hasMentorGivenMoney: boolean;
}
// @generated message type with reflection information, may provide speed optimized methods
class SynchronizedState$Type extends MessageType<SynchronizedState> {
    constructor() {
        super("SynchronizedState", [
            { no: 1, name: "money", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "hasMentorGivenMoney", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<SynchronizedState>): SynchronizedState {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.money = 0;
        message.hasMentorGivenMoney = false;
        if (value !== undefined)
            reflectionMergePartial<SynchronizedState>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SynchronizedState): SynchronizedState {
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
    internalBinaryWrite(message: SynchronizedState, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
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
 * @generated MessageType for protobuf message SynchronizedState
 */
export const SynchronizedState = new SynchronizedState$Type();
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message RequestMoneyFromMentor
 */
export interface RequestMoneyFromMentor {
}
declare class RequestMoneyFromMentor$Type extends MessageType<RequestMoneyFromMentor> {
    constructor();
    create(value?: PartialMessage<RequestMoneyFromMentor>): RequestMoneyFromMentor;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RequestMoneyFromMentor): RequestMoneyFromMentor;
    internalBinaryWrite(message: RequestMoneyFromMentor, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message RequestMoneyFromMentor
 */
export declare const RequestMoneyFromMentor: RequestMoneyFromMentor$Type;
export {};
//# sourceMappingURL=RequestMoneyFromMentor.d.ts.map
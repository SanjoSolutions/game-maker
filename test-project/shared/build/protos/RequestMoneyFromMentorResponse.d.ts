import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message RequestMoneyFromMentorResponse
 */
export interface RequestMoneyFromMentorResponse {
    /**
     * @generated from protobuf field: uint32 money = 1;
     */
    money: number;
    /**
     * @generated from protobuf field: bool hasMentorGivenMoney = 2;
     */
    hasMentorGivenMoney: boolean;
}
declare class RequestMoneyFromMentorResponse$Type extends MessageType<RequestMoneyFromMentorResponse> {
    constructor();
    create(value?: PartialMessage<RequestMoneyFromMentorResponse>): RequestMoneyFromMentorResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RequestMoneyFromMentorResponse): RequestMoneyFromMentorResponse;
    internalBinaryWrite(message: RequestMoneyFromMentorResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message RequestMoneyFromMentorResponse
 */
export declare const RequestMoneyFromMentorResponse: RequestMoneyFromMentorResponse$Type;
export {};
//# sourceMappingURL=RequestMoneyFromMentorResponse.d.ts.map
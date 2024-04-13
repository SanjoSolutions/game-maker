import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message Error
 */
export interface Error {
    /**
     * @generated from protobuf field: string message = 1;
     */
    message: string;
}
declare class Error$Type extends MessageType<Error> {
    constructor();
    create(value?: PartialMessage<Error>): Error;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Error): Error;
    internalBinaryWrite(message: Error, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message Error
 */
export declare const Error: Error$Type;
export {};
//# sourceMappingURL=Error.d.ts.map
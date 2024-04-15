import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message Disconnect
 */
export interface Disconnect {
    /**
     * @generated from protobuf field: string GUID = 1 [json_name = "GUID"];
     */
    GUID: string;
}
declare class Disconnect$Type extends MessageType<Disconnect> {
    constructor();
    create(value?: PartialMessage<Disconnect>): Disconnect;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Disconnect): Disconnect;
    internalBinaryWrite(message: Disconnect, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message Disconnect
 */
export declare const Disconnect: Disconnect$Type;
export {};
//# sourceMappingURL=Disconnect.d.ts.map
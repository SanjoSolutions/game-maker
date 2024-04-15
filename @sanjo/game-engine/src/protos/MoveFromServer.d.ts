import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message MoveFromServer
 */
export interface MoveFromServer {
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
    /**
     * @generated from protobuf field: bool isMoving = 4;
     */
    isMoving: boolean;
}
declare class MoveFromServer$Type extends MessageType<MoveFromServer> {
    constructor();
    create(value?: PartialMessage<MoveFromServer>): MoveFromServer;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: MoveFromServer): MoveFromServer;
    internalBinaryWrite(message: MoveFromServer, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message MoveFromServer
 */
export declare const MoveFromServer: MoveFromServer$Type;
export {};
//# sourceMappingURL=MoveFromServer.d.ts.map
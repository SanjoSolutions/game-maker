import { MessageType as EngineMessageType } from "@sanjo/game-engine/clientServerCommunication/MessageType.js";
declare enum ProjectMessageType {
    RequestMoneyFromMentor = "requestMoneyFromMentor",
    RequestMoneyFromMentorResponse = "requestMoneyFromMentorResponse",
    SynchronizedState = "synchronizedState"
}
export declare const MessageType: {
    RequestMoneyFromMentor: ProjectMessageType.RequestMoneyFromMentor;
    RequestMoneyFromMentorResponse: ProjectMessageType.RequestMoneyFromMentorResponse;
    SynchronizedState: ProjectMessageType.SynchronizedState;
    Error: EngineMessageType.Error;
    Character: EngineMessageType.Character;
    Move: EngineMessageType.Move;
    MoveFromServer: EngineMessageType.MoveFromServer;
};
export {};
//# sourceMappingURL=MessageType.d.ts.map
import { MessageType as EngineMessageType } from "@sanjo/game-engine/clientServerCommunication/MessageType.js";
var ProjectMessageType;
(function (ProjectMessageType) {
    ProjectMessageType["RequestMoneyFromMentor"] = "requestMoneyFromMentor";
    ProjectMessageType["RequestMoneyFromMentorResponse"] = "requestMoneyFromMentorResponse";
    ProjectMessageType["SynchronizedState"] = "synchronizedState";
})(ProjectMessageType || (ProjectMessageType = {}));
export const MessageType = { ...EngineMessageType, ...ProjectMessageType };
//# sourceMappingURL=MessageType.js.map
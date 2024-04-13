import { Message } from "../protos/Message.js";
import { ProjectMessageType } from "./MessageType.js";
import { RequestMoneyFromMentor } from "../protos/RequestMoneyFromMentor.js";
export function createRequestMoneyFromMentor() {
    return Message.create({
        body: {
            oneofKind: ProjectMessageType.RequestMoneyFromMentor,
            requestMoneyFromMentor: RequestMoneyFromMentor.create(),
        },
    });
}
export function createRequestMoneyFromMentorResponse(requestMoneyFromMentorResponse) {
    return Message.create({
        body: {
            oneofKind: ProjectMessageType.RequestMoneyFromMentorResponse,
            requestMoneyFromMentorResponse,
        },
    });
}
export function createSynchronizedState(synchronizedState) {
    return Message.create({
        body: {
            oneofKind: ProjectMessageType.SynchronizedState,
            synchronizedState,
        },
    });
}
//# sourceMappingURL=messageFactories.js.map
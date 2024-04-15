import { Message } from "../protos/Message.js";
import { MessageType } from "./MessageType.js";
import { RequestMoneyFromMentor } from "../protos/RequestMoneyFromMentor.js";
export function createRequestMoneyFromMentor() {
    return Message.create({
        body: {
            oneofKind: MessageType.RequestMoneyFromMentor,
            requestMoneyFromMentor: RequestMoneyFromMentor.create(),
        },
    });
}
export function createRequestMoneyFromMentorResponse(requestMoneyFromMentorResponse) {
    return Message.create({
        body: {
            oneofKind: MessageType.RequestMoneyFromMentorResponse,
            requestMoneyFromMentorResponse,
        },
    });
}
export function createSynchronizedState(synchronizedState) {
    return Message.create({
        body: {
            oneofKind: MessageType.SynchronizedState,
            synchronizedState,
        },
    });
}
//# sourceMappingURL=messageFactories.js.map
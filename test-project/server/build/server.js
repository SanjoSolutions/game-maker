import { WebSocketServer } from "ws";
import { Error as ErrorProto } from "@sanjo/game-engine/protos/Error.js";
import { RequestMoneyFromMentorResponse } from "@sanjo/test-project-shared/protos/RequestMoneyFromMentorResponse.js";
import { Message } from "@sanjo/test-project-shared/protos/Message.js";
import { createCharacterMessage, createError, } from "@sanjo/game-engine/clientServerCommunication/messageFactories.js";
import { createRequestMoneyFromMentorResponse, createSynchronizedState, } from "@sanjo/test-project-shared/clientServerCommunication/messageFactories.js";
import { Subject } from "rxjs";
import { MessageType } from "@sanjo/test-project-shared/clientServerCommunication/MessageType.js";
import { randomUUID } from "node:crypto";
import { createMoveFromServerMessage } from "@sanjo/game-engine/clientServerCommunication/messageFactories.js";
import { isFlagSet } from "@sanjo/game-engine/isFlagSet.js";
import { Direction } from "@sanjo/game-engine";
class GameServer {
    money = 0;
    hasMentorGivenMoney = false;
    onConnect = new Subject();
    inStream = new Subject();
    clients = [];
    socketToClient = new Map();
    constructor() {
        this.onConnect.subscribe(({ socket }) => {
            const otherClients = Array.from(this.clients);
            const character = {
                GUID: randomUUID(),
                x: 32,
                y: 6 * 32,
                isPlayed: false,
                movingDirection: Direction.None,
                facingDirection: Direction.Down,
                isMoving: false,
            };
            const client = {
                socket,
                characterGUID: character.GUID,
                character,
            };
            this.clients.push(client);
            this.socketToClient.set(socket, client);
            this.sendCharacterToClients(character, otherClients);
            this.updateCharacterPositions();
            socket.send(Message.toBinary(createSynchronizedState({
                money: this.money,
                hasMentorGivenMoney: this.hasMentorGivenMoney,
                characters: this.clients.map((client) => client.socket === socket
                    ? { ...client.character, isPlayed: true }
                    : client.character),
            })));
        });
        this.inStream.subscribe(({ message, socket }) => {
            if (message.body.oneofKind === MessageType.RequestMoneyFromMentor) {
                console.log("RequestMoneyFromMentor", message);
                try {
                    const updatedState = this.requestMoneyFromMentor();
                    socket.send(Message.toBinary(createRequestMoneyFromMentorResponse(RequestMoneyFromMentorResponse.create(updatedState))));
                }
                catch (error) {
                    socket.send(Message.toBinary(createError(Message, ErrorProto.create({
                        message: error.message,
                    }))));
                }
            }
            else if (message.body.oneofKind === MessageType.Move) {
                const client = this.socketToClient.get(socket);
                const move = message.body.move;
                if (client && this.isCharacterOfClient(move.GUID, client)) {
                    const character = client.character;
                    character.movingDirection = move.movingDirection;
                    character.facingDirection = move.facingDirection;
                    character.isMoving = move.movingDirection !== Direction.None;
                    const moveFromServer = {
                        GUID: move.GUID,
                        facingDirection: character.facingDirection,
                        movingDirection: character.movingDirection,
                        isMoving: character.isMoving,
                    };
                    this.sendMoveFromServerToClients(moveFromServer);
                }
            }
        });
    }
    updateCharacterPositions() {
        for (const character of this.clients.map((client) => client.character)) {
            this.updateCharacterPosition(character);
        }
    }
    updateCharacterPosition(character) {
        console.log("a", character);
        if (character.isMoving) {
            let xFactor;
            if (isFlagSet(character.movingDirection, Direction.Left) &&
                !isFlagSet(character.movingDirection, Direction.Right)) {
                xFactor = 1;
            }
            else if (isFlagSet(character.movingDirection, Direction.Right) &&
                !isFlagSet(character.movingDirection, Direction.Left)) {
                xFactor = -1;
            }
            else {
                xFactor = 0;
            }
            let yFactor;
            if (isFlagSet(character.movingDirection, Direction.Down) &&
                !isFlagSet(character.movingDirection, Direction.Up)) {
                yFactor = 1;
            }
            else if (isFlagSet(character.movingDirection, Direction.Up) &&
                !isFlagSet(character.movingDirection, Direction.Down)) {
                yFactor = -1;
            }
            else {
                yFactor = 0;
            }
            const time = Date.now();
            const duration = time - (character.positionUpdateTime || character.hasStartedMovingTime);
            const speed = 1;
            character.x = xFactor * duration * speed;
            character.y = yFactor * duration * speed;
            character.positionUpdateTime = time;
        }
    }
    isCharacterOfClient(GUID, client) {
        return GUID === client.characterGUID;
    }
    sendMoveFromServerToClients(moveFromServer) {
        for (const client of this.clients) {
            this.sendMoveFromServerToClient(moveFromServer, client);
        }
    }
    sendMoveFromServerToClient(moveFromServer, client) {
        client.socket.send(Message.toBinary(createMoveFromServerMessage(Message, moveFromServer)));
    }
    sendCharacterToClients(character, clients) {
        for (const client of clients) {
            this.sendCharacterToClient(character, client);
        }
    }
    sendCharacterToClient(character, client) {
        client.socket.send(Message.toBinary(createCharacterMessage(Message, character)));
    }
    requestMoneyFromMentor() {
        if (this.hasMentorGivenMoney) {
            throw new Error("The mentor has already given money and only gives money once.");
        }
        else {
            this.money += 50;
            this.hasMentorGivenMoney = true;
            return {
                money: this.money,
                hasMentorGivenMoney: this.hasMentorGivenMoney,
            };
        }
    }
}
class GameServerWithWebSocket extends GameServer {
    async listen() {
        return new Promise((resolve, onError) => {
            const webSocketServer = new WebSocketServer({ port: 8080 }, () => {
                resolve(null);
            });
            webSocketServer.once("error", onError);
            webSocketServer.on("connection", (webSocket) => {
                webSocket.on("error", console.error);
                webSocket.on("message", (data) => {
                    const message = Message.fromBinary(data);
                    this.inStream.next({ message, socket: webSocket });
                });
                this.onConnect.next({ socket: webSocket });
            });
        });
    }
}
const server = new GameServerWithWebSocket();
await server.listen();
//# sourceMappingURL=server.js.map
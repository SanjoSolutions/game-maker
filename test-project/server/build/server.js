// src/server.ts
import { WebSocketServer } from "ws";

// ../shared/src/protos/Error.ts
import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
var Error$Type = class extends MessageType {
  constructor() {
    super("Error", [
      {
        no: 1,
        name: "message",
        kind: "scalar",
        T: 9
        /*ScalarType.STRING*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.message = "";
    if (value !== void 0)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string message */
        1:
          message.message = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.message !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.message);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Error2 = new Error$Type();

// ../shared/src/protos/RequestMoneyFromMentorResponse.ts
import { WireType as WireType2 } from "@protobuf-ts/runtime";
import { UnknownFieldHandler as UnknownFieldHandler2 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial2 } from "@protobuf-ts/runtime";
import { MessageType as MessageType2 } from "@protobuf-ts/runtime";
var RequestMoneyFromMentorResponse$Type = class extends MessageType2 {
  constructor() {
    super("RequestMoneyFromMentorResponse", [
      {
        no: 1,
        name: "money",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      },
      {
        no: 2,
        name: "hasMentorGivenMoney",
        kind: "scalar",
        T: 8
        /*ScalarType.BOOL*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.money = 0;
    message.hasMentorGivenMoney = false;
    if (value !== void 0)
      reflectionMergePartial2(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint32 money */
        1:
          message.money = reader.uint32();
          break;
        case /* bool hasMentorGivenMoney */
        2:
          message.hasMentorGivenMoney = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler2.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.money !== 0)
      writer.tag(1, WireType2.Varint).uint32(message.money);
    if (message.hasMentorGivenMoney !== false)
      writer.tag(2, WireType2.Varint).bool(message.hasMentorGivenMoney);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler2.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var RequestMoneyFromMentorResponse = new RequestMoneyFromMentorResponse$Type();

// ../shared/src/protos/Message.ts
import { WireType as WireType5 } from "@protobuf-ts/runtime";
import { UnknownFieldHandler as UnknownFieldHandler6 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial6 } from "@protobuf-ts/runtime";
import { MessageType as MessageType6 } from "@protobuf-ts/runtime";

// ../shared/src/protos/SynchronizedState.ts
import { WireType as WireType3 } from "@protobuf-ts/runtime";
import { UnknownFieldHandler as UnknownFieldHandler3 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial3 } from "@protobuf-ts/runtime";
import { MessageType as MessageType3 } from "@protobuf-ts/runtime";
var SynchronizedState$Type = class extends MessageType3 {
  constructor() {
    super("SynchronizedState", [
      {
        no: 1,
        name: "money",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      },
      {
        no: 2,
        name: "hasMentorGivenMoney",
        kind: "scalar",
        T: 8
        /*ScalarType.BOOL*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.money = 0;
    message.hasMentorGivenMoney = false;
    if (value !== void 0)
      reflectionMergePartial3(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint32 money */
        1:
          message.money = reader.uint32();
          break;
        case /* bool hasMentorGivenMoney */
        2:
          message.hasMentorGivenMoney = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler3.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.money !== 0)
      writer.tag(1, WireType3.Varint).uint32(message.money);
    if (message.hasMentorGivenMoney !== false)
      writer.tag(2, WireType3.Varint).bool(message.hasMentorGivenMoney);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler3.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var SynchronizedState = new SynchronizedState$Type();

// ../shared/src/protos/RequestMoneyFromMentor.ts
import { UnknownFieldHandler as UnknownFieldHandler4 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial4 } from "@protobuf-ts/runtime";
import { MessageType as MessageType4 } from "@protobuf-ts/runtime";
var RequestMoneyFromMentor$Type = class extends MessageType4 {
  constructor() {
    super("RequestMoneyFromMentor", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== void 0)
      reflectionMergePartial4(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    return target ?? this.create();
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler4.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var RequestMoneyFromMentor = new RequestMoneyFromMentor$Type();

// ../shared/src/protos/Character.ts
import { WireType as WireType4 } from "@protobuf-ts/runtime";
import { UnknownFieldHandler as UnknownFieldHandler5 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial5 } from "@protobuf-ts/runtime";
import { MessageType as MessageType5 } from "@protobuf-ts/runtime";
var Character$Type = class extends MessageType5 {
  constructor() {
    super("Character", [
      {
        no: 1,
        name: "x",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      },
      {
        no: 2,
        name: "y",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.x = 0;
    message.y = 0;
    if (value !== void 0)
      reflectionMergePartial5(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint32 x */
        1:
          message.x = reader.uint32();
          break;
        case /* uint32 y */
        2:
          message.y = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler5.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.x !== 0)
      writer.tag(1, WireType4.Varint).uint32(message.x);
    if (message.y !== 0)
      writer.tag(2, WireType4.Varint).uint32(message.y);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler5.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Character = new Character$Type();

// ../shared/src/protos/Message.ts
var Message$Type = class extends MessageType6 {
  constructor() {
    super("Message", [
      { no: 1, name: "error", kind: "message", oneof: "body", T: () => Error2 },
      { no: 2, name: "character", kind: "message", oneof: "body", T: () => Character },
      { no: 1e3, name: "requestMoneyFromMentor", kind: "message", oneof: "body", T: () => RequestMoneyFromMentor },
      { no: 1001, name: "requestMoneyFromMentorResponse", kind: "message", oneof: "body", T: () => RequestMoneyFromMentorResponse },
      { no: 1002, name: "synchronizedState", kind: "message", oneof: "body", T: () => SynchronizedState }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.body = { oneofKind: void 0 };
    if (value !== void 0)
      reflectionMergePartial6(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* Error error */
        1:
          message.body = {
            oneofKind: "error",
            error: Error2.internalBinaryRead(reader, reader.uint32(), options, message.body.error)
          };
          break;
        case /* Character character */
        2:
          message.body = {
            oneofKind: "character",
            character: Character.internalBinaryRead(reader, reader.uint32(), options, message.body.character)
          };
          break;
        case /* RequestMoneyFromMentor requestMoneyFromMentor */
        1e3:
          message.body = {
            oneofKind: "requestMoneyFromMentor",
            requestMoneyFromMentor: RequestMoneyFromMentor.internalBinaryRead(reader, reader.uint32(), options, message.body.requestMoneyFromMentor)
          };
          break;
        case /* RequestMoneyFromMentorResponse requestMoneyFromMentorResponse */
        1001:
          message.body = {
            oneofKind: "requestMoneyFromMentorResponse",
            requestMoneyFromMentorResponse: RequestMoneyFromMentorResponse.internalBinaryRead(reader, reader.uint32(), options, message.body.requestMoneyFromMentorResponse)
          };
          break;
        case /* SynchronizedState synchronizedState */
        1002:
          message.body = {
            oneofKind: "synchronizedState",
            synchronizedState: SynchronizedState.internalBinaryRead(reader, reader.uint32(), options, message.body.synchronizedState)
          };
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler6.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.body.oneofKind === "error")
      Error2.internalBinaryWrite(message.body.error, writer.tag(1, WireType5.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "character")
      Character.internalBinaryWrite(message.body.character, writer.tag(2, WireType5.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "requestMoneyFromMentor")
      RequestMoneyFromMentor.internalBinaryWrite(message.body.requestMoneyFromMentor, writer.tag(1e3, WireType5.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "requestMoneyFromMentorResponse")
      RequestMoneyFromMentorResponse.internalBinaryWrite(message.body.requestMoneyFromMentorResponse, writer.tag(1001, WireType5.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "synchronizedState")
      SynchronizedState.internalBinaryWrite(message.body.synchronizedState, writer.tag(1002, WireType5.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler6.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Message = new Message$Type();

// ../../@sanjo/game-engine/src/protos/Message.ts
import { WireType as WireType8 } from "@protobuf-ts/runtime";
import { UnknownFieldHandler as UnknownFieldHandler9 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial9 } from "@protobuf-ts/runtime";
import { MessageType as MessageType9 } from "@protobuf-ts/runtime";

// ../../@sanjo/game-engine/src/protos/Character.ts
import { WireType as WireType6 } from "@protobuf-ts/runtime";
import { UnknownFieldHandler as UnknownFieldHandler7 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial7 } from "@protobuf-ts/runtime";
import { MessageType as MessageType7 } from "@protobuf-ts/runtime";
var Character$Type2 = class extends MessageType7 {
  constructor() {
    super("Character", [
      {
        no: 1,
        name: "x",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      },
      {
        no: 2,
        name: "y",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.x = 0;
    message.y = 0;
    if (value !== void 0)
      reflectionMergePartial7(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint32 x */
        1:
          message.x = reader.uint32();
          break;
        case /* uint32 y */
        2:
          message.y = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler7.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.x !== 0)
      writer.tag(1, WireType6.Varint).uint32(message.x);
    if (message.y !== 0)
      writer.tag(2, WireType6.Varint).uint32(message.y);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler7.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Character2 = new Character$Type2();

// ../../@sanjo/game-engine/src/protos/Error.ts
import { WireType as WireType7 } from "@protobuf-ts/runtime";
import { UnknownFieldHandler as UnknownFieldHandler8 } from "@protobuf-ts/runtime";
import { reflectionMergePartial as reflectionMergePartial8 } from "@protobuf-ts/runtime";
import { MessageType as MessageType8 } from "@protobuf-ts/runtime";
var Error$Type2 = class extends MessageType8 {
  constructor() {
    super("Error", [
      {
        no: 1,
        name: "message",
        kind: "scalar",
        T: 9
        /*ScalarType.STRING*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.message = "";
    if (value !== void 0)
      reflectionMergePartial8(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string message */
        1:
          message.message = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler8.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.message !== "")
      writer.tag(1, WireType7.LengthDelimited).string(message.message);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler8.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Error3 = new Error$Type2();

// ../../@sanjo/game-engine/src/protos/Message.ts
var Message$Type2 = class extends MessageType9 {
  constructor() {
    super("Message", [
      { no: 1, name: "error", kind: "message", oneof: "body", T: () => Error3 },
      { no: 2, name: "character", kind: "message", oneof: "body", T: () => Character2 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.body = { oneofKind: void 0 };
    if (value !== void 0)
      reflectionMergePartial9(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* Error error */
        1:
          message.body = {
            oneofKind: "error",
            error: Error3.internalBinaryRead(reader, reader.uint32(), options, message.body.error)
          };
          break;
        case /* Character character */
        2:
          message.body = {
            oneofKind: "character",
            character: Character2.internalBinaryRead(reader, reader.uint32(), options, message.body.character)
          };
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler9.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.body.oneofKind === "error")
      Error3.internalBinaryWrite(message.body.error, writer.tag(1, WireType8.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "character")
      Character2.internalBinaryWrite(message.body.character, writer.tag(2, WireType8.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler9.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Message2 = new Message$Type2();

// ../../@sanjo/game-engine/src/clientServerCommunication/messageFactories.ts
function createError(error) {
  return Message2.create({
    body: {
      oneofKind: "error" /* Error */,
      error
    }
  });
}
function createCharacterMessage(character) {
  return Message2.create({
    body: {
      oneofKind: "character" /* Character */,
      character
    }
  });
}

// ../shared/src/clientServerCommunication/messageFactories.ts
function createRequestMoneyFromMentorResponse(requestMoneyFromMentorResponse) {
  return Message.create({
    body: {
      oneofKind: "requestMoneyFromMentorResponse" /* RequestMoneyFromMentorResponse */,
      requestMoneyFromMentorResponse
    }
  });
}
function createSynchronizedState(synchronizedState) {
  return Message.create({
    body: {
      oneofKind: "synchronizedState" /* SynchronizedState */,
      synchronizedState
    }
  });
}

// src/server.ts
import { Subject } from "rxjs";

// ../shared/src/Character.ts
var Character3 = class {
  x = 0;
  y = 0;
};

// src/server.ts
var GameServer = class {
  money = 0;
  hasMentorGivenMoney = false;
  onConnect = new Subject();
  inStream = new Subject();
  clients = [];
  constructor() {
    this.onConnect.subscribe(({ socket }) => {
      const otherClients = Array.from(this.clients);
      this.clients.push(socket);
      const character = new Character3();
      character.x = 32;
      character.y = 6 * 32;
      this.sendCharacterToClients(character, otherClients);
      socket.send(
        Message.toBinary(
          createSynchronizedState({
            money: this.money,
            hasMentorGivenMoney: this.hasMentorGivenMoney
          })
        )
      );
    });
    this.inStream.subscribe(({ message, socket }) => {
      if (message.body.oneofKind === "requestMoneyFromMentor" /* RequestMoneyFromMentor */) {
        console.log("RequestMoneyFromMentor", message);
        try {
          const updatedState = this.requestMoneyFromMentor();
          socket.send(
            Message.toBinary(
              createRequestMoneyFromMentorResponse(
                RequestMoneyFromMentorResponse.create(updatedState)
              )
            )
          );
        } catch (error) {
          socket.send(
            Message.toBinary(
              createError(
                Error2.create({
                  message: error.message
                })
              )
            )
          );
        }
      }
    });
  }
  sendCharacterToClients(character, clients) {
    for (const client of clients) {
      this.sendCharacterToClient(character, client);
    }
  }
  sendCharacterToClient(character, client) {
    client.send(Message.toBinary(createCharacterMessage(character)));
  }
  requestMoneyFromMentor() {
    if (this.hasMentorGivenMoney) {
      throw new Error(
        "The mentor has already given money and only gives money once."
      );
    } else {
      this.money += 50;
      this.hasMentorGivenMoney = true;
      return {
        money: this.money,
        hasMentorGivenMoney: this.hasMentorGivenMoney
      };
    }
  }
};
var GameServerWithWebSocket = class extends GameServer {
  listen() {
    const webSocketServer = new WebSocketServer({ port: 8080 });
    webSocketServer.on("connection", (webSocket) => {
      webSocket.on("error", console.error);
      webSocket.on("message", (data) => {
        const message = Message.fromBinary(data);
        this.inStream.next({ message, socket: webSocket });
      });
      this.onConnect.next({ socket: webSocket });
    });
  }
};
var server = new GameServerWithWebSocket();
server.listen();
//# sourceMappingURL=server.js.map

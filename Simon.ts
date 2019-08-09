import { receiveMessageServer, waitForMessage } from "./receiveMessageServer";
import { VAL, BYE, ADD, MUL, SUM, PRD, Message, NOMESSAGE } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";

enum messages {
    VAL = "VAL",
    BYE = "BYE",
    ADD = "ADD",
    MUL = "MUL",
    SUM = "SUM",
    PRD = "PRD",
    NOMESSAGE = "NOMESSAGE"
}

interface ISimon {
    messageFrom: roles;
    messageType: messages;
    message: Message;
}

interface ISimon_S1 extends ISimon {
    recv(): Promise<ISimon_S2 | ISimon_S3>;
}

interface ISimon_S2 extends ISimon {
    recv(): Promise<ISimon_S4 | ISimon_S5>;
}

interface ISimon_S3 extends ISimon {
}

interface ISimon_S4 extends ISimon {
    sendSUM(sum: SUM): Promise<ISimon_S1>;
}

interface ISimon_S5 extends ISimon {
    sendPRD(prd: PRD): Promise<ISimon_S1>;
}

abstract class Simon {
    public messageFrom = roles.simon;
    public messageType = messages.NOMESSAGE;
    public message = new NOMESSAGE();
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Simon_S1 extends Simon implements ISimon_S1 {
    constructor() {
        super();
    }
    async recv(): Promise<ISimon_S2 | ISimon_S3> {
        try {
            super.checkOneTransitionPossible();
        }
        catch (exc) {
            return new Promise((resolve, reject) => reject(exc));
        }
        let msg = await waitForMessage();
        return new Promise(resolve => {
            switch (msg.name + msg.from) {
                case VAL.name + roles.colin: {
                    resolve(new Simon_S2(msg.from, messages.VAL, msg));
                    break;
                }
                case BYE.name + roles.colin: {
                    resolve(new Simon_S3(msg.from, messages.BYE, msg));
                    break;
                }
            }
        });
    }
}

class Simon_S2 extends Simon implements ISimon_S2 {
    constructor(messageFrom: roles, messageType: messages, message: Message) {
        super();
        super.messageFrom = messageFrom;
        super.messageType = messageType;
        super.message = message;
    }
    async recv(): Promise<ISimon_S4 | ISimon_S5> {
        try {
            super.checkOneTransitionPossible();
        }
        catch (exc) {
            return new Promise((resolve, reject) => reject(exc));
        }
        let msg = await waitForMessage();
        return new Promise(resolve => {
            switch (msg.name + msg.from) {
                case ADD.name + roles.colin: {
                    resolve(new Simon_S4(msg.from, messages.ADD, msg));
                    break;
                }
                case MUL.name + roles.colin: {
                    resolve(new Simon_S5(msg.from, messages.MUL, msg));
                    break;
                }
            }
        });
    }
}

class Simon_S3 extends Simon implements ISimon_S3 {
    constructor(messageFrom: roles, messageType: messages, message: Message) {
        super();
        super.messageFrom = messageFrom;
        super.messageType = messageType;
        super.message = message;
        receiveMessageServer.terminate();
    }
}

class Simon_S4 extends Simon implements ISimon_S4 {
    constructor(messageFrom: roles, messageType: messages, message: Message) {
        super();
        super.messageFrom = messageFrom;
        super.messageType = messageType;
        super.message = message;
    }
    async sendSUM(sum: SUM): Promise<ISimon_S1> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.simon, roles.colin, sum);
        return new Promise(resolve => resolve(new Simon_S1));
    }
}

class Simon_S5 extends Simon implements ISimon_S5 {
    constructor(messageFrom: roles, messageType: messages, message: Message) {
        super();
        super.messageFrom = messageFrom;
        super.messageType = messageType;
        super.message = message;
    }
    async sendPRD(prd: PRD): Promise<ISimon_S1> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.simon, roles.colin, prd);
        return new Promise(resolve => resolve(new Simon_S1));
    }
}

type Simon_Start = ISimon_S1;
type Simon_End = ISimon_S3;

async function executeProtocol(f: (Simon_Start: Simon_Start) => Promise<Simon_End>, host: string, port: number) {
    console.log(`Simon started ${new Date()}`);
    await initialize(roles.simon, port, host);
    let done = await f(new Simon_S1());
    return new Promise<Simon_End>(resolve => resolve(done));
}

export { ISimon, ISimon_S1, ISimon_S2, ISimon_S3, ISimon_S4, ISimon_S5, messages, Simon_Start, Simon_End, executeProtocol, roles };


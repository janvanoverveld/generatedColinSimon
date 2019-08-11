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
    PRD = "PRD"
}

interface IColin {
}

interface IColin_S1 extends IColin {
    sendVAL(val: VAL): Promise<IColin_S2>;
    sendBYE(bye: BYE): Promise<IColin_S3>;
}

interface IColin_S1_1 extends IColin_S1 {
    readonly messageFrom: roles.simon;
    readonly messageType: messages.SUM;
    message: SUM;
}

interface IColin_S1_2 extends IColin_S1 {
    readonly messageFrom: roles.simon;
    readonly messageType: messages.PRD;
    message: PRD;
}

interface IColin_S2 extends IColin {
    sendADD(add: ADD): Promise<IColin_S4>;
    sendMUL(mul: MUL): Promise<IColin_S5>;
}

interface IColin_S3 extends IColin {
}

interface IColin_S4 extends IColin {
    recv(): Promise<IColin_S1_1>;
}

interface IColin_S5 extends IColin {
    recv(): Promise<IColin_S1_2>;
}

abstract class Colin implements IColin {
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Colin_S1 extends Colin implements IColin_S1 {
    constructor() {
        super();
    }
    async sendVAL(val: VAL): Promise<IColin_S2> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.colin, roles.simon, val);
        return new Promise(resolve => resolve(new Colin_S2));
    }
    async sendBYE(bye: BYE): Promise<IColin_S3> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.colin, roles.simon, bye);
        return new Promise(resolve => resolve(new Colin_S3));
    }
}
class Colin_S1_1 extends Colin_S1 implements IColin_S1_1 {
    readonly messageFrom = roles.simon;
    readonly messageType = messages.SUM;
    constructor(public message: SUM) {
        super();
    }
}
class Colin_S1_2 extends Colin_S1 implements IColin_S1_2 {
    readonly messageFrom = roles.simon;
    readonly messageType = messages.PRD;
    constructor(public message: PRD) {
        super();
    }
}

class Colin_S2 extends Colin implements IColin_S2 {
    constructor() {
        super();
    }
    async sendADD(add: ADD): Promise<IColin_S4> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.colin, roles.simon, add);
        return new Promise(resolve => resolve(new Colin_S4));
    }
    async sendMUL(mul: MUL): Promise<IColin_S5> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.colin, roles.simon, mul);
        return new Promise(resolve => resolve(new Colin_S5));
    }
}

class Colin_S3 extends Colin implements IColin_S3 {
    constructor() {
        super();
        receiveMessageServer.terminate();
    }
}

class Colin_S4 extends Colin implements IColin_S4 {
    constructor() {
        super();
    }
    async recv(): Promise<IColin_S1_1> {
        try {
            super.checkOneTransitionPossible();
        }
        catch (exc) {
            return new Promise((resolve, reject) => reject(exc));
        }
        let msg = await waitForMessage();
        return new Promise(resolve => {
            switch (msg.name + msg.from) {
                case SUM.name + roles.simon: {
                    resolve(new Colin_S1_1((<SUM>msg)));
                    break;
                }
            }
        });
    }
}

class Colin_S5 extends Colin implements IColin_S5 {
    constructor() {
        super();
    }
    async recv(): Promise<IColin_S1_2> {
        try {
            super.checkOneTransitionPossible();
        }
        catch (exc) {
            return new Promise((resolve, reject) => reject(exc));
        }
        let msg = await waitForMessage();
        return new Promise(resolve => {
            switch (msg.name + msg.from) {
                case PRD.name + roles.simon: {
                    resolve(new Colin_S1_2((<PRD>msg)));
                    break;
                }
            }
        });
    }
}

type Colin_Start = IColin_S1;
type Colin_End = IColin_S3;

async function executeProtocol(f: (Colin_Start: Colin_Start) => Promise<Colin_End>, host: string, port: number) {
    console.log(`Colin started ${new Date()}`);
    await initialize(roles.colin, port, host);
    let done = await f(new Colin_S1());
    return new Promise<Colin_End>(resolve => resolve(done));
}

export { IColin, IColin_S2, IColin_S4, IColin_S5, messages, Colin_Start, Colin_End, executeProtocol, roles };


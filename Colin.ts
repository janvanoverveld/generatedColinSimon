import { receiveMessageServer, waitForMessage } from "./receiveMessageServer";
import { VAL, BYE, ADD, MUL, SUM, PRD } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";

interface IColin {
    state: string;
}

interface IColin_S1 extends IColin {
    readonly state: "S1";
    sum?: SUM;
    prd?: PRD;
    sendVAL(val: VAL): Promise<IColin_S2>;
    sendBYE(bye: BYE): Promise<IColin_S3>;
}

interface IColin_S2 extends IColin {
    readonly state: "S2";
    sendADD(add: ADD): Promise<IColin_S4>;
    sendMUL(mul: MUL): Promise<IColin_S5>;
}

interface IColin_S3 extends IColin {
    readonly state: "S3";
}

interface IColin_S4 extends IColin {
    readonly state: "S4";
    recv(): Promise<IColin_S1>;
}

interface IColin_S5 extends IColin {
    readonly state: "S5";
    recv(): Promise<IColin_S1>;
}

abstract class Colin {
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Colin_S1 extends Colin implements IColin_S1 {
    public readonly state = "S1";
    constructor(public sum?: SUM, public prd?: PRD) {
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

class Colin_S2 extends Colin implements IColin_S2 {
    public readonly state = "S2";
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
    public readonly state = "S3";
    constructor() {
        super();
        receiveMessageServer.terminate();
    }
}

class Colin_S4 extends Colin implements IColin_S4 {
    public readonly state = "S4";
    constructor() {
        super();
    }
    async recv(): Promise<IColin_S1> {
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
                    resolve(new Colin_S1((<SUM>msg)));
                    break;
                }
            }
        });
    }
}

class Colin_S5 extends Colin implements IColin_S5 {
    public readonly state = "S5";
    constructor() {
        super();
    }
    async recv(): Promise<IColin_S1> {
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
                    resolve(new Colin_S1(undefined, (<PRD>msg)));
                    break;
                }
            }
        });
    }
}

export { IColin, IColin_S1, IColin_S2, IColin_S3, IColin_S4, IColin_S5 };

export async function executeProtocol(f: (IColin_S1: IColin_S1) => Promise<IColin_S3>, host: string, port: number) {
    console.log(`Colin started ${new Date()}`);
    await initialize(roles.colin, port, host);
    let done = await f(new Colin_S1());
    return new Promise<IColin_S3>(resolve => resolve(done));
}

import { receiveMessageServer, waitForMessage } from "./receiveMessageServer";
import { VAL, BYE, ADD, MUL, SUM, PRD } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";

interface ISimon {
    state: string;
}

interface ISimon_S1 extends ISimon {
    readonly state: "S1";
    recv(): Promise<ISimon_S2 | ISimon_S3>;
}

interface ISimon_S2 extends ISimon {
    readonly state: "S2";
    val: VAL;
    recv(): Promise<ISimon_S4 | ISimon_S5>;
}

interface ISimon_S3 extends ISimon {
    readonly state: "S3";
    bye: BYE;
}

interface ISimon_S4 extends ISimon {
    readonly state: "S4";
    add: ADD;
    sendSUM(sum: SUM): Promise<ISimon_S1>;
}

interface ISimon_S5 extends ISimon {
    readonly state: "S5";
    mul: MUL;
    sendPRD(prd: PRD): Promise<ISimon_S1>;
}

abstract class Simon {
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Simon_S1 extends Simon implements ISimon_S1 {
    public readonly state = "S1";
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
                    resolve(new Simon_S2((<VAL>msg)));
                    break;
                }
                case BYE.name + roles.colin: {
                    resolve(new Simon_S3((<BYE>msg)));
                    break;
                }
            }
        });
    }
}

class Simon_S2 extends Simon implements ISimon_S2 {
    public readonly state = "S2";
    constructor(public val: VAL) {
        super();
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
                    resolve(new Simon_S4((<ADD>msg)));
                    break;
                }
                case MUL.name + roles.colin: {
                    resolve(new Simon_S5((<MUL>msg)));
                    break;
                }
            }
        });
    }
}

class Simon_S3 extends Simon implements ISimon_S3 {
    public readonly state = "S3";
    constructor(public bye: BYE) {
        super();
        receiveMessageServer.terminate();
    }
}

class Simon_S4 extends Simon implements ISimon_S4 {
    public readonly state = "S4";
    constructor(public add: ADD) {
        super();
    }
    async sendSUM(sum: SUM): Promise<ISimon_S1> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.simon, roles.colin, sum);
        return new Promise(resolve => resolve(new Simon_S1));
    }
}

class Simon_S5 extends Simon implements ISimon_S5 {
    public readonly state = "S5";
    constructor(public mul: MUL) {
        super();
    }
    async sendPRD(prd: PRD): Promise<ISimon_S1> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.simon, roles.colin, prd);
        return new Promise(resolve => resolve(new Simon_S1));
    }
}

export { ISimon, ISimon_S1, ISimon_S2, ISimon_S3, ISimon_S4, ISimon_S5 };

export async function executeProtocol(f: (ISimon_S1: ISimon_S1) => Promise<ISimon_S3>, host: string, port: number) {
    console.log(`Simon started ${new Date()}`);
    await initialize(roles.simon, port, host);
    let done = await f(new Simon_S1());
    return new Promise<ISimon_S3>(resolve => resolve(done));
}

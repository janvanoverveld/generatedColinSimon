import {connectedRoles,roles} from './globalObjects';

export abstract class Message {
    public from:roles=roles.mediator;
    constructor(public name:string){};
}

export class NOMESSAGE extends Message {
    constructor(){
        super(NOMESSAGE.name);
    }
}

export class ROLEMESSAGE extends Message {
    public host:string;
    public port:number;
    constructor(public roleName:roles){
        super(ROLEMESSAGE.name);
        this.host = connectedRoles.getInfo(roleName).host;
        this.port = connectedRoles.getInfo(roleName).port;
    }
}

export class READY extends Message {
    constructor(){
        super(READY.name);
    }
}

//
//
// extra custom classes
//

export class VAL extends Message {
    constructor(public val: number) {
        super(VAL.name);
    }
}

export class ADD extends Message {
    constructor(public add: number) {
        super(ADD.name);
    }
}

export class MUL extends Message {
    constructor(public mul: number) {
        super(MUL.name);
    }
}

export class SUM extends Message {
    constructor(public sum: number) {
        super(SUM.name);
    }
}

export class PRD extends Message {
    constructor(public prd: number) {
        super(PRD.name);
    }
}
export class BYE extends Message {
    constructor() {
        super(BYE.name);
    }
}

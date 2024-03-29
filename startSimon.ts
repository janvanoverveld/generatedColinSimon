import {ISimon, Simon_Start, ISimon_S2, Simon_End, ISimon_S4, ISimon_S5, executeProtocol, messages} from './Simon';
import {VAL,ADD,MUL,SUM,PRD,BYE} from './Message';

async function protocol(s1:Simon_Start):Promise<Simon_End> {
   const starter = await s1.recv();
   let messageType=starter.messageType;
   let messageFrom=starter.messageFrom;
   let message=starter.message;
   let nextState:ISimon = starter;
   while ( true ){
      console.log(`message ${messageType} received from ${messageFrom}  :  ${message}`);
      switch (messageType) {
         case messages.VAL: {
            const s2 = <ISimon_S2>nextState;
            const val = s2.message.val;
            //console.log(`waiting for nextstate in S2`);
            const nextActionState=await s2.recv();
            if (nextActionState.messageType === messages.ADD){
               const tmpState1 = await nextActionState.sendSUM(new SUM(nextActionState.message.add+val));
               console.log(`SUM sended`);
               const tmpState2 = await tmpState1.recv();
               messageType=tmpState2.messageType;
               messageFrom=tmpState2.messageFrom;
               message=tmpState2.message;
               nextState = tmpState2;
               break;
            }
            if (nextActionState.messageType === messages.MUL){
               const tmpState1 = await nextActionState.sendPRD(new PRD(nextActionState.message.mul*val));
               console.log(`PRD sended`);
               const tmpState2 = await tmpState1.recv();
               messageType=tmpState2.messageType;
               messageFrom=tmpState2.messageFrom;
               message=tmpState2.message;
               nextState = tmpState2;
               break;
            }
         }
         case messages.BYE: {
            console.log('in de DONE van Simon');
            let sdone=<Simon_End>nextState;
            return new Promise(
               resolve => resolve(sdone)
            );
         }
         default: {
            console.log(`how is this possible`);
            break;
         }
      }
   }
}

async function start(){
   await executeProtocol(protocol,'localhost',30002);
}

start();
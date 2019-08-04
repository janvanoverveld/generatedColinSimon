import {ISimon, ISimon_S1, ISimon_S2, ISimon_S3, ISimon_S4, ISimon_S5, executeProtocol} from './Simon';
import {VAL,ADD,MUL,SUM,PRD,BYE} from './Message';

async function protocol(s1:ISimon_S1):Promise<ISimon_S3> {
   let nextState:ISimon = await s1.recv();
   while ( true ){
      console.log(`switching state ${nextState.state}`);
      switch (nextState.state) {
         case "S1": {
            s1 = <ISimon_S1>nextState;
            console.log(`waiting for nextstate in S1`);
            nextState = await s1.recv();
            break;
         }
         case "S2": {
            const s2 = <ISimon_S2>nextState;
            const val = s2.val.val;
            //console.log(`waiting for nextstate in S2`);
            const nextActionState=await s2.recv();
            if (nextActionState.state === 'S4'){
               nextState = await nextActionState.sendSUM(new SUM(nextActionState.add.add+val));
               console.log(`SUM sended, nextstate is ${nextState.state}`);
               break;
            }
            if (nextActionState.state === 'S5'){
               nextState = await nextActionState.sendPRD(new PRD(nextActionState.mul.mul*val));
               console.log(`PRD sended, nextstate is ${nextState.state}`);
               break;
            }
         }
         case "S3": {
            console.log('in de DONE van Simon');
            let sdone=<ISimon_S3>nextState;
            return new Promise(
               resolve => resolve(sdone)
            );
         }
      }
   }
}

async function start(){
   await executeProtocol(protocol,'localhost',30002);
}

start();
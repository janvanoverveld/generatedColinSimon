

This is generated TypeScript code for the Math Service example from the paper:
Distributed Programming using Java API's
Generated from Session Types
by: Raymond Hu

The used Scribble syntax for this repo is:

module MathSvc;

global protocol MathSvc(role Colin, role Simon) {
   choice {
      Val from Colin to Simon;
      choice { Add from Colin to Simon;
               Sum from Simon to Colin;
      } or { Mul from Colin to Simon;
             Prd from Simon to Colin; }
      do MathSvc(Colin,Simon);
    } or {
        Bye from Colin to Simon;
    }
}


To execute the code make sure you have installed node.js and TypeScript. It is assumed Typescript is installed globally (npm install -g typescript)

After cloning the github repo; the command:

npm start

will execute the software.
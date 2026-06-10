export default class FunctionParser {


    static crearFuncion(expresion){


        return function(x){


            return math.evaluate(
                expresion,
                {x:x}
            );


        }


    }



    static derivar(expresion){


        return math.derivative(
            expresion,
            "x"
        );


    }



}
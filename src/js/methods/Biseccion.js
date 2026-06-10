import Iteration from "../models/Iteration.js";

export default class Biseccion {


    constructor(funcion) {

        this.funcion = funcion;

    }


    resolver(a, b, tolerancia, maxIter) {

        let historial = [];

        let fa = this.funcion(a);
        let fb = this.funcion(b);


        if (fa * fb >= 0) {

            throw new Error(
                "El intervalo no contiene una raíz"
            );

        }


        let cAnterior = null;


        for (
            let i = 0;
            i <= maxIter;
            i++
        ) {


            let c = (a + b) / 2;

            let fc =
                this.funcion(c);


            let errorAbs =
                cAnterior === null
                    ? null
                    : Math.abs(c - cAnterior);


            let errorRel =
                errorAbs === null
                    ? null
                    : Math.abs(errorAbs / c) * 100;



            historial.push(

                new Iteration(
                    i,
                    a,
                    b,
                    c,
                    fc,
                    errorAbs,
                    errorRel
                )

            );



            if (
                errorAbs !== null &&
                errorAbs < tolerancia
            ){

                break;

            }



            if (fa * fc < 0) {

                b = c;
                fb = fc;

            }
            else {

                a = c;
                fa = fc;

            }


            cAnterior = c;

        }


        return historial;

    }


}
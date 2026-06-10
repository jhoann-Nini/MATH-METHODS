import Biseccion 
from "./methods/Biseccion.js";


import FunctionParser 
from "./parser/FunctionParser.js";

let miGrafico = null;
    let historialIteraciones = [];
    let indiceIteracionActual = -1;
    let intervaloReproduccion = null;

    // Plugin personalizado de Chart.js para dibujar líneas verticales y etiquetas dinámicas exactas
    const pluginLineasGuia = {
        id: 'pluginLineasGuia',
        afterDatasetsDraw(chart) {
            if (!chart.config.options.plugins.lineasGuiaData) return;

            const { ctx, scales: { x, y } } = chart;
            const dataGuia = chart.config.options.plugins.lineasGuiaData;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.font = 'bold 11px "JetBrains Mono", monospace';

            // Configuración de las 3 líneas clave (a, b, c)
            const lineas = [
                { valor: dataGuia.a, color: '#f87171', tag: `a = ${dataGuia.a.toFixed(4)}` },
                { valor: dataGuia.b, color: '#a78bfa', tag: `b = ${dataGuia.b.toFixed(4)}` },
                { valor: dataGuia.c, color: '#fbbf24', tag: `c = ${dataGuia.c.toFixed(4)}` }
            ];

            lineas.forEach(l => {
                const xPx = x.getPixelForValue(l.valor);
                const yZeroPx = y.getPixelForValue(0);

                // Dibujar línea punteada vertical
                ctx.beginPath();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = l.color;
                ctx.lineWidth = 1.5;
                ctx.moveTo(xPx, y.top);
                ctx.lineTo(xPx, y.bottom);
                ctx.stroke();

                // Dibujar la etiqueta flotante abajo cerca del eje
                ctx.setLineDash([]);
                ctx.fillStyle = '#0a0a0f'; // Fondo para legibilidad
                const textWidth = ctx.measureText(l.tag).width;
                ctx.fillRect(xPx - (textWidth/2) - 4, y.bottom - 22, textWidth + 8, 16);

                ctx.fillStyle = l.color;
                ctx.fillText(l.tag, xPx, y.bottom - 20);
            });

            // Dibujar marcador de Eje Y = 0 (Línea amarilla horizontal sólida)
            const yZero = y.getPixelForValue(0);
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.moveTo(x.left, yZero);
            ctx.lineTo(x.right, yZero);
            ctx.stroke();

            // Etiqueta fija "y = 0"
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('y = 0', x.right - 35, yZero - 15);

            ctx.restore();
        }
    };

    // Registrar el plugin de forma global
    Chart.register(pluginLineasGuia);

    function inicializarGrafico() {
        const ctx = document.getElementById('graficoMetodos').getContext('2d');
        miGrafico = new Chart(ctx, {
            type: 'line',
            data: { datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    lineasGuiaData: null // Espacio dinámico para las variables por iteración
                },
                scales: {
                    x: {
                        type: 'linear',
                        grid: { color: 'rgba(255, 255, 255, 0.03)', borderDash: [2, 2] },
                        ticks: { color: '#9090a8', font: { size: 9, family: 'JetBrains Mono' } },
                        title: { display: true, text: 'Eje X', color: '#9090a8', font: { size: 11, weight: 'bold' } }
                    },
                    y: {
                        type: 'linear',
                        grid: { color: 'rgba(255, 255, 255, 0.03)', borderDash: [2, 2] },
                        ticks: { color: '#9090a8', font: { size: 9, family: 'JetBrains Mono' } },
                        title: { display: true, text: 'f(x)', color: '#9090a8', font: { size: 11, weight: 'bold' } }
                    }
                }
            }
        });
    }

    function obtenerPuntosCurva(expresion, a, b) {
        const margen = Math.abs(b - a) * 0.6 || 2;
        const puntos = [];
        for (let i = 0; i <= 100; i++) {
            const x = (a - margen) + (i * ((b + margen) - (a - margen)) / 100);
            try {
                const y = math.evaluate(expresion, { x });
                if (Number.isFinite(y)) puntos.push({ x, y });
            } catch (e) {}
        }
        return puntos;
    }

    function ejecutarBiseccion(){
        detenerReproduccion();

        const expresion =
        document.getElementById(
        "inputFuncion"
        ).value;

        const a =
        parseFloat(
        document.getElementById(
        "inputA"
        ).value
        );

        const b =
        parseFloat(
        document.getElementById(
        "inputB"
        ).value
        );

        const maxIter =
        parseInt(
        document.getElementById(
        "inputMaxIter"
        ).value
        );

        const tolerancia =
        parseFloat(
        document.getElementById(
        "inputTolerancia"
        ).value
        );

        try{
        const funcion =
        FunctionParser.crearFuncion(
        expresion
        );

        const metodo =
        new Biseccion(
        funcion
        );

        historialIteraciones =
        metodo.resolver(
        a,
        b,
        tolerancia,
        maxIter
        );

        renderizarHistorialUI();

        cambiarIteracion(
        historialIteraciones.length-1
        );

        }catch(error){

        alert(
        error.message
        );

        }

    }

    function renderizarHistorialUI() {
        const finalIter = historialIteraciones[historialIteraciones.length - 1];
        document.getElementById('resRaiz').innerText = finalIter.c.toFixed(4);
        document.getElementById('resFc').innerText = finalIter.fc.toFixed(4);
        document.getElementById('resIter').innerText = historialIteraciones.length - 1;
        document.getElementById('resEstado').innerHTML = `<span class="tag tag-teal">Convergido</span>`;

        const tbody = document.getElementById('cuerpoTabla');
        tbody.innerHTML = "";

        historialIteraciones.forEach((it, index) => {
            const tr = document.createElement('tr');
            tr.id = `fila-${index}`;
            tr.style.cursor = "pointer";
            tr.onclick = () => cambiarIteracion(index);

            const txtErrAbs = (it.errAbs === null) ? "—" : it.errAbs.toFixed(4);
            const txtErrRel = (it.errRel === null) ? "—" : it.errRel.toFixed(4);

            tr.innerHTML = `
                <td><b>${it.n}</b></td>
                <td>${it.a.toFixed(4)}</td>
                <td>${it.b.toFixed(4)}</td>
                <td style="color:var(--accent2); font-weight:600;">${it.c.toFixed(4)}</td>
                <td>${it.fc.toFixed(4)}</td>
                <td>${txtErrAbs}</td>
                <td>${txtErrRel}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function cambiarIteracion(index) {
        if (historialIteraciones.length === 0) return;
        if (index < 0 || index >= historialIteraciones.length) return;

        indiceIteracionActual = index;
        const it = historialIteraciones[index];

        document.getElementById('tituloGrafica').innerText = `Método de Bisección - Iteración ${it.n}`;
        document.getElementById('contadorIter').innerText = `${it.n} / ${historialIteraciones.length - 1}`;

        historialIteraciones.forEach((_, idx) => {
            const fila = document.getElementById(`fila-${idx}`);
            if (fila) fila.className = (idx === index) ? "selected" : "";
        });

        const expresion = document.getElementById('inputFuncion').value;
        const curva = obtenerPuntosCurva(expresion, historialIteraciones[0].a, historialIteraciones[0].b);

        // Pasar las coordenadas actuales de las variables al plugin de renderizado personalizado
        miGrafico.config.options.plugins.lineasGuiaData = { a: it.a, b: it.b, c: it.c };

        miGrafico.data.datasets = [
            // Curva principal f(x) con su nombre flotante dinámico
            {
                label: `f(x) = ${expresion}`,
                data: curva,
                borderColor: '#2dd4bf',
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            },
            // Puntos explícitos evaluados en la gráfica
            {
                data: [
                    { x: it.a, y: math.evaluate(expresion, {x: it.a}) },
                    { x: it.b, y: math.evaluate(expresion, {x: it.b}) }
                ],
                backgroundColor: ['#f87171', '#a78bfa'],
                pointRadius: 5,
                showLine: false
            },
            // Punto de aproximación de la raíz "c"
            {
                data: [{ x: it.c, y: 0 }],
                backgroundColor: '#fbbf24',
                borderColor: '#0a0a0f',
                borderWidth: 1,
                pointRadius: 7
            }
        ];

        miGrafico.update();
    }

    function conmutarReproduccion() {
        if (historialIteraciones.length === 0) return;
        if (intervaloReproduccion) { detenerReproduccion(); } else {
            document.getElementById('btnPlay').innerText = "⏸";
            if (indiceIteracionActual >= historialIteraciones.length - 1) indiceIteracionActual = -1;
            intervaloReproduccion = setInterval(() => {
                if (indiceIteracionActual < historialIteraciones.length - 1) cambiarIteracion(indiceIteracionActual + 1);
                else detenerReproduccion();
            }, 700);
        }
    }

    function detenerReproduccion() {
        clearInterval(intervaloReproduccion); intervaloReproduccion = null;
        document.getElementById('btnPlay').innerText = "▶";
    }

    function reiniciarApp() {
        detenerReproduccion(); historialIteraciones = []; indiceIteracionActual = -1;
        document.getElementById('cuerpoTabla').innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-dim); border:none;">Sin datos calculados.</td></tr>`;
        document.getElementById('resRaiz').innerText = "—"; document.getElementById('resFc').innerText = "—";
        document.getElementById('resIter').innerText = "—"; document.getElementById('resEstado').innerText = "—";
        document.getElementById('contadorIter').innerText = "0 / 0";
        miGrafico.config.options.plugins.lineasGuiaData = null;
        miGrafico.data.datasets = []; miGrafico.update();
    }

    window.onload = () => { inicializarGrafico(); ejecutarBiseccion(); };

    
//Exponer funciones globalmente para ser llamadas desde el HTML
window.ejecutarBiseccion = ejecutarBiseccion;
window.reiniciarApp = reiniciarApp;
window.cambiarIteracion = cambiarIteracion;
window.conmutarReproduccion = conmutarReproduccion;
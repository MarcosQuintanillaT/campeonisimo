// ====== DATOS DE ASIGNATURAS ======
const ASIGNATURAS = {
    matematicas: { nombre: 'Matemáticas', icono: '📐', color: '#f7971e' },
    espanol: { nombre: 'Español', icono: '📖', color: '#e74c3c' },
    sociales: { nombre: 'Ciencias Sociales', icono: '🌎', color: '#3498db' },
    naturales: { nombre: 'Ciencias Naturales', icono: '🔬', color: '#2ecc71' },
    cultura: { nombre: 'Cultura General', icono: '🌍', color: '#9b59b6' }
};

// Preguntas por asignatura
const PREGUNTAS_DEFAULT = {
    "matematicas": [],
    "espanol": [],
    "sociales": [],
    "naturales": [],
    "cultura": []
};

// ====== ESTADO DEL JUEGO ======
const NUBE_URL = 'https://jsonblob.com/api/jsonBlob/019d368d-ce0d-7549-80cc-769292b08947';
let preguntas = {};
let editorAsignatura = null;
let juego = {
    preguntas: [],
    indiceActual: 0,
    puntaje: 0,
    respuestasCorrectas: 0,
    totalPreguntas: 0,
    temporizador: null,
    tiempoRestante: 30,
    relojInterval: null
};

// ====== SISTEMA DE SONIDOS ======
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const MENSAJES_POSITIVOS = [
    '¡Excelente! 🌟',
    '¡Genial! 🎉',
    '¡Perfecto! 💯',
    '¡Increíble! 🚀',
    '¡Muy bien! 👏',
    '¡Brillante! ✨',
    '¡Fantástico! 🏆',
    '¡Súper! 💪',
    '¡Asombroso! 🔥',
    '¡Eres un crack! 😎',
    '¡Magnífico! ⭐',
    '¡Lo lograste! 🎯'
];

const MENSAJES_MEJORAR = [
    '¡Sigue intentando! 💪',
    '¡No te rindas! 🔥',
    '¡Tú puedes! ⭐',
    '¡La próxima será! 🎯',
    '¡No pasa nada! 😊',
    '¡Ánimo! 🌟',
    '¡A mejorar! 📚',
    '¡Vamos de nuevo! 🚀',
    '¡Casi lo logras! 💡',
    '¡Tú puedes más! ✨',
    '¡Sigue adelante! 🏃',
    '¡A practicar! 📖'
];

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new AudioCtx();
    }
    return audioCtx;
}

function reproducirSonido(tipo) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const ahora = ctx.currentTime;

        switch (tipo) {
            case 'hover':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ahora);
                osc.frequency.exponentialRampToValueAtTime(1200, ahora + 0.06);
                gain.gain.setValueAtTime(0.08, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.1);
                osc.start(ahora);
                osc.stop(ahora + 0.1);
                break;

            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ahora);
                osc.frequency.exponentialRampToValueAtTime(900, ahora + 0.08);
                gain.gain.setValueAtTime(0.12, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.15);
                osc.start(ahora);
                osc.stop(ahora + 0.15);
                break;

            case 'correcto':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ahora);
                osc.frequency.setValueAtTime(659, ahora + 0.1);
                osc.frequency.setValueAtTime(784, ahora + 0.2);
                gain.gain.setValueAtTime(0.15, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.4);
                osc.start(ahora);
                osc.stop(ahora + 0.4);
                break;

            case 'incorrecto':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, ahora);
                osc.frequency.exponentialRampToValueAtTime(150, ahora + 0.25);
                gain.gain.setValueAtTime(0.08, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.3);
                osc.start(ahora);
                osc.stop(ahora + 0.3);
                break;

            case 'inicio':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ahora);
                osc.frequency.setValueAtTime(554, ahora + 0.1);
                osc.frequency.setValueAtTime(659, ahora + 0.2);
                osc.frequency.setValueAtTime(880, ahora + 0.3);
                gain.gain.setValueAtTime(0.12, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.5);
                osc.start(ahora);
                osc.stop(ahora + 0.5);
                break;

            case 'victoria':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ahora);
                osc.frequency.setValueAtTime(659, ahora + 0.15);
                osc.frequency.setValueAtTime(784, ahora + 0.3);
                osc.frequency.setValueAtTime(1047, ahora + 0.45);
                gain.gain.setValueAtTime(0.15, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.7);
                osc.start(ahora);
                osc.stop(ahora + 0.7);
                break;

            case 'tick':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, ahora);
                osc.frequency.exponentialRampToValueAtTime(800, ahora + 0.05);
                gain.gain.setValueAtTime(0.06, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.08);
                osc.start(ahora);
                osc.stop(ahora + 0.08);
                break;

            case 'campana':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400, ahora);
                osc.frequency.exponentialRampToValueAtTime(900, ahora + 0.1);
                gain.gain.setValueAtTime(0.2, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.8);
                osc.start(ahora);
                osc.stop(ahora + 0.8);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1800, ahora + 0.1);
                osc2.frequency.exponentialRampToValueAtTime(1100, ahora + 0.2);
                gain2.gain.setValueAtTime(0.15, ahora + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.001, ahora + 0.9);
                osc2.start(ahora + 0.1);
                osc2.stop(ahora + 0.9);
                break;
        }
    } catch (e) {}
}

function agregarSonidosBotones() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .btn-asignatura, .btn-eliminar, .asignatura-check');
        if (btn) reproducirSonido('click');
    });
}

// ====== INICIALIZACIÓN ======
function mostrarMensajePositivo() {
    const existente = document.querySelector('.mensaje-positivo');
    if (existente) existente.remove();

    const mensaje = MENSAJES_POSITIVOS[Math.floor(Math.random() * MENSAJES_POSITIVOS.length)];

    const div = document.createElement('div');
    div.className = 'mensaje-positivo';
    div.textContent = mensaje;
    document.body.appendChild(div);

    requestAnimationFrame(() => div.classList.add('mostrar'));

    setTimeout(() => {
        div.classList.remove('mostrar');
        div.classList.add('salir');
        setTimeout(() => div.remove(), 500);
    }, 2500);
}

function mostrarMensajeMejorar() {
    const existente = document.querySelector('.mensaje-mejorar');
    if (existente) existente.remove();

    const mensaje = MENSAJES_MEJORAR[Math.floor(Math.random() * MENSAJES_MEJORAR.length)];

    const div = document.createElement('div');
    div.className = 'mensaje-mejorar';
    div.textContent = mensaje;
    document.body.appendChild(div);

    requestAnimationFrame(() => div.classList.add('mostrar'));

    setTimeout(() => {
        div.classList.remove('mostrar');
        div.classList.add('salir');
        setTimeout(() => div.remove(), 500);
    }, 2500);
}

function inicializar() {
    cargarPreguntas().then(() => {
        cargarPuntajes();
        agregarSonidosBotones();
    });
}

// Guardar/cargar preguntas
function cargarPreguntas() {
    return fetch(NUBE_URL)
        .then(res => res.json())
        .then(data => {
            preguntas = data;
            localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));
            console.log('Preguntas cargadas desde la nube');
        })
        .catch(() => {
            const guardadas = localStorage.getItem('campeonisimo_preguntas');
            if (guardadas) {
                preguntas = JSON.parse(guardadas);
            } else {
                preguntas = JSON.parse(JSON.stringify(PREGUNTAS_DEFAULT));
            }
            console.log('Preguntas cargadas desde localStorage (sin conexion)');
        });
}

function guardarPreguntas() {
    localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));
    fetch(NUBE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preguntas)
    })
    .then(res => res.json())
    .then(() => {
        console.log('Preguntas guardadas en la nube');
        mostrarToast('Preguntas guardadas');
    })
    .catch(() => {
        console.log('Error al guardar en la nube, guardado solo local');
        mostrarToast('Guardado localmente (sin conexion)');
    });
}

// ====== NAVEGACIÓN ======
function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    const pantalla = document.getElementById('pantalla-' + id);
    if (pantalla) {
        pantalla.classList.add('activa');
    }
    if (id === 'puntajes') {
        mostrarPuntajes();
    }
    if (id === 'menu') {
        clearInterval(juego.temporizador);
        clearInterval(juego.relojInterval);
    }
}

// ====== EDITOR DE PREGUNTAS ======
function abrirEditor(asignatura) {
    editorAsignatura = asignatura;
    const info = ASIGNATURAS[asignatura];
    document.getElementById('editor-titulo').textContent = `Preguntas de ${info.nombre}`;
    mostrarPantalla('editor');
    renderizarPreguntas();
}

function renderizarPreguntas() {
    const lista = document.getElementById('lista-preguntas');
    const preguntasAsig = preguntas[editorAsignatura] || [];

    if (preguntasAsig.length === 0) {
        lista.innerHTML = '<p class="sin-puntajes">No hay preguntas aún. ¡Agrega la primera!</p>';
        return;
    }

    lista.innerHTML = preguntasAsig.map((p, i) => `
        <div class="pregunta-item">
            <span class="texto">${i + 1}. ${p.pregunta}</span>
            <button class="btn-eliminar" onclick="eliminarPregunta(${i})">✕</button>
        </div>
    `).join('');
}

function agregarPregunta() {
    const textoPregunta = document.getElementById('input-pregunta').value.trim();
    const opA = document.getElementById('opcion-a').value.trim();
    const opB = document.getElementById('opcion-b').value.trim();
    const opC = document.getElementById('opcion-c').value.trim();
    const opD = document.getElementById('opcion-d').value.trim();
    const correcta = document.getElementById('respuesta-correcta').value;

    if (!textoPregunta) { mostrarToast('Escribe la pregunta'); return; }
    if (!opA || !opB || !opC || !opD) { mostrarToast('Completa las 4 opciones'); return; }
    if (correcta === '') { mostrarToast('Selecciona la respuesta correcta'); return; }

    if (!preguntas[editorAsignatura]) {
        preguntas[editorAsignatura] = [];
    }

    preguntas[editorAsignatura].push({
        pregunta: textoPregunta,
        opciones: [opA, opB, opC, opD],
        correcta: parseInt(correcta)
    });

    guardarPreguntas();
    renderizarPreguntas();

    document.getElementById('input-pregunta').value = '';
    document.getElementById('opcion-a').value = '';
    document.getElementById('opcion-b').value = '';
    document.getElementById('opcion-c').value = '';
    document.getElementById('opcion-d').value = '';
    document.getElementById('respuesta-correcta').value = '';

    mostrarToast('¡Pregunta agregada!');
}

function eliminarPregunta(indice) {
    preguntas[editorAsignatura].splice(indice, 1);
    guardarPreguntas();
    renderizarPreguntas();
    mostrarToast('Pregunta eliminada');
}

// ====== CAMPEONATO ======
function iniciarCampeonato() {
    cargarPreguntas().then(() => {
        iniciarCampeonatoInterno();
    });
}

function iniciarCampeonatoInterno() {

    const checks = document.querySelectorAll('.asignatura-check input:checked');
    const asignaturasSeleccionadas = Array.from(checks).map(c => c.value);

    if (asignaturasSeleccionadas.length === 0) {
        mostrarToast('Selecciona al menos una asignatura');
        return;
    }

    let todasLasPreguntas = [];
    asignaturasSeleccionadas.forEach(asig => {
        const preguntasAsig = preguntas[asig] || [];
        preguntasAsig.forEach(p => {
            todasLasPreguntas.push({ ...p, asignatura: asig });
        });
    });

    if (todasLasPreguntas.length === 0) {
        mostrarToast('No hay preguntas. Crea preguntas primero.');
        return;
    }

    // Mezclar preguntas
    todasLasPreguntas = mezclarArray(todasLasPreguntas);

    // Mezclar opciones de cada pregunta
    todasLasPreguntas = todasLasPreguntas.map(p => mezclarOpciones(p));

    // Tomar máximo 10 preguntas
    if (todasLasPreguntas.length > 10) {
        todasLasPreguntas = todasLasPreguntas.slice(0, 10);
    }

    juego = {
        preguntas: todasLasPreguntas,
        indiceActual: 0,
        puntaje: 0,
        respuestasCorrectas: 0,
        totalPreguntas: todasLasPreguntas.length,
        temporizador: null,
        tiempoRestante: 30,
        relojInterval: null
    };

    mostrarPantalla('juego');
    reproducirSonido('inicio');
    mostrarPregunta();
}

function mostrarPregunta() {
    const preguntaActual = juego.preguntas[juego.indiceActual];
    const info = ASIGNATURAS[preguntaActual.asignatura];

    const btnSiguiente = document.getElementById('btn-siguiente-pregunta');
    if (btnSiguiente) btnSiguiente.style.display = 'none';

    document.getElementById('asignatura-actual').textContent = `${info.icono} ${info.nombre}`;
    document.getElementById('puntaje-actual').textContent = juego.puntaje;
    document.getElementById('progreso').textContent = `${juego.indiceActual + 1}/${juego.totalPreguntas}`;
    document.getElementById('texto-pregunta').textContent = preguntaActual.pregunta;

    const opcionesContainer = document.getElementById('opciones-contenedor');
    const letras = ['A', 'B', 'C', 'D'];
    opcionesContainer.innerHTML = preguntaActual.opciones.map((op, i) => `
        <button class="opcion" onclick="seleccionarOpcion(${i})">
            <span>${letras[i]}</span>
            <span class="texto-opcion">${op}</span>
        </button>
    `).join('');

    // Iniciar temporizador
    juego.tiempoRestante = 30;
    const barra = document.getElementById('barra-tiempo');
    barra.style.width = '100%';
    barra.style.background = 'linear-gradient(90deg, #f7971e, #ffd200)';

    const relojIcono = document.getElementById('reloj-icono');
    const campanaIcono = document.getElementById('campana-icono');
    if (relojIcono) relojIcono.style.display = 'inline-block';
    if (campanaIcono) campanaIcono.style.display = 'none';

    clearInterval(juego.temporizador);
    clearInterval(juego.relojInterval);

    juego.relojInterval = setInterval(() => {
        reproducirSonido('tick');
    }, 1000);

    juego.temporizador = setInterval(() => {
        juego.tiempoRestante -= 0.1;
        const porcentaje = (juego.tiempoRestante / 30) * 100;
        barra.style.width = porcentaje + '%';

        if (juego.tiempoRestante <= 10) {
            barra.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        }

        if (juego.tiempoRestante <= 0) {
            clearInterval(juego.temporizador);
            clearInterval(juego.relojInterval);
            if (relojIcono) relojIcono.style.display = 'none';
            if (campanaIcono) campanaIcono.style.display = 'inline-block';
            reproducirSonido('campana');
            seleccionarOpcion(-1);
        }
    }, 100);
}

function seleccionarOpcion(indice) {
    clearInterval(juego.temporizador);
    clearInterval(juego.relojInterval);

    const preguntaActual = juego.preguntas[juego.indiceActual];
    const botones = document.querySelectorAll('.opcion');

    botones.forEach(b => b.classList.add('deshabilitada'));

    // Marcar correcta
    botones[preguntaActual.correcta].classList.add('correcta');

    if (indice === preguntaActual.correcta) {
        reproducirSonido('correcto');
        mostrarMensajePositivo();
        juego.respuestasCorrectas++;
        const puntosBase = 100;
        const bonusTiempo = Math.round(juego.tiempoRestante * 5);
        juego.puntaje += puntosBase + bonusTiempo;
        document.getElementById('puntaje-actual').textContent = juego.puntaje;
    } else if (indice >= 0) {
        reproducirSonido('incorrecto');
        botones[indice].classList.add('incorrecta');
        mostrarMensajeMejorar();
    } else {
        reproducirSonido('incorrecto');
        setTimeout(() => mostrarMensajePositivo(), 200);
    }

    const relojIcono = document.getElementById('reloj-icono');
    if (relojIcono) relojIcono.style.display = 'none';

    // Mostrar botón siguiente
    const btnSiguiente = document.getElementById('btn-siguiente-pregunta');
    if (btnSiguiente) btnSiguiente.style.display = 'inline-block';
}

function siguientePregunta() {
    const btnSiguiente = document.getElementById('btn-siguiente-pregunta');
    if (btnSiguiente) btnSiguiente.style.display = 'none';

    juego.indiceActual++;
    if (juego.indiceActual < juego.totalPreguntas) {
        mostrarPregunta();
    } else {
        finalizarCampeonato();
    }
}

function finalizarCampeonato() {
    clearInterval(juego.temporizador);
    clearInterval(juego.relojInterval);

    const icono = document.getElementById('resultado-icono');
    const porcentaje = (juego.respuestasCorrectas / juego.totalPreguntas) * 100;

    if (porcentaje === 100) {
        icono.textContent = '🏆';
        reproducirSonido('victoria');
    } else if (porcentaje >= 70) {
        icono.textContent = '🥈';
        reproducirSonido('correcto');
    } else if (porcentaje >= 50) {
        icono.textContent = '🥉';
        reproducirSonido('correcto');
    } else {
        icono.textContent = '💪';
        reproducirSonido('inicio');
    }

    document.getElementById('puntaje-final').textContent = juego.puntaje;

    document.getElementById('resultado-detalle').innerHTML = `
        <div class="detalle-item"><span>Preguntas totales:</span><span>${juego.totalPreguntas}</span></div>
        <div class="detalle-item"><span>Respuestas correctas:</span><span>${juego.respuestasCorrectas}</span></div>
        <div class="detalle-item"><span>Precisión:</span><span>${Math.round(porcentaje)}%</span></div>
    `;

    guardarPuntaje(juego.puntaje);

    juego.puntaje = 0;
    juego.respuestasCorrectas = 0;
    juego.indiceActual = 0;
    document.getElementById('puntaje-actual').textContent = '0';

    mostrarPantalla('resultados');
}

// ====== PUNTAJES ======
function cargarPuntajes() {
    return JSON.parse(localStorage.getItem('campeonisimo_puntajes') || '[]');
}

function guardarPuntaje(puntaje) {
    const puntajes = cargarPuntajes();
    const fecha = new Date().toLocaleDateString('es-ES');
    puntajes.push({ puntaje, fecha });
    puntajes.sort((a, b) => b.puntaje - a.puntaje);
    if (puntajes.length > 10) puntajes.length = 10;
    localStorage.setItem('campeonisimo_puntajes', JSON.stringify(puntajes));
}

function mostrarPuntajes() {
    const puntajes = cargarPuntajes();
    const lista = document.getElementById('lista-puntajes');

    if (puntajes.length === 0) {
        lista.innerHTML = '<p class="sin-puntajes">Aún no hay puntajes registrados</p>';
        return;
    }

    const medallas = ['🥇', '🥈', '🥉'];
    lista.innerHTML = puntajes.map((p, i) => `
        <div class="puntaje-item">
            <span class="puntaje-posicion">${medallas[i] || (i + 1)}</span>
            <span class="puntaje-nombre">Jugador</span>
            <span class="puntaje-valor">${p.puntaje} pts</span>
            <span class="puntaje-fecha">${p.fecha}</span>
        </div>
    `).join('');
}

function confirmarReinicio() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <h3>⚠ Confirmar</h3>
            <p>¿Estás seguro de borrar todos los puntajes?</p>
            <div class="modal-botones">
                <button class="btn btn-cancelar" onclick="cerrarModal()">Cancelar</button>
                <button class="btn btn-confirmar" onclick="reiniciarPuntajes()">Sí, borrar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('mostrar'));
}

function cerrarModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.classList.remove('mostrar');
        setTimeout(() => overlay.remove(), 300);
    }
}

function reiniciarPuntajes() {
    localStorage.removeItem('campeonisimo_puntajes');
    cerrarModal();
    mostrarPuntajes();
    mostrarToast('Puntajes eliminados');
    reproducirSonido('click');
}

// ====== UTILIDADES ======
function mezclarArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function mezclarOpciones(pregunta) {
    const opciones = [...pregunta.opciones];
    const correctaTexto = opciones[pregunta.correcta];
    const mezcladas = mezclarArray(opciones);
    const nuevaCorrecta = mezcladas.indexOf(correctaTexto);
    return {
        pregunta: pregunta.pregunta,
        opciones: mezcladas,
        correcta: nuevaCorrecta,
        asignatura: pregunta.asignatura
    };
}

function mostrarToast(mensaje) {
    const existente = document.querySelector('.toast');
    if (existente) existente.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('mostrar'), 10);
    setTimeout(() => {
        toast.classList.remove('mostrar');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// Iniciar
inicializar();

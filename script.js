// ====== DATOS DE ASIGNATURAS ======
let ASIGNATURAS = {};

// ====== ESTADO DEL JUEGO ======
const SUPABASE_URL = 'https://swwnwkybodidimzxjjet.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3d253a3lib2RpZGltenhqamV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Mzk1MzMsImV4cCI6MjA5MDMxNTUzM30.3CZVuFaWN2-a8LcLxdT5sbYDpHacpI5ZQB6CB8nLZv4';
const SUPABASE_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
};
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

            case 'alarma':
                // Carillón de reloj de pared - melodía Do-Mi-Sol-Do
                const notas = [523, 659, 784, 1047];
                const tiempos = [0, 0.35, 0.7, 1.05];

                notas.forEach((freq, i) => {
                    const nOsc = ctx.createOscillator();
                    const nGain = ctx.createGain();
                    nOsc.connect(nGain);
                    nGain.connect(ctx.destination);
                    nOsc.type = 'sine';
                    nOsc.frequency.setValueAtTime(freq, ahora + tiempos[i]);
                    nGain.gain.setValueAtTime(0.2, ahora + tiempos[i]);
                    nGain.gain.exponentialRampToValueAtTime(0.08, ahora + tiempos[i] + 0.6);
                    nGain.gain.exponentialRampToValueAtTime(0.001, ahora + tiempos[i] + 1.8);
                    nOsc.start(ahora + tiempos[i]);
                    nOsc.stop(ahora + tiempos[i] + 1.8);
                });

                // Armónicos para sonido de campana
                const cOsc2 = ctx.createOscillator();
                const cGain2 = ctx.createGain();
                cOsc2.connect(cGain2);
                cGain2.connect(ctx.destination);
                cOsc2.type = 'sine';
                cOsc2.frequency.setValueAtTime(1568, ahora + 1.4);
                cGain2.gain.setValueAtTime(0.12, ahora + 1.4);
                cGain2.gain.exponentialRampToValueAtTime(0.001, ahora + 3.5);
                cOsc2.start(ahora + 1.4);
                cOsc2.stop(ahora + 3.5);

                const cOsc3 = ctx.createOscillator();
                const cGain3 = ctx.createGain();
                cOsc3.connect(cGain3);
                cGain3.connect(ctx.destination);
                cOsc3.type = 'triangle';
                cOsc3.frequency.setValueAtTime(2093, ahora + 1.6);
                cGain3.gain.setValueAtTime(0.06, ahora + 1.6);
                cGain3.gain.exponentialRampToValueAtTime(0.001, ahora + 4);
                cOsc3.start(ahora + 1.6);
                cOsc3.stop(ahora + 4);
                break;

            case 'campana':
                // Cascabeles festivos - secuencia alegre de notas
                const notasFiesta = [1319, 1568, 1319, 1568, 1760, 1568, 1760, 2093, 1760, 2093, 1568, 1319];
                const tiemposFiesta = [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.96, 1.08, 1.2, 1.4];

                notasFiesta.forEach((freq, i) => {
                    const fOsc = ctx.createOscillator();
                    const fGain = ctx.createGain();
                    fOsc.connect(fGain);
                    fGain.connect(ctx.destination);
                    fOsc.type = 'sine';
                    fOsc.frequency.setValueAtTime(freq, ahora + tiemposFiesta[i]);
                    fGain.gain.setValueAtTime(0.15, ahora + tiemposFiesta[i]);
                    fGain.gain.exponentialRampToValueAtTime(0.001, ahora + tiemposFiesta[i] + 0.2);
                    fOsc.start(ahora + tiemposFiesta[i]);
                    fOsc.stop(ahora + tiemposFiesta[i] + 0.2);
                });

                // Campana de fondo resonante
                const fOsc2 = ctx.createOscillator();
                const fGain2 = ctx.createGain();
                fOsc2.connect(fGain2);
                fGain2.connect(ctx.destination);
                fOsc2.type = 'sine';
                fOsc2.frequency.setValueAtTime(2637, ahora);
                fGain2.gain.setValueAtTime(0.06, ahora);
                fGain2.gain.exponentialRampToValueAtTime(0.03, ahora + 1);
                fGain2.gain.exponentialRampToValueAtTime(0.001, ahora + 3);
                fOsc2.start(ahora);
                fOsc2.stop(ahora + 3);

                const fOsc3 = ctx.createOscillator();
                const fGain3 = ctx.createGain();
                fOsc3.connect(fGain3);
                fGain3.connect(ctx.destination);
                fOsc3.type = 'triangle';
                fOsc3.frequency.setValueAtTime(3136, ahora + 0.5);
                fGain3.gain.setValueAtTime(0.04, ahora + 0.5);
                fGain3.gain.exponentialRampToValueAtTime(0.001, ahora + 3.5);
                fOsc3.start(ahora + 0.5);
                fOsc3.stop(ahora + 3.5);
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

// ====== ROLES ======
const ADMIN_PASSWORD = 'PFF1612';
let rolActual = null;
let nombreJugador = '';

function seleccionarRol(rol) {
    if (rol === 'jugador') {
        document.getElementById('login-admin').style.display = 'none';
        document.getElementById('login-nombre').style.display = 'block';
        document.getElementById('input-nombre').focus();
    } else {
        document.getElementById('login-nombre').style.display = 'none';
        document.getElementById('login-admin').style.display = 'block';
        document.getElementById('input-password').focus();
    }
}

function verificarNombreJugador() {
    const nombre = document.getElementById('input-nombre').value.trim();
    if (!nombre) {
        document.getElementById('nombre-error').style.display = 'block';
        return;
    }
    nombreJugador = nombre;
    rolActual = 'jugador';
    document.getElementById('nombre-error').style.display = 'none';
    document.getElementById('input-nombre').value = '';
    cargarDatosYMostrarMenu();
}

function verificarAdmin() {
    const pass = document.getElementById('input-password').value;
    if (pass === ADMIN_PASSWORD) {
        rolActual = 'admin';
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('input-password').value = '';
        cargarDatosYMostrarMenu();
    } else {
        document.getElementById('login-error').style.display = 'block';
        document.getElementById('input-password').value = '';
    }
}

function cargarDatosYMostrarMenu() {
    cargarAsignaturas().then(() => {
        cargarPreguntas().then(() => {
            cargarPuntajes();
            agregarSonidosBotones();
            renderizarAsignaturas();
            renderizarMenu();
            mostrarPantalla('menu');
        });
    });
}

function renderizarMenu() {
    const menu = document.getElementById('botones-menu');
    const subtitulo = document.querySelector('#pantalla-menu .subtitulo');
    if (subtitulo) {
        subtitulo.textContent = rolActual === 'admin' ? '¡Modifica tu contenido cuando lo necesites!' : '¡Demuestra tu potencial!';
    }
    let html = `
        <button class="btn btn-jugar" onclick="mostrarPantalla('seleccion-asignaturas')">
            🚀 Jugar Campeonato
        </button>
    `;

    if (rolActual === 'admin') {
        html += `
            <button class="btn btn-crear" onclick="mostrarPantalla('seleccion-asignatura-crear')">
                ✏ Crear Preguntas
            </button>
        `;
    }

    html += `
        <button class="btn btn-puntajes" onclick="mostrarPantalla('puntajes')">
            🏅 Mejores Puntajes
        </button>
    `;

    if (rolActual === 'admin') {
        html += `
            <button class="btn btn-gestionar" onclick="mostrarPantalla('gestionar-asignaturas')">
                📚 Gestionar Asignaturas
            </button>
        `;
    }

    html += `
        <button class="btn btn-cerrar-sesion" onclick="cerrarSesion()">
            🚪 Cerrar Sesión
        </button>
    `;

    menu.innerHTML = html;
}

function cerrarSesion() {
    rolActual = null;
    nombreJugador = '';
    document.getElementById('login-admin').style.display = 'none';
    document.getElementById('login-nombre').style.display = 'none';
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('nombre-error').style.display = 'none';
    document.getElementById('input-password').value = '';
    document.getElementById('input-nombre').value = '';
    mostrarPantalla('rol');
}

function inicializar() {
    cargarPuntajes();
    agregarSonidosBotones();
}

// ====== ASIGNATURAS ======
function cargarAsignaturas() {
    return fetch(SUPABASE_URL + '/rest/v1/asignaturas?select=*&order=created_at.asc', {
        headers: SUPABASE_HEADERS
    })
        .then(res => res.json())
        .then(rows => {
            ASIGNATURAS = {};
            rows.forEach(r => {
                ASIGNATURAS[r.id] = { nombre: r.nombre, icono: r.icono, color: r.color };
            });
            localStorage.setItem('campeonisimo_asignaturas', JSON.stringify(ASIGNATURAS));
        })
        .catch(() => {
            const guardadas = localStorage.getItem('campeonisimo_asignaturas');
            if (guardadas) ASIGNATURAS = JSON.parse(guardadas);
        });
}

function agregarAsignatura() {
    const nombre = document.getElementById('input-nueva-asig-nombre').value.trim();
    const icono = document.getElementById('input-nueva-asig-icono').value.trim() || '📚';
    const color = document.getElementById('input-nueva-asig-color').value.trim() || '#f7971e';

    if (!nombre) { mostrarToast('Escribe el nombre'); return; }

    const id = nombre.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

    if (ASIGNATURAS[id]) { mostrarToast('Ya existe'); return; }

    fetch(SUPABASE_URL + '/rest/v1/asignaturas', {
        method: 'POST',
        headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify({ id, nombre, icono, color })
    })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(() => {
            ASIGNATURAS[id] = { nombre, icono, color };
            if (!preguntas[id]) preguntas[id] = [];
            localStorage.setItem('campeonisimo_asignaturas', JSON.stringify(ASIGNATURAS));
            localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));

            document.getElementById('input-nueva-asig-nombre').value = '';
            document.getElementById('input-nueva-asig-icono').value = '';
            document.getElementById('input-nueva-asig-color').value = '';

            renderizarAsignaturas();
            mostrarToast('Asignatura creada');
        })
        .catch(() => mostrarToast('Error al crear'));
}

function eliminarAsignatura(id) {
    if (!confirm('¿Eliminar "' + ASIGNATURAS[id].nombre + '" y todas sus preguntas?')) return;

    fetch(SUPABASE_URL + '/rest/v1/asignaturas?id=eq.' + id, {
        method: 'DELETE',
        headers: SUPABASE_HEADERS
    })
        .then(res => {
            if (!res.ok) throw new Error();
            delete ASIGNATURAS[id];
            delete preguntas[id];
            localStorage.setItem('campeonisimo_asignaturas', JSON.stringify(ASIGNATURAS));
            guardarPreguntas();
            renderizarAsignaturas();
            mostrarToast('Asignatura eliminada');
        })
        .catch(() => mostrarToast('Error al eliminar'));
}

function renderizarAsignaturas() {
    // Pantalla selección para jugar
    const checks = document.querySelector('.asignaturas-checks');
    if (checks) {
        checks.innerHTML = Object.entries(ASIGNATURAS).map(([id, a]) => {
            const darker = a.color.replace(/^#/, '');
            const r = Math.max(0, parseInt(darker.substr(0,2),16) - 40);
            const g = Math.max(0, parseInt(darker.substr(2,2),16) - 40);
            const b = Math.max(0, parseInt(darker.substr(4,2),16) - 40);
            const darkColor = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
            return `
            <label class="asignatura-check" style="--asig-color:${a.color};--asig-color-dark:${darkColor}">
                <input type="checkbox" value="${id}">
                <span class="check-box">${a.icono}</span>
                <span>${a.nombre}</span>
            </label>`;
        }).join('');
    }

    // Pantalla selección para crear
    const botones = document.querySelector('.asignaturas-botones');
    if (botones) {
        botones.innerHTML = Object.entries(ASIGNATURAS).map(([id, a]) => `
            <button class="btn-asignatura" onclick="abrirEditor('${id}')" style="border-left:4px solid ${a.color}">
                <span class="icono">${a.icono}</span>
                <span>${a.nombre}</span>
            </button>
        `).join('');
    }

    // Lista de asignaturas para gestionar
    const lista = document.getElementById('lista-asignaturas');
    if (lista) {
        lista.innerHTML = Object.entries(ASIGNATURAS).map(([id, a]) => `
            <div class="asignatura-item" data-asig-id="${id}">
                <span class="asig-icono">${a.icono}</span>
                <span class="asig-nombre">${a.nombre}</span>
                <span class="asig-color" style="background:${a.color}"></span>
                <button class="btn-editar" onclick="editarAsignatura('${id}')">✏</button>
                <button class="btn-eliminar" onclick="eliminarAsignatura('${id}')">✕</button>
            </div>
        `).join('');
    }
}

function editarAsignatura(id) {
    const item = document.querySelector(`[data-asig-id="${id}"]`);
    if (!item) return;
    const a = ASIGNATURAS[id];
    item.innerHTML = `
        <input type="text" class="edit-asig-icono" value="${a.icono}" maxlength="4" title="Emoji">
        <input type="text" class="edit-asig-nombre" value="${a.nombre}">
        <input type="color" class="edit-asig-color" value="${a.color}" title="Color">
        <button class="btn-guardar" onclick="guardarEdicionAsignatura('${id}')">✓</button>
        <button class="btn-cancelar-edit" onclick="renderizarAsignaturas()">✕</button>
    `;
}

function guardarEdicionAsignatura(id) {
    const item = document.querySelector(`[data-asig-id="${id}"]`);
    if (!item) return;

    const nombre = item.querySelector('.edit-asig-nombre').value.trim();
    const icono = item.querySelector('.edit-asig-icono').value.trim() || '📚';
    const color = item.querySelector('.edit-asig-color').value;

    if (!nombre) { mostrarToast('El nombre es obligatorio'); return; }

    fetch(SUPABASE_URL + '/rest/v1/asignaturas?id=eq.' + id, {
        method: 'PATCH',
        headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify({ nombre, icono, color })
    })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(() => {
            ASIGNATURAS[id] = { nombre, icono, color };
            localStorage.setItem('campeonisimo_asignaturas', JSON.stringify(ASIGNATURAS));
            renderizarAsignaturas();
            mostrarToast('Asignatura actualizada');
        })
        .catch(() => mostrarToast('Error al actualizar'));
}

const EMOJIS_POR_CATEGORIA = {
    matematic: ['📐', '🔢', '➕', '➖', '✖️', '➗', '📏', '🧮', '📊', '📈', '💹', '🪄'],
    espanol: ['📖', '📝', '✍️', '📚', '🖊️', '🔠', '💬', '🗣️', '📰', '📕', '📗', '📘'],
    ciencias: ['🔬', '🧪', '⚗️', '🔭', '🌡️', '🧬', '🦠', '💡', '⚡', '🔋', '🧲', '🌌'],
    sociales: ['🌎', '🌍', '🌏', '🏛️', '🗺️', '🗿', '⚔️', '👑', '🏴', '🏳️', '🎖️', '📜'],
    naturaleza: ['🌿', '🌱', '🌳', '🌸', '🌺', '🌻', '🦋', '🐝', '🐛', '🦎', '🐍', '🐢'],
    arte: ['🎨', '🖌️', '🎭', '🎬', '🎤', '🎵', '🎶', '🎸', '🎹', '🥁', '🎺', '🎻'],
    deporte: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊', '🏊', '🚴', '🏃', '🏆'],
    tecnologia: ['💻', '🖥️', '📱', '⌨️', '🖱️', '💾', '🔌', '🤖', '🎮', '🕹️', '📡', '🛰️'],
    cocina: ['🍳', '🥘', '🍕', '🍔', '🌮', '🍰', '🧁', '🍪', '🥗', '🍜', '🍣', '🥐'],
    musica: ['🎵', '🎶', '🎸', '🎹', '🥁', '🎺', '🎻', '🎤', '🎧', '📻', '🎼', '🪕'],
    salud: ['🏥', '💊', '🩺', '💉', '🩹', '🧬', '❤️', '🦷', '👁️', '🧠', '💪', '🧘'],
    idiomas: ['🗣️', '💬', '🌐', '📝', '📖', '🔤', '🆎', '🎎', '🏰', '🗽', '🕌', '⛩️'],
    religion: ['⛪', '🕌', '🕍', '🛕', '✡️', '☸️', '✝️', '☪️', '🕉️', '📿', '🕯️', '🙏'],
    economia: ['💰', '💵', '💴', '💶', '💷', '🪙', '💳', '🏦', '📉', '📈', '💹', '🛒'],
    espacio: ['🚀', '🌙', '⭐', '🌟', '💫', '🪐', '☄️', '🌌', '👽', '🛸', '🔭', '🌍'],
    animales: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    transporte: ['🚗', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚂', '🚀', '⛵', '🚁'],
    clima: ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌧️', '⛈️', '🌩️', '❄️', '🌈', '🌪️', '🌊'],
    bandera: ['🏳️', '🏴', '🏁', '🚩', '🎌', '🏴‍☠️', '🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇲🇽']
};

function sugerirEmojis(texto) {
    const container = document.getElementById('emoji-sugerencias');
    if (!texto || texto.length < 2) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    const lower = texto.toLowerCase();
    let emojis = [];

    Object.entries(EMOJIS_POR_CATEGORIA).forEach(([cat, lista]) => {
        if (lower.includes(cat) || cat.includes(lower)) {
            emojis = emojis.concat(lista);
        }
    });

    if (emojis.length === 0) {
        Object.entries(EMOJIS_POR_CATEGORIA).forEach(([cat, lista]) => {
            const palabras = cat.split(' ');
            palabras.forEach(p => {
                if (p.startsWith(lower) || lower.startsWith(p)) {
                    emojis = emojis.concat(lista);
                }
            });
        });
    }

    if (emojis.length === 0) {
        emojis = Object.values(EMOJIS_POR_CATEGORIA).flat().slice(0, 20);
    }

    const unicos = [...new Set(emojis)].slice(0, 16);

    container.innerHTML = unicos.map(e => `
        <button type="button" class="emoji-btn" onclick="seleccionarEmoji('${e}')">${e}</button>
    `).join('');
    container.style.display = 'flex';
}

function seleccionarEmoji(emoji) {
    document.getElementById('input-nueva-asig-icono').value = emoji;
    document.getElementById('emoji-sugerencias').style.display = 'none';
}

// Guardar/cargar preguntas desde Supabase
function cargarPreguntas() {
    return fetch(SUPABASE_URL + '/rest/v1/preguntas_detalle?select=*&order=id.asc', {
        headers: SUPABASE_HEADERS
    })
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(rows => {
            preguntas = {};
            Object.keys(ASIGNATURAS).forEach(id => { preguntas[id] = []; });
            rows.forEach(r => {
                if (!preguntas[r.asignatura_id]) preguntas[r.asignatura_id] = [];
                preguntas[r.asignatura_id].push({
                    id: r.id,
                    pregunta: r.pregunta,
                    opciones: [r.respuesta1, r.respuesta2, r.respuesta3, r.respuesta4],
                    correcta: parseInt(r.respuestacorrecta)
                });
            });
            localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));
        })
        .catch(() => {
            const guardadas = localStorage.getItem('campeonisimo_preguntas');
            if (guardadas) preguntas = JSON.parse(guardadas);
        });
}

function guardarPreguntas() {
    localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));
}

function sincronizarDesdeNube() {
    mostrarToast('Sincronizando...');
    cargarPreguntas().then(() => {
        mostrarToast('Sincronizado');
        if (editorAsignatura) renderizarPreguntas();
    });
}

function exportarPreguntas() {
    const json = JSON.stringify(preguntas, null, 4);
    navigator.clipboard.writeText(json).then(() => {
        mostrarToast('JSON copiado al portapapeles');
    }).catch(() => {
        const area = document.createElement('textarea');
        area.value = json;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        mostrarToast('JSON copiado al portapapeles');
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
    clearTimeout(juego.relojRapido);
        clearTimeout(juego.relojRapido);
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
        <div class="pregunta-item" data-pregunta-idx="${i}">
            <span class="texto">${i + 1}. ${p.pregunta}</span>
            <button class="btn-editar" onclick="editarPregunta(${i})">✏</button>
            <button class="btn-eliminar" onclick="eliminarPregunta(${i})">✕</button>
        </div>
    `).join('');
}

function editarPregunta(idx) {
    const p = preguntas[editorAsignatura][idx];
    const item = document.querySelector(`[data-pregunta-idx="${idx}"]`);
    if (!item) return;

    item.classList.add('editando');
    item.innerHTML = `
        <div class="edit-pregunta-form">
            <input type="text" class="edit-pregunta-texto" value="${p.pregunta.replace(/"/g, '&quot;')}" placeholder="Pregunta">
            <div class="edit-opciones-grid">
                <input type="text" class="edit-opcion" value="${p.opciones[0].replace(/"/g, '&quot;')}" placeholder="Opción A">
                <input type="text" class="edit-opcion" value="${p.opciones[1].replace(/"/g, '&quot;')}" placeholder="Opción B">
                <input type="text" class="edit-opcion" value="${p.opciones[2].replace(/"/g, '&quot;')}" placeholder="Opción C">
                <input type="text" class="edit-opcion" value="${p.opciones[3].replace(/"/g, '&quot;')}" placeholder="Opción D">
            </div>
            <select class="edit-correcta">
                <option value="0" ${p.correcta === 0 ? 'selected' : ''}>A</option>
                <option value="1" ${p.correcta === 1 ? 'selected' : ''}>B</option>
                <option value="2" ${p.correcta === 2 ? 'selected' : ''}>C</option>
                <option value="3" ${p.correcta === 3 ? 'selected' : ''}>D</option>
            </select>
            <div class="edit-botones">
                <button class="btn-guardar" onclick="guardarEdicionPregunta(${idx})">✓</button>
                <button class="btn-cancelar-edit" onclick="renderizarPreguntas()">✕</button>
            </div>
        </div>
    `;
}

function guardarEdicionPregunta(idx) {
    const item = document.querySelector(`[data-pregunta-idx="${idx}"]`);
    if (!item) return;

    const texto = item.querySelector('.edit-pregunta-texto').value.trim();
    const opciones = Array.from(item.querySelectorAll('.edit-opcion')).map(i => i.value.trim());
    const correcta = parseInt(item.querySelector('.edit-correcta').value);

    if (!texto) { mostrarToast('Escribe la pregunta'); return; }
    if (opciones.some(o => !o)) { mostrarToast('Completa las 4 opciones'); return; }

    const pregunta = preguntas[editorAsignatura][idx];
    const id = pregunta.id;

    if (id) {
        fetch(SUPABASE_URL + '/rest/v1/preguntas_detalle?id=eq.' + id, {
            method: 'PATCH',
            headers: SUPABASE_HEADERS,
            body: JSON.stringify({
                pregunta: texto,
                respuesta1: opciones[0],
                respuesta2: opciones[1],
                respuesta3: opciones[2],
                respuesta4: opciones[3],
                respuestacorrecta: String(correcta)
            })
        }).catch(() => {});
    }

    preguntas[editorAsignatura][idx] = { id, pregunta: texto, opciones, correcta };
    localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));
    renderizarPreguntas();
    mostrarToast('Pregunta actualizada');
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

    fetch(SUPABASE_URL + '/rest/v1/preguntas_detalle', {
        method: 'POST',
        headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify({
            asignatura_id: editorAsignatura,
            pregunta: textoPregunta,
            respuesta1: opA,
            respuesta2: opB,
            respuesta3: opC,
            respuesta4: opD,
            respuestacorrecta: correcta
        })
    })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(rows => {
            if (!preguntas[editorAsignatura]) preguntas[editorAsignatura] = [];
            preguntas[editorAsignatura].push({
                id: rows[0].id,
                pregunta: textoPregunta,
                opciones: [opA, opB, opC, opD],
                correcta: parseInt(correcta)
            });
            localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));
            renderizarPreguntas();

            document.getElementById('input-pregunta').value = '';
            document.getElementById('opcion-a').value = '';
            document.getElementById('opcion-b').value = '';
            document.getElementById('opcion-c').value = '';
            document.getElementById('opcion-d').value = '';
            document.getElementById('respuesta-correcta').value = '';

            mostrarToast('Pregunta agregada');
        })
        .catch(() => mostrarToast('Error al agregar'));
}

function eliminarPregunta(indice) {
    const pregunta = preguntas[editorAsignatura][indice];

    if (pregunta.id) {
        fetch(SUPABASE_URL + '/rest/v1/preguntas_detalle?id=eq.' + pregunta.id, {
            method: 'DELETE',
            headers: SUPABASE_HEADERS
        }).catch(() => {});
    }

    preguntas[editorAsignatura].splice(indice, 1);
    localStorage.setItem('campeonisimo_preguntas', JSON.stringify(preguntas));
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
    clearTimeout(juego.relojRapido);

    // Carillón al inicio - suena una sola vez
    reproducirSonido('alarma');

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
    clearTimeout(juego.relojRapido);
        clearTimeout(juego.relojRapido);
        if (relojIcono) relojIcono.style.display = 'none';
            if (campanaIcono) campanaIcono.style.display = 'inline-block';
            reproducirSonido('campana');

            // Deshabilitar opciones pero NO mostrar correcta aún
            const botones = document.querySelectorAll('.opcion');
            botones.forEach(b => b.classList.add('deshabilitada'));

            // Después de 4 segundos mostrar la correcta
            setTimeout(() => {
                if (campanaIcono) campanaIcono.style.display = 'none';
                seleccionarOpcion(-1);
            }, 4000);
        }
    }, 100);
}

function seleccionarOpcion(indice) {
    clearInterval(juego.temporizador);
    clearInterval(juego.relojInterval);
    clearTimeout(juego.relojRapido);

    const preguntaActual = juego.preguntas[juego.indiceActual];
    const botones = document.querySelectorAll('.opcion');

    botones.forEach(b => b.classList.add('deshabilitada'));

    // Marcar correcta
    botones[preguntaActual.correcta].classList.add('correcta');

    if (indice === preguntaActual.correcta) {
        reproducirSonido('correcto');
        mostrarMensajePositivo();
        juego.respuestasCorrectas++;
        const puntosPorPregunta = Math.round(100 / juego.totalPreguntas);
        juego.puntaje += puntosPorPregunta;
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
    clearTimeout(juego.relojRapido);

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
    const nombre = nombreJugador || 'Anónimo';
    puntajes.push({ nombre, puntaje, fecha });
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
            <span class="puntaje-nombre">${p.nombre || 'Jugador'}</span>
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

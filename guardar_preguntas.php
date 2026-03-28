<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metodo no permitido']);
    exit;
}

$archivo = 'script.js';

// Verificar permisos de escritura
if (!is_writable($archivo) && file_exists($archivo)) {
    echo json_encode(['success' => false, 'message' => 'Sin permisos de escritura en script.js']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['preguntas'])) {
    echo json_encode(['success' => false, 'message' => 'Datos invalidos']);
    exit;
}

$preguntas = $data['preguntas'];

// Convertir a JSON con formato legible
$json = json_encode($preguntas, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Generar el bloque de datos
$bloqueDatos = "// ====== DATOS DE ASIGNATURAS ======\n";
$bloqueDatos .= "const ASIGNATURAS = {\n";
$bloqueDatos .= "    matematicas: { nombre: 'Matemáticas', icono: '📐', color: '#f7971e' },\n";
$bloqueDatos .= "    espanol: { nombre: 'Español', icono: '📖', color: '#e74c3c' },\n";
$bloqueDatos .= "    sociales: { nombre: 'Ciencias Sociales', icono: '🌎', color: '#3498db' },\n";
$bloqueDatos .= "    naturales: { nombre: 'Ciencias Naturales', icono: '🔬', color: '#2ecc71' },\n";
$bloqueDatos .= "    cultura: { nombre: 'Cultura General', icono: '🌍', color: '#9b59b6' }\n";
$bloqueDatos .= "};\n\n";
$bloqueDatos .= "// Preguntas por asignatura\n";
$bloqueDatos .= "const PREGUNTAS_DEFAULT = " . $json . ";\n\n";

// Leer archivo actual
$contenido = file_get_contents($archivo);

if ($contenido === false) {
    echo json_encode(['success' => false, 'message' => 'No se pudo leer script.js']);
    exit;
}

// Marcadores para buscar el bloque de datos
$marcadorInicio = '// ====== DATOS DE ASIGNATURAS ======';
$marcadorFin = '// ====== ESTADO DEL JUEGO ======';

$posInicio = strpos($contenido, $marcadorInicio);
$posFin = strpos($contenido, $marcadorFin);

if ($posInicio === false || $posFin === false || $posFin <= $posInicio) {
    echo json_encode(['success' => false, 'message' => 'No se encontraron marcadores en script.js']);
    exit;
}

// Extraer la parte del archivo despues del bloque de datos
$resto = substr($contenido, $posFin);

// Construir archivo completo
$nuevoContenido = $bloqueDatos . $resto;

// Escribir archivo
$resultado = file_put_contents($archivo, $nuevoContenido);

if ($resultado !== false) {
    echo json_encode(['success' => true, 'message' => 'Preguntas guardadas correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al escribir script.js. Verifique permisos.']);
}
?>

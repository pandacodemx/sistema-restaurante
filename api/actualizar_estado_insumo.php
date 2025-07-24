<?php
// actualizar_estado_insumo.php
include_once "funciones.php";

$idMesa = $_POST['idMesa'] ?? null;
$idInsumo = $_POST['idInsumo'] ?? null;
$nuevoEstado = $_POST['nuevoEstado'] ?? null;

if (!$idMesa || !$idInsumo || !$nuevoEstado) {
    echo json_encode(false);
    exit;
}

$archivo = "./mesas_ocupadas/" . $idMesa . ".csv";

if (!file_exists($archivo)) {
    echo json_encode(false);
    exit;
}

$lineas = file($archivo, FILE_IGNORE_NEW_LINES);
if (!$lineas) {
    echo json_encode(false);
    exit;
}

$datos = [];
foreach ($lineas as $linea) {
    $datos[] = str_getcsv($linea);
}

// La primer línea es la mesa, desde la segunda están los insumos
for ($i = 1; $i < count($datos); $i++) {
    if ($datos[$i][0] == $idInsumo) {
        $datos[$i][6] = $nuevoEstado; // Asumiendo que la posición 6 es estado
        break;
    }
}

// Reescribir el archivo con los datos actualizados
$archivoNuevo = fopen($archivo, "w");
foreach ($datos as $linea) {
    fputcsv($archivoNuevo, $linea);
}
fclose($archivoNuevo);

echo json_encode(true);

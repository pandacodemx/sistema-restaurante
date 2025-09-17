<?php
include_once "encabezado.php";
include_once "funciones.php";


$input = file_get_contents("php://input");
$filtros = !empty($input) ? json_decode($input) : (object)[];


if (!is_object($filtros)) {
    $filtros = (object)[];
}


if (!isset($filtros->tipo)) $filtros->tipo = "";
if (!isset($filtros->categoria)) $filtros->categoria = "";
if (!isset($filtros->nombre)) $filtros->nombre = "";

$insumos = obtenerInsumos($filtros);
echo json_encode($insumos);
?>
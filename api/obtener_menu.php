<?php
include_once "encabezado.php";
include_once "funciones.php";

$bd = conectarBaseDatos();
$sentencia = $bd->query("SELECT nombre, categoria, codigo, descripcion AS ingredientes, imagen, tipo FROM insumos");

$datos = [];
while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
    $fila['tipo'] = json_decode($fila['tipo'], true); // si lo guardas como JSON
    $fila['imagen'] = $fila['imagen'] ? "http://localhost/sistema-restaurante/api/" . $fila['imagen'] : null;
    $datos[] = $fila;
}

echo json_encode($datos);

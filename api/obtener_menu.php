<?php
include_once "encabezado.php";
include_once "funciones.php";

$bd = conectarBaseDatos();


$sentencia = $bd->query("
    SELECT 
        i.nombre, 
        c.nombre AS categoria, 
        i.codigo, 
        i.precio, 
        i.descripcion AS ingredientes, 
        i.imagen, 
        i.tipo 
    FROM insumos i
    INNER JOIN categorias c ON i.categoria = c.id
");

$datos = [];
while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
    $fila['tipo'] = json_decode($fila['tipo'], true); 
    $fila['imagen'] = $fila['imagen'] ? "http://localhost/sistema-restaurante-1/api/" . $fila['imagen'] : null;
    $datos[] = $fila;
}

echo json_encode($datos);

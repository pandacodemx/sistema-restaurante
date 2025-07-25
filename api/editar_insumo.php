<?php
include_once "encabezado.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

include_once "funciones.php";

$bd = conectarBaseDatos();

$id = $_POST['id'];
$tipo = $_POST['tipo'];
$codigo = $_POST['codigo'];
$nombre = $_POST['nombre'];
$descripcion = $_POST['descripcion'];
$categoria = $_POST['categoria'];
$precio = $_POST['precio'];

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {

    $sentencia = $bd->prepare("SELECT imagen FROM insumos WHERE id = ?");
    $sentencia->execute([$id]);
    $anterior = $sentencia->fetchColumn();


    if ($anterior && file_exists($anterior)) {
        unlink($anterior);
    }


    $directorio = "imagenes_insumos/";
    $nombreTemp = $_FILES['imagen']['tmp_name'];
    $nombreArchivo = uniqid() . "_" . basename($_FILES['imagen']['name']);
    $rutaDestino = $directorio . $nombreArchivo;

    if (move_uploaded_file($nombreTemp, $rutaDestino)) {
        $sentencia = $bd->prepare("UPDATE insumos SET tipo = ?, codigo = ?, nombre = ?, descripcion = ?, categoria = ?, precio = ?, imagen = ? WHERE id = ?");
        $resultado = $sentencia->execute([$tipo, $codigo, $nombre, $descripcion, $categoria, $precio, $rutaDestino, $id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo guardar la imagen"]);
        exit;
    }
} else {

    $sentencia = $bd->prepare("UPDATE insumos SET tipo = ?, codigo = ?, nombre = ?, descripcion = ?, categoria = ?, precio = ? WHERE id = ?");
    $resultado = $sentencia->execute([$tipo, $codigo, $nombre, $descripcion, $categoria, $precio, $id]);
}

echo json_encode($resultado);

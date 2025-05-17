<?php
include_once "encabezado.php";

// Verifica que los campos obligatorios estén presentes
if (!isset($_POST['codigo'], $_POST['nombre'], $_POST['descripcion'], $_POST['precio'], $_POST['tipo'], $_POST['categoria'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos obligatorios."]);
    exit;
}

// Opcional: manejar imagen si se subió
$imagen = null;
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $rutaDestino = "imagenes_insumos/";
    if (!is_dir($rutaDestino)) {
        mkdir($rutaDestino, 0777, true);
    }

    $nombreArchivo = uniqid() . "_" . basename($_FILES["imagen"]["name"]);
    $rutaCompleta = $rutaDestino . $nombreArchivo;

    if (move_uploaded_file($_FILES["imagen"]["tmp_name"], $rutaCompleta)) {
        $imagen = $rutaCompleta;
    }
}

include_once "funciones.php";

// Construye objeto insumo como stdClass
$insumo = (object)[
    'codigo' => $_POST['codigo'],
    'nombre' => $_POST['nombre'],
    'descripcion' => $_POST['descripcion'],
    'precio' => $_POST['precio'],
    'tipo' => $_POST['tipo'],
    'categoria' => $_POST['categoria'],
    'imagen' => $imagen // puedes guardarla si actualizas la base
];

$resultado = registrarInsumoP($insumo);
echo json_encode($resultado);

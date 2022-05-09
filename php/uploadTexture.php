<?php
session_start();
// Leer fichero de configuracion
$config = parse_ini_file("pcbuilder.config", true)["phpmyadmin"];
// Conexion DB (2 contraseñas porque hay 1 BD en Xammp y otra en LTIM)
$db = @mysqli_connect("localhost", $config["user"], $config["password"], "pc_builder_db"); //@ elimina el warning
if (!$db) {
    $db = @mysqli_connect("localhost", "root", "", "pc_builder_db");
    if (!$db) {
        echo "errorBD";
        return;
    }
}
mysqli_set_charset($db, "utf8mb4"); // Forzar ut8mb4 en la conexion

revisarCredenciales($db);

// Subir textura al servidor
if (isset($_FILES['file']['name'])) {
    // File name
    $filename = $_FILES['file']['name'];

    // Location
    $location = '../assets/texturesComponents/' . $filename;

    // File extension
    $file_extension = pathinfo($location, PATHINFO_EXTENSION);
    $file_extension = strtolower($file_extension);

    // Cambiar nombre
    if ($_POST["cmp_id"] == null) {
        $_POST["cmp_id"] = generarIDPieza($db, $_FILES["file"]["tipo"]);
    }
    $filename = $_POST["cmp_id"] . ".jpg";
    $location = '../assets/texturesComponents/' . $filename;

    // Valid extensions
    $valid_ext = array("png", "jpg");

    $response = "false";
    if (in_array($file_extension, $valid_ext)) {
        // Upload file
        if (move_uploaded_file($_FILES['file']['tmp_name'], $location)) {
            $response = $location;
        }
    }
    echo $response;
    exit;
}


// Funcion que comprueba el usuario y la contraseña
function revisarCredenciales($db)
{
    $sql = "SELECT * FROM usuario WHERE username='" . $_SESSION["username-piezas"] . "'";
    $query = mysqli_query($db, $sql);
    $result = mysqli_fetch_all($query, MYSQLI_NUM);

    if ($result == null) {
        echo "errorCredenciales";
        exit;
    }
    if ($result[0][0] != $_SESSION["username-piezas"]) {
        echo "errorCredenciales";
        exit;
    }
}

// Funcion que genera un identificador para las piezas nuevas
function generarIDPieza($db, $tipo)
{
    $tipo = $tipo - 1;
    $type = ["placabase", "cpu", "ventilador", "ram", "disco", "fuente", "gpu"];
    $id = ["idPlacaBase", "idCPU", "idVentilador", "idRAM", "idDisco", "idFuente", "idGPU"];
    $replace = "cmp-" . $type[$tipo] . "-";

    $sql = "SELECT * FROM " . $type[$tipo] . " ORDER BY " . $id[$tipo] . " DESC LIMIT 1";
    $query = mysqli_query($db, $sql);
    $result = mysqli_fetch_all($query, MYSQLI_NUM);
    $nuevoID = (intval(str_replace($replace, "", $result[0][0]))) + 1;
    return "cmp-" . $type[$tipo] . "-" . $nuevoID;
}

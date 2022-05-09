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

// Revisar credenciales
$sql = "SELECT * FROM usuario WHERE username='" . $_SESSION["username-main"] . "'";
$query = mysqli_query($db, $sql);
$result = mysqli_fetch_all($query, MYSQLI_NUM);

if ($result == null) {
    echo "false";
    return;
}
if ($result[0][0] != $_SESSION["username-main"]) {
    echo "false";
    return;
}


// Verificar que no exista el nuevo nombre
if ($_POST["oldUsername"] != $_POST["newUsername"]) {
    $sql = "SELECT * FROM usuario WHERE username='" . $_POST["newUsername"] . "'";
    $query = mysqli_query($db, $sql);
    $result = mysqli_fetch_all($query, MYSQLI_NUM);
    if (count($result) > 0) {
        echo "existe";
        return;
    }
}

// Realizar la modificacion en la BD
$sql = "UPDATE usuario SET username='" . $_POST["newUsername"] . "', idAvatar="
    . $_POST["idAvatar"] . " WHERE username='" . $_POST["oldUsername"] . "'";
$query = mysqli_query($db, $sql);

// Actualizar sesion
$_SESSION["username-main"] = $_POST["newUsername"];

echo json_encode($query); //true o false
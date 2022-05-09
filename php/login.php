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

// Calcular los nombres de sesion
$title = "username-main";
if ($_GET["tipo"] == 1) $title = "username-piezas";
else if ($_GET["tipo"] == 2) $title = "username-pruebas";

// Tablas
switch ($_GET["tabla"]) {
    case "usuario":
        // No hay sesion iniciada
        if (!isset($_SESSION[$title])) {
            // Realizar la consulta en la BD
            $sql = "SELECT * FROM usuario WHERE username='" . $_GET["username"] . "'";
            $query = mysqli_query($db, $sql);
            $result = mysqli_fetch_all($query, MYSQLI_NUM);

            // Si el usuario no existe
            if ($result == null) {
                echo "false";
                return;
            }

            // Verificar la contraseña
            if (password_verify($_GET["password"], $result[0][1])) {
                // Verificar si es del tipo que toca (si se requiere)
                if (isset($_GET["tipo"]) && $_GET["tipo"] != $result[0][3] && $_GET["tipo"] != 0) {
                    echo "false";
                    return;
                }
                $_SESSION[$title] = $_GET["username"];
                devolverDatos($db, $_GET["username"], $result);
                return;
            }
            else {
                echo "false";
            }
        } else { // Hay sesion iniciada (SESSION)
            // Realizar la consulta en la BD
            $sql = "SELECT * FROM usuario WHERE username='" . $_SESSION[$title] . "'";
            $query = mysqli_query($db, $sql);
            $result = mysqli_fetch_all($query, MYSQLI_NUM);

            if ($result[0][0] == $_SESSION[$title]) {
                if (isset($_GET["tipo"]) && $_GET["tipo"] != $result[0][3] && $_GET["tipo"] != 0) {
                    echo "false";
                    return;
                }
                devolverDatos($db, $_SESSION[$title], $result);
                return;
            } else {
                echo "false";
            }
        }

        break;

    case "session":
        if (!isset($_SESSION[$title])) {
            echo "sinDatos";
            return;
        } else {
            echo "conDatos";
        }

        break;

    case "cerrar_sesion":
        unset($_SESSION[$title]);
        break;
}

function devolverDatos($db, $usuario, $result)
{
    // Obtener las estadisticas de ese usuario
    $sql = "SELECT username, nomPrueba, date_format(fecha, '%d/%m/%Y'), "
        . "tiempo, puntuacion, idEstadistica FROM estadistica INNER JOIN "
        . "prueba WHERE estadistica.idPrueba = prueba.idPrueba AND "
        . "username = '" . $usuario . "' ORDER BY idEstadistica DESC";
    $query = mysqli_query($db, $sql);
    $estadisticas = mysqli_fetch_all($query, MYSQLI_NUM);

    $data = [
        "usuario" => $result,
        "estadisticas" => $estadisticas
    ];
    echo json_encode($data);
}

<?php
// https://www.php.net/manual/es/function.password-hash.php     BCRYPT
// https://www.php.net/manual/es/function.password-verify.php
// https://github.com/tapio/live-server/issues/222              POST en LiveServer

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

// Tablas
switch ($_POST["tabla"]) {
    case "usuario":
        // Calcular hash de la contraseña
        $pwHash = password_hash($_POST["password"], PASSWORD_DEFAULT);

        // Realizar la insercion en la BD
        $sql = "INSERT INTO usuario(username, pwHash, idAvatar, tipoUsuario) VALUES ('"
            . $_POST["username"] . "', '"
            . $pwHash . "', "
            . $_POST["idAvatar"] . ", "
            . $_POST["tipoUsuario"] . ")";
        $query = mysqli_query($db, $sql);

        echo json_encode($query); //true o false
        break;

    case "insertar_pieza":
        revisarCredenciales($db, 1);
        // Crear id (si la pieza es nueva)
        if ($_POST["datos"][0] == null) {
            $_POST["datos"][0] = generarIDPieza($db, $_POST["datos"][9]);
        }

        // Borrar la pieza (por si existiera)
        $sql = "DELETE FROM pieza WHERE idPieza='" . $_POST["datos"][0] . "'";
        mysqli_query($db, $sql);

        // Insertar en la tabla del tipo de pieza
        insertarPiezaTipo($db, $_POST["datos"][9]);

        // Revisar si la textura es subida por el usuario
        if ($_POST["datos"][6] == null) {
            $_POST["datos"][6] = $_POST["datos"][0] . ".jpg";
        }

        // Insertar en la tabla "pieza"
        $sql = "INSERT INTO pieza(idPieza, nomPieza, descrPieza, width, height," .
            "depth, textura, marca, modelo, idTipoPieza) VALUES ('" . $_POST["datos"][0] . "', '" .
            $_POST["datos"][1] . "', '" . $_POST["datos"][2] . "', '" . $_POST["datos"][3] . "', '" .
            $_POST["datos"][4] . "', '" . $_POST["datos"][5] . "', '" . $_POST["datos"][6] . "', '" .
            $_POST["datos"][7] . "', '" . $_POST["datos"][8] . "', '" . $_POST["datos"][9] . "')";
        mysqli_query($db, $sql);

        echo $_POST["datos"][0]; // Devolver el cmp_id
        break;

    case "insertar_prueba":
        revisarCredenciales($db, 2);
        // Crear id (si la prueba es nueva)
        if ($_POST["datos"][0][0] == null) {
            $idPrueba = generarIDPrueba($db);
            $numPrueba = str_replace("prueba-", "", $idPrueba);
            $_POST["datos"][0][0] = $idPrueba;
            // Aplicar id tambien a las tareas
            for ($i = 0; $i < count($_POST["datos"][1]); $i++) {
                $_POST["datos"][1][$i][0] = "tarea-" . $numPrueba . "-" . $i;
                $_POST["datos"][1][$i][7] = $idPrueba;
            }
        }

        // Borrar las tareas (por si existieran)
        $sql = "DELETE FROM tarea WHERE tarea.idPrueba='" . $_POST["datos"][0][0] . "'";
        mysqli_query($db, $sql);

        // Mirar si la prueba ya existe
        $sql = "SELECT * FROM prueba WHERE idPrueba = '" . $_POST["datos"][0][0] . "'";
        $query = mysqli_query($db, $sql);
        $prueba = mysqli_fetch_all($query, MYSQLI_NUM);
        // No existe
        if (count($prueba) == 0) {
            // Insertar la prueba
            $sql = "INSERT INTO prueba(idPrueba, nomPrueba, descrPrueba, dificultad) VALUES ('"
                . $_POST["datos"][0][0] . "', '" . $_POST["datos"][0][1] . "', '"
                . $_POST["datos"][0][2] . "', " . $_POST["datos"][0][3] . ")";
            mysqli_query($db, $sql);
        }
        // Si existe
        else {
            // Actualizarla
            $sql = "UPDATE prueba SET nomPrueba = '" . $_POST["datos"][0][1]
                . "', descrPrueba = '" . $_POST["datos"][0][2] . "', dificultad = "
                . $_POST["datos"][0][3] . " WHERE idPrueba='" . $_POST["datos"][0][0] . "'";
            mysqli_query($db, $sql);
        }

        // Insertar las tareas
        for ($i = 0; $i < count($_POST["datos"][1]); $i++) {
            $sql = "INSERT INTO tarea(idTarea, descrTarea, almacenamiento, atributo, "
                . "accion, valor1, valor2, idPrueba, idTipoPieza) VALUES ('"
                . $_POST["datos"][1][$i][0] . "', '" . $_POST["datos"][1][$i][1] . "', "
                . $_POST["datos"][1][$i][2] . ", '" . $_POST["datos"][1][$i][3] . "', '"
                . $_POST["datos"][1][$i][4] . "', '" . $_POST["datos"][1][$i][5] . "', '"
                . $_POST["datos"][1][$i][6] . "', '" . $_POST["datos"][1][$i][7] . "', "
                . $_POST["datos"][1][$i][8] . ")";
            mysqli_query($db, $sql);
        }

        break;

    case "eliminar_pieza":
        $sql = "DELETE FROM pieza WHERE idPieza='" . $_POST["cmp_id"] . "'";
        mysqli_query($db, $sql);
        eliminarPiezaTipo($db);

        break;

    case "eliminar_prueba":
        // Borrar las tareas
        $sql = "DELETE FROM tarea WHERE tarea.idPrueba='" . $_POST["prueba_id"] . "'";
        mysqli_query($db, $sql);

        // Borrar las estadisticas
        $sql = "DELETE FROM estadistica WHERE estadistica.idPrueba='" . $_POST["prueba_id"] . "'";
        mysqli_query($db, $sql);

        // Borrar la prueba
        $sql = "DELETE FROM prueba WHERE idPrueba='" . $_POST["prueba_id"] . "'";
        mysqli_query($db, $sql);

        break;

    case "estadistica":
        // Crear id para la estadistica
        $idEstadistica = generarIDEstadistica($db);
        // Arreglar el username null o no null
        if ($_POST["datos"][4] != null) {
            $_POST["datos"][4] = "'" . $_POST["datos"][4] . "'";
        } else $_POST["datos"][4] = "NULL";
        // Arreglar el userEstadistica null o no null
        if ($_POST["datos"][3] != null) {
            $_POST["datos"][3] = "'" . $_POST["datos"][3] . "'";
        } else $_POST["datos"][3] = "NULL";

        $sql = "INSERT INTO estadistica(idEstadistica, fecha, tiempo, "
            . "puntuacion, usuarioRegistrado, userEstadistica, username, "
            . "idPrueba) VALUES ('" . $idEstadistica . "', CURDATE(), "
            . $_POST["datos"][0] . ", " . $_POST["datos"][1] . ", "
            . $_POST["datos"][2] . ", " . $_POST["datos"][3] . ", "
            . $_POST["datos"][4] . ", '" . $_POST["datos"][5] . "')";
        mysqli_query($db, $sql);

        // Devolver todas las estadisticas
        $sql = "SELECT username, nomPrueba, date_format(fecha, '%d/%m/%Y'), "
            . "tiempo, puntuacion, idEstadistica FROM estadistica INNER JOIN "
            . "prueba WHERE estadistica.idPrueba = prueba.idPrueba AND "
            . "username = " . $_POST["datos"][4] . " ORDER BY idEstadistica DESC";
        $query = mysqli_query($db, $sql);
        $estadisticas = mysqli_fetch_all($query, MYSQLI_NUM);

        echo json_encode($estadisticas);
        break;
}


// Funcion que hace un insert en la BD de la pieza segun su tipo (1 tabla por tipo)
function insertarPiezaTipo($db, $tipo)
{
    switch ($tipo) {
        case 1:
            $sql = "DELETE FROM placabase WHERE idPlacaBase='" . $_POST["datos"][0] . "'";
            mysqli_query($db, $sql);
            $sql = "INSERT INTO placabase(idPlacaBase, tipoPlacaBase, socketMBCPU, " .
                "slotsRAM, slotsHDD, slotsSSD) VALUES ('" . $_POST["datos"][0] . "', '" .
                $_POST["datos"][11] . "', '" . $_POST["datos"][12] . "', '" . $_POST["datos"][13] . "', '" .
                $_POST["datos"][14] . "', '" . $_POST["datos"][15] . "')";
            mysqli_query($db, $sql);
            break;
        case 2:
            $sql = "DELETE FROM cpu WHERE idCPU='" . $_POST["datos"][0] . "'";
            mysqli_query($db, $sql);
            $sql = "INSERT INTO cpu(idCPU, arquitectura, socketCPU, nucleos," .
                " frecCPU, frecTurbo, consumoCPU) VALUES ('" . $_POST["datos"][0] . "', '" .
                $_POST["datos"][11] . "', '" . $_POST["datos"][12] . "', '" . $_POST["datos"][13] . "', '" .
                $_POST["datos"][14] . "', '" . $_POST["datos"][15] . "', '" . $_POST["datos"][16] . "')";
            mysqli_query($db, $sql);
            break;
        case 3:
            $sql = "DELETE FROM ventilador WHERE idVentilador='" . $_POST["datos"][0] . "'";
            mysqli_query($db, $sql);
            $sql = "INSERT INTO ventilador(idVentilador, velocidadVentilador) VALUES('" .
                $_POST["datos"][0] . "', '" . $_POST["datos"][11] . "')";
            mysqli_query($db, $sql);
            break;
        case 4:
            $sql = "DELETE FROM ram WHERE idRAM='" . $_POST["datos"][0] . "'";
            mysqli_query($db, $sql);
            $sql = "INSERT INTO ram(idRAM, estandar, velocidadRAM, capacidadRAM) VALUES('" .
                $_POST["datos"][0] . "', '" . $_POST["datos"][11] . "', '" . $_POST["datos"][12] .
                "', '" . $_POST["datos"][13] . "')";
            mysqli_query($db, $sql);
            break;
        case 5:
            $sql = "DELETE FROM disco WHERE idDisco='" . $_POST["datos"][0] . "'";
            mysqli_query($db, $sql);
            $sql = "INSERT INTO disco(idDisco, tipoDisco, velocidadDisco, capacidadDisco) VALUES('" .
                $_POST["datos"][0] . "', '" . $_POST["datos"][11] . "', '" . $_POST["datos"][12] .
                "', '" . $_POST["datos"][13] . "')";
            mysqli_query($db, $sql);
            break;
        case 6:
            $sql = "DELETE FROM fuente WHERE idFuente='" . $_POST["datos"][0] . "'";
            mysqli_query($db, $sql);
            $sql = "INSERT INTO fuente(idFuente, tipoFuente, potencia) VALUES('" .
                $_POST["datos"][0] . "', '" . $_POST["datos"][11] . "', '" . $_POST["datos"][12] .
                "')";
            mysqli_query($db, $sql);
            break;
        case 7:
            $sql = "DELETE FROM gpu WHERE idGPU='" . $_POST["datos"][0] . "'";
            mysqli_query($db, $sql);
            $sql = "INSERT INTO gpu(idGPU, memoria, vram, consumoGPU) VALUES('" .
                $_POST["datos"][0] . "', '" . $_POST["datos"][11] . "', '" . $_POST["datos"][12] .
                "', '" . $_POST["datos"][13] . "')";
            mysqli_query($db, $sql);
            break;
    }
}

// Funcion que elimina una pieza segun su tipo
function eliminarPiezaTipo($db)
{
    switch ($_POST["tipo"]) {
        case 1:
            $sql = "DELETE FROM placabase WHERE idPlacaBase='" . $_POST["cmp_id"] . "'";
            mysqli_query($db, $sql);
            break;
        case 2:
            $sql = "DELETE FROM cpu WHERE idCPU='" . $_POST["cmp_id"] . "'";
            mysqli_query($db, $sql);
            break;
        case 3:
            $sql = "DELETE FROM ventilador WHERE idVentilador='" . $_POST["cmp_id"] . "'";
            mysqli_query($db, $sql);
            break;
        case 4:
            $sql = "DELETE FROM ram WHERE idRAM='" . $_POST["cmp_id"] . "'";
            mysqli_query($db, $sql);
            break;
        case 5:
            $sql = "DELETE FROM disco WHERE idDisco='" . $_POST["cmp_id"] . "'";
            mysqli_query($db, $sql);
            break;
        case 6:
            $sql = "DELETE FROM fuente WHERE idFuente='" . $_POST["cmp_id"] . "'";
            mysqli_query($db, $sql);
            break;
        case 7:
            $sql = "DELETE FROM gpu WHERE idGPU='" . $_POST["cmp_id"] . "'";
            mysqli_query($db, $sql);
            break;
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

// Funcion que genera un identificador para las pruebas nuevas
function generarIDPrueba($db)
{
    $query = mysqli_query($db, "SELECT * FROM prueba ORDER BY idPrueba DESC LIMIT 1");
    $result = mysqli_fetch_all($query, MYSQLI_NUM);
    $nuevoID = (intval(str_replace("prueba-", "", $result[0][0]))) + 1;
    return "prueba-" . $nuevoID;
}

// Funcion que genera un identificador para las estadisticas nuevas
function generarIDEstadistica($db)
{
    $query = mysqli_query($db, "SELECT * FROM estadistica ORDER BY idEstadistica DESC LIMIT 1");
    $result = mysqli_fetch_all($query, MYSQLI_NUM);
    $nuevoID = (intval(str_replace("estadistica-", "", $result[0][0]))) + 1;
    return "estadistica-" . $nuevoID;
}

// Funcion que comprueba el usuario y la contraseña
function revisarCredenciales($db, $tipoUsuario)
{
    // Calcular los nombres de sesion
    $title = "username-main";
    if ($tipoUsuario == 1) $title = "username-piezas";
    else if ($tipoUsuario == 2) $title = "username-pruebas";

    // Realizar la consulta en la BD
    $sql = "SELECT * FROM usuario WHERE username='" . $_SESSION[$title] . "'" .
        " AND tipoUsuario='" . $tipoUsuario . "'";
    $query = mysqli_query($db, $sql);
    $result = mysqli_fetch_all($query, MYSQLI_NUM);

    // Si el usuario no existe
    if ($result == null) {
        echo "errorCredenciales";
        exit;
    }
}

<?php
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
switch ($_GET["tabla"]) {
    case "usuario":
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
            if (isset($_GET["tipo"]) && $_GET["tipo"] != $result[0][3]) {
                echo "false";
                return;
            }

            // Obtener las estadisticas de ese usuario
            $sql = "SELECT username, nomPrueba, date_format(fecha, '%d/%m/%Y'), "
                . "tiempo, puntuacion, idEstadistica FROM estadistica INNER JOIN "
                . "prueba WHERE estadistica.idPrueba = prueba.idPrueba AND "
                . "username = '" . $_GET["username"] . "' ORDER BY idEstadistica DESC";
            $query = mysqli_query($db, $sql);
            $estadisticas = mysqli_fetch_all($query, MYSQLI_NUM);

            $data = [
                "usuario" => $result,
                "estadisticas" => $estadisticas
            ];

            $_SESSION["username-piezas"] = $_GET["username"];

            echo json_encode($data);
        } else {
            echo "false";
        }
        break;

    case "componentes": // Obtener todos los componentes
        $tabla = ["placabase", "cpu", "ventilador", "ram", "disco", "fuente", "gpu"];
        $idComp = ["idPlacaBase", "idCPU", "idVentilador", "idRAM", "idDisco", "idFuente", "idGPU"];
        $result = [];
        for ($i = 0; $i < count($tabla); $i++) {
            // Obtener el componente juntamente con la clase "Pieza"
            $sql = "SELECT * FROM pieza INNER JOIN " . $tabla[$i]
                . " ON pieza.idPieza=" . $tabla[$i] . "." . $idComp[$i];

            $query = mysqli_query($db, $sql);
            $result[] = mysqli_fetch_all($query, MYSQLI_NUM);
        }

        // Return JSON (combinar todo en un array clave-valor)
        $data = [
            "placabase" => $result[0],
            "cpu" => $result[1],
            "ventilador" => $result[2],
            "ram" => $result[3],
            "disco" => $result[4],
            "fuente" => $result[5],
            "gpu" => $result[6]

        ];
        echo json_encode($data); // Codificar en JSON
        break;

    case "tarea":
        $sql = "SELECT * FROM tarea WHERE tarea.idPrueba = '" . $_GET["prueba"] . "'";
        $query = mysqli_query($db, $sql);
        $tareas = mysqli_fetch_all($query, MYSQLI_NUM);

        $cmps = calcularPiezasCompatibles($db, $tareas, TRUE);

        $data = [
            "tareas" => $tareas,
            "tareas_cmps" => $cmps,
        ];

        echo json_encode($data);
        break;

    case "prueba":
        $sql = "SELECT * FROM prueba";
        $query = mysqli_query($db, $sql);
        $result = mysqli_fetch_all($query, MYSQLI_NUM);

        echo json_encode($result);
        break;

    case "prueba_tarea":
        $sql = "SELECT * FROM prueba";
        $query = mysqli_query($db, $sql);
        $pruebas = mysqli_fetch_all($query, MYSQLI_NUM);

        $tareas;
        for ($i = 0; $i < count($pruebas); $i++) {
            $sql = "SELECT * FROM tarea WHERE idPrueba= '" . $pruebas[$i][0] . "'";
            $query = mysqli_query($db, $sql);
            $tareas[$i] = mysqli_fetch_all($query, MYSQLI_NUM);
        }

        $sql = "SELECT DISTINCT socketMBCPU FROM placabase";
        $query = mysqli_query($db, $sql);
        $socketMBCPU = mysqli_fetch_all($query, MYSQLI_NUM);
        $sql = "SELECT DISTINCT socketCPU FROM cpu";
        $query = mysqli_query($db, $sql);
        $socketCPU = mysqli_fetch_all($query, MYSQLI_NUM);

        $data = [
            "pruebas" => $pruebas,
            "tareas" => $tareas,
            "socketMBCPU" => $socketMBCPU,
            "socketCPU" => $socketCPU
        ];
        echo json_encode($data);
        break;

    case "compatibilidades":
        $tareas = $_GET["datos"][1];
        $piezasCompatibles = calcularPiezasCompatibles($db, $tareas, FALSE);

        echo json_encode($piezasCompatibles);
        break;

    case "estadisticas":
        // Estadisticas
        $sql = "SELECT userEstadistica, usuarioRegistrado, nomPrueba, "
            . "date_format(fecha, '%d/%m/%Y'), tiempo, puntuacion, idEstadistica, username "
            . "FROM estadistica INNER JOIN  prueba WHERE estadistica.idPrueba = "
            . "prueba.idPrueba";
        $query = mysqli_query($db, $sql);
        $estadisticas = mysqli_fetch_all($query, MYSQLI_NUM);

        // Pruebas (para el nombre)
        $sql = "SELECT nomPrueba FROM prueba";
        $query = mysqli_query($db, $sql);
        $pruebas = mysqli_fetch_all($query, MYSQLI_NUM);

        $data = [
            "estadisticas" => $estadisticas,
            "pruebas" => $pruebas
        ];

        echo json_encode($data);
        break;
}

// Funcion que calcula las piezas compatibles para cada tarea (o solo devuelve la cantidad)
function calcularPiezasCompatibles($db, $tareas, $nombres)
{
    $piezasCompatibles = array_fill(0, count($tareas), "");
    $cmps = [];
    for ($i = 0; $i < count($tareas); $i++) {
        // Si es de almacenamiento no se calculan piezas
        if ($tareas[$i][2] == "1") {
            if ($nombres == FALSE) {
                $piezasCompatibles[$i] = 0;
            }
            continue;
        }

        // Calcular piezas asociadas a la tarea
        $tipos = ["placabase", "cpu", "ventilador", "ram", "disco", "fuente", "gpu"];
        $id = ["idPlacaBase", "idCPU", "idVentilador", "idRAM", "idDisco", "idFuente", "idGPU"];

        $sql = "";
        if ($tareas[$i][4] == "BETWEEN") {
            $sql = "SELECT " . $id[$tareas[$i][8] - 1] . " FROM " . $tipos[$tareas[$i][8] - 1]
                . " WHERE " . $tareas[$i][3] . " " . $tareas[$i][4] . " '" . $tareas[$i][5]
                . "' AND '" . $tareas[$i][6] . "'";
        } else {
            $sql = "SELECT " . $id[$tareas[$i][8] - 1] . " FROM " . $tipos[$tareas[$i][8] - 1]
                . " WHERE " . $tareas[$i][3] . " " . $tareas[$i][4] . " '" . $tareas[$i][5] . "'";
        }
        $query = mysqli_query($db, $sql);
        $result = mysqli_fetch_all($query, MYSQLI_NUM);

        // Crear array doble tarea-pieza
        if ($nombres) {
            for ($j = 0; $j < count($result); $j++) {
                array_push($cmps, [$tareas[$i][0], $result[$j][0]]);
            }
        }
        else { // Dar unicamente el numero de piezas
            $piezasCompatibles[$i] = count($result);
        }
    }

    if ($nombres) return $cmps;
    else return $piezasCompatibles;
}

function setCookieSameSite(
    string $name, string $value,
    int $expire,bool $secure, string $samesite
): void {
    if (PHP_VERSION_ID < 70300) {
        setcookie($name, $value, $expire, "" . '; samesite=' . $samesite, "", $secure, false);
        return;
    }
    setcookie($name, $value, [
        'expires' => $expire,
        'path' => "",
        'domain' => "",
        'samesite' => $samesite,
        'secure' => $secure,
        'httponly' => false,
    ]);
}

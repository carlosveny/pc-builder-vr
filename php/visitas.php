<?php

// JSON Contador
if ($_POST["tipo"] == "contador") {
    $json_contador = json_decode(file_get_contents("../json/visitas_contador.json"));

    $json_contador = actualizarContador($json_contador);
    $json_contador[count($json_contador) - 1][1] += 1;

    file_put_contents("../json/visitas_contador.json", json_encode($json_contador));
    exit;
}


// Actualizar Contador (al abrir estadisticas.html)
if ($_POST["tipo"] == "actualizar") {

    $json_contador = json_decode(file_get_contents("../json/visitas_contador.json"));
    if ($_POST["commit"] == "true") {
        $json_contador = actualizarContador($json_contador);
    }

    file_put_contents("../json/visitas_contador.json", json_encode($json_contador));
    echo json_encode($json_contador);
    exit;
}


// JSON Mapa
$json_mapa = json_decode(file_get_contents("../json/visitas_mapa.json"));
$pais = $_POST["pais"];
// Generar array de paises
$paises = [];
for ($i = 0; $i < count($json_mapa); $i++) {
    array_push($paises, $json_mapa[$i][0]);
}

// Comprobar que el array existe
if (!in_array($pais, $paises)) {
    echo "pais_no_existe";
    return;
}

// Actualizar la entrada
$pos = array_search($pais, $paises);
$json_mapa[$pos][1] += 1;
file_put_contents("../json/visitas_mapa.json", json_encode($json_mapa));
exit;


// Funcion que actualiza el contador y crea entradas a 0 hasta el día actual
function actualizarContador($json_contador) {
    $ultimoDia = end($json_contador)[0];
    $diaActual = strtotime("today", time()) * 1000;
    if (gethostname() == "i5Carlos") {
        $diaActual = strtotime("today + 2 hours", time()) * 1000;
    }
    $milisDia = 24*60*60*1000;

    while ($ultimoDia != $diaActual) {
        $diaAux = $ultimoDia+$milisDia;
        array_push($json_contador, array($diaAux, 0));
        $ultimoDia = end($json_contador)[0];
    }
    return $json_contador;
}
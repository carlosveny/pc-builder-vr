<?php

// JSON Contador
if ($_POST["tipo"] == "contador") {
    $json_contador = json_decode(file_get_contents("../json/visitas_contador.json"));

    $ultimoDia = end($json_contador)[0];
    $diaActual = strtotime("today", time()) * 1000;

    if ($ultimoDia != $diaActual) { // No hay entrada para el dia actual
        // Crear entrada
        array_push($json_contador, array($diaActual, 1));
    } else { // Ya hay entrada para el dia actual
        $json_contador[count($json_contador) - 1][1] += 1;
    }
    file_put_contents("../json/visitas_contador.json", json_encode($json_contador));
    return;
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

/*
    Fichero que se encarga de gestionar todos los niveles
    (excepto el tutorial), creando el menu de la derecha y
    gestionando cuando se termina el nivel y mostrando los
    resultados.
*/
var nivelActualNombre; // Nombre del nivel actual (Tutorial)
var nivelActualID; // ID del nivel actual (prueba-0)
var tareas; // Array de tareas del nivel actual
var terminado = false; // Para la pantalla de fin de partida

function loadNivel() {
    peticionTareas(nivelActualID);

    // Crear menus y hacer peticiones
    crearMenuComponentes(); //menuComponentes.js
    crearComponenteCogido();
    crearCarteles();
    console.log(componentes);
}

// Funcion que crea el menu de las tareas (derecha)
function crearMenuTareas() {
    terminado = false;
    // Planos
    var plano1 = document.createElement("a-rounded");
    setAttributes(plano1, { id: "plano-tareas", position: "-2.3 0.8 -0.8", rotation: "0 90 0" });
    setAttributes(plano1, { width: "1.27", height: "1.12", radius: "0.04", color: "black", class: "raycastable" });
    var plano2 = document.createElement("a-rounded");
    setAttributes(plano2, { position: "0 0 0.002", width: "1.25", height: "1.1" });
    setAttributes(plano2, { radius: "0.04", color: "white" });

    // Titulo y tareas
    var tit = document.createElement("a-text");
    var texto = "Tareas - " + nivelActualNombre;
    setAttributes(tit, { position: "-0.56 0.49 0", scale: "0.28 0.28 0.28", value: texto });
    setAttributes(tit, { color: "black", });
    tit.setAttribute("font-open-sans", "");
    for (var i = 0; i < tareas["tareas"].length; i++) {
        var y = 0.38 - (i * 0.07);
        var tr = document.createElement("a-text");
        var texto = "#\t" + tareas["tareas"][i][1];
        setAttributes(tr, { position: "-0.55 " + y + " 0", scale: "0.27 0.27 0.27", value: texto });
        setAttributes(tr, { color: "black" });
        tr.setAttribute("wrap-count", "60");
        tr.setAttribute("font-open-sans", "");
        plano2.appendChild(tr);
    }

    // Botones
    var bt1 = document.createElement("a-rounded");
    setAttributes(bt1, { position: "-0.28 -0.45 0.01", width: "0.38", height: "0.1" });
    setAttributes(bt1, { radius: "0.04", color: "#caffc2", class: "raycastable", onclick: "avisoMenuTareas('fin')" });
    bt1.setAttribute("highlight-verde", "");
    bt1.setAttribute("hc-sound", "");
    var txtBt1 = document.createElement("a-text");
    setAttributes(txtBt1, { position: "0 0.01 0", scale: "0.2 0.2 0.2", align: "center", value: "Fin de la partida" });
    setAttributes(txtBt1, { color: "black" });
    txtBt1.setAttribute("font-open-sans", "");
    var bt2 = document.createElement("a-rounded");
    setAttributes(bt2, { position: "0.28 -0.45 0.01", width: "0.38", height: "0.1" });
    setAttributes(bt2, { radius: "0.04", color: "#ffdbdb", class: "raycastable", onclick: "avisoMenuTareas('salir')" });
    bt2.setAttribute("highlight-rojo", "");
    bt2.setAttribute("hc-sound", "");
    var txtBt2 = document.createElement("a-text");
    setAttributes(txtBt2, { position: "0 0.01 0", scale: "0.2 0.2 0.2", align: "center", value: "Salir sin guardar" });
    setAttributes(txtBt2, { color: "black" });
    txtBt2.setAttribute("font-open-sans", "");

    // Contador
    var contador = document.createElement("a-text");
    setAttributes(contador, { id: "contador", position: "0.42 0.485 0", scale: "0.25 0.25 0.25" });
    setAttributes(contador, { color: "#a61717", value: "00:00" });
    contador.setAttribute("font-open-sans", "");
    var time = 0;
    setInterval(() => {
        contador.setAttribute('value', formatSeconds(time));
        contador.setAttribute("title", time);
        time++;
    }, 1000);

    // Appends
    bt1.appendChild(txtBt1);
    bt2.appendChild(txtBt2);
    plano2.appendChild(bt1);
    plano2.appendChild(bt2);
    plano2.appendChild(tit);
    plano2.appendChild(contador);
    plano1.appendChild(plano2);
    document.getElementById("mesa-trabajo").appendChild(plano1);
}

// Funcion que crea un aviso de confirmacion en el menu de tareas
function avisoMenuTareas(tipo) {
    if (document.getElementById("aviso-tareas") != null) {
        document.getElementById("aviso-tareas").remove();
    }
    var click = "finPartida()";
    var descr = "Se va a finalizar la partida. ¿Estás seguro?";
    if (tipo == "salir") {
        click = "movePlayer(false, null)";
        descr = "Se va a salir sin guardar los cambios. ¿Estás seguro?";
    }
    // Planos
    var plano1 = document.createElement("a-rounded");
    setAttributes(plano1, { id: "aviso-tareas", position: "0 0 0.2" });
    setAttributes(plano1, { width: "0.56", height: "0.29", radius: "0.04", color: "black", class: "raycastable" });
    var plano2 = document.createElement("a-rounded");
    setAttributes(plano2, { position: "0 0 0.002", width: "0.55", height: "0.28" });
    setAttributes(plano2, { radius: "0.04", color: "#ffecd4" });

    // Titulo y descripcion
    var tit = document.createElement("a-text");
    setAttributes(tit, { position: "0 0.1 0", scale: "0.2 0.2 0.2", value: "Aviso" });
    setAttributes(tit, { color: "black", align: "center" });
    tit.setAttribute("font-open-sans", "");
    var descripcion = document.createElement("a-text");
    setAttributes(descripcion, { position: "0 0.02 0", width: "0.55", value: descr });
    setAttributes(descripcion, { color: "black", align: "center" });
    descripcion.setAttribute("wrap-count", "28");
    descripcion.setAttribute("font-open-sans", "");

    // Botones
    var bt1 = document.createElement("a-rounded");
    setAttributes(bt1, { position: "-0.13 -0.09 0.01", width: "0.13", height: "0.06" });
    setAttributes(bt1, { radius: "0.02", color: "#caffc2", class: "raycastable", onclick: click });
    bt1.setAttribute("highlight-verde", "");
    bt1.setAttribute("hc-sound", "");
    var txtBt1 = document.createElement("a-text");
    setAttributes(txtBt1, { position: "0 0.01 0", scale: "0.17 0.17 0.17", align: "center", value: "Sí" });
    setAttributes(txtBt1, { color: "black" });
    txtBt1.setAttribute("font-open-sans", "");
    var bt2 = document.createElement("a-rounded");
    setAttributes(bt2, { position: "0.13 -0.09 0.01", width: "0.13", height: "0.06" });
    setAttributes(bt2, { radius: "0.02", color: "#ffdbdb", class: "raycastable" });
    bt2.setAttribute("onclick", "document.getElementById('aviso-tareas').remove()");
    bt2.setAttribute("highlight-rojo", "");
    bt2.setAttribute("hc-sound", "");
    var txtBt2 = document.createElement("a-text");
    setAttributes(txtBt2, { position: "0 0.01 0", scale: "0.17 0.17 0.17", align: "center", value: "No" });
    setAttributes(txtBt2, { color: "black" });
    txtBt2.setAttribute("font-open-sans", "");

    // Appends
    bt1.appendChild(txtBt1);
    bt2.appendChild(txtBt2);
    plano2.appendChild(tit);
    plano2.appendChild(descripcion);
    plano2.appendChild(bt1);
    plano2.appendChild(bt2);
    plano1.appendChild(plano2);
    document.getElementById("plano-tareas").appendChild(plano1);
}

// Funcion que muestra los resultados de la partida y la guarda
function finPartida() {
    terminado = true;
    var tiempo = document.getElementById("contador").getAttribute("title");

    // Cambiar controllers/superHands
    editSuperHand(false, true); // eliminar superHand derecha
    editController(true, true); // crear controller derecho

    // Eliminar todos los displays
    document.getElementById("plano-tareas").remove();
    document.getElementById("plano-oficina").remove();
    if (document.getElementById("plano-instrucciones") != null) {
        document.getElementById("plano-instrucciones").remove();
    }
    document.getElementById("plano-cmp-cogido").remove();
    document.getElementById("cartel-aparicion").remove();
    document.getElementById("cartel-recolocacion").remove();

    // Crear plano fin partida
    var plano = crearPlanoTexto(2.5, 1.6, "-0.25 1 1.2", "0 180 0", "plano-fin", "1 3");
    plano.setAttribute("fin-sound", "");
    // Titulo
    var tit = document.createElement("a-text");
    setAttributes(tit, { position: "0 0.7 0.03", scale: "0.45 0.45 0.45", color: "black" });
    setAttributes(tit, { align: "center", value: "Fin de Partida" });
    tit.setAttribute("font-open-sans", "");
    // Nivel y tiempo
    var niv1 = document.createElement("a-text");
    setAttributes(niv1, { position: "-1.15 0.68 0.03", scale: "0.35 0.35 0.35", color: "black" });
    setAttributes(niv1, { align: "left", value: "Nivel:" });
    niv1.setAttribute("font-open-sans", "");
    var niv2 = document.createElement("a-text");
    var nivTxt = nivelActualNombre;
    if (nivTxt.length > 12) nivTxt = nivTxt.slice(0, 12) + "..."
    setAttributes(niv2, { position: "0.65 -0.01 0", scale: "0.95 0.95 0.95", color: "blue" });
    setAttributes(niv2, { align: "left", value: nivTxt });
    niv2.setAttribute("font-open-sans", "");
    niv1.appendChild(niv2);
    var tiem1 = document.createElement("a-text");
    setAttributes(tiem1, { position: "0.66 0.68 0.03", scale: "0.35 0.35 0.35", color: "black" });
    setAttributes(tiem1, { align: "left", value: "Tiempo:" });
    tiem1.setAttribute("font-open-sans", "");
    var tiem2 = document.createElement("a-text");
    setAttributes(tiem2, { position: "0.9 -0.01 0", scale: "0.95 0.95 0.95", color: "blue" });
    setAttributes(tiem2, { align: "left", value: formatSeconds(tiempo) });
    tiem2.setAttribute("font-open-sans", "");
    tiem1.appendChild(tiem2);
    // Tareas
    var titTareas = document.createElement("a-text");
    setAttributes(titTareas, { position: "-0.6 0.45 0.03", scale: "0.25 0.25 0.25", color: "black" });
    setAttributes(titTareas, { align: "center", value: "Tareas" });
    titTareas.setAttribute("font-open-sans", "");
    var memorias = getMemoriasColocada();
    var estadoTareas = comprobarTareasRealizadas(memorias);
    for (var i = 0; i < estadoTareas.length; i++) {
        var y = 0.34 - (i * 0.1);
        var tr = document.createElement("a-text");
        console.log(tareas);
        var text = "#\t" + tareas["tareas"][i][1];
        if (tareas["tareas"][i][2] == "1") text += " (Montada: " + memorias[i] + " GB)"
        setAttributes(tr, { position: "-1.15 " + y + " 0.03", scale: "0.2 0.2 0.2", value: text });
        if (estadoTareas[i] == true) tr.setAttribute("color", "green");
        else tr.setAttribute("color", "red");
        tr.setAttribute("font-open-sans", "");
        tr.setAttribute("width", "6");
        tr.setAttribute("wrap-count", "50");
        plano.appendChild(tr);
    }
    // Linea divisoria
    var linea = document.createElement("a-plane");
    setAttributes(linea, { position: "0 0.02 0.03", width: "0.005", height: "1", color: "black" });
    // Colocacion de componentes
    var titColocacion = document.createElement("a-text");
    setAttributes(titColocacion, { position: "0.6 0.45 0.03", scale: "0.25 0.25 0.25", color: "black" });
    setAttributes(titColocacion, { align: "center", value: "Colocación de componentes" });
    titColocacion.setAttribute("font-open-sans", "");
    var cmps = comprobarComponentesColocados();
    var nombres = ["Placa Base", "CPU", "Ventilador", "RAM", "Disco", "Fuente", "GPU"];
    for (var i = 0; i < cmps.length; i++) {
        var x = 0.4;
        if (i > 3) x = 0.8;
        var y = 0.34 - (i % 4 * 0.1);
        var cmp = document.createElement("a-text");
        setAttributes(cmp, { position: x + " " + y + " 0.03", scale: "0.2 0.2 0.2" });
        setAttributes(cmp, { value: nombres[i], align: "center" });
        if (cmps[i] == true) cmp.setAttribute("color", "green");
        else cmp.setAttribute("color", "red");
        cmp.setAttribute("font-open-sans", "");
        plano.appendChild(cmp);
    }
    // Compatibilidad tecnica
    var titCompatibilidad = document.createElement("a-text");
    setAttributes(titCompatibilidad, { position: "0.6 -0.15 0.03", scale: "0.25 0.25 0.25", color: "black" });
    setAttributes(titCompatibilidad, { align: "center", value: "Compatibilidad técnica" });
    titCompatibilidad.setAttribute("font-open-sans", "");
    var compatibilidad = [false, false];
    var sckActual = getSockets();
    var socket = document.createElement("a-text");
    setAttributes(socket, { position: "0.1 -0.27 0.03", scale: "0.3 0.3 0.3" });
    if (sckActual[0] != null && sckActual[0] == sckActual[1]) {
        compatibilidad[0] = true;
        socket.setAttribute("color", "green");
    }
    else {
        socket.setAttribute("color", "red");
    }
    var valor = "Socket:\t\t Placa Base (" + sckActual[0] + ") - CPU (" + sckActual[1] + ")";
    setAttributes(socket, { align: "left", value: valor });
    socket.setAttribute("font-open-sans", "");
    socket.setAttribute("wrap-count", "60");
    var consumoActual = getConsumos();
    var consumo = document.createElement("a-text");
    if (consumoActual[0] != 0 && consumoActual[1] != 0 && consumoActual[0] <= consumoActual[1]) {
        compatibilidad[1] = true;
        consumo.setAttribute("color", "green");
    }
    else {
        consumo.setAttribute("color", "red");
    }
    setAttributes(consumo, { position: "0.1 -0.37 0.03", scale: "0.2 0.2 0.2" });
    valor = "Consumo:\tMáximo (" + consumoActual[0] + " W) - Fuente (" + consumoActual[1] + " W)";
    setAttributes(consumo, { align: "left", value: valor });
    consumo.setAttribute("font-open-sans", "");
    // Puntuacion total
    var titPunt = document.createElement("a-text");
    setAttributes(titPunt, { position: "-1.1 -0.63 0.03", scale: "0.4 0.4 0.4", color: "black" });
    setAttributes(titPunt, { align: "left", value: "Puntuación total:" });
    titPunt.setAttribute("font-open-sans", "");
    var puntuacionTxt = document.createElement("a-text");
    var nota = calcularPuntuacionFinal(estadoTareas, cmps, compatibilidad, tiempo);
    setAttributes(puntuacionTxt, { position: "1.8 -0.05 0", align: "left", value: nota });
    if (nota < 5) puntuacionTxt.setAttribute("color", "red");
    else if (nota < 7) puntuacionTxt.setAttribute("color", "yellow");
    else puntuacionTxt.setAttribute("color", "green");
    titPunt.appendChild(puntuacionTxt);
    // Boton menu principal
    var bt = document.createElement("a-rounded");
    setAttributes(bt, { position: "0.86 -0.64 0.03", width: "0.47", height: "0.13" });
    setAttributes(bt, { radius: "0.03", color: "#caffc2", class: "raycastable", onclick: "movePlayer(false, null)" });
    bt.setAttribute("highlight-verde", "");
    bt.setAttribute("hc-sound", "");
    var txtBt = document.createElement("a-text");
    setAttributes(txtBt, { position: "0 0.01 0", scale: "0.25 0.25 0.25", align: "center", value: "Menú principal" });
    setAttributes(txtBt, { color: "black" });
    txtBt.setAttribute("font-open-sans", "");
    bt.appendChild(txtBt);

    // Appends
    plano.appendChild(tit);
    plano.appendChild(niv1);
    plano.appendChild(tiem1);
    plano.appendChild(titTareas);
    plano.appendChild(linea);
    plano.appendChild(titColocacion);
    plano.appendChild(titCompatibilidad);
    plano.appendChild(socket);
    plano.appendChild(consumo);
    plano.appendChild(titPunt);
    plano.appendChild(bt);
    document.getElementById("mesa-trabajo").appendChild(plano);

    // Si es el tutorial, mostrar explicacion
    if (nivelActualID == "prueba-0") mostrarExplicacionFinPartida();

    // Guardar la estadistica de la partida
    var user = null;
    var usuarioRegistrado = 1;
    var username = actualUsername;
    if (actualUsername == "") {
        user = userInvitado;
        usuarioRegistrado = 0;
        username = null;
    }
    var datos = [tiempo, nota, usuarioRegistrado, user, username, nivelActualID];
    peticionInsertarEstadistica(datos);
}

// Funcion que devuelve un array booleano con las tareas realizadas
function comprobarTareasRealizadas(memorias) {
    var estadoTareas = Array.apply(false, Array(tareas["tareas"].length)).map(function () { });
    var colocados = getCmpsColocadosID();
    var memoriaColocada = getArrayMemoriaColocada(); // ram y discos colocados

    for (var i = 0; i < tareas["tareas"].length; i++) {
        // Gestionar las 3 tareas iniciales de almacenamiento
        if (tareas["tareas"][i][2] == "1") {
            if (memorias[i] >= tareas["tareas"][i][5]) estadoTareas[i] = true;
            continue;
        }

        var piezasCompatibles = getPiezasCompatiblesTarea(tareas["tareas"][i][0]);
        // La tarea es de RAM
        if (tareas["tareas"][i][8] == 4) {
            var hayError = false;
            for (var j = 0; j < memoriaColocada[0].length; j++) {
                if (piezasCompatibles.indexOf(memoriaColocada[0][j]) == -1) {
                    hayError = true;
                    break;
                }
            }
            if (!hayError && memoriaColocada[0].length > 0) estadoTareas[i] = true;
        }
        // La tarea es de discos
        else if (tareas["tareas"][i][8] == 5) {
            var hayError = false;
            for (var j = 0; j < memoriaColocada[1].length; j++) {
                if (piezasCompatibles.indexOf(memoriaColocada[1][j]) == -1) {
                    hayError = true;
                    break;
                }
            }
            if (!hayError && memoriaColocada[1].length > 0) estadoTareas[i] = true;
        }
        // La tarea NO es de RAM ni de discos
        else {
            for (var j = 0; j < colocados.length; j++) {
                if (piezasCompatibles.indexOf(colocados[j]) != -1) {
                    estadoTareas[i] = true;
                    break;
                }
            }
        }
    }
    return estadoTareas;
}

// Funcion que calcula la puntuacion final segun los errores cometidos
function calcularPuntuacionFinal(tar, cmps, compatibilidad, tiempo) {
    var errTareas = getAllIndexes(tar, false).length;
    var errColoc = getAllIndexes(cmps, false).length;
    var errCompat = getAllIndexes(compatibilidad, false).length;

    // Calcular puntuacion
    var puntuacion = 10;
    if (errColoc > 0) puntuacion = 5;
    puntuacion = puntuacion - (errTareas * 0.5) - (errColoc * 1) - (errCompat * 1);

    // Aplicar porcentaje tiempo (2-15 minutos)
    var descMaximo = 5; // El tiempo solo puede restar maximo 5 puntos
    var min = 2; // 2 minutos
    var max = 15; // 15 minutos
    var minimo = min * 60;
    var maximo = (max - min) * 60;
    if (tiempo > max * 60) tiempo = max * 60;
    if (tiempo < min * 60) tiempo = min * 60;
    var restaTiempo = ((tiempo - minimo) * descMaximo / maximo);

    puntuacion = puntuacion - restaTiempo;
    if (puntuacion < 0) puntuacion = 0;

    return (Math.round(puntuacion * 100) / 100).toFixed(2);
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES POST Y GET

// Funcion que solicita a la BD las tareas de la prueba
function peticionTareas(nomPrueba) {
    $.get("php/consult.php", {
        tabla: "tarea",
        prueba: nomPrueba
    })
        .done(function (data) {
            // Error con la conexion de la BD
            if (data == "errorBD") {
                var descr = "Imposible obtener los componentes por un error ";
                descr += "con la base de datos. Estamos trabajando para solventarlo.";
                alert(descr);
            }
            // Peticion correcta
            else {
                tareas = JSON.parse(data);
                console.log(tareas["tareas_cmps"]);
                crearMenuTareas();
            }
        });
}

// Funcion que envia a la BD una peticion de añadir una estadistica
function peticionInsertarEstadistica(datos) {
    $.post("php/insert.php", {
        tabla: "estadistica",
        datos: datos
    })
        .done(function (data) {
            // Error con la conexion de la BD
            if (data == "errorBD") {
                var descr = "Imposible guardar las estadisticas por un error ";
                descr += "con la base de datos. Estamos trabajando para solventarlo.";
                alert(descr);
            }
            else {
                estadisticas = JSON.parse(data); // actualizar variable
            }
        });
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES AUXILIARES

// Funcion que convierte segundos a minutos:segundos
function formatSeconds(time) {
    var minutes = ("0" + Math.floor(time / 60)).slice(-2);
    var seconds = ('0' + Math.floor(time % 60)).slice(-2);
    return minutes + ':' + seconds;
}

// Funcion que devuelve todos los indices de las ocurrencias de un array (indexOf en bucle)
// https://stackoverflow.com/questions/20798477/how-to-find-index-of-all-occurrences-of-element-in-array
function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

// Funcion que devuelve todas las piezas compatibles dada una tarea
function getPiezasCompatiblesTarea(idTarea) {
    var piezasCompatibles = [];
    for (var l = 0; l<tareas["tareas_cmps"].length; l++) {
        if (tareas["tareas_cmps"][l][0] == idTarea) {
            piezasCompatibles.push(tareas["tareas_cmps"][l][1]);
        }
    }
    return piezasCompatibles;
}
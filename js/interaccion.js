/*
    Fichero para gestionar las interacciones entre las manos, los objetos,
    las zonas de colocacion (drop zone) y los componentes colocados.
*/

// VARIABLES GLOBALES
var actualDropZone;
var emptyDropZones = [true, true]; //true: empty, false: full. 0-9: Placa Base, Fuente
var emptyDropZonesCPU = []; //si hay placa base. 10-19
var emptyDropZonesGPU = []; //si hay placa base. 20-29
var emptyDropZonesRAM = []; //si hay placa base. 30-39
var emptyDropZonesHDD = []; //si hay placa base. 40-49
var emptyDropZonesSSD = []; //si hay placa base. 50-59
var emptyDropZonesVentilador = []; //si hay CPU. 60-69
var posPlacaBase; //guarda la posicion de la placa base una vez colocada
var heightPlacaBase; //guarda la altura de la placa base una vez colocada
var posCPU; //guarda la posicion de la CPU una vez colocada
var cogiendo = false;

// Funcion que se ejecuta cuando se coge un componente
function cogido(event, cmpInfo) {
    if (cogiendo || terminado) return;
    if (event.target.getAttribute("title") != null) return;
    cogiendo = true;

    var cmp = event.target;
    console.log("cogido " + cmp.getAttribute("id"));
    console.log(actualDropZone);

    // Crear tarjeta "Componente actual"
    var tipo = cmpInfo[0].replace("cmp-", "");
    tipo = tipo.substring(0, tipo.indexOf("-"));
    borrarDisplay("display-cmp-actual");
    gestionCargarListado(0, tipo, cmpInfo);

    crearDropZones();

    // Para el tutorial
    if (instrucciones != null) {
        if (instrucciones[instIdx]["id"] == "agarrar" && cmp["id"].includes("placabase")) {
            cargarInstruccion(6);
        }
    }
}

// Funcion que se ejecuta cuando se suelta un componente
function soltado(event, cmpInfo) {
    if (event.target.getAttribute("title") != null) return;
    cogiendo = false;

    borrarDisplay("display-cmp-actual");
    if (actualDropZone != null) {
        console.log("Soltado en " + actualDropZone.getAttribute("id"));
    }
    else console.log("Soltado en undefined");
    var cmp = event.target;
    if (actualDropZone != null) { // Soltado en una drop zone
        document.querySelector("#snap-sound").play();
        // Si es una placa base crear nuevas drop zones
        if (cmp.getAttribute("id").includes("placabase")) {
            // Actualizar variable global
            var p = actualDropZone.getAttribute("position");
            posPlacaBase = new THREE.Vector3(p.x, p.y, p.z);
            heightPlacaBase = cmpInfo[4];

            generarDropZonesPlacaBase(cmpInfo);
        }
        // Si es una CPU crear nueva drop zone (ventilador)
        if (cmp.getAttribute("id").includes("cpu")) {
            // Actualizar variable global
            var p = actualDropZone.getAttribute("position");
            posCPU = new THREE.Vector3(p.x, p.y, p.z);

            emptyDropZonesVentilador.push(true);
        }

        // Marcar drop zone como llena
        var index = parseInt(actualDropZone.getAttribute("id").replace("drop-zone-", ""));
        marcarDropZone(index, false);

        // Asignar al componente la drop zone (porque despues se elimina)
        // Usar esto para saber donde esta cada componente
        cmp.setAttribute("title", index);

        // Colocar el componente en la drop zone y hacerlo estatico
        var shape = cmp.getAttribute("dynamic-body").shape;
        cmp.removeAttribute("dynamic-body");
        cmp.setAttribute("static-body", "shape: " + shape);
        var p = actualDropZone.getAttribute("position");
        var pos = new THREE.Vector3(p.x, p.y, p.z);
        if (cmpInfo[9] == "5" && cmpInfo[11] == "HDD") pos.y += 0.04;
        if (cmpInfo[9] == "6") pos.y += 0.04;
        cmp.setAttribute("position", pos);
        cmp.setAttribute("rotation", "0 180 0");

        // Para el tutorial
        tutorialCmpColocado(cmp); // tutorial.js
    }
    eliminarDropZones();
}

// Funcion que crea las drop zones en el ordenador
function crearDropZones() {
    var positions = ["0.06 -0.01 -0.07", "0.16 -0.01 0.17"]; // Posiciones ajenas a la placa base
    var positionsHDD = ["-0.22 -0.01 -0.2", "-0.22 -0.01 -0.15", "-0.22 -0.01 -0.1", "-0.22 -0.01 -0.05",
        "-0.22 -0.01 0", "-0.22 -0.01 0.05", "-0.22 -0.01 0.1", "-0.22 -0.01 0.15"];
    var positionsCPU = [];
    var positionsGPU = [];
    var positionsRAM = [];
    var positionsSSD = [];
    var positionsVentilador = [];
    // Generar posiciones basadas en la placa base
    if (posPlacaBase != null) { // Hay placa base ya colocada
        var p1 = new THREE.Vector3(posPlacaBase.x + 0.04, (heightPlacaBase / 2) + 0.01, posPlacaBase.z + 0.04);
        positionsCPU = [p1];
        p1 = new THREE.Vector3(posPlacaBase.x + 0.015, (heightPlacaBase / 2) + 0.02, posPlacaBase.z - 0.105);
        positionsGPU = [p1];
        p1 = new THREE.Vector3(posPlacaBase.x - 0.04, (heightPlacaBase / 2) + 0.01, posPlacaBase.z + 0.06);
        p2 = new THREE.Vector3(posPlacaBase.x - 0.06, (heightPlacaBase / 2) + 0.01, posPlacaBase.z + 0.06);
        p3 = new THREE.Vector3(posPlacaBase.x - 0.08, (heightPlacaBase / 2) + 0.01, posPlacaBase.z + 0.06);
        p4 = new THREE.Vector3(posPlacaBase.x - 0.1, (heightPlacaBase / 2) + 0.01, posPlacaBase.z + 0.06);
        positionsRAM = [p1, p2, p3, p4];
        p1 = new THREE.Vector3(posPlacaBase.x + 0.06, (heightPlacaBase / 2) + 0.01, posPlacaBase.z - 0.05);
        p2 = new THREE.Vector3(posPlacaBase.x + 0.06, (heightPlacaBase / 2) + 0.01, posPlacaBase.z - 0.07);
        p3 = new THREE.Vector3(posPlacaBase.x - 0.06, (heightPlacaBase / 2) + 0.01, posPlacaBase.z - 0.05);
        p4 = new THREE.Vector3(posPlacaBase.x - 0.06, (heightPlacaBase / 2) + 0.01, posPlacaBase.z - 0.07);
        positionsSSD = [p1, p2, p3, p4];
    }
    // Generar posiciones basadas en la CPU
    if (posCPU != null) { // Hay CPU ya colocada
        var p1 = new THREE.Vector3(posCPU.x, posCPU.y + 0.03, posCPU.z);
        positionsVentilador = [p1];
    }

    // Bucles de creacion de drop zones
    for (var i = 0; i < positions.length; i++) {
        if (emptyDropZones[i] == true) { // Si esta vacia
            var dz = document.createElement("a-box");
            setAttributes(dz, { id: "drop-zone-" + i, class: "colisionable", position: positions[i], width: "0.07" });
            setAttributes(dz, { height: "0.02", depth: "0.07", color: "red", opacity: "0.3" });
            document.getElementById("drop-zones").appendChild(dz);
        }
    }
    // Drop zones CPU
    if (emptyDropZonesCPU[0] == true) {
        var dz = document.createElement("a-box");
        setAttributes(dz, { id: "drop-zone-10", class: "colisionable", position: positionsCPU[0], width: "0.05" });
        setAttributes(dz, { height: "0.02", depth: "0.05", color: "orange", opacity: "0.3" });
        document.getElementById("drop-zones").appendChild(dz);
    }
    // Drop zones GPU
    if (emptyDropZonesGPU[0] == true) {
        var dz = document.createElement("a-box");
        setAttributes(dz, { id: "drop-zone-20", class: "colisionable", position: positionsGPU[0], width: "0.1" });
        setAttributes(dz, { height: "0.02", depth: "0.025", color: "orange", opacity: "0.3" });
        document.getElementById("drop-zones").appendChild(dz);
    }
    // Drop zones RAM
    for (var i = 0; i < positionsRAM.length; i++) {
        if (emptyDropZonesRAM[i] == true) {
            var dz = document.createElement("a-box");
            setAttributes(dz, { id: "drop-zone-3" + i, class: "colisionable", position: positionsRAM[i], width: "0.01" });
            setAttributes(dz, { height: "0.02", depth: "0.1", color: "orange", opacity: "0.3" });
            document.getElementById("drop-zones").appendChild(dz);
        }
    }
    // Drop zones HDD
    for (var i = 0; i < positionsHDD.length; i++) {
        if (emptyDropZonesHDD[i] == true) { // Si esta vacia
            var dz = document.createElement("a-box");
            setAttributes(dz, { id: "drop-zone-4" + i, class: "colisionable", position: positionsHDD[i], width: "0.1" });
            setAttributes(dz, { height: "0.02", depth: "0.02", color: "orange", opacity: "0.3" });
            document.getElementById("drop-zones").appendChild(dz);
        }
    }
    // Drop zones SSD
    for (var i = 0; i < positionsSSD.length; i++) {
        if (emptyDropZonesSSD[i] == true) {
            var dz = document.createElement("a-box");
            setAttributes(dz, { id: "drop-zone-5" + i, class: "colisionable", position: positionsSSD[i], width: "0.07" });
            setAttributes(dz, { height: "0.02", depth: "0.01", color: "orange", opacity: "0.3" });
            document.getElementById("drop-zones").appendChild(dz);
        }
    }
    // Drop zones Ventilador
    if (emptyDropZonesVentilador[0] == true) {
        var dz = document.createElement("a-box");
        setAttributes(dz, { id: "drop-zone-60", class: "colisionable", position: positionsVentilador[0], width: "0.03" });
        setAttributes(dz, { height: "0.02", depth: "0.03", color: "green", opacity: "0.3" });
        document.getElementById("drop-zones").appendChild(dz);
    }
}

// Funcion que elimina las drop zones del ordenador
function eliminarDropZones() {
    const myNode = document.getElementById("drop-zones");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
    actualDropZone = null;
}

// Funcion que desmarca (opacidad: 0.3) todas las drop zones
function desmarcarDropZones() {
    var container = document.getElementById("drop-zones");
    for (var i = 0; i < container.childElementCount; i++) {
        container.children[i].setAttribute("opacity", "0.3");
    }
    actualDropZone = null;
}

// Funcion que el array de la drop zone como libre/ocupada
function marcarDropZone(index, empty) {
    if (index < 10) emptyDropZones[index] = empty;
    else if ((index > 9) && (index < 20)) emptyDropZonesCPU[index % 10] = empty;
    else if ((index > 19) && (index < 30)) emptyDropZonesGPU[index % 10] = empty;
    else if ((index > 29) && (index < 40)) emptyDropZonesRAM[index % 10] = empty;
    else if ((index > 39) && (index < 50)) emptyDropZonesHDD[index % 10] = empty;
    else if ((index > 49) && (index < 60)) emptyDropZonesSSD[index % 10] = empty;
    else if ((index > 59) && (index < 70)) emptyDropZonesVentilador[index % 10] = empty;
}

// Funcion que coloca el componente en la mesa y lo hace dinamico
function colocarComponenteMesa(cmp) {
    // Posicion pseudoaleatoria
    var x = getRandomArbitrary(-1.05, -0.5);
    var z = getRandomArbitrary(-0.2, 0.2);
    var pos = new THREE.Vector3(x, 0.5, z);
    cmp.setAttribute("position", pos);
    // var shape = "box"
    // if (cmp.getAttribute("static-body") != null) {
    //     shape = cmp.getAttribute("static-body").shape;
    // }
    cmp.removeAttribute("static-body");
    cmp.setAttribute("dynamic-body", "shape: box");
}

function resetDropZones() {
    emptyDropZones = [true, true];
    emptyDropZonesCPU = [];
    emptyDropZonesGPU = [];
    emptyDropZonesRAM = [];
    emptyDropZonesHDD = [];
    emptyDropZonesSSD = [];
    emptyDropZonesVentilador = [];
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES REFERENTES A LAS PLACAS BASES

// Funcion que genera las drop zones referentes a la placa base
function generarDropZonesPlacaBase(cmpInfo) {
    //console.log("cmpInfo");
    //console.log(cmpInfo);
    emptyDropZonesCPU.push(true);
    emptyDropZonesGPU.push(true);
    for (var i = 0; i < parseInt(cmpInfo[13]); i++) {
        emptyDropZonesRAM.push(true);
    }
    for (var i = 0; i < parseInt(cmpInfo[14]); i++) {
        emptyDropZonesHDD.push(true);
    }
    for (var i = 0; i < parseInt(cmpInfo[15]); i++) {
        emptyDropZonesSSD.push(true);
    }
    // console.log(emptyDropZonesCPU.length);
    // console.log(emptyDropZonesRAM.length);
    // console.log(emptyDropZonesHDD.length);
    // console.log(emptyDropZonesSSD.length);
}

// Funcion que elimina las drop zones referentes a la placa base (cuando esta se quita)
function eliminarDropZonesPlacaBase() {
    emptyDropZonesCPU = [];
    emptyDropZonesGPU = [];
    emptyDropZonesRAM = [];
    emptyDropZonesHDD = [];
    emptyDropZonesSSD = [];
    posPlacaBase = null;
    heightPlacaBase = null;
    // Tambien quitar la cpu y sus derivados
    emptyDropZonesVentilador = [];
    posCPU = null;
}

// Funcion que quita los componentes de la placa base cuando se quita la placa base
function desasignarComponentesPlacaBase() {
    var cmps = document.getElementById("componentes").children;
    for (var i = 0; i < cmps.length; i++) {
        // Si el componente esta colocado
        if (cmps[i].getAttribute("title") != null) {
            var numDz = parseInt(cmps[i].getAttribute("title").replace("drop-zone-"));
            // Revisar que este colocado en una drop zone relativa de la placa base
            if ((numDz > 9) && (numDz < 70)) {
                // Desasignar la drop zone del componente
                cmps[i].removeAttribute("title");

                // Hacerlo dinamico para que se mueva y colocarlo en la mesa
                colocarComponenteMesa(cmps[i]);
            }
        }
    }
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES REFERENTES A LAS CPU

// Funcion que quita los componentes de la CPU cuando se quita la CPU
function desasignarComponentesCPU() {
    var cmps = document.getElementById("componentes").children;
    for (var i = 0; i < cmps.length; i++) {
        // Si el componente esta colocado
        if (cmps[i].getAttribute("title") != null) {
            var numDz = parseInt(cmps[i].getAttribute("title").replace("drop-zone-"));
            // Revisar que este colocado en una drop zone relativa de la CPU
            if ((numDz > 59) && (numDz < 70)) {
                // Desasignar la drop zone del componente
                cmps[i].removeAttribute("title");

                // Hacerlo dinamico para que se mueva y colocarlo en la mesa
                colocarComponenteMesa(cmps[i]);
            }
        }
    }
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES PARA OBTENER INFORMACION DE LOS COMPONENTES COLOCADOS

// Funcion que devuelve todos los componentes que hay colocados
function getCmpsColocados() {
    var colocados = [];
    var todos = document.getElementById("componentes").children;
    for (var i = 0; i < todos.length; i++) {
        // Si tiene drop-zone asignada, añadirlo a colocados
        if (todos[i].getAttribute("title") != null) {
            colocados.push(todos[i]);
        }
    }
    return colocados;
}

// Funcion que devuelve el ID de todos los componentes que hay colocados
function getCmpsColocadosID() {
    var colocados = [];
    var todos = document.getElementById("componentes").children;
    for (var i = 0; i < todos.length; i++) {
        // Si tiene drop-zone asignada, añadirlo a colocados
        if (todos[i].getAttribute("title") != null) {
            var id = todos[i].getAttribute("id");
            while (id.includes("X")) id = id.replace("X", "");
            colocados.push(id);
        }
    }
    return colocados;
}

// Funcion que devuelve todo un elemento componente a partir de un id
function getCmpFromID(id) {
    var tipo = id.replace("cmp-", "").split("-")[0];
    while (id.includes("X")) id = id.replace("X", "");
    // Recorrer todos los componentes de ese tipo
    for (var i = 0; i < componentes[tipo].length; i++) {
        if (componentes[tipo][i][0] == id) {
            return componentes[tipo][i];
        }
    }
    return null;
}

// Funcion que devuelve el componente que esta en una determinada drop zone
function getCmpDropZone(idDropZone) {
    var cmps = document.getElementById("componentes").children;
    for (var i = 0; i < cmps.length; i++) {
        if (cmps[i].getAttribute("title") == idDropZone.toString()) {
            return cmps[i];
        }
    }
    return null;
}

// Funcion que devuelve un multi-array indicando si los cmp estan bien colocados
function comprobarComponentesColocados() {
    // Orden: Placa Base, CPU, Ventilador, RAM, Disco, Fuente, GPU
    var componentes = [false, false, false, false, false, false, false];
    // Placa Base
    var cmp = getCmpDropZone(0);
    if (cmp != null && cmp.getAttribute("id").includes("placabase")) {
        componentes[0] = true;
    }
    // CPU
    cmp = getCmpDropZone(10);
    if (cmp != null && cmp.getAttribute("id").includes("cpu")) {
        componentes[1] = true;
    }
    // Ventilador
    cmp = getCmpDropZone(60);
    if (cmp != null && cmp.getAttribute("id").includes("ventilador")) {
        componentes[2] = true;
    }
    // RAM
    var rams = getAllIndexes(emptyDropZonesRAM, false);
    var unaBien = false;
    var i;
    for (i = 0; i < rams.length - 1; i++) {
        cmp = getCmpDropZone(rams[i] + 30);
        if (cmp != null && !cmp.getAttribute("id").includes("ram")) {
            unaBien = false;
            break;
        }
        else if (cmp != null && cmp.getAttribute("id").includes("ram")) {
            unaBien = true;
        }
    }
    // Es la ultima RAM por revisar (las demas estan bien colocadas o son null)
    if (i == rams.length - 1) {
        cmp = getCmpDropZone(rams[i] + 30);
        if (unaBien && cmp == null) {
            componentes[3] = true;
        }
        else if (unaBien && cmp != null && cmp.getAttribute("id").includes("ram")) {
            componentes[3] = true;
        }
        else if (cmp != null && cmp.getAttribute("id").includes("ram")) {
            componentes[3] = true;
        }
    }
    // Disco (HDD)
    var hdds = getAllIndexes(emptyDropZonesHDD, false);
    var unaBien = false;
    var todoNullHDD = true;
    var HDD = false;
    var i;
    for (i = 0; i < hdds.length - 1; i++) {
        cmp = getCmpDropZone(hdds[i] + 40);
        var c = null;
        if (cmp != null) c = getCmpFromID(cmp.getAttribute("id"));
        if (cmp != null && (!cmp.getAttribute("id").includes("disco") || c[11] != "HDD")) {
            unaBien = false;
            todoNullHDD = false;
            break;
        }
        else if (cmp != null && cmp.getAttribute("id").includes("disco") && c[11] == "HDD") {
            unaBien = true;
            todoNullHDD = false;
        }
    }
    // Es el ultimo HDD por revisar (los demas estan bien colocados o son null)
    if (i == hdds.length - 1) {
        cmp = getCmpDropZone(hdds[i] + 40);
        var c = null;
        if (cmp != null) c = getCmpFromID(cmp.getAttribute("id"));
        if (unaBien && cmp == null) {
            HDD = true;
            todoNullHDD = false;
        }
        else if (unaBien && cmp != null && cmp.getAttribute("id").includes("disco") && c[11] == "HDD") {
            HDD = true;
            todoNullHDD = false;
        }
        else if (cmp != null && cmp.getAttribute("id").includes("disco") && c[11] == "HDD") {
            HDD = true;
            todoNullHDD = false;
        }
    }
    // Disco (SSD)
    var ssds = getAllIndexes(emptyDropZonesSSD, false);
    unaBien = false;
    var todoNullSSD = true;
    var SSD = false;
    var i;
    for (i = 0; i < ssds.length - 1; i++) {
        cmp = getCmpDropZone(ssds[i] + 50);
        var c = null;
        if (cmp != null) c = getCmpFromID(cmp.getAttribute("id"));
        if (cmp != null && (!cmp.getAttribute("id").includes("disco") || c[11] != "SSD")) {
            unaBien = false;
            todoNullSSD = false;
            break;
        }
        else if (cmp != null && cmp.getAttribute("id").includes("disco") && c[11] == "SSD") {
            unaBien = true;
            todoNullSSD = false;
        }
    }
    if (i == (ssds.length - 1) && (componentes[4] || (!componentes[4] && todoNullHDD))) {
        cmp = getCmpDropZone(ssds[i] + 50);
        var c = null;
        if (cmp != null) c = getCmpFromID(cmp.getAttribute("id"));
        if (unaBien && cmp == null) {
            SSD = true;
            todoNullSSD = false;
        }
        else if (unaBien && cmp != null && cmp.getAttribute("id").includes("disco") && c[11] == "SSD") {
            SSD = true;
            todoNullSSD = false;
        }
        else if (cmp != null && cmp.getAttribute("id").includes("disco") && c[11] == "SSD") {
            SSD = true;
            todoNullSSD = false;
        }
    }
    // Conclusiones HDD y SSD
    if (HDD && SSD) componentes[4] = true;
    else if (HDD && !SSD && todoNullSSD) componentes[4] = true;
    else if (SSD && !HDD && todoNullHDD) componentes[4] = true;
    // Fuente
    cmp = getCmpDropZone(1);
    if (cmp != null && cmp.getAttribute("id").includes("fuente")) {
        componentes[5] = true;
    }
    // GPU
    cmp = getCmpDropZone(20);
    if (cmp != null && cmp.getAttribute("id").includes("gpu")) {
        componentes[6] = true;
    }

    //return [true, false, true, true, true, true, false]; // BORRAR ESTO
    return componentes;
}

// Funcion que devuelve el socket de la Placa Base y el de la CPU
function getSockets() {
    var sockets = [null, null]; //0: Placa Base, 1: CPU
    var colocados = getCmpsColocados();
    for (var i = 0; i < colocados.length; i++) {
        if (colocados[i].getAttribute("id").includes("placabase")) {
            var cmp = getCmpFromID(colocados[i].getAttribute("id"));
            sockets[0] = cmp[12];
        }
        if (colocados[i].getAttribute("id").includes("cpu")) {
            var cmp = getCmpFromID(colocados[i].getAttribute("id"));
            sockets[1] = cmp[12];
        }
    }
    return sockets;
}

// Funcion que devuelve el consumo maximo y la potencia de la fuente
function getConsumos() {
    var consumos = [0, 0]; //0: Maximo, 1: Fuente
    var maximo = 0;
    var colocados = getCmpsColocados();
    for (var i = 0; i < colocados.length; i++) {
        if (colocados[i].getAttribute("id").includes("cpu")) {
            var cmp = getCmpFromID(colocados[i].getAttribute("id"));
            maximo += parseInt(cmp[16]); // Incrementar consumo maximo
        }
        if (colocados[i].getAttribute("id").includes("gpu")) {
            var cmp = getCmpFromID(colocados[i].getAttribute("id"));
            maximo += parseInt(cmp[13]); // Incrementar consumo maximo
        }
        if (colocados[i].getAttribute("id").includes("fuente")) {
            var cmp = getCmpFromID(colocados[i].getAttribute("id"));
            consumos[1] = parseInt(cmp[12]);
        }
    }
    consumos[0] = maximo;
    return consumos;
}

// Funcion que devuelve la cantidad (GB) de memoria RAM, HDD y SSD colocada
function getMemoriasColocada() {
    var memorias = [0, 0, 0] // RAM, HDD, SSD
    var colocados = getCmpsColocadosID();
    for (var i = 0; i < colocados.length; i++) {
        if (colocados[i].includes("ram")) {
            var cmp = getCmpFromID(colocados[i]);
            memorias[0] += parseInt(cmp[13]);
        }
        else if (colocados[i].includes("disco")) {
            var cmp = getCmpFromID(colocados[i]);
            if (cmp[11] == "HDD") memorias[1] += parseInt(cmp[13]);
            else memorias[2] += parseInt(cmp[13]);
        }
    }
    return memorias;
}

// Funcion que devuelve un array con las RAMs y los discos colocados
function getArrayMemoriaColocada() {
    var memoria = [[], []]; // 0: RAM; 1: Discos
    var colocados = getCmpsColocadosID();
    for (var i = 0; i < colocados.length; i++) {
        if (colocados[i].includes("ram")) {
            memoria[0].push(colocados[i]);
        }
        else if (colocados[i].includes("disco")) {
            memoria[1].push(colocados[i]);
        }
    }
    return memoria;
}

/* ---------------------------------------------------------------------------- */

// COMPONENTES DE INTERACCION

// Componente que gestiona las colisiones de los componentes con las zona de colocacion
// https://github.com/supermedium/superframe/tree/master/components/aabb-collider/
AFRAME.registerComponent('colision', {
    init: function () {
        // Componente grabbed (el que genera la colision)
        var comp = this.el;
        // Drop zone que colisiona con el componente
        var zone;

        this.el.addEventListener('hitstart', (e) => {
            console.log("Inicio colision ");

            // Actualizar drop zone
            zone = comp.components['aabb-collider'].intersectedEls[0];

            // Remarcar drop zone y actualizar variable
            desmarcarDropZones();
            zone.setAttribute("opacity", "1");
            actualDropZone = zone;

        });
        this.el.addEventListener('hitend', (e) => {
            console.log("Fin colision ");

            // Desmarcar drop zone y actualizar variable
            if (zone != null) {
                zone.setAttribute("opacity", "0.3");
            }
            actualDropZone = null;
        });

        this.el.addEventListener('mouseenter', function (evt) {
            if (comp.getAttribute("title") != null && !terminado) {
                // Solo si esta colocado
                comp.setAttribute("opacity", "0.4");

                // Crear tarjeta "Componente actual"
                if (!cogiendo) {
                    var cmp = getCmpFromID(comp.getAttribute("id"));
                    var tipo = cmp[0].replace("cmp-", "");
                    tipo = tipo.substring(0, tipo.indexOf("-"));
                    setTimeout(() => {
                    	borrarDisplay("display-cmp-actual");
                        gestionCargarListado(0, tipo, cmp);
                    }, 10);
                }
            }
        });
        this.el.addEventListener('mouseleave', function (evt) {
            comp.setAttribute("opacity", "1");

            // Borrar tarjeta "Componente actual"
            if (!cogiendo) {
                borrarDisplay("display-cmp-actual");
            }
        });
        // Click para quitar un componente del ordenador
        this.el.addEventListener('click', function (evt) {
            // Revisar que se hace click con el puntero (y no las manos que tambien generan click)
            if (evt.fromElement == undefined || evt.fromElement == null); // puntero o raton
            else if (evt.fromElement.getAttribute("hand-controls") != null) { // manos
                return;
            }
            // Si el componente esta colocado quitarlo
            if (comp.getAttribute("static-body") != null && !terminado) {
                // Si se quiere quitar una placa base
                if (comp.getAttribute("id").includes("placabase")) {
                    // Eliminar drop zones y componentes relativos a la placa base
                    eliminarDropZonesPlacaBase();
                    desasignarComponentesPlacaBase();
                }
                // Si se quiere quitar una CPU
                else if (comp.getAttribute("id").includes("cpu")) {
                    // Eliminar drop zones y componentes relativos a la CPU
                    emptyDropZonesVentilador = [];
                    posCPU = null;
                    desasignarComponentesCPU();
                }

                // Marcar drop zone como libre
                var index = parseInt(comp.getAttribute("title"));
                marcarDropZone(index, true);

                // Desasignar la drop zone del componente
                comp.removeAttribute("title");

                // Hacerlo dinamico para que se mueva y colocarlo en la mesa
                colocarComponenteMesa(comp);

                // Para el tutorial
                if (instrucciones != null) {
                    if (instrucciones[instIdx]["id"] == "descolocar" && emptyDropZones.every(Boolean)) {
                        cargarInstruccion(9);
                    }
                }
            }
        });
    }
})
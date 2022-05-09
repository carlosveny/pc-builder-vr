/*
    Fichero que se encarga de crear/eliminar objetos del
    escenario para mejorar el rendimiento y gestionar el
    movimiento de la camara hacia dentro/fuera de la oficina.
    Tambien modifica los controllers y super-hands.
*/

// VARIABLES GLOBALES
var inside = false; // dentro: true; fuera: false
var oldRigX = 0;
var oldRigZ = 0;

// Funcion que posiciona al usuario en la mesa de trabajo con una animacion de fade black,
// carga el escenario y carga el nivel (si es necesario)
function movePlayer(dentro, nivel) {
    inside = dentro;
    var esfera = document.createElement("a-box");
    document.getElementById("camara").appendChild(esfera);
    setAttributes(esfera, { id: "camara-fader", position: "0 0 -0.3" });
    setAttributes(esfera, { material: "shader:flat; color: black; opacity: 0.0; side: double" });
    esfera.setAttribute("animation", "property: material.opacity; from: 0.0; to: 1.0; dur: 1000;");

    esfera.addEventListener('animationcomplete', function () {
        // Todo negro (cambiar posicion e invertir animacion)
        if (esfera.getAttribute("material")["opacity"] == 1) {
            // Moverse dentro de la oficina
            if (dentro) {
                // Cambiar posicion
                document.getElementById("rig").object3D.position.set(0, 0.2, -15.7);
                document.getElementById("rig").setAttribute("rotation", "0 180 0");
                document.getElementById("camara").object3D.position.set(0, 1.6, 0);
                setTimeout(() => {
                    centerPlayer(0, -15.7, "0 180 0");
                }, 100);

                // Modificar escenario
                luzDia();
                borrarEscenarioExterior();
                crearEscenarioInterior();

                // Cambiar controllers/superHands
                editController(false, true); // eliminar controller derecho
                editSuperHand(true, true); // crear superHand derecha

                // Cargar nivel
                nivelActualID = nivel[0];
                nivelActualNombre = nivel[1];
                if (nivelActualID == "prueba-0") loadTutorial();
                else loadNivel();
            }
            // Moverse fuera de la oficina
            else {
                // Cambiar posicion
                document.getElementById("rig").object3D.position.set(0, 0.2, 0);
                document.getElementById("rig").setAttribute("rotation", "0 0 0");
                document.getElementById("camara").object3D.position.set(0, 1.6, 0);
                setTimeout(() => {
                    centerPlayer(0, 0, "0 0 0");
                }, 100);

                // Modificar escenario
                resetDropZones();
                borrarEscenarioInterior();
                crearEscenarioExterior();

                // Cambiar controllers/superHands
                editSuperHand(false, true); // eliminar superHand derecha
                editController(true, true); // crear controller derecho
            }

            // Añadir animacion
            esfera.setAttribute("animation", "property: material.opacity; from: 1.0; to: 0.0; dur: 1000;");
        }
        // Todo normal (eliminar la esfera)
        else {
            esfera.remove();
        }
    });
}

// Funcion que crea el escenario de dentro de la oficina
function crearEscenarioInterior() {
    // Cambiar luces
    var foco = document.getElementById("luz-foco");
    setAttributes(foco, { position: "-10 3.5 -23", rotation: "-1 -151 103" });
    setAttributes(foco, { light: "type: spot; angle: 60; intensity: 0.4" });
    var foco2 = document.getElementById("luz-foco2");
    setAttributes(foco2, { light: "type: spot; angle: 60; intensity: 0.4" });

    // Mesa ordenadores 1
    var mesa1 = document.createElement("a-entity");
    setAttributes(mesa1, { id: "esc-mesa1", position: "3 0.8 1.5" });
    mesa1.setAttribute("mesa-ordenadores", "");
    // Mesa ordenadores 2
    var mesa2 = document.createElement("a-entity");
    setAttributes(mesa2, { id: "esc-mesa2", position: "-3 0.8 1.5" });
    mesa2.setAttribute("mesa-ordenadores", "");
    // Luz 1
    var luz1 = document.createElement("a-box");
    setAttributes(luz1, { id: "esc-luzTecho1", position: "3 3.35 1", width: "0.5", height: "0.08" });
    setAttributes(luz1, { depth: "1", src: "#luzTechoTexture", repeat: "1 2" });
    // Luz 2
    var luz2 = document.createElement("a-box");
    setAttributes(luz2, { id: "esc-luzTecho2", position: "-3 3.35 1", width: "0.5", height: "0.08" });
    setAttributes(luz2, { depth: "1", src: "#luzTechoTexture", repeat: "1 2" });
    // Luz 3
    var luz3 = document.createElement("a-box");
    setAttributes(luz3, { id: "esc-luzTecho3", position: "0 3.35 -3.5", width: "0.5", height: "0.08" });
    setAttributes(luz3, { rotation: "0 90 0", depth: "1", src: "#luzTechoTexture", repeat: "1 2" });
    var mesaMain = document.createElement("a-entity");
    setAttributes(mesaMain, { id: "mesa-trabajo", position: "0.25 0.82 -2.7" });
    // Mesa trabajo: ordenador, componentes y drop zones
    var ordenador = document.createElement("a-entity");
    ordenador.setAttribute("id", "ordenador");
    var o1 = document.createElement("a-box");
    setAttributes(o1, { position: "0 0.1 0", width: "0.01", height: "0.15", depth: "0.49" });
    setAttributes(o1, { multisrc: "src0:#pcBackTexture; src1:#pcBackTexture2; src2:#pcColorTexture" });
    o1.setAttribute("class", "raycastable");
    var o2 = document.createElement("a-box");
    setAttributes(o2, { position: "-0.55 0.1 0", width: "0.01", height: "0.15", depth: "0.49" });
    setAttributes(o2, { multisrc: "src1:#pcFrontTexture; src2:#pcColorTexture; src0:#pcColorTexture" });
    o2.setAttribute("class", "raycastable");
    var o3 = document.createElement("a-box");
    setAttributes(o3, { position: "-0.275 0.1 0.25", width: "0.01", height: "0.15", depth: "0.56" });
    setAttributes(o3, { rotation: "0 90 0", src: "#pcColorTexture", class: "raycastable" });
    var o4 = document.createElement("a-box");
    setAttributes(o4, { position: "-0.275 0.1 -0.25", width: "0.01", height: "0.15", depth: "0.56" });
    setAttributes(o4, { rotation: "0 90 0", color: "#292929", class: "raycastable" });
    var o5 = document.createElement("a-box");
    setAttributes(o5, { position: "-0.275 0.03 0", width: "0.55", height: "0.01", depth: "0.5" });
    setAttributes(o5, { src: "#pcBottomTexture", class: "raycastable" });
    var o6 = document.createElement("a-box");
    setAttributes(o6, { position: "-0.4 0.1 0", width: "0.005", height: "0.1", depth: "0.5" });
    setAttributes(o6, { color: "#3d3d3d", class: "raycastable" });
    var o7 = document.createElement("a-box");
    setAttributes(o7, { position: "-0.075 0.1 0.09", width: "0.005", height: "0.1", depth: "0.15" });
    setAttributes(o7, { rotation: "0 90 0", color: "#3d3d3d", class: "raycastable" });
    var componentes = document.createElement("a-entity");
    setAttributes(componentes, { id: "componentes", position: "-0.25 0.05 0" });
    var dropzones = document.createElement("a-entity");
    setAttributes(dropzones, { id: "drop-zones", position: "-0.25 0.05 0" });

    // Appends
    var interior = document.getElementById("oficina-interior");
    ordenador.appendChild(o1);
    ordenador.appendChild(o2);
    ordenador.appendChild(o3);
    ordenador.appendChild(o4);
    ordenador.appendChild(o5);
    ordenador.appendChild(o6);
    ordenador.appendChild(o7);
    mesaMain.appendChild(ordenador);
    mesaMain.appendChild(componentes);
    mesaMain.appendChild(dropzones);
    interior.appendChild(mesa1);
    interior.appendChild(mesa2);
    interior.appendChild(luz1);
    interior.appendChild(luz2);
    interior.appendChild(luz3);
    interior.appendChild(mesaMain);
}

// Funcion que crea el escenario de fuera de la oficina
function crearEscenarioExterior() {
    // Cambiar luces
    var foco = document.getElementById("luz-foco");
    setAttributes(foco, { position: "5 5.3 10", rotation: "-3 0 0" });
    setAttributes(foco, { light: "type: directional; intensity: 0.7" });
    var foco2 = document.getElementById("luz-foco2");
    setAttributes(foco2, { light: "type: spot; angle: 60; intensity: 0" });

    // Menu principal
    crearMenuPrincipal();
    loadMenuPrincipal();
    var toggle = document.createElement("a-cylinder");
    setAttributes(toggle, { id: "esc-toggleMenu", position: "1 0.5 -0.56", height: "1" });
    setAttributes(toggle, { radius: "0.02", color: "red", class: "raycastable" });
    var boxMain = document.createElement("a-box");
    setAttributes(boxMain, { position: "0 0.5 0", rotation: "45 -75 0", width: "0.3" });
    setAttributes(boxMain, { height: "0.03", depth: "0.25", color: "white", class: "raycastable" });
    var box2 = document.createElement("a-box");
    setAttributes(box2, { position: "0 0 0", width: "0.31", height: "0.02", depth: "0.26" });
    setAttributes(box2, { color: "black", class: "raycastable" });
    var txt0 = document.createElement("a-text");
    setAttributes(txt0, { position: "0 0.02 -0.08", rotation: "-90 0 0", width: "0.7" });
    setAttributes(txt0, { value: "Ocultar/mostrar", color: "black", align: "center" });
    var txt1 = document.createElement("a-text");
    setAttributes(txt1, { position: "-0.11 0.02 -0.01", rotation: "-90 0 0", width: "0.6", value: "Menú", color: "black" });
    txt1.setAttribute("font-open-sans", "");
    var c1 = document.createElement("a-cylinder");
    setAttributes(c1, { position: "0.13 0 0", rotation: "90 0 0", height: "0.001", radius: "0.022", color: "#9c9c9c" });
    var c11 = document.createElement("a-cylinder");
    setAttributes(c11, { position: "0 0.001 0", height: "0.001", radius: "0.02" });
    setAttributes(c11, { color: "#fa9d9d", class: "raycastable", onclick: "borrarMenuTodo()" });
    c11.setAttribute("highlight-ocultar", "");
    c11.setAttribute("hc-sound", "");
    var c2 = document.createElement("a-cylinder");
    setAttributes(c2, { position: "0.2 0 0", rotation: "90 0 0", height: "0.001", radius: "0.022", color: "black" });
    var c21 = document.createElement("a-cylinder");
    setAttributes(c21, { position: "0 0.001 0", height: "0.001", radius: "0.02", color: "#86eba1" });
    setAttributes(c21, { class: "raycastable", onclick: "crearMenuPrincipal(); loadMenuPrincipal()" });
    c21.setAttribute("highlight-mostrar", "");
    c21.setAttribute("hc-sound", "");
    var txt1 = document.createElement("a-text");
    setAttributes(txt1, { position: "-0.11 0.02 -0.01", rotation: "-90 0 0", width: "0.6", value: "Menu", color: "black" });
    var c1 = document.createElement("a-cylinder");
    setAttributes(c1, { position: "0.13 0 0", rotation: "90 0 0", height: "0.001", radius: "0.022", color: "#9c9c9c" });
    var c11 = document.createElement("a-cylinder");
    setAttributes(c11, { position: "0 0.001 0", height: "0.001", radius: "0.02" });
    setAttributes(c11, { color: "#fa9d9d", class: "raycastable", onclick: "borrarMenuTodo()" });
    c11.setAttribute("highlight-ocultar", "");
    c11.setAttribute("hc-sound", "");
    var c2 = document.createElement("a-cylinder");
    setAttributes(c2, { position: "0.2 0 0", rotation: "90 0 0", height: "0.001", radius: "0.022", color: "black" });
    var c21 = document.createElement("a-cylinder");
    setAttributes(c21, { position: "0 0.001 0", height: "0.001", radius: "0.02", color: "#86eba1" });
    setAttributes(c21, { class: "raycastable", onclick: "crearMenuPrincipal(); loadMenuPrincipal()" });
    c21.setAttribute("highlight-mostrar", "");
    c21.setAttribute("hc-sound", "");
    var txt2 = document.createElement("a-text");
    setAttributes(txt2, { position: "-0.11 0.02 0.05", rotation: "-90 0 0", width: "0.6", value: "Luces", color: "black" });
    var c3 = document.createElement("a-cylinder");
    setAttributes(c3, { position: "0.13 0 0", rotation: "90 0 0", height: "0.001", radius: "0.022", color: "#9c9c9c" });
    var c31 = document.createElement("a-cylinder");
    setAttributes(c31, { position: "0 0.001 0", height: "0.001", radius: "0.02" });
    setAttributes(c31, { color: "#fa9d9d", class: "raycastable", onclick: "luzNoche()" });
    c31.setAttribute("highlight-ocultar", "");
    c31.setAttribute("hc-sound", "");
    var c4 = document.createElement("a-cylinder");
    setAttributes(c4, { position: "0.2 0 0", rotation: "90 0 0", height: "0.001", radius: "0.022", color: "black" });
    var c41 = document.createElement("a-cylinder");
    setAttributes(c41, { position: "0 0.001 0", height: "0.001", radius: "0.02", color: "#86eba1" });
    setAttributes(c41, { class: "raycastable", onclick: "luzDia()" });
    c41.setAttribute("highlight-mostrar", "");
    c41.setAttribute("hc-sound", "");
    // Añadidos suelo
    var s1 = document.createElement("a-box");
    setAttributes(s1, { position: "-4 -0.1 5.2", width: "6", height: "0.15", depth: "0.4" });
    setAttributes(s1, { color: "#9d9e9e", class: "raycastable" });
    var s2 = document.createElement("a-box");
    setAttributes(s2, { position: "4 -0.1 5.2", width: "6", height: "0.15", depth: "0.4" });
    setAttributes(s2, { color: "#9d9e9e", class: "raycastable" });
    var s3 = document.createElement("a-box");
    setAttributes(s3, { position: "-7.2 -0.1 0", width: "0.4", height: "0.15", depth: "10.8" });
    setAttributes(s3, { color: "#9d9e9e", class: "raycastable" });
    var s4 = document.createElement("a-box");
    setAttributes(s4, { position: "7.2 -0.1 0", width: "0.4", height: "0.15", depth: "10.8" });
    setAttributes(s4, { color: "#9d9e9e", class: "raycastable" });
    var s5 = document.createElement("a-box");
    setAttributes(s5, { position: "0 -0.1 -5.2", width: "14", height: "0.15", depth: "0.4" });
    setAttributes(s5, { color: "#9d9e9e", class: "raycastable" });
    // Añadidos techo
    var t1 = document.createElement("a-box");
    setAttributes(t1, { position: "0 0.1 5.2", width: "14", height: "0.3", depth: "0.4" });
    setAttributes(t1, { color: "#9d9e9e", class: "raycastable" });
    var t2 = document.createElement("a-box");
    setAttributes(t2, { position: "0 0.1 -5.2", width: "14", height: "0.3", depth: "0.4" });
    setAttributes(t2, { color: "#9d9e9e", class: "raycastable" });
    var t3 = document.createElement("a-box");
    setAttributes(t3, { position: "7.2 0.1 0", width: "0.4", height: "0.3", depth: "10.8" });
    setAttributes(t3, { color: "#9d9e9e", class: "raycastable" });
    var t4 = document.createElement("a-box");
    setAttributes(t4, { position: "-7.2 0.1 0", width: "0.4", height: "0.3", depth: "10.8" });
    setAttributes(t4, { color: "#9d9e9e", class: "raycastable" });
    var t5 = document.createElement("a-box");
    setAttributes(t5, { position: "0 0.4 5.45", width: "4.5", height: "0.9", depth: "0.05" });
    setAttributes(t5, { color: "#9fc99f", class: "raycastable" });
    var l1 = document.createElement("a-box");
    setAttributes(l1, { position: "0 0 -0.02", color: "black", width: "4.6" });
    setAttributes(l1, { height: "1", depth: "0.05", class: "raycastable" });
    var l2 = document.createElement("a-plane");
    setAttributes(l2, { position: "-1.75 0 0.03", width: "0.9", height: "0.9" });
    setAttributes(l2, { src: "#letreroTexture", transparent: "true" });
    var l3 = document.createElement("a-entity");
    setAttributes(l3, { position: "2.8 -0.28 0.03", scale: "8 8 8" });
    l3.setAttribute("text", "value:PC Repair Center; color:black; shader: msdf; font:https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/concertone/ConcertOne-Regular.json;");

    // Appends
    c1.appendChild(c11);
    c2.appendChild(c21);
    c3.appendChild(c31);
    c4.appendChild(c41);
    txt1.appendChild(c1);
    txt1.appendChild(c2);
    txt2.appendChild(c3);
    txt2.appendChild(c4);
    boxMain.appendChild(box2);
    boxMain.appendChild(txt0);
    boxMain.appendChild(txt1);
    boxMain.appendChild(txt2);
    toggle.appendChild(boxMain);
    document.getElementById("esc-dinamico").appendChild(toggle);
    var ground = document.getElementById("ground");
    ground.appendChild(s1);
    ground.appendChild(s2);
    ground.appendChild(s3);
    ground.appendChild(s4);
    ground.appendChild(s5);
    var ceiling = document.getElementById("ceiling");
    t5.appendChild(l1);
    t5.appendChild(l2);
    t5.appendChild(l3);
    ceiling.appendChild(t1);
    ceiling.appendChild(t2);
    ceiling.appendChild(t3);
    ceiling.appendChild(t4);
    ceiling.appendChild(t5);
}

// Funcion que borra el escenario de dentro de la oficina
function borrarEscenarioInterior() {
    $("#esc-mesa1").remove();
    $("#esc-mesa2").remove();
    $("#esc-luzTecho1").remove();
    $("#esc-luzTecho2").remove();
    $("#esc-luzTecho3").remove();
    $("#mesa-trabajo").remove();
}

// Funcion que borra el escenario de fuera de la oficina
function borrarEscenarioExterior() {
    borrarMenuTodo();
    $("#esc-toggleMenu").remove();
    const suelo = document.getElementById("ground");
    while (suelo.firstChild) {
        suelo.removeChild(suelo.lastChild);
    }
    const techo = document.getElementById("ceiling");
    while (techo.firstChild) {
        techo.removeChild(techo.lastChild);
    }
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES QUE MODIFICAN CONTROLLERS O SUPERHANDS

// Funcion que crea/elimina la super hand derecha/izquierda
function editSuperHand(crear, derecha) {
    // Eliminar siempre (aunque se tenga que crear despues)
    if (derecha && document.getElementById("rightSuperHand") != null) {
        document.getElementById("rightSuperHand").remove();
    }
    else if (!derecha && document.getElementById("leftSuperHand") != null) {
        document.getElementById("leftSuperHand").remove();
    }

    // Crear (solo si hay que crearlo)
    if (crear) {
        var superHand = document.createElement("a-entity");
        superHand.setAttribute("static-body", "shape: sphere; sphereRadius: 0.02;");
        superHand.setAttribute("sphere-collider", "objects: .interactable");
        superHand.setAttribute("super-hands", "");
        if (derecha) {
            superHand.setAttribute("hand-controls", "hand: right; handModelStyle: highPoly");
            superHand.setAttribute("id", "rightSuperHand");
        }
        else {
            superHand.setAttribute("hand-controls", "hand: left; handModelStyle: highPoly");
            superHand.setAttribute("id", "leftSuperHand");
        }
        document.getElementById("rig").appendChild(superHand);
    }
}

// Funcion que crea/elimina el controller derecho/izquierdo
function editController(crear, derecha) {
    // Eliminar siempre (aunque se tenga que crear despues)
    if (derecha && document.getElementById("rightHand") != null) {
        document.getElementById("rightHand").remove();
    }
    else if (!derecha && document.getElementById("leftHand") != null) {
        document.getElementById("leftHand").remove();
    }

    // Crear (solo si hay que crearlo)
    if (crear) {
        var controller = document.createElement("a-entity");
        controller.setAttribute("raycaster", "objects: .raycastable; lineColor: #4103fc; lineOpacity: 1");
        controller.setAttribute("controller-cmp", "");
        if (derecha) {
            controller.setAttribute("laser-controls", "hand: right");
            controller.setAttribute("id", "rightHand");
        }
        else {
            controller.setAttribute("laser-controls", "hand: left");
            controller.setAttribute("id", "leftHand");
        }
        document.getElementById("rig").appendChild(controller);
    }
}

// Funcion que re-centra al jugador a la posicion inicial
function centerPlayer(x, z, rotation) {
    // Coordenadas mundo de la camara
    var cameraEl = document.querySelector('#camara');
    var worldPos1 = new THREE.Vector3();
    worldPos1.setFromMatrixPosition(cameraEl.object3D.matrixWorld);
    // Coordenadas mundo del rig
    var rigEl = document.querySelector('#rig');
    rigEl.object3D.position.set(x, 0.2, z);
    var worldPos2 = new THREE.Vector3();
    worldPos2.setFromMatrixPosition(rigEl.object3D.matrixWorld);
    worldPos2.x += x;
    worldPos2.z += z;

    // Actualizar variables globales
    oldRigX = worldPos2.x;
    oldRigZ = worldPos2.z;
    // Actualizar posicion y rotacion del rig
    document.getElementById("rig").object3D.position.set(worldPos2.x - worldPos1.x, 0.2, worldPos2.z - worldPos1.z);
    document.getElementById("rig").setAttribute("rotation", rotation);
}
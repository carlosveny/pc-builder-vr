/*
	Fichero que se encarga de gestionar el nivel del tutorial,
	mostrando todos los pasos a seguir previamente cargados del JSON. 
*/

// VARIABLES GLOBALES
var instrucciones = null; // array de instrucciones del JSON
var instIdx; // idx de la instruccion actual

// Funcion que carga el tutorial
function loadTutorial() {
	peticionTareas(nivelActualID);

	// Crear menus y hacer peticiones
	crearMenuComponentes(); //menuComponentes.js
	crearComponenteCogido();
	crearCarteles();
	console.log(componentes);
	peticionInstruccionesJSON();
}

// Funcion que carga la instruccion indicada en la pantalla
function cargarInstruccion(idx) {
	// Borrar y actualizar variables
	borrarInstruccion();
	instIdx = idx;

	// Mostrar nueva instruccion
	var tit = document.createElement("a-text");
	setAttributes(tit, { position: "0 0.43 0", width: "2.5", color: "black", align: "center" });
	tit.setAttribute("value", instrucciones[idx]["titulo"]);
	tit.setAttribute("font-open-sans", "");
	var txt = document.createElement("a-text");
	setAttributes(txt, { position: "0 0.3 0", scale: "0.35 0.35 0.35", color: "black", align: "center", baseline: "top" });
	txt.setAttribute("value", instrucciones[idx]["descripcion"]);
	txt.setAttribute("wrap-count", "58");
	txt.setAttribute("font-open-sans", "");
	document.getElementById("instruccion").appendChild(tit);
	document.getElementById("instruccion").appendChild(txt);

	if (instrucciones[idx]["boton"] != "") {
		var but = document.createElement("a-rounded");
		setAttributes(but, { position: "0 -0.38 0.002", width: "0.45", height: "0.13", radius: "0.03", color: "#dbdfff" });
		setAttributes(but, { class: "raycastable", onclick: instrucciones[idx]["onclick"] });
		but.setAttribute("hc-sound", "");
		but.setAttribute("highlight-azul2", "");
		var txtBut = document.createElement("a-text");
		setAttributes(txtBut, { position: "0 0.02 0", align: "center", scale: "0.33 0.33 0.33", color: "black" });
		txtBut.setAttribute("value", instrucciones[idx]["boton"]);
		txtBut.setAttribute("font-open-sans", "");
		but.appendChild(txtBut);
		document.getElementById("instruccion").appendChild(but);
	}
}

// Funcion que borra la instruccion actual de la pantalla
function borrarInstruccion() {
	const myNode = document.getElementById("instruccion");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.lastChild);
	}
}

// Funcion que revisa los componentes colocados y avanza el tutorial
// (llamado desde interaccion.js)
function tutorialCmpColocado(cmp) {
	if (instrucciones == null) return;
	switch (instrucciones[instIdx]["id"]) {
		case "colocar":
			var cmp2 = getCmpDropZone(0);
			if (cmp2 != null && cmp2.getAttribute("id").includes("placabase")) {
				cargarInstruccion(7);
			}
			break;
		case "colocar2":
			var cmp2 = getCmpDropZone(10);
			if (cmp2 != null && cmp2.getAttribute("id").includes("cpu")) {
				cargarInstruccion(8);
			}
			break;
		case "placabase2":
			var cmp2 = getCmpDropZone(0);
			if (cmp2 != null && cmp2.getAttribute("id").includes("placabase")) {
				cargarInstruccion(11);
			}
			break;
		case "cpu":
			var cmp2 = getCmpDropZone(10);
			if (cmp2 != null && cmp2.getAttribute("id").includes("cpu")) {
				cargarInstruccion(12);
			}
			break;
		case "ventilador":
			var cmp2 = getCmpDropZone(60);
			if (cmp2 != null && cmp2.getAttribute("id").includes("ventilador")) {
				cargarInstruccion(13);
			}
			break;
		case "ram":
			var dz = emptyDropZonesRAM.indexOf(false); // idx de la ram drop zone llena
			if (dz == -1) break;

			var num = parseInt("3" + dz.toString());
			var cmp2 = getCmpDropZone(num);
			if (cmp2 != null && cmp2.getAttribute("id").includes("ram")) {
				cargarInstruccion(14);
			}
			break;
		case "hdd":
			var dz = emptyDropZonesHDD.indexOf(false); // idx del hdd drop zone llena
			if (dz == -1) break;

			var num = parseInt("4" + dz.toString());
			var cmp2 = getCmpDropZone(num);
			if (cmp2 != null && cmp2.getAttribute("id").includes("disco")) {
				var c = getCmpFromID(cmp2.getAttribute("id"));
				if (c[11] == "HDD") cargarInstruccion(15);
			}
			break;
		case "ssd":
			var dz = emptyDropZonesSSD.indexOf(false); // idx del ssd drop zone llena
			if (dz == -1) break;

			var num = parseInt("5" + dz.toString());
			var cmp2 = getCmpDropZone(num);
			if (cmp2 != null && cmp2.getAttribute("id").includes("disco")) {
				var c = getCmpFromID(cmp2.getAttribute("id"));
				if (c[11] == "SSD") cargarInstruccion(16);
			}
			break;
		case "gpu":
			var cmp2 = getCmpDropZone(20);
			if (cmp2 != null && cmp2.getAttribute("id").includes("gpu")) {
				cargarInstruccion(17);
			}
			break;
		case "fuente":
			var cmp2 = getCmpDropZone(1);
			if (cmp2 != null && cmp2.getAttribute("id").includes("fuente")) {
				cargarInstruccion(18);
			}
			break;
	}
}

// Funcion que muestra la explicacion de "Fin de Partida" al acabar el tutorial
function mostrarExplicacionFinPartida() {
	// Planos
	var plano1 = document.createElement("a-rounded");
	setAttributes(plano1, { position: "-2.1 0.9 0.2", rotation: "0 125 0" });
	setAttributes(plano1, { width: "1.82", height: "1.02", radius: "0.04", color: "black", class: "raycastable" });
	var plano2 = document.createElement("a-rounded");
	setAttributes(plano2, { position: "0 0 0.002", width: "1.8", height: "1" });
	setAttributes(plano2, { radius: "0.04", color: "#e6ffe8" });

	// Titulo y texto
	var tit = document.createElement("a-text");
	setAttributes(tit, { position: "0 0.43 0", width: "2.5", color: "black", align: "center" });
	tit.setAttribute("value", instrucciones[20]["titulo"]);
	tit.setAttribute("font-open-sans", "");
	var txt = document.createElement("a-text");
	setAttributes(txt, { position: "0 0.3 0", scale: "0.35 0.35 0.35", color: "black", align: "center", baseline: "top" });
	txt.setAttribute("value", instrucciones[20]["descripcion"]);
	txt.setAttribute("wrap-count", "58");
	txt.setAttribute("font-open-sans", "");

	// Appends
	plano2.appendChild(tit);
	plano2.appendChild(txt);
	plano1.appendChild(plano2);
	document.getElementById("mesa-trabajo").appendChild(plano1);
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES POST Y GET

// Funcion que obtiene el JSON de las instrucciones del tutorial
function peticionInstruccionesJSON() {
	$.getJSON('json/tutorial.json', function (data) {
		instrucciones = data;
		// Crear display
		var plano1 = document.createElement("a-rounded");
		setAttributes(plano1, { id: "plano-instrucciones", position: "-0.23 1 1.3", rotation: "0 180 0" });
		setAttributes(plano1, { width: "1.82", height: "1.02", radius: "0.04", color: "black", class: "raycastable" });
		var hitbox = document.createElement("a-box");
		setAttributes(hitbox, { position: "0 0 -0.01", width: "1.8", height: "1", depth: "0.001" });
		hitbox.setAttribute("static-body", "shape: box;");
		plano1.appendChild(hitbox);
		var plano2 = document.createElement("a-rounded");
		setAttributes(plano2, { id: "instruccion", position: "0 0 0.002", width: "1.8", height: "1" });
		setAttributes(plano2, { radius: "0.04", color: "#e6ffe8" });
		plano1.appendChild(plano2);
		document.getElementById("mesa-trabajo").appendChild(plano1);

		crearAvisoControles();
		cargarInstruccion(0);
		// setTimeout(() => {
		// 	finPartida();
		// }, 200);
	});
}

// Funcion que muestra el aviso de que los controles han cambiado
function crearAvisoControles() {
	// Titulo y texto
	var p1 = document.createElement("a-rounded");
	setAttributes(p1, { id: "plano-controles", position: "0 0 0.7" });
	setAttributes(p1, { width: "1.12", height: "0.72", radius: "0.04", color: "black", class: "raycastable" });
	var hitbox = document.createElement("a-box");
	setAttributes(hitbox, { position: "0 0 -0.01", width: "1.1", height: "0.7", depth: "0.001" });
	hitbox.setAttribute("static-body", "shape: box;");
	p1.appendChild(hitbox);
	var p2 = document.createElement("a-rounded");
	setAttributes(p2, { position: "0 0 0.002", width: "1.1", height: "0.7" });
	setAttributes(p2, { radius: "0.04", color: "#ffddde" });
	p1.appendChild(p2);
	var tit = document.createElement("a-text");
	setAttributes(tit, { position: "0 0.28 0", width: "1.8", color: "black", align: "center" });
	tit.setAttribute("value", "Aviso de Controles");
	tit.setAttribute("font-open-sans", "");
	var txt = document.createElement("a-text");
	setAttributes(txt, { position: "0 0.18 0", scale: "0.2 0.2 0.2", color: "black", align: "center", baseline: "top" });
	var val = "Los controles son diferentes en esta zona de juego. Ahora solo ";
	val += "se puede usar la mano izquierda para hacer click en botones.\n";
	val += "En el tutorial se explicarán los controles con más detalle."
	txt.setAttribute("value", val);
	txt.setAttribute("wrap-count", "40");
	txt.setAttribute("font-open-sans", "");

	// Boton
	var but = document.createElement("a-rounded");
	setAttributes(but, { position: "0 -0.25 0.002", width: "0.4", height: "0.1", radius: "0.03", color: "#dbdfff" });
	var click = "$('#plano-controles').remove()";
	setAttributes(but, { class: "raycastable", onclick: click });
	but.setAttribute("hc-sound", "");
	but.setAttribute("highlight-azul2", "");
	var txtBut = document.createElement("a-text");
	setAttributes(txtBut, { position: "0 0.018 0", align: "center", scale: "0.27 0.27 0.27", color: "black" });
	txtBut.setAttribute("value", "Entendido");
	txtBut.setAttribute("font-open-sans", "");
	but.appendChild(txtBut);
	p2.appendChild(but);

	// Appends
	p2.appendChild(tit);
	p2.appendChild(txt);
	document.getElementById("plano-instrucciones").appendChild(p1);
}
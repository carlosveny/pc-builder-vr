/*
	Fichero que se encarga de gestionar el menu de los componentes,
	visualizar y generar tarjetas de componentes.
*/

// VARIABLES GLOBALES
var componentes; // Array clave-valor

// Funcion que llama a cargar las tarjetas segun el tipo de componente
function gestionCargarListado(nPag, tipo, cmp) {
	switch (tipo) {
		case "cpu":
			if (cmp == null) cmp = componentes.cpu;
			cargarListado(nPag, "cpu", cmp, ["Arquitectura:", 11, ""],
				["Socket:", 12, ""], ["Consumo:", 16, " W"], ["Núcleos:", 13, ""],
				["Frecuencia:", 14, " GHz"], ["Turbo:", 15, " GHz"]);
			break;
		case "gpu":
			if (cmp == null) cmp = componentes.gpu;
			cargarListado(nPag, "gpu", cmp, ["Memoria:", 11, " GB"],
				["VRAM:", 12, " GHz"], ["Consumo:", 13, " W"], ["", 0, ""],
				["", 0, ""], ["", 0, ""]);
			break;
		case "ram":
			if (cmp == null) cmp = componentes.ram;
			cargarListado(nPag, "ram", cmp, ["Velocidad:", 12, " MHz"],
				["Capacidad:", 13, " GB"], ["", 0, ""], ["Estándar:", 11, ""],
				["", 0, ""], ["", 0, ""]);
			break;
		case "disco":
			if (cmp == null) cmp = componentes.disco;
			cargarListado(nPag, "disco", cmp, ["Velocidad:", 12, " MB/s"],
				["Capacidad:", 13, " GB"], ["", 0, ""], ["Tipo:", 11, ""],
				["", 0, ""], ["", 0, ""]);
			break;
		case "placabase":
			if (cmp == null) cmp = componentes.placabase;
			cargarListado(nPag, "placabase", cmp, ["Tipo:", 11, ""],
				["Socket:", 12, ""], ["", 0, ""], ["Slots RAM:", 13, ""],
				["Slots HDD:", 14, ""], ["Slots SSD:", 15, ""]);
			break;
		case "fuente":
			if (cmp == null) cmp = componentes.fuente;
			cargarListado(nPag, "fuente", cmp, ["Tipo:", 11, ""],
				["", 0, ""], ["", 0, ""], ["Potencia:", 12, " W"],
				["", 0, ""], ["", 0, ""]);
			break;
		case "ventilador":
			if (cmp == null) cmp = componentes.ventilador;
			cargarListado(nPag, "ventilador", cmp, ["Velocidad:", 11, " RPM"],
				["", 0, ""], ["", 0, ""], ["", 0, ""],
				["", 0, ""], ["", 0, ""]);
			break;
	}
}

// Funcion que carga 3 tarjetas dados los campos, el componente y la pagina
function cargarListado(nPag, tipo, cmps, t1, t2, t3, t4, t5, t6) {
	if (Array.isArray(cmps[0])) {
		borrarDisplay("display-oficina-componentes");
	}
	var idxStart = nPag * 3;
	var idxEnd = idxStart + 3;
	var pos = ["0 0.3 0.03", "0 -0.1 0.03", "0 -0.5 0.03"];

	// Botones para controlar las paginas
	if ((nPag > 0) && (Array.isArray(cmps[0]))) {
		var prevPag = document.createElement("a-plane");
		setAttributes(prevPag, { position: "0.3 0.51 0.03", width: "0.11", height: "0.07", src: "#backArrowTexture" });
		setAttributes(prevPag, { color: "#fff7bd", class: "raycastable" });
		prevPag.setAttribute("onclick", "gestionCargarListado(" + (nPag - 1) + ", '" + tipo + "')");
		prevPag.setAttribute("highlight-amarillo", "");
		prevPag.setAttribute("hc-sound", "");
		document.getElementById("display-oficina-componentes").appendChild(prevPag);
	}
	if ((cmps[idxEnd] != null) && (Array.isArray(cmps[0]))) {
		var nextPag = document.createElement("a-plane");
		setAttributes(nextPag, { position: "0.5 0.51 0.03", width: "0.11", height: "0.07" });
		setAttributes(nextPag, { src: "#backArrowTexture2", color: "#fff7bd", class: "raycastable" });
		nextPag.setAttribute("onclick", "gestionCargarListado(" + (nPag + 1) + ", '" + tipo + "')");
		nextPag.setAttribute("highlight-amarillo", "");
		nextPag.setAttribute("hc-sound", "");
		document.getElementById("display-oficina-componentes").appendChild(nextPag);
	}

	// Tratar si se esta creando la tarjeta de "Componente actual"
	var cmpActual = false;
	var display = document.getElementById("display-oficina-componentes");
	if (!Array.isArray(cmps[0])) {
		cmpActual = true;
		cmps = [cmps];
		pos[0] = "0 -0.04 0.01";
		display = document.getElementById("display-cmp-actual");
	}

	// Bucle de creacion de tarjetas
	for (var i = idxStart; i < idxEnd; i++) {
		// Revisar que haya mas tarjetas
		if (cmps[i] == null) break;

		// Crear tarjeta
		var main = document.createElement("a-rounded");
		setAttributes(main, { position: pos[i % 3], width: "1.1", height: "0.3", radius: "0.02" });
		setAttributes(main, { color: "#ebf1ff", class: "raycastable" });
		// Si es el "Componente actual" no generar click, ni highlight, ni sonido
		if (!cmpActual) {
			main.setAttribute("onclick", "generarComponente(" + getArrayFromComponent(cmps[i]) + ")");
			main.setAttribute("highlight-componente", "");
			main.setAttribute("hc-sound", "");
		}
		var txt = [];
		txt[0] = crearTexto(cmps[i][1], "-0.52 0.12 0", "0.22 0.22 0.22");
		txt[1] = crearTextoAnidado(t1[0], cmps[i][t1[1]] + t1[2], "-0.52 0.03 0");
		txt[2] = crearTextoAnidado(t2[0], cmps[i][t2[1]] + t2[2], "-0.52 -0.03 0");
		txt[3] = crearTextoAnidado(t3[0], cmps[i][t3[1]] + t3[2], "-0.52 -0.09 0");
		txt[4] = crearTextoAnidado(t4[0], cmps[i][t4[1]] + t4[2], "0.1 0.03 0");
		txt[5] = crearTextoAnidado(t5[0], cmps[i][t5[1]] + t5[2], "0.1 -0.03 0");
		txt[6] = crearTextoAnidado(t6[0], cmps[i][t6[1]] + t6[2], "0.1 -0.09 0");

		// Append
		// Array con las posiciones
		var posicionArray = [1, t1[1], t2[1], t3[1], t4[1], t5[1], t6[1]];
		// Bucle para hacer append solo con los que existen
		for (var j = 0; j < txt.length; j++) {
			// Si una posicion es 0 no tiene contenido y no hay que incluirla
			if (posicionArray[j] != 0) {
				main.appendChild(txt[j]);
			}
		}
		display.appendChild(main);
	}
}

// Funcion que genera un componente fisico en la oficina
function generarComponente(cmp) {
	console.log(cmp);
	var id = cmp[0];
	// Eliminar componente si ya existiese (evitar id duplicados)
	if (document.getElementById(cmp[0]) != null) {
		// Permitir colocar +1 discos o rams (siendo el mismo componente)
		if (cmp[9] == 4 || cmp[9] == 5) {
			while (document.getElementById(id) != null) {
				id += "X";
			}
		}
		// No eliminarlo ni crearlo si ya esta colocado en el ordenador
		else if (document.getElementById(cmp[0]).getAttribute("title") != null) {
			var descr = "No puedes generar un componente que\n ya está colocado en el ordenador";
			descr += "\n(excepto RAM y discos).\nQuítalo del ordenador para regenerarlo.";
			crearAvisoComponentes("Aviso", descr, "orange");
			return;
		}
		else {
			document.getElementById(cmp[0]).remove();
		}
	}

	// Generar array para pasarlo en las funciones cogido() y soltado()
	var cmpArray = getArrayFromComponent(cmp);

	// Crear componente fisico en la mesa (posicion pseudoaleatoria)
	var x = getRandomArbitrary(0.45, 1.1);
	var z = getRandomArbitrary(-0.2, 0.2);
	var pos = new THREE.Vector3(x, 0.5, z);
	var compFisico = document.createElement("a-box");
	setAttributes(compFisico, { id: id, position: pos, width: cmp[3], height: cmp[4], depth: cmp[5] });
	setAttributes(compFisico, { class: "interactable raycastable", hoverable: "" });
	setAttributes(compFisico, { grabbable: "", draggable: "", droppable: "", colision: "" });
	setAttributes(compFisico, { ondragstart: "cogido(event, " + cmpArray + ")", ondragend: "soltado(event, " + cmpArray + ")" });
	compFisico.setAttribute("dynamic-body", "shape: box");
	compFisico.setAttribute("aabb-collider", "objects: .colisionable");
	compFisico.setAttribute("rotation", "0 180 0");
	compFisico.setAttribute("src", "assets/texturesComponents/" + cmp[6]);
	document.getElementById("componentes").appendChild(compFisico);

	// Para el tutorial
	if (instrucciones != null) {
		if (instrucciones[instIdx]["id"] == "generar" && cmp[0].includes("placabase")) {
			cargarInstruccion(4);
		}
	}
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES PARA DIBUJAR OBJETOS O ELEMENTOS DE TEXTO

// Funcion que crea el menu principal de los componentes
function crearMenuComponentes() {
	borrarDisplay("display-oficina");

	// Revisar si hay que crearlo de 0 o solo hacen falta botones y titulo
	var existe = false;
	if (document.getElementById("display-oficina") != null) {
		existe = true;
	}
	// Plano y titulo
	var plano;
	var display;
	if (!existe) {
		plano = crearPlanoTexto(1.3, 1.5, "1.8 1 -0.8", "0 -90 0", "plano-oficina", "1 3");
		plano.setAttribute("static-body", "shape: box;");
		display = document.createElement("a-entity");
		display.setAttribute("id", "display-oficina");
	}
	var textTitulo = document.createElement("a-text");
	setAttributes(textTitulo, { position: "0 0.63 0.05", scale: "0.35 0.35 0.35" });
	setAttributes(textTitulo, { value: "Componentes", color: "black", align: "center" });
	textTitulo.setAttribute("font-open-sans", "");

	// Botones de tipos de componentes
	var boton1 = crearBotonAjustes("componentes-option1-border", "-0.3 0.4 0.03",
		0.4, "CPU", "cargarDisplay('CPU'); gestionCargarListado(0, 'cpu', null)");
	var boton2 = crearBotonAjustes("componentes-option2-border", "0.3 0.4 0.03",
		0.4, "GPU", "cargarDisplay('GPU'); gestionCargarListado(0, 'gpu', null)");
	var boton3 = crearBotonAjustes("componentes-option3-border", "-0.3 0.1 0.03",
		0.4, "RAM", "cargarDisplay('RAM'); gestionCargarListado(0, 'ram', null)");
	var boton4 = crearBotonAjustes("componentes-option4-border", "0.3 0.1 0.03",
		0.4, "Disco", "cargarDisplay('Disco'); gestionCargarListado(0, 'disco', null)");
	var boton5 = crearBotonAjustes("componentes-option4-border", "-0.3 -0.2 0.03",
		0.4, "Placa Base", "cargarDisplay('Placa Base'); gestionCargarListado(0, 'placabase', null)");
	var boton6 = crearBotonAjustes("componentes-option4-border", "0.3 -0.2 0.03",
		0.4, "Fuente", "cargarDisplay('Fuente'); gestionCargarListado(0, 'fuente', null)");
	var boton7 = crearBotonAjustes("componentes-option4-border", "0 -0.5 0.03",
		0.4, "Ventilador", "cargarDisplay('Ventilador'); gestionCargarListado(0, 'ventilador', null)");

	// Append
	if (existe) display = document.getElementById("display-oficina");
	display.appendChild(textTitulo);
	display.appendChild(boton1);
	display.appendChild(boton2);
	display.appendChild(boton3);
	display.appendChild(boton4);
	display.appendChild(boton5);
	display.appendChild(boton6);
	display.appendChild(boton7);
	if (!existe) {
		plano.appendChild(display);
		document.getElementById("mesa-trabajo").appendChild(plano);
	}
}

// Funcion que crea el display donde saldrá el componente que se tiene cogido
function crearComponenteCogido() {
	// Plano, titulo y display
	var main = document.createElement("a-box");
	setAttributes(main, { position: "-0.25 0.225 0.8", rotation: "-20 180 0", color: "#d9d9d9" });
	setAttributes(main, { id: "plano-cmp-cogido", width: "1.15", height: "0.42", depth: "0.01", class: "raycastable" });
	main.setAttribute("static-body", "shape: box");
	var titulo = document.createElement("a-text");
	setAttributes(titulo, { position: "0 0.17 0.01", value: "Componente actual" });
	setAttributes(titulo, { align: "center", scale: "0.26 0.26 0.26", color: "black" });
	titulo.setAttribute("font-open-sans", "");
	var disp = document.createElement("a-entity");
	disp.setAttribute("id", "display-cmp-actual");


	// Append
	main.appendChild(titulo);
	main.append(disp);
	document.getElementById("mesa-trabajo").appendChild(main);
}

// Funcion que crea los carteles de las 2 zonas (aparicion y recolocacion)
function crearCarteles() {
	// Cartel "Zona de aparicion"
	var cartel1 = document.createElement("a-box");
	setAttributes(cartel1, { position: "0.6 0.057 0.55", rotation: "-10 180 0", color: "#adadad" });
	setAttributes(cartel1, { id: "cartel-aparicion", width: "0.46", height: "0.07", depth: "0.005" });
	cartel1.setAttribute("static-body", "shape: box");
	cartel1.setAttribute("class", "raycastable");
	var txt1 = document.createElement("a-text");
	setAttributes(txt1, { position: "0 0.01 0.003", scale: "0.2 0.2 0.2" });
	setAttributes(txt1, { value: "Zona de aparición", align: "center", color: "black" });
	txt1.setAttribute("font-open-sans", "");

	// Cartel "Zona de recolocacion"
	var cartel2 = document.createElement("a-box");
	setAttributes(cartel2, { position: "-1.1 0.057 0.55", rotation: "-10 180 0", color: "#adadad" });
	setAttributes(cartel2, { id: "cartel-recolocacion", width: "0.46", height: "0.07", depth: "0.005" });
	cartel2.setAttribute("static-body", "shape: box");
	cartel2.setAttribute("class", "raycastable");
	var txt2 = document.createElement("a-text");
	setAttributes(txt2, { position: "0 0.01 0.003", scale: "0.19 0.19 0.19" });
	setAttributes(txt2, { value: "Zona de recolocación", align: "center", color: "black" });
	txt2.setAttribute("font-open-sans", "");

	// Append
	cartel1.appendChild(txt1);
	cartel2.appendChild(txt2);
	document.getElementById("mesa-trabajo").appendChild(cartel1);
	document.getElementById("mesa-trabajo").appendChild(cartel2);
}

// Funcion que crea un plano flotante para introducir texto (y lo devuelve)
function crearPlanoTexto(width, height, position, rotation, id, repetir) {
	var entity = document.createElement("a-entity");
	entity.setAttribute("id", id);
	entity.setAttribute("position", position);
	entity.setAttribute("rotation", rotation);

	// Caja principal
	var main = document.createElement("a-box");
	setAttributes(main, { height: height, width: width, depth: "0.05", src: "#centerMenuTexture", repeat: repetir });
	main.classList.add("raycastable");

	// Bordes
	var side1 = document.createElement("a-box");
	setAttributes(side1, { position: (-(width / parseFloat(2))) + " 0 0.005", height: height + 0.05 });
	setAttributes(side1, { width: "0.02", depth: "0.06", src: "#sideMenuTexture" });
	var side2 = document.createElement("a-box");
	setAttributes(side2, { position: (width / parseFloat(2)) + " 0 0.005", height: height + 0.05 });
	setAttributes(side2, { width: "0.02", depth: "0.06", src: "#sideMenuTexture" });
	var side3 = document.createElement("a-box");
	setAttributes(side3, { position: "0 " + (height / parseFloat(2)) + " 0", height: "0.02" });
	setAttributes(side3, { width: width + 0.05, depth: "0.06", src: "#sideMenuTexture" });
	var side4 = document.createElement("a-box");
	setAttributes(side4, { position: "0 " + (-(height / parseFloat(2))) + " 0", height: "0.02" });
	setAttributes(side4, { width: width + 0.05, depth: "0.06", src: "#sideMenuTexture" });

	entity.appendChild(main);
	entity.appendChild(side1);
	entity.appendChild(side2);
	entity.appendChild(side3);
	entity.appendChild(side4);
	return entity;
}

// Funcion que crea un aviso en el display de la oficina
function crearAvisoComponentes(tit, descr, color) {
	// Borrar aviso anterior (si aun existe)
	borrarAviso();

	// Plano, titulo y descripcion
	var main = crearPlanoTexto(0.8, 0.42, "0 0 0.2", "0 0 0", "aviso", "1 1");
	//elementoMenu("", 0.8, 0.4, "0 1.5 -1.5", 0, "aviso", false, "", "1 1");
	var titulo = document.createElement("a-text");
	setAttributes(titulo, { position: "0 0.17 0.03", scale: "0.22 0.22 0.22", value: tit, color: color, align: "center" });
	titulo.setAttribute("font-open-sans", "");
	var descripcion = document.createElement("a-text");
	setAttributes(descripcion, { position: "0 0.03 0.03", scale: "0.18 0.18 0.18", value: descr, color: "black", align: "center" });
	descripcion.setAttribute("font-open-sans", "");

	// Boton inferior
	var botonOkay = document.createElement("a-rounded");
	setAttributes(botonOkay, { position: "0 -0.15 0.05", width: "0.18", height: "0.08", color: "#a8a8a8", radius: "0.02" })
	var plano2 = document.createElement("a-rounded");
	setAttributes(plano2, { position: "0 0 0.001", width: "0.17", height: "0.07", color: "#fff7bd" });
	setAttributes(plano2, { class: "raycastable", onclick: "borrarAviso()", radius: "0.02" });
	plano2.setAttribute("highlight-amarillo", "");
	plano2.setAttribute("hc-sound", "");
	var texto = document.createElement("a-text");
	setAttributes(texto, { position: "0 0.01 0", scale: "0.16 0.16 0.16", value: "Vale", color: "black", align: "center" });
	texto.setAttribute("font-open-sans", "");

	plano2.appendChild(texto);
	botonOkay.appendChild(plano2);

	// Append
	main.appendChild(titulo);
	main.appendChild(descripcion);
	main.appendChild(botonOkay);
	document.getElementById("display-oficina").appendChild(main);
}

// Funcion que devuelve una entidad de texto dado su valor, posicion y escala
function crearTexto(val, pos, scale) {
	var text = document.createElement("a-text");
	setAttributes(text, { position: pos, scale: scale, value: val, color: "black" });
	text.setAttribute("font-open-sans", "");
	return text;
}

// Funcion que devuelve una entidad de texto anidada dado sus 2 valores y su posicion
function crearTextoAnidado(val1, val2, pos) {
	var text1 = document.createElement("a-text");
	setAttributes(text1, { position: pos, scale: "0.17 0.17 0.17", value: val1, color: "black" });
	text1.setAttribute("font-open-sans", "");
	var text2 = document.createElement("a-text");
	setAttributes(text2, { position: "1.5 0 0", value: val2, color: "black" });
	text2.setAttribute("font-open-sans", "");
	text1.appendChild(text2);
	return text1;
}

// Funcion que carga el display con el titulo y el boton de atras (sin componentes)
function cargarDisplay(nombre) {
	borrarDisplay("display-oficina");

	// Plano y titulo
	var titulo = document.createElement("a-text");
	setAttributes(titulo, { position: "0 0.63 0.05", scale: "0.35 0.35 0.35", value: nombre, color: "black", align: "center" });
	titulo.setAttribute("font-open-sans", "");
	document.getElementById("display-oficina").appendChild(titulo);

	// Boton atras
	var botAtras = document.createElement("a-rounded");
	setAttributes(botAtras, { position: "-0.47 0.63 0.03", width: "0.21", height: "0.11", color: "#7a7a7a", radius: "0.02" })
	var plano2 = document.createElement("a-rounded");
	setAttributes(plano2, { position: "0 0 0.001", width: "0.2", height: "0.1", color: "#fff7bd" });
	setAttributes(plano2, { class: "raycastable", onclick: "crearMenuComponentes()", radius: "0.02" });
	plano2.setAttribute("highlight-amarillo", "");
	plano2.setAttribute("hc-sound", "");
	var texto = document.createElement("a-text");
	setAttributes(texto, { position: "0 0.01 0", scale: "0.18 0.18 0.18", value: "Atrás", color: "black", align: "center" });
	texto.setAttribute("font-open-sans", "");
	plano2.appendChild(texto);
	botAtras.appendChild(plano2);
	document.getElementById("display-oficina").appendChild(botAtras);

	// Crear display de tarjetas de componentes
	var display = document.createElement("a-entity")
	display.setAttribute("id", "display-oficina-componentes");
	document.getElementById("display-oficina").appendChild(display);
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES AUXILIARES

// Funcion que devuelve un array con todo el contenido del componente para pasarlo
// a otras funciones (generarComponente(), cogido() y soltado())
function getArrayFromComponent(cmp) {
	console.log(cmp);
	var func = "[";
	for (var i = 0; i < cmp.length - 1; i++) {
		func = func + "'" + cmp[i] + "', "
	}
	func = func + "'" + (cmp[cmp.length - 1]) + "']";
	return func;
}

// Retorna un número aleatorio entre min (incluido) y max (excluido)
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

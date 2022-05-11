/*
	Fichero que gestiona el menu principal y todo lo referente a cuando el
	usuario esta fuera de la oficina
*/

// VARIABLES GLOBALES
var inputId = ""; //para saber donde esta escribiendo el teclado
var kbRaycaster = "#cursor" //#rightHand o #cursor (para el teclado)
var actualUsername = "" //username o "" si es un usuario invitado (sin iniciar sesion)
var userInvitado = "Invitado"; //username del usuario invitado (si hay)
var actualPassword = ""; //contraseña en texto plano
var actualAvatar = 1; //1-5. 11-12 (diseñador piezas y pruebas)
var actualTipoUsuario = 0; //0: Jugador, 1: D.Piezas, 2: D. Pruebas
var pruebas;
var volumenMusica = 0.25;

// Funcion que se ejecuta al cargarse la pagina
function loaded() {
	// Para la interaccion con el teclado virtual al entrar a VR y la gravedad
	window.addEventListener('enter-vr', e => {
		if (AFRAME.utils.device.checkHeadsetConnected()) {
			kbRaycaster = "#rightHand";
			var sceneEl = document.getElementById("escena");
			sceneEl.systems.physics.driver.world.gravity.y = -8.5;
		}
	});
	window.addEventListener('exit-vr', e => {
		kbRaycaster = "#cursor";
		var sceneEl = document.getElementById("escena");
		sceneEl.systems.physics.driver.world.gravity.y = -0.5;
	});
	// Evento de teclado ('M') para abrir el menu de musica
	document.addEventListener('keydown', function (event) {
		if (event.key == "m" || event.key == "M") {
			menuMusica(volumenMusica);
		}
	});

	document.querySelector("#background-music").loop = true;
	document.querySelector("#background-music").volume = volumenMusica;
	document.querySelector("#background-music").play();
	crearEscenarioExterior();
	// Recargar menu para evitar bugs con la fuente
	setTimeout(() => {
		borrarMenuTodo();
		crearMenuPrincipal();
		loadMenuPrincipal();

		peticionSession();
	}, 300);

	//setTimeout(() => {movePlayer(true, pruebas[0]);}, 200);
}

// Funcion que crea el menu principal (titulo y entidad)
function crearMenuPrincipal() {
	// Evitar que se cree si ya existe
	if (document.getElementById("menu-principal-titulo-banner") != null) return;

	// Titulo
	var titulo = document.createElement("a-entity");
	titulo.setAttribute("text", "value:PC Builder VR; color:#000000; align: center; shader: msdf; font:https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/shadowsintolight/ShadowsIntoLight.json;");
	titulo.setAttribute("position", "0 2.4 -2");
	titulo.setAttribute("scale", "6 6 6");
	var menuExtras = document.createElement("a-entity");
	menuExtras.setAttribute("id", "menu-principal-titulo-banner");
	menuExtras.appendChild(titulo)

	//Perfil
	var perfil = crearBannerPerfil();
	menuExtras.appendChild(perfil);

	//Entidad de menu principal
	var menu = document.createElement("a-entity");
	menu.setAttribute("id", "menu-principal");
	menuExtras.appendChild(menu);
	document.getElementById("esc-dinamico").appendChild(menuExtras);
}

// Funcion que carga el menu principal
function loadMenuPrincipal() {
	// Evitar que se cree si ya existe
	if (document.getElementById("menu-1") != null) return;

	// Crear el menu dinamicamente segun las pruebas que hay
	var y = 2.2;
	var i = 0;
	for (i; i < pruebas.length; i++) {
		var nombre = pruebas[i][1];
		var dif = pruebas[i][3];
		var click = "movePlayer(true, " + JSON.stringify(pruebas[i]) + ")";
		elementoMenu(nombre, 1.8, 0.2, "0 " + y + " -2", 0.45, "menu-" + (i + 1), true, click, "1 1", dif);
		y = y - 0.3;
	}
	elementoMenu("Estadísticas", 0.8, 0.2, "-0.5 " + y + " -2", 0.3, "menu-" + (i + 1), true, "mostrarEstadisticas()", "1 1");
	elementoMenu("Ajustes", 0.8, 0.2, "0.5 " + y + " -2", 0.3, "menu-" + (i + 2), true, "mostrarAjustes()", "1 1");
}

// Funcion para marcar el input donde se va a escribir y abrir el teclado
function inputTeclado(id) {
	inputId = id;
	crearTeclado();
}

// Funcion para deseleccionar todos los inputs de teclado (bordes)
function deseleccionarInputs() {
	if (document.getElementById("ajustes-input1-border") != null) {
		document.getElementById("ajustes-input1-border").setAttribute("color", "#a1a1a1");
	}
	if (document.getElementById("ajustes-input2-border") != null) {
		document.getElementById("ajustes-input2-border").setAttribute("color", "#a1a1a1");
	}
	if (document.getElementById("ajustes-input3-border") != null) {
		document.getElementById("ajustes-input3-border").setAttribute("color", "#a1a1a1");
	}
}

// Funcion para deseleccionar los inputs de los avatares (bordes)
function deseleccionarInputsAvatar() {
	if (document.getElementById("ajustes-inputavatar1-borde") != null) {
		document.getElementById("ajustes-inputavatar1-borde").setAttribute("color", "#a1a1a1");
	}
	if (document.getElementById("ajustes-inputavatar2-borde") != null) {
		document.getElementById("ajustes-inputavatar2-borde").setAttribute("color", "#a1a1a1");
	}
	if (document.getElementById("ajustes-inputavatar3-borde") != null) {
		document.getElementById("ajustes-inputavatar3-borde").setAttribute("color", "#a1a1a1");
	}
	if (document.getElementById("ajustes-inputavatar4-borde") != null) {
		document.getElementById("ajustes-inputavatar4-borde").setAttribute("color", "#a1a1a1");
	}
	if (document.getElementById("ajustes-inputavatar5-borde") != null) {
		document.getElementById("ajustes-inputavatar5-borde").setAttribute("color", "#a1a1a1");
	}
}

// Funcion para borrar el menu actual
function borrarMenuActual() {
	pantallaEditarPerfil = false;
	pantallaRegistrarse = false;
	if (document.getElementById("keyboard") != null) {
		document.getElementById("keyboard").remove();
	}
	const myNode = document.getElementById("menu-principal");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.lastChild);
	}
}

// Funcion para borrar todo el menu (incluido titulo y banner perfil)
function borrarMenuTodo() {
	if (document.getElementById("keyboard") != null) {
		document.getElementById("keyboard").remove();
	}
	if (document.getElementById("menu-principal-titulo-banner") != null) {
		document.getElementById("menu-principal-titulo-banner").remove();
	}
}

// Funciones que modifican la iluminacion simulando el dia y la noche
function luzDia() {
	document.getElementById("luz-foco").setAttribute("light", "intensity", "0.6");
	document.getElementById("luz-ambiente").setAttribute("light", "intensity", "0.7");
	document.getElementById("luz-suelo").setAttribute("light", "intensity", "0.4");
	document.getElementById("luz-sol").setAttribute("sun-position", "0.5 0.5 1");
}
function luzNoche() {
	document.getElementById("luz-foco").setAttribute("light", "intensity", "0");
	document.getElementById("luz-ambiente").setAttribute("light", "intensity", "0.2");
	document.getElementById("luz-suelo").setAttribute("light", "intensity", "0");
	document.getElementById("luz-sol").setAttribute("sun-position", "0.5 -1 1");
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES POST Y GET

// Funcion que solicita a la BD las pruebas
function peticionPruebas() {
	$.get("php/consult.php", {
		tabla: "prueba"
	})
		.done(function (data) {
			// Error con la conexion de la BD
			if (data == "errorBD") {
				var descr = "Imposible obtener las pruebas por un error ";
				descr += "con la base de datos. Estamos trabajando para solventarlo.";
				alert(descr);
			}
			// Peticion correcta
			else {
				pruebas = JSON.parse(data);
				peticionComponentes();
			}
		});
}

// Funcion que solicita a la BD todos los componentes
function peticionComponentes() {
	$.get("php/consult.php", {
		tabla: "componentes"
	})
		.done(function (data) {
			// Error con la conexion de la BD
			if (data == "errorBD") {
				crearMenuComponentes();
				var descr = "Imposible obtener los componentes\n por un error ";
				descr += "con la base de datos.\n Estamos trabajando para solventarlo.";
				alert(descr);
			}
			// Peticion correcta
			else {
				componentes = JSON.parse(data); // actualizar variable global
				loaded();
			}
		});
}

// Funcion que revisa si el usuario y la contraseña introducidos coinciden (en la BD)
function peticionLogin(user, pass) {
	$.get("php/login.php", {
		tabla: "usuario",
		username: user,
		password: pass,
		tipo: 0
	})
		.done(function (data) {
			// Error con la conexion de la BD
			if (data == "errorBD") {
				crearAviso("Error", "Conexión errónea con la base de datos.\n Estamos trabajando para solventarlo.", "red");
				borrarInputs();
			}
			// Usuario o contraseña incorrectos
			else if (data == "false") {
			}
			// Sesion iniciada
			else {
				var datos = JSON.parse(data)["usuario"];
				// Actualizar variables
				userInvitado = null;
				actualPassword = pass;
				setActualUsername(datos[0][0]);
				setActualAvatar(datos[0][2]);
				setActualTipoUsuario(datos[0][3]);
				// Modificar nombre y avatar
				document.getElementById("profileName").setAttribute("value", datos[0][0]);
				document.getElementById("profileAvatar").setAttribute("src", "#profileTexture" + datos[0][2]);

				estadisticas = JSON.parse(data)["estadisticas"];
			}
		});
}

// Funcion que revisa si hay credenciales guardadas en la session
function peticionSession() {
	$.get("php/login.php", {
		tabla: "session",
		tipo: 0
	})
		.done(function (data) {
			console.log(data);
			if (data == "conDatos") {
				peticionLogin(null, null);
			}
		});
}

// Funcion para cerrar la sesion actual
function peticionCerrarSesion() {
	$.get("php/login.php", {
		tabla: "cerrar_sesion",
		tipo: 0
	})
		.done(function (data) {
			crearAviso("Hecho", "Sesión cerrada con éxito.", "green");
			actualUsername = "";
			userInvitado = "Invitado";
			actualAvatar = 1;
			actualTipoUsuario = 0;
			document.getElementById("profileName").setAttribute("value", "Invitado");
			document.getElementById("profileAvatar").setAttribute("src", "#profileTexture1");

			if (pantallaEditarPerfil) mostrarEditarPerfil();
			else if (pantallaRegistrarse) mostrarRegistrarse();
		});
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES PARA CREAR OBJETOS DE MENUS
// Funcion que dibuja cada elemento del menu segun texto, width, height, posicion, escala(texto), animacion, funcion y repeat
function elementoMenu(texto, width, height, position, textScale, id, anim, click, repetir, dif) {
	var txtScale = new THREE.Vector3(textScale, textScale, textScale);
	var entity = document.createElement("a-entity");
	entity.setAttribute("id", id);
	entity.setAttribute("position", position);
	entity.setAttribute("onclick", click); //funcion en otro .js

	// Caja principal
	var main = document.createElement("a-box");
	setAttributes(main, { height: height, width: width, depth: "0.05", src: "#centerMenuTexture", repeat: repetir });
	if (anim) {
		main.setAttribute("highlight", "");
		main.setAttribute("hc-sound", "");
	}
	main.classList.add("raycastable");
	//main.setAttribute("shadow", "");

	// Texto
	if (text != "") { //si hay texto que añadir
		var text = document.createElement("a-text");
		setAttributes(text, { value: texto, position: "0 0.03 0.05", scale: txtScale });
		setAttributes(text, { align: "center", baseline: "center", color: "#1d521d" });
		text.setAttribute("font-open-sans", "");
	}
	if (dif != null) {
		var dificultad = document.createElement("a-text");
		var valor = "[Fácil]";
		var color = "green";
		if (dif == 2) {
			valor = "[Medio]";
			color = "#bf8217";
		}
		else if (dif == 3) {
			valor = "[Difícil]";
			color = "red";
		}
		setAttributes(dificultad, { value: valor, position: "0.83 0.01 0.05", scale: "0.28 0.28 0.28" });
		setAttributes(dificultad, { align: "right", baseline: "center", color: color });
		dificultad.setAttribute("font-open-sans", "");
	}

	// Animacion
	if (anim) {
		var txtScaleBig = new THREE.Vector3(textScale + 0.05, textScale + 0.05, textScale + 0.05);
		scBig = txtScaleBig.x + " " + txtScaleBig.y + " " + txtScaleBig.z;
		scSmall = txtScale.x + " " + txtScale.y + " " + txtScale.z;
		text.setAttribute("animation__big", "property: scale; to: " + scBig + "; dur: 200; startEvents: menuBiggerAnimation");
		text.setAttribute("animation__small", "property: scale; to: " + scSmall + "; dur: 200; startEvents: menuSmallerAnimation");
	}

	// Bordes
	var side1 = document.createElement("a-box");
	setAttributes(side1, { position: (-(width / parseFloat(2))) + " 0 0.005", height: height + 0.05, width: "0.02", depth: "0.06", src: "#sideMenuTexture" });
	var side2 = document.createElement("a-box");
	setAttributes(side2, { position: (width / parseFloat(2)) + " 0 0.005", height: height + 0.05, width: "0.02", depth: "0.06", src: "#sideMenuTexture" });
	var side3 = document.createElement("a-box");
	setAttributes(side3, { position: "0 " + (height / parseFloat(2)) + " 0", height: "0.02", width: width + 0.05, depth: "0.06", src: "#sideMenuTexture" });
	var side4 = document.createElement("a-box");
	setAttributes(side4, { position: "0 " + (-(height / parseFloat(2))) + " 0", height: "0.02", width: width + 0.05, depth: "0.06", src: "#sideMenuTexture" });

	if (text != "") main.appendChild(text);
	if (dif != null) main.appendChild(dificultad);
	entity.appendChild(main);
	entity.appendChild(side1);
	entity.appendChild(side2);
	entity.appendChild(side3);
	entity.appendChild(side4);
	document.getElementById("menu-principal").appendChild(entity);
}

// Funcion que crea el teclado
// https://github.com/supermedium/aframe-super-keyboard
function crearTeclado() {
	if (document.getElementById("keyboard") == null) { // Si no existe
		// Si hay algo escrito en el campo input, que salga en el teclado tambien
		var val = document.getElementById(inputId).getAttribute("value");
		// Crear teclado
		var kb = document.createElement("a-entity");
		kb.setAttribute("id", "keyboard");
		var atributos = "hand: " + kbRaycaster + "; imagePath:extras/keyboard-dist/; ";
		atributos += "show: true; maxLength: 12; value: " + val;
		kb.setAttribute("super-keyboard", atributos);
		kb.setAttribute("position", "0 1 -1.3");
		kb.setAttribute("rotation", "-30 0 0");
		kb.setAttribute("keyboard-functions", "");
		document.getElementById("escena").appendChild(kb);
	}
}

// Funcion que crea el banner del perfil actual
function crearBannerPerfil() {
	var caja1 = document.createElement("a-box");
	setAttributes(caja1, { position: "0.68 2.43 -2", class: "raycastable", color: "#407bcf", scale: "0.3 0.3 0.3", width: "1.5", height: "0.35", depth: "0.01", onclick: "crearAvisoBannerPerfil()" });
	caja1.setAttribute("hc-sound", "");
	caja1.setAttribute("highlight-azul", "");
	caja1.setAttribute("hc-sound", "");
	var caja2 = document.createElement("a-box");
	setAttributes(caja2, { position: "0 0 -0.01", class: "raycastable", color: "black", width: "1.53", height: "0.38", depth: "0.01", onclick: "crearAvisoBannerPerfil()" });
	caja2.setAttribute("hc-sound", "");
	//caja2.setAttribute("shadow", "");
	var avatar = document.createElement("a-plane");
	var img = "#profileTexture" + actualAvatar;
	setAttributes(avatar, { id: "profileAvatar", class: "raycastable", src: img, position: "-0.57 0 0.01", scale: "0.28 0.28 0.28", onclick: "crearAvisoBannerPerfil()" });
	avatar.setAttribute("hc-sound", "");
	var nombre = document.createElement("a-text");
	var name = actualUsername;
	if (name == "") name = userInvitado;
	setAttributes(nombre, { id: "profileName", position: "-0.35 0 0.03", scale: "0.7 0.7 0.7", value: name, color: "white" });
	caja1.appendChild(caja2);
	caja1.appendChild(avatar);
	caja1.appendChild(nombre);
	return caja1;
}

// Funcion que crea un aviso con un titulo y una descripcion
function crearAviso(tit, descr, color) {
	// Borrar aviso anterior (si aun existe)
	borrarAviso();

	// Plano, titulo y descripcion
	elementoMenu("", 0.8, 0.4, "0 1.5 -1.5", 0, "aviso", false, "", "1 1");
	var titulo = document.createElement("a-text");
	setAttributes(titulo, { position: "0 0.13 0.03", scale: "0.22 0.22 0.22", value: tit, color: color, align: "center" });
	titulo.setAttribute("font-open-sans", "");
	var descripcion = document.createElement("a-text");
	setAttributes(descripcion, { position: "0 0.03 0.03", scale: "0.18 0.18 0.18", value: descr, color: "black", align: "center" });
	descripcion.setAttribute("font-open-sans", "");

	// Boton inferior
	var botonOkay = document.createElement("a-rounded");
	setAttributes(botonOkay, { position: "0 -0.12 0.05", width: "0.18", height: "0.08", color: "#a8a8a8", radius: "0.02" })
	var plano2 = document.createElement("a-rounded");
	setAttributes(plano2, { position: "0 0 0.001", width: "0.17", height: "0.07", color: "#fff7bd", class: "raycastable", onclick: "borrarAviso()", radius: "0.02" });
	plano2.setAttribute("highlight-amarillo", "");
	plano2.setAttribute("hc-sound", "");
	var texto = document.createElement("a-text");
	setAttributes(texto, { position: "0 0.01 0", scale: "0.16 0.16 0.16", value: "Vale", color: "black", align: "center" });
	texto.setAttribute("font-open-sans", "");

	plano2.appendChild(texto);
	botonOkay.appendChild(plano2);

	// Append
	document.getElementById("aviso").appendChild(titulo);
	document.getElementById("aviso").appendChild(descripcion);
	document.getElementById("aviso").appendChild(botonOkay);
}

// Funcion que borra un aviso
function borrarAviso() {
	if (document.getElementById("aviso") != null) {
		document.getElementById("aviso").remove();
	}
}

// Funcion que crea el aviso al pulsar el banner del perfil
function crearAvisoBannerPerfil() {
	if (document.getElementById("aviso") != null) {
		document.getElementById("aviso").remove();
	}
	// Plano, titulo y descripcion
	elementoMenu("", 0.8, 0.4, "0 1.5 -1.5", 0, "aviso", false, "", "1 1");
	var descr = "Cuenta no registrada.\n Inicia sesión para guardar tu progreso.";
	var col = "#ff6929";
	if (actualUsername != "") { // Usuario registrado
		var tUser = ["Jugador", "D. Piezas", "D. Pruebas"];
		descr = "Cuenta registrada (" + tUser[actualTipoUsuario] + ").\n El progreso se guardará.";
		col = "green";
	}
	var titulo = document.createElement("a-text");
	var user = document.getElementById("profileName").getAttribute("value");
	setAttributes(titulo, { position: "0 0.15 0.03", scale: "0.22 0.22 0.22", value: "Perfil: " + user, color: col, align: "center" });
	titulo.setAttribute("font-open-sans", "");
	var descripcion = document.createElement("a-text");
	setAttributes(descripcion, { position: "0 0.03 0.03", scale: "0.18 0.18 0.18", value: descr, color: "black", align: "center" });
	descripcion.setAttribute("font-open-sans", "");

	// Avatar
	var avatar = document.createElement("a-plane");
	setAttributes(avatar, { id: "profileAvatar", src: "#profileTexture" + actualAvatar, position: "0.33 0.13 0.03", scale: "0.08 0.08 0.08" });

	// Boton inferior
	var click = "borrarAviso(); peticionCerrarSesion()";
	var txt = "Cerrar Sesión";
	if (actualUsername == "") { // Usuario registrado
		click = "mostrarAjustes(); mostrarIniciarSesion(); document.getElementById('ajustes-option2-border').setAttribute('color', 'black')";
		txt = "Iniciar Sesión";
	}
	var botonInf = document.createElement("a-rounded");
	setAttributes(botonInf, { position: "0 -0.12 0.03", width: "0.26", height: "0.08", color: "#7a7a7a", radius: "0.02" })
	var plano2 = document.createElement("a-rounded");
	setAttributes(plano2, { position: "0 0 0.001", width: "0.25", height: "0.07", color: "#fff7bd", class: "raycastable", onclick: click, radius: "0.02" });
	plano2.setAttribute("highlight-amarillo", "");
	plano2.setAttribute("hc-sound", "");
	var texto = document.createElement("a-text");
	setAttributes(texto, { position: "0 0.01 0", scale: "0.16 0.16 0.16", value: txt, color: "black", align: "center" });
	texto.setAttribute("font-open-sans", "");

	plano2.appendChild(texto);
	botonInf.appendChild(plano2);

	// Boton atras
	var botonAtr = document.createElement("a-plane");
	setAttributes(botonAtr, { position: "-0.31 0.14 0.03", width: "0.08", height: "0.05", src: "#backArrowTexture", color: "#fff7bd", class: "raycastable", onclick: "borrarAviso();" });
	botonAtr.setAttribute("highlight-amarillo", "");
	botonAtr.setAttribute("hc-sound", "");

	// Append
	document.getElementById("aviso").appendChild(titulo);
	document.getElementById("aviso").appendChild(descripcion);
	document.getElementById("aviso").appendChild(avatar);
	document.getElementById("aviso").appendChild(botonInf);
	document.getElementById("aviso").appendChild(botonAtr);
}

// Funcion que crea/elimina el menu de musica
function menuMusica(porcentaje) {
	// Borrar si ya existe
	if (document.getElementById("menu-musica") != null) {
		document.getElementById("menu-musica").remove();
		return;
	}

	// Coordenadas mundo de la camara
    var cameraEl = document.querySelector('#tracker-cam');
    var cameraPos = new THREE.Vector3();
    cameraPos.setFromMatrixPosition(cameraEl.object3D.matrixWorld);

	// Entidad y texto
	var entidad = document.createElement("a-entity");
	setAttributes(entidad, {id: "menu-musica", "position": cameraPos, "scale": "0.8 0.8 0.8"});
	entidad.setAttribute("look-at", "#camara");
	var texto = document.createElement("a-text");
	setAttributes(texto, { position: "0 0.2 0", rotation: "0 0 0", value: "Música" });
	setAttributes(texto, { align: "center", scale: "0.5 0.5 0.5", color: "black" });
	texto.setAttribute("font-open-sans", "");
	var info = document.createElement("a-text");
	var val = "Pulsa el botón Y para ocultar este menú";
	setAttributes(info, { position: "0 -0.24 0", rotation: "0 0 0", value: val });
	setAttributes(info, { align: "center", scale: "0.18 0.18 0.18", color: "black" });
	info.setAttribute("font-open-sans", "");

	// Contenedor
	var cont = document.createElement("a-gui-flex-container");
	setAttributes(cont, { id: "gui-container", opacity: "0.95", width: "1.6", height: "0.6" });
	setAttributes(cont, { position: "0 0 0", rotation: "0 0 0", class:"raycastable" });
	cont.setAttribute("flex-direction", "column");
	cont.setAttribute("justify-content", "flexEnd");
	cont.setAttribute("align-items", "normal");
	cont.setAttribute("component-padding", "0.1");
	cont.setAttribute("panel-color", "#b5d1ff");
	cont.setAttribute("panel-rounded", "0.05");

	// Slider
	var sl = document.createElement("a-gui-slider");
	setAttributes(sl, { id: "slider", class: "raycastable", width: "2.5", height: "0.3" });
	setAttributes(sl, { onclick: "slideActionFunction", percent: porcentaje });
	setAttributes(sl, { margin: "0 0 0.1 0", scale: "0.5 0.5 0.5", position: "0 -0.5 0" });
	sl.setAttribute("handle-outer-radius", "0.06");
	sl.setAttribute("handle-inner-radius", "0.04");
	sl.setAttribute("background-color", "#abacff");
	sl.setAttribute("active-color", "#fa341e");

	// Appends
	cont.appendChild(sl);
	entidad.appendChild(texto);
	entidad.appendChild(cont);
	entidad.appendChild(info);
	document.getElementById("esc-dinamico").appendChild(entidad);
}

// Funcion que se ejecuta al cambiar el volumen de la musica
function slideActionFunction(click, percent) {
	document.querySelector("#click-sound").play();
	volumenMusica = percent;

	var musica = document.querySelector("#background-music");
	if (volumenMusica < 0.005) {
		musica.pause();
	}
	else {
		if (musica.paused) musica.play();
		musica.volume = volumenMusica;
	}
}

/* ---------------------------------------------------------------------------- */

// GETTERS Y SETTERS
function setKbRaycaster(kbrc) {
	kbRaycaster = kbrc;
}
function getKbRaycaster() {
	return kbRaycaster;
}

function setActualUsername(user) {
	actualUsername = user;
}
function getActualUsername() {
	return actualUsername;
}

function setInputId(ipid) {
	inputId = ipid;
}
function getInputId() {
	return inputId;
}

function setActualAvatar(id) {
	actualAvatar = id;
}
function getActualAvatar() {
	return actualAvatar;
}

function setActualTipoUsuario(tipoUser) {
	actualTipoUsuario = tipoUser;
}
function getActualTipoUsuario() {
	return actualTipoUsuario;
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES AUXILIARES

// Funcion auxiliar para añadir mas de 1 atributo a la vez (a un mismo elemento)
// https://stackoverflow.com/questions/12274748/setting-multiple-attributes-for-an-element-at-once-with-javascript
function setAttributes(el, attrs) {
	for (var key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
}

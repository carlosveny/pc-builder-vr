/*
    Fichero que gestiona el apartado de ajustes del menu principal y la
    conexion con el back-end del servidor
*/

// VARIABLES GLOBALES
var provisionalAvatar = 1; //1-5. Solo es para el menu de seleccion de avatares
var pantallaEditarPerfil = false;
var pantallaRegistrarse = false;

// Funcion que muestra el menu de Ajustes
function mostrarAjustes() {
    borrarMenuActual();
    elementoMenu("", 1.6, 1.3, "0 1.6 -1.8", 0, "menu-ajustes", false, "", "1 5");

    // Titulo
    var textTitulo = document.createElement("a-text");
    setAttributes(textTitulo, { position: "0 0.58 0.05", scale: "0.35 0.35 0.35", value: "Ajustes", color: "black", align: "center" });
    textTitulo.setAttribute("font-open-sans", "");

    // Botones
    var botonAtras = crearBotonAtras();
    var boton1 = crearBotonAjustes("ajustes-option1-border", "-0.4 0.4 0.03", 0.5, "Registrarse", "mostrarRegistrarse()");
    var boton2 = crearBotonAjustes("ajustes-option2-border", "0.4 0.4 0.03", 0.5, "Iniciar Sesión", "mostrarIniciarSesion()");
    var boton3 = crearBotonAjustes("ajustes-option3-border", "-0.4 0.2 0.03", 0.5, "Editar perfil", "mostrarEditarPerfil()");
    var boton4 = crearBotonAjustes("ajustes-option4-border", "0.4 0.2 0.03", 0.5, "Información", "mostrarInformacion()");

    // Linea divisoria
    var linea = document.createElement("a-plane");
    setAttributes(linea, { position: "0 0.05 0.05", width: "1.4", height: "0.005", color: "black" });

    // Entidad para mostrar la informacion de cada uno de los botones
    var ajustesDisplay = document.createElement("a-entity");
    ajustesDisplay.setAttribute("id", "menu-ajustes-display");

    // Append
    document.getElementById("menu-ajustes").appendChild(textTitulo);
    document.getElementById("menu-ajustes").appendChild(botonAtras);
    document.getElementById("menu-ajustes").appendChild(boton1);
    document.getElementById("menu-ajustes").appendChild(boton2);
    document.getElementById("menu-ajustes").appendChild(boton3);
    document.getElementById("menu-ajustes").appendChild(boton4);
    document.getElementById("menu-ajustes").appendChild(linea);
    document.getElementById("menu-ajustes").appendChild(ajustesDisplay);
}

// Funcion que muestra el contenido de la opcion "Registrarse"
function mostrarRegistrarse() {
    borrarDisplay("menu-ajustes-display");
    pantallaRegistrarse = true;
    // Si ya hay una sesion iniciada
    if (getActualUsername() != "") {
        var text = document.createElement("a-text");
        var valor = "Aviso: Ya hay una sesión iniciada. Pulsa en el banner\n superior del perfil para cerrar la sesión actual";
        setAttributes(text, { position: "0 -0.06 0.03", scale: "0.3 0.3 0.3", value: valor, color: "red", align: "center" });
        text.setAttribute("wrap-count", "60");
        text.setAttribute("font-open-sans", "");
        document.getElementById("menu-ajustes-display").appendChild(text);
        return;
    }
    var user = crearOpcionInput("-0.1 -0.05 0.05", "Nombre de usuario:", "ajustes-input1");
    var pass1 = crearOpcionInput("-0.1 -0.2 0.05", "Contraseña:", "ajustes-input2");
    var pass2 = crearOpcionInput("-0.1 -0.35 0.05", "Repetir contraseña:", "ajustes-input3");
    var botReg = crearBotonInferior("Registrarse", "botonRegistrarse()");
    document.getElementById("menu-ajustes-display").appendChild(user);
    document.getElementById("menu-ajustes-display").appendChild(pass1);
    document.getElementById("menu-ajustes-display").appendChild(pass2);
    document.getElementById("menu-ajustes-display").appendChild(botReg);
}

// Funcion que muestra el contenido de la opcion "Iniciar Sesion"
function mostrarIniciarSesion() {
    borrarDisplay("menu-ajustes-display");
    // Si ya hay una sesion iniciada
    if (getActualUsername() != "") {
        var text = document.createElement("a-text");
        var valor = "Aviso: Ya hay una sesión iniciada. Pulsa en el banner\n superior del perfil para cerrar la sesión actual";
        setAttributes(text, { position: "0 -0.06 0.03", scale: "0.3 0.3 0.3", value: valor, color: "red", align: "center" });
        text.setAttribute("wrap-count", "60");
        text.setAttribute("font-open-sans", "");
        document.getElementById("menu-ajustes-display").appendChild(text);
        return;
    }
    var user = crearOpcionInput("-0.1 -0.1 0.05", "Nombre de usuario:", "ajustes-input1");
    var pass = crearOpcionInput("-0.1 -0.25 0.05", "Contraseña:", "ajustes-input2");
    var botReg = crearBotonInferior("Acceder", "botonAcceder()");
    document.getElementById("menu-ajustes-display").appendChild(user);
    document.getElementById("menu-ajustes-display").appendChild(pass);
    document.getElementById("menu-ajustes-display").appendChild(botReg);
}

// Funcion que muestra el contenido de la opcion "Editar perfil"
function mostrarEditarPerfil() {
    borrarDisplay("menu-ajustes-display");
    pantallaEditarPerfil = true; // para actualizarse al cerrar sesion
    // No hay sesion iniciada
    if (getActualUsername() == "") {
        var text = document.createElement("a-text");
        var valor = "Aviso: No has iniciado sesión. Los cambios se perderán al salir del juego.";
        setAttributes(text, { position: "0 0.01 0.03", scale: "0.25 0.25 0.25", value: valor, color: "red", align: "center" });
        text.setAttribute("wrap-count", "60");
        text.setAttribute("font-open-sans", "");
        document.getElementById("menu-ajustes-display").appendChild(text);
    }
    // Nuevo nombre de usuario
    var user = crearOpcionInput("-0.1 -0.1 0.03", "Nuevo nombre de usuario:", "ajustes-input1");
    document.getElementById("menu-ajustes-display").appendChild(user);
    document.getElementById("ajustes-input1").setAttribute("value", document.getElementById("profileName").getAttribute("value"));

    // Seleccion de avatares
    provisionalAvatar = getActualAvatar();
    var titAvatar = document.createElement("a-text");
    setAttributes(titAvatar, { position: "0 -0.22 0.03", scale: "0.22 0.22 0.22", value: "Nuevo avatar", color: "black", align: "center" });
    titAvatar.setAttribute("font-open-sans", "");
    document.getElementById("menu-ajustes-display").appendChild(titAvatar);
    // Los roles de diseñador de pruebas y piezas no pueden cambiar su avatar
    if (getActualTipoUsuario() != 0) {
        var text = document.createElement("a-text");
        var valor = "Aviso: Los roles 'D. Pruebas' y 'D.Piezas' no pueden cambiar su avatar.";
        setAttributes(text, { position: "0 -0.31 0.03", scale: "0.27 0.27 0.27", value: valor, color: "red", align: "center" });
        text.setAttribute("wrap-count", "60");
        text.setAttribute("font-open-sans", "");
        document.getElementById("menu-ajustes-display").appendChild(text);
    }
    else {
        var avatar1 = crearAvatarInput("-0.5 -0.35 0.03", "ajustes-inputavatar1-borde", 1);
        var avatar2 = crearAvatarInput("-0.25 -0.35 0.03", "ajustes-inputavatar2-borde", 2);
        var avatar3 = crearAvatarInput("0 -0.35 0.03", "ajustes-inputavatar3-borde", 3);
        var avatar4 = crearAvatarInput("0.25 -0.35 0.03", "ajustes-inputavatar4-borde", 4);
        var avatar5 = crearAvatarInput("0.5 -0.35 0.03", "ajustes-inputavatar5-borde", 5);
        document.getElementById("menu-ajustes-display").appendChild(avatar1);
        document.getElementById("menu-ajustes-display").appendChild(avatar2);
        document.getElementById("menu-ajustes-display").appendChild(avatar3);
        document.getElementById("menu-ajustes-display").appendChild(avatar4);
        document.getElementById("menu-ajustes-display").appendChild(avatar5);
    }

    // Boton guardar
    var botGuardar = crearBotonInferior("Guardar", "botonGuardarPerfil()");
    document.getElementById("menu-ajustes-display").appendChild(botGuardar);
}

// Funcion que muestra el contenido de la opcion "Informacion"
function mostrarInformacion() {
    borrarDisplay("menu-ajustes-display");
    // Texto inicial
    var texto = document.createElement("a-text");
    var txt = "PC Builder VR, un juego desarrollado para entornos web usando A-Frame.\n\n";
    txt += "Este juego forma parte de un Trabajo de Fin de Grado de la Universitat ";
    txt += "de les Illes Balears, con el soporte del departamento de LTIM."
    txt += "\n\nDesarrollador:";
    setAttributes(texto, {position: "0 -0.14 0.03", scale: "0.28 0.28 0.28"});
    setAttributes(texto, {value: txt, color: "black", align: "center"});
    texto.setAttribute("wrap-count", "60");
    texto.setAttribute("font-open-sans", "");

    // Imagen
    var img = document.createElement("a-plane");
    setAttributes(img, {position: "-0.18 -0.47 0.03", width: "0.22", height: "0.22"});
    setAttributes(img, {src: "#profileTexture0"});

    // Nombre
    var nombre = document.createElement("a-text");
    txt = "Carlos Veny Carmona";
    setAttributes(nombre, {position: "0 -0.4 0.03", scale: "0.2 0.2 0.2"});
    setAttributes(nombre, {value: txt, color: "black", align: "left"});
    nombre.setAttribute("font-open-sans", "");

    // Linkedin
    var link = document.createElement("a-text");
    txt = "Linkedin";
    setAttributes(link, {position: "0.08 -0.48 0.03", scale: "0.18 0.18 0.18"});
    setAttributes(link, {value: txt, color: "blue", align: "center", class: "raycastable"});
    setAttributes(link, {geometry: "primitive:plane; height: 0.3", onclick:"redirectLinkedin()"});
    link.setAttribute("material", "opacity: 0.0; transparent: true");
    link.setAttribute("font-open-sans", "");

    document.getElementById("menu-ajustes-display").appendChild(texto);
    document.getElementById("menu-ajustes-display").appendChild(img);
    document.getElementById("menu-ajustes-display").appendChild(nombre);
    document.getElementById("menu-ajustes-display").appendChild(link);
}

// Funcion que borra el contenido del display especificado (debajo de la linea divisoria)
function borrarDisplay(disp) {
    pantallaRegistrarse = false;
    pantallaEditarPerfil = false;
    const myNode = document.getElementById(disp);
    if (myNode == null) return;
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
}

// Funcion que deja en blanco los campos de los inputs
function borrarInputs() {
    if (document.getElementById("ajustes-input1") != null) {
        document.getElementById("ajustes-input1").setAttribute("value", "");
    }
    if (document.getElementById("ajustes-input2") != null) {
        document.getElementById("ajustes-input2").setAttribute("value", "");
    }
    if (document.getElementById("ajustes-input3") != null) {
        document.getElementById("ajustes-input3").setAttribute("value", "");
    }
}

// Funcion que se ejecuta al registrarse (los datos ya se han introducido)
function botonRegistrarse() {
    var username = document.getElementById("ajustes-input1").getAttribute("value");
    var password1 = document.getElementById("ajustes-input2").getAttribute("value");
    var password2 = document.getElementById("ajustes-input3").getAttribute("value");
    // Revisar que haya algo escrito
    if ((username == "") || (password1 == "") || (password2 == "")) {
        crearAviso("Error", "El usuario y la contraseña\ndeben tener más de 1 carácter.", "red");
        borrarInputs();
        return;
    }
    // Revisar que no haya espacios
    if ((username.indexOf(' ') > -1) || (password1.indexOf(' ') > -1)) {
        crearAviso("Error", "No puede haber espacios\n ni en el usuario ni en la contraseña.", "red");
        borrarInputs();
        return;
    }
    // Revisar que no se excedan los 12 caracteres
    if (username.length > 12) {
        crearAviso("Error", "El nombre de usuario puede tener\n como máximo 12 carácteres.", "red");
        borrarInputs();
        return;
    }
    // Revisar contraseñas iguales
    if (password1 != password2) {
        crearAviso("Error", "Las contraseñas introducidas no\n coinciden.", "red");
        borrarInputs();
        return;
    }
    enviarPeticionRegistrarse(username, password1);
}

// Funcion que se ejecuta al iniciar sesion (los datos ya se han introducido)
function botonAcceder() {
    var username = document.getElementById("ajustes-input1").getAttribute("value");
    var password = document.getElementById("ajustes-input2").getAttribute("value");
    // Revisar que haya algo escrito
    if ((username == "") || (password == "")) {
        crearAviso("Error", "El usuario y la contraseña\n deben tener más de 1 carácter.", "red");
        borrarInputs();
        return;
    }
    enviarPeticionIniciarSesion(username, password);
}

function botonGuardarPerfil() {
    var user = document.getElementById("ajustes-input1").getAttribute("value");
    // Revisar que haya algo escrito
    if (user == "") {
        crearAviso("Error", "El nombre de usuario debe\n tener más de 1 carácter.", "red");
        borrarInputs();
        return;
    }
    // Revisar que no haya espacios
    if (user.indexOf(' ') > -1) {
        crearAviso("Error", "No puede haber espacios\n en el nombre de usuario.", "red");
        borrarInputs();
        return;
    }
    // Revisar que no se excedan los 12 caracteres
    if (user.length > 12) {
        crearAviso("Error", "El nombre de usuario puede tener\n como máximo 12 carácteres.", "red");
        borrarInputs();
        return;
    }

    // Modificar valores y hacer la peticion a la BD
    if (getActualUsername() != "") { // Usuario registrado
        enviarPeticionEditarPerfil(user, provisionalAvatar);
    }
    else { // Usuario no registrado
        userInvitado = user;
        document.getElementById("profileName").setAttribute("value", user);
        document.getElementById("profileAvatar").setAttribute("src", "#profileTexture" + provisionalAvatar);
        setActualAvatar(provisionalAvatar);
        crearAviso("Hecho", "Perfil actualizado con éxito.", "green");
        borrarDisplay("menu-ajustes-display");
        document.getElementById("ajustes-option3-border").setAttribute("color", "#a8a8a8"); // reset borde negro
    }
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES POST Y GET
// Funcion que envia a la BD una peticion de añadir un nuevo usuario
function enviarPeticionRegistrarse(user, pass) {
    $.post("php/insert.php", {
        tabla: "usuario",
        username: user,
        password: pass,
        idAvatar: 1,
        tipoUsuario: 0
    })
        .done(function (data) {
            // Error con la conexion de la BD
            if (data == "errorBD") {
                crearAviso("Error", "Conexión errónea con la base de datos.\n Estamos trabajando para solventarlo.", "red");
                borrarInputs();
            }
            // Usuario ya existe
            else if (data == "false") {
                crearAviso("Error", "El usuario ya existe.\n Intenta iniciar sesión con tu cuenta.", "red");
                borrarInputs();
            }
            else {
                crearAviso("Hecho", "Usuario registrado con éxito.\n Sesión iniciada con tu nueva cuenta.", "green");
                // Actualizar variables
                setActualUsername(user);
                setActualAvatar(1);
                setActualTipoUsuario(0);
                // Modificar nombre
                document.getElementById("profileName").setAttribute("value", user);
                borrarDisplay("menu-ajustes-display");
                document.getElementById("ajustes-option1-border").setAttribute("color", "#a8a8a8"); // reset borde negro
            }
        });
}

// Funcion que revisa si el usuario y la contraseña introducidos coinciden (en la BD)
function enviarPeticionIniciarSesion(user, pass) {
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
                crearAviso("Error", "El usuario o la contraseña no son\n correctos.", "red");
                borrarInputs();
            }
            // Sesion iniciada
            else {
                var datos = JSON.parse(data)["usuario"];
                crearAviso("Bienvenido, " + user, "Sesión iniciada con éxito.", "green");
                // Actualizar variables
                userInvitado = null;
                actualPassword = pass;
                setActualUsername(datos[0][0]);
                setActualAvatar(datos[0][2]);
                setActualTipoUsuario(datos[0][3]);
                // Modificar nombre y avatar
                document.getElementById("profileName").setAttribute("value", datos[0][0]);
                document.getElementById("profileAvatar").setAttribute("src", "#profileTexture" + datos[0][2]);
                borrarDisplay("menu-ajustes-display");
                document.getElementById("ajustes-option2-border").setAttribute("color", "#a8a8a8"); // reset borde negro

                estadisticas = JSON.parse(data)["estadisticas"];
                console.log(estadisticas);
            }
        });
}

// Funcion que realiza una modificacion en el nombre de usuario y en el avatar
function enviarPeticionEditarPerfil(user, av) {
    $.post("php/updateUser.php", {
        oldUsername: getActualUsername(),
        newUsername: user,
        password: actualPassword,
        idAvatar: av
    })
        .done(function (data) {
            console.log(data);
            // Error con la conexion de la BD
            if (data == "errorBD") {
                crearAviso("Error", "Conexión errónea con la base de datos.\n Estamos trabajando para solventarlo.", "red");
                mostrarEditarPerfil();
            }
            // Credenciales incorrectas (por si alguien accede por consola)
            else if (data == "errorCredenciales") {
                crearAviso("Error", "El usuario o la contraseña no son\n correctos.", "red");
                mostrarEditarPerfil();
            }
            // Ya existe el nuevo nombre de usuario
            else if (data == "existe") {
                crearAviso("Error", "El nombre de usuario ya existe.", "red");
                mostrarEditarPerfil();
            }
            // Cambios realizados con exito
            else {
                // Actualizar campos y variables
                document.getElementById("profileName").setAttribute("value", user);
                document.getElementById("profileAvatar").setAttribute("src", "#profileTexture" + av);
                setActualUsername(user);
                setActualAvatar(av);

                // Mostrar aviso
                crearAviso("Hecho", "Perfil actualizado con éxito.", "green");
                borrarDisplay("menu-ajustes-display");
                document.getElementById("ajustes-option3-border").setAttribute("color", "#a8a8a8"); // reset borde negro
            }
        });
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES PARA CREAR OBJETOS DE MENUS

function crearBotonAtras() {
    var plano1 = document.createElement("a-rounded");
    setAttributes(plano1, { position: "-0.63 0.55 0.03", width: "0.21", height: "0.11", color: "#7a7a7a", radius: "0.02" })
    var plano2 = document.createElement("a-rounded");
    setAttributes(plano2, { position: "0 0 0.001", width: "0.2", height: "0.1", color: "#fff7bd", class: "raycastable", onclick: "borrarMenuActual(); loadMenuPrincipal()", radius: "0.02" });
    plano2.setAttribute("highlight-amarillo", "");
    plano2.setAttribute("hc-sound", "");
    var texto = document.createElement("a-text");
    setAttributes(texto, { position: "0 0.01 0", scale: "0.18 0.18 0.18", value: "Atrás", color: "black", align: "center" });
    texto.setAttribute("font-open-sans", "");

    plano2.appendChild(texto);
    plano1.appendChild(plano2);
    return plano1;
}

function crearBotonAjustes(id, posPlano1, width, text, click) {
    var plano1 = document.createElement("a-rounded");
    setAttributes(plano1, { id: id, position: posPlano1, width: width + 0.01, height: "0.12", color: "#a8a8a8", radius: "0.04" })
    var plano2 = document.createElement("a-rounded");
    setAttributes(plano2, { position: "0 0 0.001", width: width, height: "0.11", color: "#caffc2", class: "raycastable", onclick: click, radius: "0.04" });
    plano2.setAttribute("highlight-verde", "");
    plano2.setAttribute("hc-sound", "");
    var texto = document.createElement("a-text");
    setAttributes(texto, { position: "0 0.015 0", scale: "0.23 0.23 0.23", value: text, color: "black", align: "center" });
    texto.setAttribute("font-open-sans", "");

    plano2.appendChild(texto);
    plano1.appendChild(plano2);
    return plano1;
}

function crearOpcionInput(posicion, text, id) {
    var texto1 = document.createElement("a-text");
    setAttributes(texto1, { position: posicion, scale: "0.2 0.2 0.2", value: text, color: "black", align: "right" });
    texto1.setAttribute("font-open-sans", "");
    var plano1 = document.createElement("a-plane");
    setAttributes(plano1, { id: (id + "-border"), position: "1.7 -0.05 0", width: "2.53", height: "0.33", color: "#a1a1a1" });
    var plano2 = document.createElement("a-plane");
    setAttributes(plano2, { position: "0 0 0.001", width: "2.5", height: "0.3", color: "#ededed", class: "raycastable", onclick: "inputTeclado('" + id + "')" });
    plano2.setAttribute("highlight-gris", "");
    plano2.setAttribute("hc-sound", "");
    var texto2 = document.createElement("a-text");
    setAttributes(texto2, { id: id, position: "-1.15 0 0", scale: "0.9 0.9 0.9", value: "", color: "black" });

    plano2.appendChild(texto2);
    plano1.appendChild(plano2);
    texto1.appendChild(plano1);
    return texto1;
}

function crearBotonInferior(text, click) {
    var plano1 = document.createElement("a-rounded");
    setAttributes(plano1, { position: "0 -0.53 0.03", width: "0.415", height: "0.135", color: "#7a7a7a", radius: "0.02" })
    var plano2 = document.createElement("a-rounded");
    setAttributes(plano2, { position: "0 0 0.001", width: "0.4", height: "0.12", color: "#fff7bd", class: "raycastable", onclick: click, radius: "0.02" });
    plano2.setAttribute("highlight-amarillo", "");
    plano2.setAttribute("hc-sound", "");
    var texto = document.createElement("a-text");
    setAttributes(texto, { position: "0 0.015 0", scale: "0.25 0.25 0.25", value: text, color: "black", align: "center" });
    texto.setAttribute("font-open-sans", "");

    plano2.appendChild(texto);
    plano1.appendChild(plano2);
    return plano1;
}

// Funcion que crea un avatar seleccionable dada la posicion, el identificador del avatar y el numero del avatar(1-5)
function crearAvatarInput(pos, id, num) {
    var plano1 = document.createElement("a-plane");
    // Pintar el borde negro si es el avatar actual
    if (provisionalAvatar == num) {
        setAttributes(plano1, { id: id, position: pos, width: "0.125", height: "0.125", color: "black" });
    }
    else {
        setAttributes(plano1, { id: id, position: pos, width: "0.125", height: "0.125", color: "#a8a8a8" })
    }
    var plano2 = document.createElement("a-plane");
    setAttributes(plano2, { position: "0 0 0.001", width: "0.12", height: "0.12", src: "#profileTexture" + num, class: "raycastable", onclick: "provisionalAvatar=" + num });
    plano2.setAttribute("highlight-avatar", "");
    plano2.setAttribute("hc-sound", "");
    plano1.appendChild(plano2);
    return plano1;
}


/* ---------------------------------------------------------------------------- */

// FUNCIONES AUXILIARES

// Funcion que redirige a linkedin
function redirectLinkedin() {
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl.is('vr-mode')) sceneEl.exitVR();
    window.open(
        'https://www.linkedin.com/in/carlos-veny-carmona/','_blank'
    );
}
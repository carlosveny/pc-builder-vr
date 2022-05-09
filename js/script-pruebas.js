/*
    Fichero que se encarga de gestionar la interfaz de todas
    las pruebas que hay en la base de datos. Permite introducir,
    editar y eliminar pruebas. Tambien se pueden gestionar las tareas
    de cada una de las pruebas.
*/

// VARIABLES GLOBALES
var pruebas; // objeto que contiene todas las pruebas
var pruebaActual; // objeto que contiene la prueba actual
var tareas; // objeto que contiene todas las tareas indexadas por pruebas
var socketMBCPU; // array de todos los sockets de placa base que hay en la BD
var socketCPU; // array de todos los sockets de cpu que hay en la BD
var username = null;
var password = null;
var accion = null // introducido/actualizado

// Funcion que se ejecuta cuando se carga la pagina
function loaded() {
    $("#username").val("");
    $("#password").val("");
    $("#boton-n").css("display", "none");
    $("#boton-s").css("display", "none");

    peticionSession();
}

// Funcion que borra la ventana actual
function cerrarVentana(botonCerrar) {
    botonCerrar.parentElement.parentElement.remove();
    accion = null;
}

// Funcion que desplaza la ventana arriba o abajo segun el navbar collapsed
function moverVentanaAbajo(toggler) {
    var elements = document.getElementsByClassName("centered-dialog");
    if (toggler.getAttribute("aria-expanded") == "true") {
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.top = 'calc(24vh)';
        }
    }
    else {
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.top = 'calc(10vh)';
        }
    }
}

// Funcion que se ejecuta al modificar un campo y que activa el boton "Introducir"
// cuando todos los campos estan llenos
function revisarCamposVacios() {
    // Actualizar descripcion de las 3 tareas de almacenamiento
    var descr0 = $("#inp-valor1-0").val();
    var descr1 = $("#inp-valor1-1").val();
    var descr2 = $("#inp-valor1-2").val();
    $("#inp-descripcion-0").val("Memoria RAM mínima: " + descr0 + " GB");
    $("#inp-descripcion-1").val("Memoria HDD mínima: " + descr1 + " GB");
    $("#inp-descripcion-2").val("Memoria SSD mínima: " + descr2 + " GB");

    // Revisar si hay algun campo vacio
    var vacios = false;
    if ($("#inp-nombre").val() == "" && !vacios) vacios = true;
    if ($("#inp-descripcion").val() == "" && !vacios) vacios = true;
    if ($('#inp-dificultad').find(":selected").val() == "default" && !vacios) vacios = true;
    // Revisar los campos de cada tarea
    var nTareas = document.getElementById("contenedor-tareas").children.length;
    for (var i = 0; i < nTareas; i++) {
        if ($("#inp-descripcion-" + i).val() == "" && !vacios) vacios = true;
        if ($('#inp-tipo-' + i).find(":selected").val() == "default" && !vacios) vacios = true;
        if ($('#inp-atributo-' + i).find(":selected").val() == "default" && !vacios) vacios = true;
        if ($('#inp-accion-' + i).find(":selected").val() == "default" && !vacios) vacios = true;
        if ($('#inp-valor1-' + i).is("select")) {
            if ($('#inp-valor1-' + i).find(":selected").val() == "default" && !vacios) vacios = true;
        }
        else {
            if ($('#inp-valor1-' + i).val() == "" && !vacios) vacios = true;
        }
        if (document.getElementById("inp-valor2" + i) != null) {
            if ($('#inp-valor2-' + i).val() == "" && !vacios) vacios = true;
        }
    }

    // Activar o desactivar los botones "Guardar/Introducir" y "Validar"
    if (vacios) {
        $("#bt-guardar").prop("disabled", true);
        $("#bt-validar").prop("disabled", true);
    }
    else {
        $("#bt-guardar").prop("disabled", false);
        if (document.getElementById("contenedor-tareas").children.length > 3) {
            $("#bt-validar").prop("disabled", false);
        }
        else $("#bt-validar").prop("disabled", true);
        console.log("Todo lleno");
    }
}

// Funcion que rellena los campos de input con la prueba dada
function rellenarInputs(prueba_id) {
    accion = "actualizado";
    var prueba = getPruebaFromID(prueba_id); // obtener prueba

    // Campos normales
    $("#inp-nombre").attr("title", prueba[0]);
    $("#inp-nombre").val(prueba[1]);
    $("#inp-descripcion").val(prueba[2]);
    $('#inp-dificultad').find(":selected").removeAttr('selected');
    $('#inp-dificultad').val(prueba[3]);

    // Tareas
    var tar = tareas[prueba_id.replace("prueba-", "")];
    for (var i = 0; i < tar.length; i++) {
        if (tar[i][3] == 0) continue; // la del tutorial (Monta un ordenador...)
        $("#inp-descripcion-" + i).val(tar[i][1]);
        $('#inp-tipo-' + i).find(":selected").removeAttr('selected');
        $('#inp-tipo-' + i).val(tar[i][8]);
        actualizarAtributos(tar[i][8], i);
        $('#inp-atributo-' + i).find(":selected").removeAttr('selected');
        $('#inp-atributo-' + i).val(tar[i][3]);
        actualizarValores(tar[i][8], tar[i][3], i);
        $('#inp-accion-' + i).find(":selected").removeAttr('selected');
        $('#inp-accion-' + i).val(tar[i][4]);
        actualizarValor2(tar[i][4], i);
        $('#inp-valor1-' + i).val(tar[i][5]);
        if (tar[i][4] == "BETWEEN") {
            $('#inp-valor2-' + i).val(tar[i][6]);
        }
    }

    // Actualizar boton eliminar
    $('#bt-eliminar').attr("onclick", "botonEliminar('" + prueba[0] + "')");
}

// Funcion que elimina una tarea y actualiza los ids de todas
function eliminarTarea(numTarea) {
    document.getElementById("tarea-" + numTarea).remove();
    var tareasActuales = document.getElementById("contenedor-tareas").children;
    for (var i = 0; i < tareasActuales.length; i++) {
        var iAntiguo = tareasActuales[i].getAttribute("id").replace("tarea-", "");
        $('#tarea-' + iAntiguo).attr("id", "tarea-" + i);
        $('#inp-titulo-' + iAntiguo).html("Tarea " + (i + 1));
        $('#inp-titulo-' + iAntiguo).attr("id", "inp-titulo-" + i);
        $('#inp-descripcion-' + iAntiguo).attr("id", "inp-descripcion-" + i);
        $('#inp-tipo-' + iAntiguo).attr("id", "inp-tipo-" + i);
        $('#inp-atributo-' + iAntiguo).attr("id", "inp-atributo-" + i);
        $('#inp-accion-' + iAntiguo).attr("id", "inp-accion-" + i);
        $('#contenedor-valor1-' + iAntiguo).attr("id", "contenedor-valor1-" + i);
        $('#inp-valor1-' + iAntiguo).attr("id", "inp-valor1-" + i);
        $('#contenedor-valor2-' + iAntiguo).attr("id", "contenedor-valor2-" + i);
        if (document.getElementById("inp-valor2-" + iAntiguo) != null) {
            $('#inp-valor2-' + iAntiguo).attr("id", "inp-valor2-" + i);
        }
        if (document.getElementById("inp-eliminar-" + iAntiguo) != null) {
            $('#inp-eliminar-' + iAntiguo).attr("onclick", "eliminarTarea('" + i + "')");
            $('#inp-eliminar-' + iAntiguo).attr("id", "inp-eliminar-" + i);
        }
    }
    // Actualizar boton Validar
    if (document.getElementById("contenedor-tareas").children.length > 3) {
        document.getElementById("bt-validar").removeAttribute("disabled");
    }
    else document.getElementById("bt-validar").setAttribute("disabled", "");

    revisarCamposVacios();
}

// Funcion que muestra la ventana para aceptar o rechazar la eliminacion de la prueba
function botonEliminar(prueba_id) {
    // Es el tutorial (no se tiene que poder borrar)
    if (prueba_id == "prueba-0") {
        var descr = "El tutorial no se puede eliminar.";
        crearAviso("alert-danger", "Error", descr, 3000);
        return;
    }

    var descr = "¿Estás seguro de que quieres eliminar esta prueba? ";
    descr += "También se eliminarán las estadísticas asociadas a esta prueba.\n";
    descr += "Esta acción no se puede deshacer.";
    if (window.confirm(descr)) {
        peticionEliminarPrueba(prueba_id);
        if (document.getElementById("dialog") != null) {
            document.getElementById("dialog").remove();
        }
        accion = null;
    }
}

// Funcion que actualiza el numero de piezas compatibles en cada tarea
function actualizarValorCompatibilidad(tar) {
    for (var i=0; i<tar.length; i++) {
        if (i<3) continue;
        var descr = "Piezas compatibles: " + tar[i];
        descr += " (Pulsa Validar para actualizar)";
        $('#compatibilidad-' + i).html(descr);
        $('#compatibilidad-' + i).removeClass("pieza-rojo");
        $('#compatibilidad-' + i).removeClass("pieza-verde");
        if (tar[i] >= 1) $('#compatibilidad-' + i).addClass("pieza-verde");
        else $('#compatibilidad-' + i).addClass("pieza-rojo");
    }
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES POST Y GET

// Funcion que solicita a la BD las pruebas
function peticionPruebas() {
    spinnerLoading(true);
    $.get("php/consult.php", {
        tabla: "prueba_tarea"
    })
        .done(function (data) {
            spinnerLoading(false);
            // Error con la conexion de la BD
            if (data == "errorBD") {
                var descr = "Imposible obtener las pruebas por un error ";
                descr += "con la base de datos. Estamos trabajando para solventarlo.";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            // Peticion correcta
            else {
                var datos = JSON.parse(data);
                pruebas = datos["pruebas"];
                tareas = datos["tareas"];
                socketMBCPU = datos["socketMBCPU"];
                socketCPU = datos["socketCPU"];
                crearTarjetasPruebas();
            }
        });
}

// Funcion que introduce/edita una prueba en la BD
function peticionInsertarPrueba() {
    spinnerLoading(true);
    var datos = generarArrayDatos();
    console.log(datos);
    $.post("php/insert.php", {
        tabla: "insertar_prueba",
        username: username,
        password: password,
        datos: datos
    })
        .done(function (data) {
            spinnerLoading(false);
            console.log(data);
            // Error con la conexion de la BD
            if (data == "errorBD") {
                var descr = "Imposible realizar esta operación por un error ";
                descr += "con la base de datos. Estamos trabajando para solventarlo.";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            else if (data == "errorCredenciales") {
                var descr = "Credenciales incorrectas";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            // Peticion correcta
            else {
                var descr = "Se ha " + accion + " la prueba en la Base de Datos ";
                descr += "de manera correcta."
                crearAviso("alert-success", "Éxito", descr, 4000);
                document.getElementById("dialog").remove();
                accion = null;
                peticionPruebas();
            }
        });
}

// Funcion que elimina una prueba de la BD
function peticionEliminarPrueba(prueba_id) {
    spinnerLoading(true);
    $.post("php/insert.php", {
        tabla: "eliminar_prueba",
        username: username,
        password: password,
        prueba_id: prueba_id,
    })
        .done(function (data) {
            spinnerLoading(false);
            console.log(data);
            // Error con la conexion de la BD
            if (data == "errorBD") {
                var descr = "Imposible realizar esta operación por un error ";
                descr += "con la base de datos. Estamos trabajando para solventarlo.";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            else if (data == "errorCredenciales") {
                var descr = "Credenciales incorrectas";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            // Peticion correcta
            else {
                var descr = "Se ha eliminado la prueba correctamente."
                crearAviso("alert-success", "Éxito", descr, 4000);
                peticionPruebas();
            }
        });
}

// Funcion que revisa los componentes compatibles con cada tarea
function peticionValidarTareas() {
    var datos = generarArrayDatos();
    spinnerLoading(true);
    $.get("php/consult.php", {
        tabla: "compatibilidades",
        datos: datos
    })
        .done(function (data) {
            spinnerLoading(false);
            // Error con la conexion de la BD
            if (data == "errorBD") {
                var descr = "Imposible obtener las pruebas por un error ";
                descr += "con la base de datos. Estamos trabajando para solventarlo.";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            // Peticion correcta
            else {
                var datos = JSON.parse(data);
                actualizarValorCompatibilidad(datos);
            }
        });
}

// Funcion que revisa si las credenciales coinciden con las del servidor
function peticionLogin() {
    user = $("#username").val();
    pass = $("#password").val();

    // Peticion GET al servidor para comprobar la contraseña
    $.get("php/login.php", {
        tabla: "usuario",
        username: user,
        password: pass,
        tipo: 2
    })
        .done(function (data) {
            // Contraseña incorrecta
            if (data == "false") {
                $("#username").val("");
                $("#password").val("");
                var descr = "Usuario o contraseña incorrectos. Inténtalo de nuevo.";
                crearAviso("alert-danger", "Error", descr, 4000);
            }
            // Contraseña correcta
            else {
                document.getElementById("parent").remove();
                var descr = "Credenciales aceptadas. No te olvides de cerrar sesión al terminar.";
                crearAviso("alert-success", "Éxito", descr, 4000);
                $("#boton-n").css("display", "");
                $("#boton-s").css("display", "");

                // Mostrar pruebas
                peticionPruebas();
            }
        });
}
function enterKey(e) {
    if (e.keyCode == 13) peticionLogin();
}

// Funcion que revisa si hay credenciales guardadas en las cookies
function peticionSession() {
    $.get("php/login.php", {
        tabla: "session",
        tipo: 2
    })
        .done(function (data) {
            console.log(data);
            if (data == "conDatos") {
                peticionLogin();
            }
        });
}

// Funcion para cerrar la sesion actual
function peticionCerrarSesion() {
	$.get("php/login.php", {
		tabla: "cerrar_sesion",
        tipo: 2
	})
		.done(function (data) {
			location.reload();
		});
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES DE CREACION DE ELEMENTOS

// Funcion que crea todas las tarjetas de las pruebas
function crearTarjetasPruebas() {
    // Eliminar las tarjetas (si existen)
    const parent = document.getElementById("tarjetas-pruebas");
    while (parent.firstChild) {
        parent.firstChild.remove();
    }

    for (var i = 0; i < pruebas.length; i++) {
        var tarjeta = document.createElement("div");
        tarjeta.setAttribute("class", "card mt-4");
        var cuerpo = document.createElement("div");
        cuerpo.setAttribute("class", "card-body");
        var titulo = document.createElement("h4");
        titulo.setAttribute("class", "card-title mb-3");
        titulo.innerHTML = pruebas[i][1];
        var texto = document.createElement("div");
        texto.setAttribute("class", "card-text");
        var fila1 = document.createElement("div");
        fila1.setAttribute("class", "row");
        var col1 = document.createElement("div");
        col1.setAttribute("class", "col-lg row");
        var col11 = document.createElement("div");
        col11.setAttribute("class", "col max-w130");
        col11.innerHTML = "<strong>Descripción:</strong>";
        var col12 = document.createElement("div");
        col12.setAttribute("class", "col justificar");
        col12.innerHTML = pruebas[i][2];
        col1.appendChild(col11);
        col1.appendChild(col12);
        fila1.appendChild(col1);
        var fila2 = document.createElement("div");
        fila2.setAttribute("class", "row mt-1");
        var col2 = document.createElement("div");
        col2.setAttribute("class", "col-lg row");
        var col21 = document.createElement("div");
        col21.setAttribute("class", "col max-w130");
        col21.innerHTML = "<strong>Dificultad:</strong>";
        var col22 = document.createElement("div");
        col22.setAttribute("class", "col justificar");
        var dificultades = ["Fácil", "Medio", "Difícil"];
        col22.innerHTML = dificultades[pruebas[i][3] - 1];
        col2.appendChild(col21);
        col2.appendChild(col22);
        fila2.appendChild(col2);

        // Botones
        var botones = document.createElement("div");
        botones.setAttribute("class", "mt-4");
        var bot1 = document.createElement("a");
        bot1.setAttribute("class", "boton-a");
        bot1.setAttribute("onclick", "crearVentanaSinInputs('" + pruebas[i][0] + "')");
        bot1.innerHTML = "<i class='fa-regular fa-bookmark me-1'></i></i>Detalles";
        var bot2 = document.createElement("a");
        bot2.setAttribute("class", "boton-a ms-3");
        bot2.setAttribute("onclick", "crearVentanaInputs('" + pruebas[i][0] + "')");
        bot2.innerHTML = "<i class='fa-regular fa-pen-to-square me-1'></i></i>Editar";
        var bot3 = document.createElement("a");
        bot3.setAttribute("class", "boton-a ms-3");
        bot3.setAttribute("onclick", "botonEliminar('" + pruebas[i][0] + "')");
        bot3.innerHTML = "<i class='fa fa-ban me-1'></i></i>Eliminar";
        botones.appendChild(bot1);
        botones.appendChild(bot2);
        botones.appendChild(bot3);

        // Appends finales
        texto.appendChild(fila1);
        texto.appendChild(fila2);
        cuerpo.appendChild(titulo);
        cuerpo.appendChild(texto);
        cuerpo.appendChild(botones);
        tarjeta.appendChild(cuerpo);
        document.getElementById("tarjetas-pruebas").appendChild(tarjeta);
    }
}

// Funcion que crea una ventana con inputs (para editar o crear de 0)
function crearVentanaInputs(prueba_id) {
    // Revisar que no haya 5 (maximo 5 pruebas)
    var nActual = document.getElementById("tarjetas-pruebas").childElementCount;
    if (nActual == 5) {
        var descr = "Solo se pueden crear 5 pruebas como máximo. ";
        descr += "Elimina alguna para definir una prueba nueva.";
        crearAviso("alert-warning", "Aviso", descr, 4000);
        return;
    }

    accion = "introducido";
    // Actualizar variable global
    if (prueba_id != null) {
        pruebaActual = getPruebaFromID(prueba_id);
    }

    // Eliminar si ya hay una ventana existente
    if (document.getElementById("dialog") != null) {
        document.getElementById("dialog").remove();
    }

    // Crear campos
    var dialog = document.createElement("div");
    setAttributes(dialog, { id: "dialog", class: "centered-dialog" });
    var form = document.createElement("form");
    form.setAttribute("class", "row mt-3 mb-3 m-3");
    var close = document.createElement("a");
    setAttributes(close, { onclick: "cerrarVentana(this)", class: "close-thik" });
    var tit = document.createElement("h4");
    tit.setAttribute("class", "row ms-0 mt-1 mb-3");
    if (prueba_id == null) tit.innerHTML = "Introducir Prueba";
    else tit.innerHTML = "Editar Prueba";
    var nombre0 = document.createElement("div");
    nombre0.setAttribute("class", "row");
    var nombre1 = document.createElement("h6");
    nombre1.setAttribute("class", "col mt-1 mb-4 max-w100");
    nombre1.innerHTML = "<strong>Nombre:</strong>";
    var nombre2 = document.createElement("input");
    setAttributes(nombre2, { id: "inp-nombre", type: "text", required: "" });
    setAttributes(nombre2, { minlength: "1", maxlength: "16", oninput: "revisarCamposVacios()" });
    nombre2.setAttribute("class", "col font-size-input width1-input height2-input");
    nombre0.appendChild(nombre1);
    nombre0.appendChild(nombre2);
    var col1 = document.createElement("div");
    col1.setAttribute("class", "col-lg-5 mb-4");
    var col11 = document.createElement("h6");
    col11.setAttribute("class", "mb-1");
    col11.innerHTML = "<strong>Descripción:</strong>";
    var col12 = document.createElement("textarea");
    setAttributes(col12, { id: "inp-descripcion", rows: "4", maxlength: "200" });
    col12.setAttribute("oninput", "revisarCamposVacios()");
    col12.setAttribute("class", "font-size-input col-12 ps-1");
    col1.appendChild(col11);
    col1.appendChild(col12);
    var col2 = document.createElement("div");
    col2.setAttribute("class", "col-lg-2");
    var col3 = document.createElement("div");
    col3.setAttribute("class", "col-lg-5 mb-4");
    var col31 = document.createElement("div");
    col31.setAttribute("class", "row");
    var col311 = document.createElement("h6");
    col311.setAttribute("class", "col max-w130");
    col311.innerHTML = "<strong>Dificultad:</strong>";
    var col312 = document.createElement("select");
    setAttributes(col312, { id: "inp-dificultad", onchange: "revisarCamposVacios()" });
    col312.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
    var opt0 = document.createElement("option");
    setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
    opt0.innerHTML = "Elegir...";
    col312.appendChild(opt0);
    var valores = ["1", "2", "3"];
    var etiquetas = ["Fácil", "Medio", "Difícil"];
    for (var i = 0; i < valores.length; i++) {
        var opt = document.createElement("option");
        opt.setAttribute("value", valores[i]);
        opt.innerHTML = etiquetas[i];
        col312.appendChild(opt);
    }
    col31.appendChild(col311);
    col31.appendChild(col312);
    col3.appendChild(col31);

    // Crear campos de tareas
    var contenedorTareas = document.createElement("div");
    contenedorTareas.setAttribute("id", "contenedor-tareas");
    var nTareas = 3;
    if (prueba_id != null) {
        var numPrueba = prueba_id.replace("prueba-", "");
        nTareas = tareas[numPrueba].length;
    }
    for (var i = 0; i < nTareas; i++) {
        var t = document.createElement("div");
        t.setAttribute("id", "tarea-" + i);
        var hr = document.createElement("hr");
        var fila1 = document.createElement("div");
        fila1.setAttribute("class", "row");
        var fila11 = document.createElement("h5");
        setAttributes(fila11, { id: "inp-titulo-" + i, class: "col max-w100" });
        fila11.innerHTML = "Tarea " + (i + 1);
        fila1.appendChild(fila11);
        if (i >= 3) {
            var fila12 = document.createElement("a");
            setAttributes(fila12, { id: "inp-eliminar-" + i, class: "col boton-rojo ms-3" });
            setAttributes(fila12, { onclick: "eliminarTarea(" + i + ")" });
            fila12.innerHTML = "<i class='fa fa-ban me-1'></i>Eliminar tarea";
            fila1.appendChild(fila12);
        }
        var fila2 = document.createElement("div");
        fila2.setAttribute("class", "row");
        var fila21 = document.createElement("h6");
        fila21.setAttribute("class", "col max-w130");
        fila21.innerHTML = "<strong>Descripción:</strong>";
        var fila22 = document.createElement("input");
        setAttributes(fila22, { id: "inp-descripcion-" + i, type: "text", required: "" });
        setAttributes(fila22, { minlength: "1", maxlength: "45", oninput: "revisarCamposVacios()" });
        fila22.setAttribute("class", "col font-size-input width5-input height2-input ps-1");
        fila22.setAttribute("placeholder", "IMPORTANTE: Es el titulo que aparecerá en el juego");
        if (i < 3) fila22.setAttribute("disabled", "");
        fila2.appendChild(fila21);
        fila2.appendChild(fila22);
        var fila3 = document.createElement("div");
        fila3.setAttribute("class", "row mt-3");
        var fila31 = document.createElement("h6");
        fila31.setAttribute("class", "col max-w130");
        fila31.innerHTML = "<strong>Tipo de pieza:</strong>";
        var fila32 = document.createElement("select");
        fila32.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
        setAttributes(fila32, { id: "inp-tipo-" + i, onchange: "actualizarAtributos(this); revisarCamposVacios()" });
        if (i < 3) fila32.setAttribute("disabled", "");
        var opt0 = document.createElement("option");
        setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
        opt0.innerHTML = "Elegir...";
        fila32.appendChild(opt0);
        var textos = ["Placa Base", "CPU", "Ventilador", "RAM", "Disco", "Fuente", "GPU"];
        for (var j = 0; j < textos.length; j++) {
            var opt = document.createElement("option");
            opt.setAttribute("value", j + 1);
            opt.innerHTML = textos[j];
            fila32.appendChild(opt);
        }
        fila3.appendChild(fila31);
        fila3.appendChild(fila32);
        var fila4 = document.createElement("div");
        fila4.setAttribute("class", "row mt-2");
        var col41 = document.createElement("div");
        col41.setAttribute("class", "col-lg-6 row mb-2");
        var col411 = document.createElement("h6");
        col411.setAttribute("class", "col max-w130");
        col411.innerHTML = "<strong>Atributo:</strong>";
        var col412 = document.createElement("select");
        col412.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
        setAttributes(col412, { id: "inp-atributo-" + i, onchange: "actualizarValores(this); revisarCamposVacios()" });
        if (i < 3) col412.setAttribute("disabled", "");
        var opt0 = document.createElement("option");
        setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
        opt0.innerHTML = "Elegir...";
        col412.appendChild(opt0);
        col41.appendChild(col411);
        col41.appendChild(col412);
        var col42 = document.createElement("div");
        col42.setAttribute("class", "col-lg-6 row mb-2");
        var col421 = document.createElement("h6");
        col421.setAttribute("class", "col max-w130");
        col421.innerHTML = "<strong>Acción:</strong>";
        var col422 = document.createElement("select");
        col422.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
        setAttributes(col422, { id: "inp-accion-" + i, onchange: "actualizarValor2(this); revisarCamposVacios()" });
        if (i < 3) col422.setAttribute("disabled", "");
        var opt0 = document.createElement("option");
        setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
        opt0.innerHTML = "Elegir...";
        col422.appendChild(opt0);
        var valores = ["=", "!=", ">", ">=", "<", "<=", "BETWEEN"];
        var textos = ["es igual", "no es igual", "es mayor que",
            "es mayor/igual que", "es menor que", "es menor/igual que", "está entre"];
        for (var j = 0; j < valores.length; j++) {
            var opt = document.createElement("option");
            opt.setAttribute("value", valores[j]);
            opt.innerHTML = textos[j];
            col422.appendChild(opt);
        }
        col42.appendChild(col421);
        col42.appendChild(col422);
        fila4.appendChild(col41);
        fila4.appendChild(col42);
        var fila5 = document.createElement("div");
        fila5.setAttribute("class", "row mb-3");
        var col51 = document.createElement("div");
        col51.setAttribute("class", "col-lg-6 row mb-2");
        col51.setAttribute("id", "contenedor-valor1-" + i);
        var col511 = document.createElement("h6");
        col511.setAttribute("class", "col max-w130");
        col511.innerHTML = "<strong>Valor 1:</strong>";
        var col512 = document.createElement("input");
        setAttributes(col512, { id: "inp-valor1-" + i, type: "text", required: "" });
        setAttributes(col512, { minlength: "1", maxlength: "20", oninput: "revisarCamposVacios()" });
        col512.setAttribute("class", "col font-size-input width4-input height2-input ps-1");
        col51.appendChild(col511);
        col51.appendChild(col512);
        var col52 = document.createElement("div");
        col52.setAttribute("class", "col-lg-6 row mb-2");
        col52.setAttribute("id", "contenedor-valor2-" + i);
        fila5.appendChild(col51);
        fila5.appendChild(col52);
        // Crear texto de X piezas compatibles
        if (i >= 3) {
            var fila6 = document.createElement("div");
            fila6.setAttribute("class", "row mg-neg-top");
            var p = document.createElement("p");
            p.setAttribute("id", "compatibilidad-"+i);
            if (i == nTareas-1) p.setAttribute("class", "mb-3 pieza-rojo");
            else p.setAttribute("class", "mb-1 pieza-rojo");
            p.innerHTML = "Piezas compatibles: 0 (Pulsa Validar para actualizar)";
            fila6.appendChild(p);
        }
        // Appends finales
        t.appendChild(hr);
        t.appendChild(fila1);
        t.appendChild(fila2);
        t.appendChild(fila3);
        t.appendChild(fila4);
        t.appendChild(fila5);
        if (i >= 3) t.appendChild(fila6);
        contenedorTareas.appendChild(t);
    }
    // Botones
    var hr = document.createElement("hr");
    var nueva = document.createElement("a");
    setAttributes(nueva, { class: "boton-nuevo2 mb-2 max-w160", onclick: "crearNuevaTarea()" });
    nueva.innerHTML = "<i class='fa-solid fa-circle-plus me-2'></i>Nueva tarea";
    var hr2 = document.createElement("hr");
    hr2.setAttribute("class", "linea");
    var bot0 = document.createElement("div");
    bot0.setAttribute("class", "text-center");
    var bot3 = document.createElement("button");
    setAttributes(bot3, { id: "bt-validar", type: "button", class: "boton-editar me-2" });
    setAttributes(bot3, { onclick: "peticionValidarTareas()", disabled: "" });
    if (nTareas > 3) bot3.removeAttribute("disabled");
    bot3.innerHTML = "Validar";
    bot0.appendChild(bot3);
    var bot1 = document.createElement("button");
    setAttributes(bot1, { id: "bt-guardar", type: "button", class: "boton-guardar ms-2 me-2" });
    setAttributes(bot1, { onclick: "peticionInsertarPrueba()", disabled: "" });
    if (prueba_id == null) {
        bot1.innerHTML = "Introducir";
        bot0.appendChild(bot1);
    }
    else {
        bot1.innerHTML = "Guardar";
        bot0.appendChild(bot1);
        var bot2 = document.createElement("button");
        setAttributes(bot2, { id: "bt-eliminar", type: "button", class: "boton-eliminar ms-2" });
        setAttributes(bot2, { onclick: "", });
        bot2.innerHTML = "Eliminar";
        bot0.appendChild(bot2);
    }

    // Appends finales
    form.appendChild(close);
    form.appendChild(tit);
    form.appendChild(nombre0);
    form.appendChild(col1);
    form.appendChild(col2);
    form.appendChild(col3);
    form.appendChild(contenedorTareas);
    form.appendChild(hr);
    form.appendChild(nueva);
    form.appendChild(hr2);
    form.appendChild(bot0);
    dialog.appendChild(form);
    document.getElementById("body").appendChild(dialog);

    // Rellenar si la prueba ya existe y se tiene que editar
    if (prueba_id != null) rellenarInputs(prueba_id);
    // Dar valor a las tareas de almacenamiento si la prueba es null (nueva)
    else {
        // Dar valor a las de almacenamiento
        for (var i = 0; i < 3; i++) {
            $('#inp-tipo-' + i).find(":selected").removeAttr('selected');
            $('#inp-atributo-' + i).find(":selected").removeAttr('selected');
            $('#inp-accion-' + i).find(":selected").removeAttr('selected');
            if (i == 0) {
                $("#inp-tipo-" + i).val("4");
                actualizarAtributos(4, i);
                $("#inp-atributo-" + i).val("capacidadRAM");
            }
            else {
                $("#inp-tipo-" + i).val("5");
                actualizarAtributos(5, i);
                $("#inp-atributo-" + i).val("capacidadDisco");
            }
            $("#inp-accion-" + i).val(">=");
            $("#inp-valor1-" + i).val("0");
        }
        revisarCamposVacios();
    }

    var collapser = document.getElementById("collapser");
    moverVentanaAbajo(collapser);
    peticionValidarTareas();
}

// Funcion que crea una ventana sin inputs (para visualizar una prueba)
function crearVentanaSinInputs(prueba_id) {
    // Eliminar si ya hay una ventana existente
    if (document.getElementById("dialog") != null) {
        document.getElementById("dialog").remove();
    }

    var prueba = getPruebaFromID(prueba_id); // obtener prueba
    var numPrueba = prueba_id.replace("prueba-", "");

    // Crear campos
    var dialog = document.createElement("div");
    setAttributes(dialog, { id: "dialog", class: "centered-dialog" });
    var form = document.createElement("form");
    form.setAttribute("class", "row mt-3 mb-3 m-3");
    var close = document.createElement("a");
    setAttributes(close, { onclick: "cerrarVentana(this)", class: "close-thik" });
    var tit = document.createElement("h4");
    tit.setAttribute("class", "row ms-0 mt-1 mb-3");
    tit.innerHTML = prueba[1];
    var col1 = document.createElement("div");
    col1.setAttribute("class", "col-lg-5 mb-1");
    var col11 = document.createElement("h6");
    col11.setAttribute("class", "mb-1");
    col11.innerHTML = "<strong>Descripción:</strong>";
    var col12 = document.createElement("div");
    col12.setAttribute("class", "justificar");
    col12.innerHTML = prueba[2];
    col1.appendChild(col11);
    col1.appendChild(col12);
    var col2 = document.createElement("div");
    col2.setAttribute("class", "col-lg-2");
    var col3 = document.createElement("div");
    col3.setAttribute("class", "col-lg-5 mb-3");
    var col31 = document.createElement("h6");
    var dif = "Fácil";
    if (prueba[3] == 2) dif = "Medio";
    else if (prueba[3] == 3) dif = "Difícil";
    col31.innerHTML = "<strong>Dificultad: </strong>" + dif;
    col3.appendChild(col31);

    // Appends
    form.appendChild(close);
    form.appendChild(tit);
    form.appendChild(col1);
    form.appendChild(col2);
    form.appendChild(col3);

    // Tareas
    for (var i = 0; i < tareas[numPrueba].length; i++) {
        var t1 = document.createElement("h5");
        t1.setAttribute("class", "mt-3");
        t1.innerHTML = "Tarea " + (i + 1);
        var t2 = document.createElement("h6");
        var txt = "<strong>Descripción:&nbsp;&nbsp;&nbsp;</strong>";
        t2.innerHTML = txt + tareas[numPrueba][i][1];
        form.appendChild(t1);
        form.appendChild(t2);
    }

    // Botones
    var hr = document.createElement("hr");
    var botones = document.createElement("div");
    botones.setAttribute("class", "text-center");
    var bot1 = document.createElement("button");
    setAttributes(bot1, { id: "bt-editar", type: "button", class: "boton-editar me-2" });
    bot1.setAttribute("onclick", "crearVentanaInputs('" + prueba_id + "')");
    bot1.innerHTML = "Editar";
    var bot2 = document.createElement("button");
    setAttributes(bot2, { id: "bt-eliminar", type: "button", class: "boton-eliminar ms-2" });
    bot2.setAttribute("onclick", "botonEliminar('" + prueba_id + "')");
    bot2.innerHTML = "Eliminar";
    botones.appendChild(bot1);
    botones.appendChild(bot2);
    form.appendChild(hr);
    form.appendChild(botones);

    // Appends finales
    dialog.appendChild(form);
    document.getElementById("body").appendChild(dialog);
}

// Funcion que crea una nueva tarea
function crearNuevaTarea() {
    var nActual = document.getElementById("contenedor-tareas").childElementCount;
    if (nActual == 10) {
        var descr = "Solo se pueden crear 10 tareas como máximo. ";
        descr += "Elimina alguna para definir una tarea nueva.";
        crearAviso("alert-warning", "Aviso", descr, 4000);
        return;
    }

    var t = document.createElement("div");
    t.setAttribute("id", "tarea-" + nActual);
    var hr = document.createElement("hr");
    var fila1 = document.createElement("div");
    fila1.setAttribute("class", "row");
    var fila11 = document.createElement("h5");
    setAttributes(fila11, { id: "inp-titulo-" + nActual, class: "col max-w100" });
    fila11.innerHTML = "Tarea " + (nActual + 1);
    fila1.appendChild(fila11);
    var fila12 = document.createElement("a");
    setAttributes(fila12, { id: "inp-eliminar-" + nActual, class: "col boton-rojo ms-3" });
    setAttributes(fila12, { onclick: "eliminarTarea(" + nActual + ")" });
    fila12.innerHTML = "<i class='fa fa-ban me-1'></i>Eliminar tarea";
    fila1.appendChild(fila12);
    var fila2 = document.createElement("div");
    fila2.setAttribute("class", "row");
    var fila21 = document.createElement("h6");
    fila21.setAttribute("class", "col max-w130");
    fila21.innerHTML = "<strong>Descripción:</strong>";
    var fila22 = document.createElement("input");
    setAttributes(fila22, { id: "inp-descripcion-" + nActual, type: "text", required: "" });
    setAttributes(fila22, { minlength: "1", maxlength: "50", oninput: "revisarCamposVacios()" });
    fila22.setAttribute("class", "col font-size-input width5-input height2-input ps-1");
    fila22.setAttribute("placeholder", "IMPORTANTE: Es el titulo que aparecerá en el juego");
    fila2.appendChild(fila21);
    fila2.appendChild(fila22);
    var fila3 = document.createElement("div");
    fila3.setAttribute("class", "row mt-3");
    var fila31 = document.createElement("h6");
    fila31.setAttribute("class", "col max-w130");
    fila31.innerHTML = "<strong>Tipo de pieza:</strong>";
    var fila32 = document.createElement("select");
    fila32.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
    setAttributes(fila32, { id: "inp-tipo-" + nActual, onchange: "actualizarAtributos(this); revisarCamposVacios()" });
    var opt0 = document.createElement("option");
    setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
    opt0.innerHTML = "Elegir...";
    fila32.appendChild(opt0);
    var textos = ["Placa Base", "CPU", "Ventilador", "RAM", "Disco", "Fuente", "GPU"];
    for (var j = 0; j < textos.length; j++) {
        var opt = document.createElement("option");
        opt.setAttribute("value", j + 1);
        opt.innerHTML = textos[j];
        fila32.appendChild(opt);
    }
    fila3.appendChild(fila31);
    fila3.appendChild(fila32);
    var fila4 = document.createElement("div");
    fila4.setAttribute("class", "row mt-2");
    var col41 = document.createElement("div");
    col41.setAttribute("class", "col-lg-6 row mb-2");
    var col411 = document.createElement("h6");
    col411.setAttribute("class", "col max-w130");
    col411.innerHTML = "<strong>Atributo:</strong>";
    var col412 = document.createElement("select");
    col412.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
    setAttributes(col412, { id: "inp-atributo-" + nActual, onchange: "actualizarValores(this); revisarCamposVacios()" });
    var opt0 = document.createElement("option");
    setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
    opt0.innerHTML = "Elegir...";
    col412.appendChild(opt0);
    col41.appendChild(col411);
    col41.appendChild(col412);
    var col42 = document.createElement("div");
    col42.setAttribute("class", "col-lg-6 row mb-2");
    var col421 = document.createElement("h6");
    col421.setAttribute("class", "col max-w130");
    col421.innerHTML = "<strong>Acción:</strong>";
    var col422 = document.createElement("select");
    col422.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
    setAttributes(col422, { id: "inp-accion-" + nActual, onchange: "actualizarValor2(this); revisarCamposVacios()" });
    var opt0 = document.createElement("option");
    setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
    opt0.innerHTML = "Elegir...";
    col422.appendChild(opt0);
    var valores = ["=", "!=", ">", ">=", "<", "<=", "BETWEEN"];
    var textos = ["es igual", "no es igual", "es mayor que",
        "es mayor/igual que", "es menor que", "es menor/igual que", "está entre"];
    for (var j = 0; j < valores.length; j++) {
        var opt = document.createElement("option");
        opt.setAttribute("value", valores[j]);
        opt.innerHTML = textos[j];
        col422.appendChild(opt);
    }
    col42.appendChild(col421);
    col42.appendChild(col422);
    fila4.appendChild(col41);
    fila4.appendChild(col42);
    var fila5 = document.createElement("div");
    fila5.setAttribute("class", "row mb-3");
    var col51 = document.createElement("div");
    col51.setAttribute("class", "col-lg-6 row mb-2");
    col51.setAttribute("id", "contenedor-valor1-" + nActual);
    var col511 = document.createElement("h6");
    col511.setAttribute("class", "col max-w130");
    col511.innerHTML = "<strong>Valor 1:</strong>";
    var col512 = document.createElement("input");
    setAttributes(col512, { id: "inp-valor1-" + nActual, type: "text", required: "" });
    setAttributes(col512, { minlength: "1", maxlength: "20", oninput: "revisarCamposVacios()" });
    col512.setAttribute("class", "col font-size-input width4-input height2-input ps-1");
    col51.appendChild(col511);
    col51.appendChild(col512);
    var col52 = document.createElement("div");
    col52.setAttribute("class", "col-lg-6 row mb-2");
    col52.setAttribute("id", "contenedor-valor2-" + nActual);
    fila5.appendChild(col51);
    fila5.appendChild(col52);
    var fila6 = document.createElement("div");
    fila6.setAttribute("class", "row mg-neg-top");
    var p = document.createElement("p");
    p.setAttribute("id", "compatibilidad-"+nActual);
    p.setAttribute("class", "mb-3 pieza-rojo");
    p.innerHTML = "Piezas compatibles: 0 (Pulsa Validar para actualizar)";
    fila6.appendChild(p);
    // Appends finales
    t.appendChild(hr);
    t.appendChild(fila1);
    t.appendChild(fila2);
    t.appendChild(fila3);
    t.appendChild(fila4);
    t.appendChild(fila5);
    t.appendChild(fila6);
    document.getElementById("contenedor-tareas").appendChild(t);

    // Actualizar boton Validar
    document.getElementById("bt-validar").removeAttribute("disabled");

    revisarCamposVacios();
}

// Funcion que actualiza los atributos del dropdown segun el tipo seleccionado
function actualizarAtributos(tipoPieza, nTarea) {
    // Gestionar cuando se modifica el dropdown del tipo de pieza
    if (nTarea == null) {
        // Ajustar correctamente el valor de las variables
        nTarea = tipoPieza.getAttribute("id").replace("inp-tipo-", "");
        tipoPieza = $(tipoPieza).val();
        $('#inp-accion-' + nTarea).find(":selected").removeAttr('selected');
        $('#inp-accion-' + nTarea).val("default");
        if ($('#inp-valor1-' + nTarea).is("select")) {
            $('#inp-valor1-' + nTarea).find(":selected").removeAttr('selected');
            $('#inp-valor1-' + nTarea).val("default");
        }
        else {
            $('#inp-valor1-' + nTarea).val("");
        }
        if (document.getElementById("contenedor-valor2-" + nTarea).children.length > 1) {
            document.getElementById("contenedor-valor2-" + nTarea).children[0].remove();
            document.getElementById("contenedor-valor2-" + nTarea).children[0].remove();
        }
    }

    var campos = getNombresAtributos(); // Obtener informacion atributos

    // Eliminar valores dropdown Atributos
    $('#inp-atributo-' + nTarea).find(":selected").removeAttr('selected');
    $('#inp-atributo-' + nTarea).val("default");
    $('#inp-atributo-' + nTarea).empty();
    var opt = document.createElement("option");
    setAttributes(opt, { value: "default", selected: "", disabled: "", hidden: "" });
    opt.innerHTML = "Elegir...";
    document.getElementById("inp-atributo-" + nTarea).appendChild(opt);

    // Crear nuevos valores en el dropdown Atributos
    var atributos = campos[tipoPieza]; // obtener atributos segun el tipo de pieza
    var valores = getValoresAtributos();
    //console.log(atributos);
    for (var i = 0; i < Object.keys(atributos).length; i++) {
        var key = Object.keys(atributos)[i]; // Obtener clave del JSON
        var opt = document.createElement("option");
        opt.setAttribute("value", valores[tipoPieza][i]);
        opt.innerHTML = key;
        document.getElementById("inp-atributo-" + nTarea).appendChild(opt);
    }
}

// Funcion que actualiza los valores según si es input o select
function actualizarValores(tipoPieza, atr, nTarea) {
    // Gestionar cuando se modifica el dropdown del atributo
    if (atr == null && nTarea == null) {
        // Ajustar correctamente el valor de las variables
        atr = $(tipoPieza).val();
        nTarea = tipoPieza.getAttribute("id").replace("inp-atributo-", "");
        tipoPieza = $("#inp-tipo-" + nTarea).val();
    }

    var campos = getNombresAtributos(); // Obtener informacion atributos
    var valores = getValoresAtributos()[tipoPieza]; //Obtener valores atributos
    var atributos = campos[tipoPieza];
    var atributo = Object.keys(atributos)[valores.indexOf(atr)];

    // Eliminar el dropdown/input actual
    document.getElementById("inp-valor1-" + nTarea).remove();

    // Crear dropdown
    var valores = campos[tipoPieza][atributo];
    if (valores != null) {
        // Deshabilitar todos los campos menos "=" y "!="
        $("#inp-accion-" + nTarea + " option[value='>']").attr("disabled", "");
        $("#inp-accion-" + nTarea + " option[value='>=']").attr("disabled", "");
        $("#inp-accion-" + nTarea + " option[value='<']").attr("disabled", "");
        $("#inp-accion-" + nTarea + " option[value='<=']").attr("disabled", "");
        $("#inp-accion-" + nTarea + " option[value='BETWEEN']").attr("disabled", "");
        if ($("#inp-accion-" + nTarea).find(":selected").val() != ("=" || "!=")) {
            $("#inp-accion-" + nTarea).val("default");
            actualizarValor2("default", nTarea);
        }

        // Dropdown
        var select = document.createElement("select");
        select.setAttribute("class", "col font-size-input width4-input height2-input ps-0");
        setAttributes(select, { id: "inp-valor1-" + nTarea, onchange: "revisarCamposVacios()" });
        var opt0 = document.createElement("option");
        setAttributes(opt0, { value: "default", selected: "", disabled: "", hidden: "" });
        opt0.innerHTML = "Elegir...";
        select.appendChild(opt0);
        for (var j = 0; j < valores.length; j++) {
            var opt = document.createElement("option");
            opt.setAttribute("value", valores[j]);
            opt.innerHTML = valores[j];
            select.appendChild(opt);
        }
        document.getElementById("contenedor-valor1-" + nTarea).appendChild(select);
    }
    // Crear input
    else {
        // Habilitar todos los campos
        $("#inp-accion-" + nTarea + " option[value='>']").removeAttr("disabled");
        $("#inp-accion-" + nTarea + " option[value='>=']").removeAttr("disabled");
        $("#inp-accion-" + nTarea + " option[value='<']").removeAttr("disabled");
        $("#inp-accion-" + nTarea + " option[value='<=']").removeAttr("disabled");
        $("#inp-accion-" + nTarea + " option[value='BETWEEN']").removeAttr("disabled");

        // Input
        var input = document.createElement("input");
        setAttributes(input, { id: "inp-valor1-" + nTarea, type: "text", required: "" });
        setAttributes(input, { minlength: "1", maxlength: "20", oninput: "revisarCamposVacios()" });
        input.setAttribute("class", "col font-size-input width4-input height2-input ps-1");
        document.getElementById("contenedor-valor1-" + nTarea).appendChild(input);
    }

}

// Funcion que actualiza el valor 2 segun si es necesario
function actualizarValor2(accion, nTarea) {
    // Gestionar cuando se modifica el dropdown de la accion
    if (nTarea == null) {
        // Ajustar correctamente el valor de las variables
        nTarea = accion.getAttribute("id").replace("inp-accion-", "");
        accion = $("#inp-accion-" + nTarea).val();
    }

    // Crear valor2
    if (accion == "BETWEEN") {
        var tit = document.createElement("h6");
        tit.setAttribute("class", "col max-w130");
        tit.innerHTML = "<strong>Valor 2:</strong>";
        var input = document.createElement("input");
        setAttributes(input, { id: "inp-valor2-" + nTarea, type: "text", required: "" });
        setAttributes(input, { minlength: "1", maxlength: "20", oninput: "revisarCamposVacios()" });
        input.setAttribute("class", "col font-size-input width4-input height2-input ps-1");
        document.getElementById("contenedor-valor2-" + nTarea).appendChild(tit);
        document.getElementById("contenedor-valor2-" + nTarea).appendChild(input);
    }
    // Eliminar valor2
    else if (document.getElementById("contenedor-valor2-" + nTarea).children.length > 1) {
        document.getElementById("contenedor-valor2-" + nTarea).children[0].remove();
        document.getElementById("contenedor-valor2-" + nTarea).children[0].remove();
    }
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES AUXILIARES

// Funcion para añadir mas de 1 atributo a la vez (a un mismo elemento)
// https://stackoverflow.com/questions/12274748/setting-multiple-attributes-for-an-element-at-once-with-javascript
function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

// Funcion que crea/elimina la animacion de cargando
function spinnerLoading(crear) {
    if (document.getElementById("loading") != null) {
        document.getElementById("loading").remove()
    }
    if (crear) {
        var spinner = document.createElement("div");
        spinner.setAttribute("id", "loading");
        document.getElementById("body").appendChild(spinner);
    }
}

// Funcion que devuelve todo un elemento prueba a partir de un id
function getPruebaFromID(id) {
    // Recorrer todas las pruebas
    for (var i = 0; i < pruebas.length; i++) {
        if (pruebas[i][0] == id) {
            return pruebas[i];
        }
    }
    return null;
}

// Funcion que genera un array con los datos introducidos en los inputs
function generarArrayDatos() {
    var id = $("#inp-nombre").attr("title");
    var numPrueba = null;
    if (id == undefined) id = null;
    else numPrueba = id.replace("prueba-", "");

    // Array de datos ([0]: prueba; [1]: tareas)
    var datos = [[
        id,
        $("#inp-nombre").val(),
        $("#inp-descripcion").val(),
        $("#inp-dificultad").find(":selected").val()
    ], []];

    var tareasActuales = document.getElementById("contenedor-tareas").children;
    for (var i = 0; i < tareasActuales.length; i++) {
        datos[1].push([]);
        if (id == null) datos[1][i].push(null); //id
        else datos[1][i].push("tarea-" + numPrueba + "-" + i); //id
        datos[1][i].push($("#inp-descripcion-" + i).val()); //descrTarea
        if (i < 3) datos[1][i].push(1); //almacenamiento
        else datos[1][i].push(0); //almacenamiento
        datos[1][i].push($("#inp-atributo-" + i).find(":selected").val()); //atributo
        datos[1][i].push($("#inp-accion-" + i).find(":selected").val()); //accion
        if ($("#inp-valor1-" + i).is("select")) {
            datos[1][i].push($("#inp-valor1-" + i).find(":selected").val()); //valor1
        }
        else datos[1][i].push($("#inp-valor1-" + i).val()); //valor1
        if (document.getElementById("inp-valor2-" + i) != null) {
            datos[1][i].push($("#inp-valor2-" + i).val()); //valor2
        }
        else datos[1][i].push(0); //valor2
        datos[1][i].push(id); //idPrueba
        datos[1][i].push($("#inp-tipo-" + i).find(":selected").val()); //idTipoPieza
    }

    return datos;
}

// Funcion que devuelve un JSON con los nombres de los atributos (segun el tipo)
function getNombresAtributos() {
    return {
        "1": {
            "Tipo": ["ATX", "Micro ATX"],
            "Socket CPU": socketMBCPU,
            "Slots RAM": null,
            "Slots HDD": null,
            "Slots SSD": null
        },
        "2": {
            "Arquitectura": ["Intel", "AMD"],
            "Socket": socketCPU,
            "Núcleos": null,
            "Frec. Base (GHz)": null,
            "Frec. Turbo (GHz)": null,
            "Consumo (W)": null
        },
        "3": {
            "Velocidad (RPM)": null
        },
        "4": {
            "Estándar": ["DDR", "DDR2", "DDR3", "DDR4", "DDR5"],
            "Velocidad (MHz)": null,
            "Capacidad (GB)": null
        },
        "5": {
            "Tipo": ["HDD", "SSD"],
            "Velocidad (MB/s)": null,
            "Capacidad (GB)": null
        },
        "6": {
            "Tipo": ["ATX", "SFX"],
            "Potencia (W)": null
        },
        "7": {
            "Memoria (GB)": null,
            "VRAM (Gbps)": null,
            "Consumo (W)": null
        }
    };
}

// Funcion que devuelve un JSON con los nombres de los atributos (segun el tipo)
function getValoresAtributos() {
    return {
        "1": ["tipoPlacaBase", "socketMBCPU", "slotsRAM", "slotsHDD", "slotsSDD"],
        "2": ["arquitectura", "socketCPU", "nucleos", "frecCPU", "frecTurbo", "consumoCPU"],
        "3": ["velocidadVentilador"],
        "4": ["estandar", "velocidadRAM", "capacidadRAM"],
        "5": ["tipoDisco", "velocidadDisco", "capacidadDisco"],
        "6": ["tipoFuente", "potencia"],
        "7": ["memoria", "vram", "consumoGPU"]
    };
}

// Funcion que crea un aviso de bootstrap dado el tipo, titulo y descripcion
// tipo: alert-danger, alert-warning, alert-success. (Clases de Bootstrap)
function crearAviso(tipo, titulo, descr, tiempo) {
    // Crear aviso
    var aviso = document.createElement("div");
    aviso.classList.add("myAlert-top", "alert", "alert-dismissible", "fade", "show", tipo);
    aviso.innerHTML = "<strong>" + titulo + ": </strong>" + descr;
    var cerrar = document.createElement("button");
    cerrar.setAttribute("type", "button");
    cerrar.classList.add("btn-close");
    cerrar.setAttribute("data-bs-dismiss", "alert");
    cerrar.setAttribute("aria-label", "Close");

    // Append
    aviso.appendChild(cerrar);
    document.getElementById("body").appendChild(aviso);

    // Mostrar y ocultar tras X segundos
    $(".myAlert-top").show();
    if (tiempo > 0) {
        setTimeout(function () {
            // Quitar aviso
            $(".myAlert-top").hide();
            const boxes = document.querySelectorAll('.myAlert-top');
            boxes.forEach(box => {
                box.remove();
            });
        }, tiempo);
    }
}
/*
    Fichero que se encarga de gestionar la interfaz de todas
    las piezas que hay en la base de datos. Permite introducir,
    editar y eliminar piezas.
*/

// VARIABLES GLOBALES
var componentes; // objeto que contiene todos los componentes
var username = null;
var password = null;
var accion = null // introducido/actualizado

// Funcion que se ejecuta cuando se carga la pagina
function loaded() {
    $("#username").val("");
    $("#password").val("");
    $("#boton-n").css("display", "none");
    $("#boton-s").css("display", "none");
    $("#filtros").prop("disabled", true);

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

// Funcion que permite solo 1 opcion de textura (o la subida o la seleccionada)
// Tambien actualiza la imagen seleccionada
function inputTextura(subido) {
    $("#bt-guardar").prop("disabled", false);
    if (subido) {
        // Actualizar preview
        var imagen = document.getElementById("inp-file1").files[0];
        var url = URL.createObjectURL(imagen);
        document.getElementById("inp-textura").setAttribute("src", url);

        // Desmarcar dropdown
        $("#inp-file2").val("default");
    }
    else {
        // Actualizar preview
        var url = $('#inp-file2').find(":selected").attr("title");
        url = "assets/texturesComponents/" + url;
        document.getElementById("inp-textura").setAttribute("src", url);

        // Desmarcar el input de archivos (eliminarlo y crearlo)
        document.getElementById("inp-file1").remove();
        var input = document.createElement("input");
        setAttributes(input, { class: "row max-w-files mb-3 ms-0", type: "file" });
        setAttributes(input, { id: "inp-file1", accept: ".png, .jpg", oninput: "inputTextura(true)" });
        document.getElementById("fileinput-container").appendChild(input);
    }
}

// Funcion que se ejecuta al modificar un campo y que activa el boton "Introducir"
// cuando todos los campos estan llenos
function revisarCamposVacios() {
    // Revisar si hay algun campo vacio
    var vacios = false;
    if ($("#inp-nombre").val() == "" && !vacios) vacios = true;
    if ($("#inp-descripcion").val() == "" && !vacios) vacios = true;
    if ($("#inp-ancho").val() == "" && !vacios) vacios = true;
    if ($("#inp-alto").val() == "" && !vacios) vacios = true;
    if ($("#inp-fondo").val() == "" && !vacios) vacios = true;
    if ($("#inp-marca").val() == "" && !vacios) vacios = true;
    if ($("#inp-modelo").val() == "" && !vacios) vacios = true;
    if ($('#inp-tipo').find(":selected").val() == "default" && !vacios) vacios = true;

    // Revisar la textura
    if (document.getElementById("inp-file1").files.length) { }
    else if ($('#inp-file2').find(":selected").val() == "default" && !vacios) vacios = true;

    // Revisar los campos extra (propios de cada tipo de pieza)
    for (var i = 1; i < 10; i++) {
        var elem = "#inp-extra" + i;
        if ($(elem).length) {
            if ($(elem).is("select")) {
                if ($(elem).find(":selected").val() == "default" && !vacios) vacios = true;
            }
            else {
                if ($(elem).val() == "" && !vacios) vacios = true;
            }
        }
    }

    // Activar o desactivar el boton "Guardar/Introducir"
    if (vacios) {
        $("#bt-guardar").prop("disabled", true);
    }
    else {
        $("#bt-guardar").prop("disabled", false);
        console.log("Todo lleno");
    }

    // Placeholders dimensiones
    var dimensiones = ["", "", ""];
    if ($('#inp-tipo').val() != null) {
        var dimensiones = getDimensionesDefault($('#inp-tipo').val());
    }
    $("#inp-ancho").attr("placeholder", dimensiones[0]);
    $("#inp-alto").attr("placeholder", dimensiones[1]);
    $("#inp-fondo").attr("placeholder", dimensiones[2]);

    // Textura Discos
    // Actualizar textura default
    var tipo = $('#inp-tipo').find(":selected").val();
    if (tipo != "disco") return;
    var src = "default-hdd.jpg";
    if ($('#inp-extra1').val() == "ssd") {
        src = "default-ssd.jpg";
    }
    $("#inp-file2 option[value='defaultTexture']").attr("title", src);

    // Si se ha cargado la default, actualizarla con el tipo de componente
    var opcion = $("#inp-file2").find(":selected").val();
    if (opcion == "defaultTexture") {
        $('#inp-textura').attr("src", "assets/texturesComponents/" + src);
    }
}

// Funcion que rellena los campos de input con el componente dado
function rellenarInputs(cmp_id) {
    accion = "actualizado";
    var cmp = getCmpFromID(cmp_id); // obtener componente

    // Campos normales
    $("#inp-nombre").attr("title", cmp[0]);
    $("#inp-nombre").val(cmp[1]);
    $("#inp-descripcion").val(cmp[2]);
    $("#inp-ancho").val(cmp[3] * 1000);
    $("#inp-alto").val(cmp[4] * 1000);
    $("#inp-fondo").val(cmp[5] * 1000);
    $("#inp-marca").val(cmp[7]);
    $("#inp-modelo").val(cmp[8]);
    $('#inp-tipo option[value=default]').removeAttr('selected');
    $('#inp-tipo').val(cmp_id.replace("cmp-", "").split("-")[0]);

    // Campo textura
    $('#inp-textura').attr("src", "assets/texturesComponents/" + cmp[6]);
    // Es la textura default
    if (cmp[6] == $('#inp-file2 option[value=defaultTexture]').attr("title")) {
        $('#inp-file2 option[value=default]').removeAttr('selected');
        $('#inp-file2').val("defaultTexture");
    }
    // No es la textura default, por tanto se crea una nueva option del select
    else {
        $('#inp-file2 option[value=default]').removeAttr('selected');
        var opt = document.createElement("option");
        var nombre = cmp[6];
        opt.setAttribute("value", nombre);
        opt.setAttribute("title", cmp[6]);
        opt.innerHTML = nombre;
        opt.setAttribute("selected", "");
        document.getElementById("inp-file2").appendChild(opt);
        //$('#inp-file1').val('selected');
    }

    // Campos extra
    actualizarInputsExtra(cmp);
    for (var i = 11; i < cmp.length; i++) {
        var elem = "#inp-extra" + (i - 10);
        // Es un campo select
        if ($(elem).is("select")) {
            $(elem + ' option[value=default]').removeAttr('selected');
            $(elem).val(cmp[i].toLowerCase());
        }
        // Es un campo input
        else {
            $(elem).val(cmp[i]);
        }
    }

    // Actualizar boton eliminar
    $('#bt-eliminar').attr("onclick", "botonEliminar('" + cmp[0] + "')");
}

// Funcion que muestra la ventana para aceptar o rechazar la eliminacion de la pieza
function botonEliminar(cmp_id) {
    var cmp = getCmpFromID(cmp_id);
    var descr = "¿Estás seguro de que quieres eliminar esta pieza? ";
    descr += "Esta acción no se puede deshacer.";
    if (window.confirm(descr)) {
        peticionEliminarComponente(cmp_id, parseInt(cmp[9]));
        if (document.getElementById("dialog") != null) {
            document.getElementById("dialog").remove();
        }
        accion = null;
    }
}

// Funcion que gestiona la insercion de una pieza y revisa si hay que subir textura
function insertarComponente() {
    var file = document.getElementById("inp-file1").files[0];
    var formData = new FormData();
    if (file == undefined) {
        peticionInsertarComponente();
    }
    else {
        var datos = generarArrayDatos();
        formData.append("file", file);
        formData.append("cmp_id", datos[0]);
        formData.append("tipo", datos[9]);
        peticionSubirTextura(formData);
    }
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES POST Y GET

// Funcion que solicita a la BD todos los componentes
function peticionComponentes() {
    spinnerLoading(true);
    $.get("php/consult.php", {
        tabla: "componentes"
    })
        .done(function (data) {
            spinnerLoading(false);
            // Error con la conexion de la BD
            if (data == "errorBD") {
                var descr = "Imposible realizar esta operación por un error ";
                descr += "con la base de datos. Estamos trabajando para solventarlo.";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            // Peticion correcta
            else {
                componentes = JSON.parse(data); // actualizar variable global
                crearTarjetasComponentes($("#filtros").val());
            }
        });
}

// Funcion que introduce/edita un componente en la BD
function peticionInsertarComponente() {
    spinnerLoading(true);
    var datos = generarArrayDatos();
    console.log(datos);
    $.post("php/insert.php", {
        tabla: "insertar_pieza",
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
                var descr = "Se ha " + accion + " la pieza en la Base de Datos ";
                descr += "de manera correcta."
                crearAviso("alert-success", "Éxito", descr, 4000);
                document.getElementById("dialog").remove();
                accion = null;
                peticionComponentes();
            }
        });
}

// Peticion que guarda la textura subida en el servidor
function peticionSubirTextura(formData) {
    $.ajax({
        url: "php/uploadTexture.php",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            spinnerLoading(false);
            console.log(data);
            // Credenciales incorrectas
            if (data == "errorCredenciales") {
                var descr = "Credenciales incorrectas";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            // Error extension
            else if (data == "false") {
                var descr = "Formato de archivo no válido. Solo se permite .png o .jpg";
                crearAviso("alert-danger", "Error", descr, 5000);
            }
            // Peticion correcta
            else {
                peticionInsertarComponente();
            }
        }
    });
}

// Funcion que introduce/edita un componente en la BD
function peticionEliminarComponente(cmp_id, tipo) {
    spinnerLoading(true);
    $.post("php/insert.php", {
        tabla: "eliminar_pieza",
        username: username,
        password: password,
        cmp_id: cmp_id,
        tipo: tipo
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
                var descr = "Se ha eliminado la pieza correctamente."
                crearAviso("alert-success", "Éxito", descr, 4000);
                peticionComponentes();
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
        tipo: 1
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
                $("#filtros").prop("disabled", false);

                // Mostrar piezas
                peticionComponentes();
                $("#filtros").val("null");
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
        tipo: 1
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
        tipo: 1
    })
        .done(function (data) {
            location.reload();
        });
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES DE CREACION DE ELEMENTOS

// Funcion que crea todas las tarjetas de las piezas
function crearTarjetasComponentes(tipo) {
    if (tipo == "null") tipo = null;
    // Eliminar las tarjetas (si existen)
    const parent = document.getElementById("tarjetas-piezas");
    while (parent.firstChild) {
        parent.firstChild.remove();
    }

    var keys = Object.keys(componentes); // Obtener claves
    var nombres = getNombresTiposComponentes(); // Obtener nombres mayusculas
    var campos = getNombresCamposExtra(); // Obtener campos extra y unidades

    for (var i = 0; i < keys.length; i++) {
        if (tipo != null && keys[i] != tipo) continue;
        for (var j = 0; j < componentes[keys[i]].length; j++) {
            var cmp = componentes[keys[i]][j];
            // Crear titulo y barra
            if (j == 0) {
                if (i != 0 && tipo == null) {
                    var hr = document.createElement("hr");
                    document.getElementById("tarjetas-piezas").appendChild(hr);
                }
                var tit = document.createElement("h3");
                tit.innerHTML = nombres[keys[i]];
                document.getElementById("tarjetas-piezas").appendChild(tit);
            }

            // Crear tarjeta
            var card = document.createElement("div");
            card.setAttribute("class", "card mt-3");
            var cuerpo = document.createElement("div");
            cuerpo.setAttribute("class", "card-body");
            var nombre = document.createElement("h5");
            nombre.setAttribute("class", "card-title");
            nombre.innerHTML = cmp[1];
            var texto = document.createElement("div");
            texto.setAttribute("class", "card-text");
            var fila1 = document.createElement("div");
            fila1.setAttribute("class", "row");
            var fila2 = document.createElement("div");
            fila2.setAttribute("class", "row");
            var col11 = document.createElement("div");
            col11.setAttribute("class", "col-lg-4 row");
            var elem11 = document.createElement("div");
            elem11.setAttribute("class", "col max-w130");
            elem11.innerHTML = "<strong>" + Object.keys(campos[keys[i]])[0] + "</strong>";
            var elem12 = document.createElement("div");
            elem12.setAttribute("class", "col");
            elem12.innerHTML = cmp[11] + campos[keys[i]][Object.keys(campos[keys[i]])[0]];
            col11.appendChild(elem11);
            col11.appendChild(elem12);
            fila1.appendChild(col11);

            if (cmp.length > 12) {
                var col12 = document.createElement("div");
                col12.setAttribute("class", "col-lg-4 row");
                var elem21 = document.createElement("div");
                elem21.setAttribute("class", "col max-w130");
                elem21.innerHTML = "<strong>" + Object.keys(campos[keys[i]])[1] + "</strong>";
                var elem22 = document.createElement("div");
                elem22.setAttribute("class", "col");
                elem22.innerHTML = cmp[12] + campos[keys[i]][Object.keys(campos[keys[i]])[1]];
                col12.append(elem21);
                col12.append(elem22);
                fila1.appendChild(col12);
            }
            if (cmp.length > 13) {
                var col13 = document.createElement("div");
                col13.setAttribute("class", "col-lg-4 row");
                var elem31 = document.createElement("div");
                elem31.setAttribute("class", "col max-w130");
                elem31.innerHTML = "<strong>" + Object.keys(campos[keys[i]])[2] + "</strong>";
                var elem32 = document.createElement("div");
                elem32.setAttribute("class", "col");
                elem32.innerHTML = cmp[13] + campos[keys[i]][Object.keys(campos[keys[i]])[2]];
                col13.append(elem31);
                col13.append(elem32);
                fila1.appendChild(col13);
            }
            if (cmp.length > 14) {
                var col21 = document.createElement("div");
                col21.setAttribute("class", "col-lg-4 row");
                var elem41 = document.createElement("div");
                elem41.setAttribute("class", "col max-w130");
                elem41.innerHTML = "<strong>" + Object.keys(campos[keys[i]])[3] + "</strong>";
                var elem42 = document.createElement("div");
                elem42.setAttribute("class", "col");
                elem42.innerHTML = cmp[14] + campos[keys[i]][Object.keys(campos[keys[i]])[3]];
                col21.append(elem41);
                col21.append(elem42);
                fila2.appendChild(col21);
            }
            if (cmp.length > 15) {
                var col22 = document.createElement("div");
                col22.setAttribute("class", "col-lg-4 row");
                var elem51 = document.createElement("div");
                elem51.setAttribute("class", "col max-w130");
                elem51.innerHTML = "<strong>" + Object.keys(campos[keys[i]])[4] + "</strong>";
                var elem52 = document.createElement("div");
                elem52.setAttribute("class", "col");
                elem52.innerHTML = cmp[15] + campos[keys[i]][Object.keys(campos[keys[i]])[4]];
                col22.append(elem51);
                col22.append(elem52);
                fila2.appendChild(col22);
            }
            if (cmp.length > 16) {
                var col23 = document.createElement("div");
                col23.setAttribute("class", "col-lg-4 row");
                var elem61 = document.createElement("div");
                elem61.setAttribute("class", "col max-w130");
                elem61.innerHTML = "<strong>" + Object.keys(campos[keys[i]])[5] + "</strong>";
                var elem62 = document.createElement("div");
                elem62.setAttribute("class", "col");
                elem62.innerHTML = cmp[16] + campos[keys[i]][Object.keys(campos[keys[i]])[5]];
                col23.append(elem61);
                col23.append(elem62);
                fila2.appendChild(col23);
            }

            // Botones
            var botones = document.createElement("div");
            botones.setAttribute("class", "mt-3");
            var bot1 = document.createElement("a");
            bot1.setAttribute("class", "boton-a");
            bot1.setAttribute("onclick", "crearVentanaSinInputs('" + cmp[0] + "')");
            bot1.innerHTML = "<i class='fa-regular fa-bookmark me-1'></i></i>Detalles";
            var bot2 = document.createElement("a");
            bot2.setAttribute("class", "boton-a ms-3");
            bot2.setAttribute("onclick", "crearVentanaInputs('" + cmp[0] + "')");
            bot2.innerHTML = "<i class='fa-regular fa-pen-to-square me-1'></i></i>Editar";
            var bot3 = document.createElement("a");
            bot3.setAttribute("class", "boton-a ms-3");
            bot3.setAttribute("onclick", "botonEliminar('" + cmp[0] + "')");
            bot3.innerHTML = "<i class='fa fa-ban me-1'></i></i>Eliminar";
            botones.appendChild(bot1);
            botones.appendChild(bot2);
            botones.appendChild(bot3);

            // Appends finales
            texto.appendChild(fila1);
            texto.appendChild(fila2);
            cuerpo.appendChild(nombre);
            cuerpo.appendChild(texto);
            cuerpo.appendChild(botones);
            card.appendChild(cuerpo);
            document.getElementById("tarjetas-piezas").appendChild(card);
        }
    }
}

// Funcion que crea una ventana con inputs (para editar o crear de 0)
function crearVentanaInputs(cmp_id) {
    accion = "introducido";
    // Eliminar si ya hay una ventana existente
    if (document.getElementById("dialog") != null) {
        document.getElementById("dialog").remove();
    }

    var dialog = document.createElement("div");
    dialog.setAttribute("class", "centered-dialog");
    dialog.setAttribute("id", "dialog");
    var form = document.createElement("form");
    form.setAttribute("class", "row mt-3 mb-3 m-3");
    var close = document.createElement("a");
    setAttributes(close, { onclick: "cerrarVentana(this)", class: "close-thik" });
    var tit = document.createElement("h4");
    tit.setAttribute("class", "row ms-0 mt-1 mb-3");
    if (cmp_id == null) tit.innerHTML = "Introducir Pieza";
    else tit.innerHTML = "Editar Pieza";
    // Nombre
    var nombre0 = document.createElement("div");
    nombre0.setAttribute("class", "row");
    var nombre1 = document.createElement("h6");
    nombre1.setAttribute("class", "col mt-1 mb-3 max-w100");
    nombre1.innerHTML = "<strong>Nombre:</strong>";
    var nombre2 = document.createElement("input");
    nombre2.setAttribute("class", "col font-size-input width1-input height2-input");
    setAttributes(nombre2, { id: "inp-nombre", type: "text", required: "", minlength: "1" });
    setAttributes(nombre2, { maxlength: "50", oninput: "revisarCamposVacios()" });
    nombre0.appendChild(nombre1);
    nombre0.appendChild(nombre2);

    var col1 = document.createElement("div");
    col1.setAttribute("class", "col-lg-5 mb-4");
    // Descripcion
    var descr1 = document.createElement("h6");
    descr1.setAttribute("class", "mb-1");
    descr1.innerHTML = "<strong>Descripción:</strong>";
    var descr2 = document.createElement("textarea");
    setAttributes(descr2, { id: "inp-descripcion", class: "font-size-input col-12 ps-1" });
    setAttributes(descr2, { rows: "4", maxlength: "190", oninput: "revisarCamposVacios()" });
    // Dimensiones
    var dim1 = document.createElement("h6");
    dim1.setAttribute("class", "mt-3 mb-1");
    dim1.innerHTML = "<strong>Dimensiones en mm (ancho X alto X fondo):</strong>";
    var dim2 = document.createElement("div");
    dim2.setAttribute("class", "row ms-0");
    var dim3 = document.createElement("input");
    dim3.setAttribute("class", "col font-size-input width2-input height2-input");
    setAttributes(dim3, { id: "inp-ancho", type: "text", required: "", minlength: "1" });
    setAttributes(dim3, { maxlength: "3", oninput: "revisarCamposVacios()" });
    var dim4 = document.createElement("p");
    dim4.setAttribute("class", "col text-center max-w40");
    dim4.innerHTML = "X";
    var dim5 = document.createElement("input");
    dim5.setAttribute("class", "col font-size-input width2-input height2-input");
    setAttributes(dim5, { id: "inp-alto", type: "text", required: "", minlength: "1" });
    setAttributes(dim5, { maxlength: "3", oninput: "revisarCamposVacios()" });
    var dim6 = document.createElement("p");
    dim6.setAttribute("class", "col text-center max-w40");
    dim6.innerHTML = "X";
    var dim7 = document.createElement("input");
    dim7.setAttribute("class", "col font-size-input width2-input height2-input");
    setAttributes(dim7, { id: "inp-fondo", type: "text", required: "", minlength: "1" });
    setAttributes(dim7, { maxlength: "3", oninput: "revisarCamposVacios()" });
    dim2.appendChild(dim3);
    dim2.appendChild(dim4);
    dim2.appendChild(dim5);
    dim2.appendChild(dim6);
    dim2.appendChild(dim7);
    // Textura
    var text1 = document.createElement("h6");
    text1.innerHTML = "<strong>Textura (subir o seleccionar):</strong>";
    var text100 = document.createElement("div");
    text100.setAttribute("class", "row");
    var text101 = document.createElement("div");
    text101.setAttribute("class", "col-xxl-10 mb-3");
    var text102 = document.createElement("div");
    text102.setAttribute("class", "col-xxl-2 text-start");
    var text2 = document.createElement("div");
    text2.setAttribute("id", "fileinput-container");
    var text20 = document.createElement("input");
    setAttributes(text20, { id: "inp-file1", type: "file", class: "row max-w-files mb-3 ms-0" });
    setAttributes(text20, { accept: ".png, .jpg", oninput: "inputTextura(true)" });
    var text3 = document.createElement("select");
    setAttributes(text3, { id: "inp-file2", class: "row max-w200 font-size-input ms-0" });
    setAttributes(text3, { onchange: "inputTextura(false); revisarCamposVacios()" });
    var text30 = document.createElement("option");
    setAttributes(text30, { value: "default", selected: "", disabled: "", hidden: "" });
    text30.innerHTML = "Seleccionar existente...";
    var text31 = document.createElement("option");
    var img = document.createElement("img");
    setAttributes(img, { id: "inp-textura", class: "textura", src: "" });
    text31.setAttribute("value", "defaultTexture");
    var src = "default-cpu.jpg";
    if (cmp_id != null) {
        var tipo = cmp_id.replace("cmp-", "").split("-")[0];
        src = "default-" + tipo + ".jpg";
        if (tipo == "disco") {
            var cmp = getCmpFromID(cmp_id);
            if (cmp[11] == "HDD") src = "default-hdd.jpg";
            else src = "default-ssd.jpg";
        }
    }
    text31.setAttribute("title", src);
    text31.innerHTML = "Default Texture";
    text2.appendChild(text20);
    text3.appendChild(text30);
    text3.appendChild(text31);
    text101.appendChild(text2);
    text101.appendChild(text3);
    text102.appendChild(img);
    text100.appendChild(text101);
    text100.appendChild(text102);

    var col2 = document.createElement("div");
    col2.setAttribute("class", "col-lg-2");
    var col3 = document.createElement("div");
    col3.setAttribute("class", "col-lg-5 mb-3");
    // Marca
    var marca0 = document.createElement("div");
    marca0.setAttribute("class", "row");
    var marca1 = document.createElement("h6");
    marca1.setAttribute("class", "col max-w170");
    marca1.innerHTML = "<strong>Marca:</strong>";
    var marca2 = document.createElement("input");
    marca2.setAttribute("class", "col font-size-input width3-input height2-input ps-1");
    setAttributes(marca2, { id: "inp-marca", type: "text", required: "", minlength: "1" });
    setAttributes(marca2, { maxlength: "20", oninput: "revisarCamposVacios()" });
    marca0.appendChild(marca1);
    marca0.appendChild(marca2);
    // Modelo
    var mod0 = document.createElement("div");
    mod0.setAttribute("class", "row mt-2");
    var mod1 = document.createElement("h6");
    mod1.setAttribute("class", "col max-w170");
    mod1.innerHTML = "<strong>Modelo:</strong>";
    var mod2 = document.createElement("input");
    mod2.setAttribute("class", "col font-size-input width3-input height2-input ps-1");
    setAttributes(mod2, { id: "inp-modelo", type: "text", required: "", minlength: "1" });
    setAttributes(mod2, { maxlength: "20", oninput: "revisarCamposVacios()" });
    mod0.appendChild(mod1);
    mod0.appendChild(mod2);
    // Tipo de pieza
    var tipo0 = document.createElement("div");
    tipo0.setAttribute("class", "row mt-2");
    var tipo1 = document.createElement("h6");
    tipo1.setAttribute("class", "col max-w170");
    tipo1.innerHTML = "<strong>Tipo de pieza:</strong>";
    var tipo2 = document.createElement("select");
    tipo2.setAttribute("class", "col font-size-input width3-input height2-input ps-0");
    setAttributes(tipo2, { id: "inp-tipo", onchange: "actualizarInputsExtra(); revisarCamposVacios()" });
    if (cmp_id != null) tipo2.setAttribute("disabled", "");
    var tipo20 = document.createElement("option");
    setAttributes(tipo20, { value: "default", selected: "", disabled: "", hidden: "" });
    tipo20.innerHTML = "Elegir...";
    tipo2.appendChild(tipo20);
    var valores = ["placabase", "cpu", "ventilador", "ram", "disco", "fuente", "gpu"];
    var textos = ["Placa Base", "CPU", "Ventilador", "RAM", "Disco", "Fuente", "GPU"];
    for (var i = 0; i < valores.length; i++) {
        var opt = document.createElement("option");
        opt.setAttribute("value", valores[i]);
        opt.innerHTML = textos[i];
        tipo2.appendChild(opt);
    }
    tipo0.appendChild(tipo1);
    tipo0.appendChild(tipo2);
    // Extras
    var extras = document.createElement("div");
    setAttributes(extras, { id: "extras", class: "mt-4" });

    // Boton
    var linea = document.createElement("hr");
    var bot0 = document.createElement("div");
    bot0.setAttribute("class", "text-center");
    var bot1 = document.createElement("button");
    setAttributes(bot1, { id: "bt-guardar", type: "button", class: "boton-guardar me-2" });
    setAttributes(bot1, { onclick: "insertarComponente()", disabled: "" });
    if (cmp_id == null) {
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


    // Appends
    dialog.appendChild(form);
    form.appendChild(close);
    form.appendChild(tit);
    form.appendChild(nombre0);
    form.appendChild(col1);
    col1.appendChild(descr1);
    col1.appendChild(descr2);
    col1.appendChild(dim1);
    col1.appendChild(dim2);
    col1.appendChild(text1);
    col1.appendChild(text100);
    form.appendChild(col2);
    form.appendChild(col3);
    col3.appendChild(marca0);
    col3.appendChild(mod0);
    col3.appendChild(tipo0);
    col3.appendChild(extras);
    form.appendChild(linea);
    form.appendChild(bot0);
    document.getElementById("body").appendChild(dialog);

    // Rellenar si la pieza ya existe y se tiene que editar
    if (cmp_id != null) rellenarInputs(cmp_id);

    var collapser = document.getElementById("collapser");
    moverVentanaAbajo(collapser);
}

// Funcion que crea una ventana sin inputs (para visualizar una pieza)
function crearVentanaSinInputs(cmp_id) {
    // Eliminar si ya hay una ventana existente
    if (document.getElementById("dialog") != null) {
        document.getElementById("dialog").remove();
    }

    var cmp = getCmpFromID(cmp_id); // obtener componente
    var tipo = cmp_id.replace("cmp-", "").split("-")[0];
    var nombres = getNombresTiposComponentes(); // Obtener nombres mayusculas
    var campos = getNombresCamposExtra(); // Obtener campos extra y unidades

    // Crear campos
    var dialog = document.createElement("div");
    setAttributes(dialog, { id: "dialog", class: "centered-dialog" });
    var form = document.createElement("form");
    form.setAttribute("class", "row mt-3 mb-3 m-3");
    var close = document.createElement("a");
    setAttributes(close, { onclick: "cerrarVentana(this)", class: "close-thik" });
    var tit = document.createElement("h5");
    tit.setAttribute("class", "row ms-0 mt-1 mb-3");
    tit.innerHTML = cmp[1];
    var col1 = document.createElement("div");
    col1.setAttribute("class", "col-lg-5 mb-4");
    var descr1 = document.createElement("h6");
    descr1.setAttribute("class", "mb-1");
    descr1.innerHTML = "<strong>Descripción:</strong>";
    var descr2 = document.createElement("div");
    descr2.setAttribute("class", "justificar");
    descr2.innerHTML = cmp[2];
    var dim1 = document.createElement("h6");
    dim1.setAttribute("class", "mt-3 mb-1");
    dim1.innerHTML = "<strong>Dimensiones (ancho X alto X fondo):</strong>";
    var dim2 = document.createElement("p");
    dim2.innerHTML = cmp[3] * 1000 + "mm x " + cmp[4] * 1000 + "mm x " + cmp[5] * 1000 + "mm";
    var txt1 = document.createElement("h6");
    txt1.innerHTML = "<strong>Textura:</strong>";
    var txt2 = document.createElement("img");
    setAttributes(txt2, { class: "textura", src: "assets/texturesComponents/" + cmp[6] });
    col1.appendChild(descr1);
    col1.appendChild(descr2);
    col1.appendChild(dim1);
    col1.appendChild(dim2);
    col1.appendChild(txt1);
    col1.appendChild(txt2);

    var col2 = document.createElement("div");
    col2.setAttribute("class", "col-lg-2");
    var col3 = document.createElement("div");
    col3.setAttribute("class", "col-lg-5 mb-3");
    var marca = document.createElement("h6");
    marca.innerHTML = "<strong>Marca: </strong> " + cmp[7];
    var modelo = document.createElement("h6");
    modelo.innerHTML = "<strong>Modelo: </strong> " + cmp[8];
    var tipo1 = document.createElement("h6");
    tipo1.innerHTML = "<strong>Tipo: </strong> " + nombres[tipo];
    col3.appendChild(marca);
    col3.appendChild(modelo);
    col3.appendChild(tipo1);

    // Campos extra
    var extra1 = document.createElement("h6");
    extra1.setAttribute("class", "mt-4");
    var valor = cmp[11] + campos[tipo][Object.keys(campos[tipo])[0]];
    extra1.innerHTML = "<strong>" + Object.keys(campos[tipo])[0] + " </strong>" + valor;
    col3.appendChild(extra1);
    if (cmp.length > 12) {
        var extra2 = document.createElement("h6");
        var valor = cmp[12] + campos[tipo][Object.keys(campos[tipo])[1]];
        extra2.innerHTML = "<strong>" + Object.keys(campos[tipo])[1] + " </strong>" + valor;
        col3.appendChild(extra2);
    }
    if (cmp.length > 13) {
        var extra3 = document.createElement("h6");
        var valor = cmp[13] + campos[tipo][Object.keys(campos[tipo])[2]];
        extra3.innerHTML = "<strong>" + Object.keys(campos[tipo])[2] + " </strong>" + valor;
        col3.appendChild(extra3);
    }
    if (cmp.length > 14) {
        var extra4 = document.createElement("h6");
        var valor = cmp[14] + campos[tipo][Object.keys(campos[tipo])[3]];
        extra4.innerHTML = "<strong>" + Object.keys(campos[tipo])[3] + " </strong>" + valor;
        col3.appendChild(extra4);
    }
    if (cmp.length > 15) {
        var extra5 = document.createElement("h6");
        var valor = cmp[15] + campos[tipo][Object.keys(campos[tipo])[4]];
        extra5.innerHTML = "<strong>" + Object.keys(campos[tipo])[4] + " </strong>" + valor;
        col3.appendChild(extra5);
    }
    if (cmp.length > 16) {
        var extra6 = document.createElement("h6");
        var valor = cmp[16] + campos[tipo][Object.keys(campos[tipo])[5]];
        extra6.innerHTML = "<strong>" + Object.keys(campos[tipo])[5] + " </strong>" + valor;
        col3.appendChild(extra6);
    }
    // Botones
    var hr = document.createElement("hr");
    var botones = document.createElement("div");
    botones.setAttribute("class", "text-center");
    var bot1 = document.createElement("button");
    setAttributes(bot1, { id: "bt-editar", type: "button", class: "boton-editar me-2" });
    bot1.setAttribute("onclick", "crearVentanaInputs('" + cmp_id + "')");
    bot1.innerHTML = "Editar";
    var bot2 = document.createElement("button");
    setAttributes(bot2, { id: "bt-eliminar", type: "button", class: "boton-eliminar ms-2" });
    bot2.setAttribute("onclick", "botonEliminar()");
    bot2.innerHTML = "Eliminar";
    botones.appendChild(bot1);
    botones.appendChild(bot2);

    // Appends
    form.appendChild(close);
    form.appendChild(tit);
    form.appendChild(col1);
    form.appendChild(col2);
    form.appendChild(col3);
    form.appendChild(hr);
    form.appendChild(botones);
    dialog.appendChild(form);
    document.getElementById("body").appendChild(dialog);
}

// Funcion que crea/elimina los campos de inputs extra
function actualizarInputsExtra(cmp) {
    console.log(cmp);
    // Actualizar textura default (porque se acaba de cambiar el tipo)
    var tipo = $('#inp-tipo').find(":selected").val();
    var src = "default-" + tipo + ".jpg";
    if (tipo == "disco") {
        if (cmp != null && cmp[11] == "HDD") src = "default-hdd.jpg";
        else src = "default-ssd.jpg";
    }
    $("#inp-file2 option[value='defaultTexture']").attr("title", src);

    // Si se ha cargado la default, actualizarla con el tipo de componente
    var opcion = $("#inp-file2").find(":selected").val();
    if (opcion == "defaultTexture") {
        $('#inp-textura').attr("src", "assets/texturesComponents/" + src);
    }

    // Eliminar campos extra actuales (si hay)
    const parent = document.getElementById("extras");
    while (parent.firstChild) {
        parent.firstChild.remove();
    }

    // Definir campos extra segun el tipo
    var campos = {
        "placabase": {
            "Tipo:": ["ATX", "Micro ATX"],
            "Socket CPU:": null,
            "Slots RAM:": ["1", "2", "3", "4"],
            "Slots HDD:": ["1", "2", "3", "4", "5", "6", "7", "8"],
            "Slots SSD:": ["1", "2", "3", "4"]
        },
        "cpu": {
            "Arquitectura:": ["Intel", "AMD"],
            "Socket:": null,
            "Núcleos:": null,
            "Frec. Base (GHz):": null,
            "Frec. Turbo (GHz):": null,
            "Consumo (W):": null
        },
        "ventilador": {
            "Velocidad (RPM):": null
        },
        "ram": {
            "Estándar:": ["DDR", "DDR2", "DDR3", "DDR4", "DDR5"],
            "Velocidad (MHz):": null,
            "Capacidad (GB):": null
        },
        "disco": {
            "Tipo:": ["HDD", "SSD"],
            "Velocidad (MB/s):": null,
            "Capacidad (GB):": null
        },
        "fuente": {
            "Tipo:": ["ATX", "SFX"],
            "Potencia (W):": null
        },
        "gpu": {
            "Memoria (GB):": null,
            "VRAM (Gbps):": null,
            "Consumo (W):": null
        }
    };
    var extras = campos[tipo];
    for (var i = 0; i < Object.keys(extras).length; i++) {
        var key = Object.keys(extras)[i]; // Obtener clave del JSON
        var extra0 = document.createElement("div");
        extra0.setAttribute("class", "row mt-2");
        var extra1 = document.createElement("h6");
        extra1.setAttribute("class", "col max-w170");
        extra1.innerHTML = "<strong>" + key + "</strong>";

        // Crear dropdown
        if (extras[key] != null) {
            var extra2 = document.createElement("select");
            extra2.setAttribute("class", "col font-size-input width3-input height2-input ps-0");
            setAttributes(extra2, { id: "inp-extra" + (i + 1), onchange: "revisarCamposVacios()" });
            var extra20 = document.createElement("option");
            setAttributes(extra20, { value: "default", selected: "", disabled: "", hidden: "" });
            extra20.innerHTML = "Elegir...";
            extra2.appendChild(extra20);
            for (var j = 0; j < extras[key].length; j++) {
                var opt = document.createElement("option");
                opt.setAttribute("value", extras[key][j].toLowerCase());
                opt.innerHTML = extras[key][j];
                extra2.appendChild(opt);
            }
        }
        // Crear campo input
        else {
            var extra2 = document.createElement("input");
            extra2.setAttribute("class", "col font-size-input width3-input height2-input ps-1");
            setAttributes(extra2, { id: "inp-extra" + (i + 1), type: "text", required: "" });
            setAttributes(extra2, { minlength: "1", maxlength: "20", oninput: "revisarCamposVacios()" });
        }

        // Append element
        extra0.appendChild(extra1);
        extra0.appendChild(extra2);
        document.getElementById("extras").appendChild(extra0);
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

// Funcion que devuelve todo un elemento componente a partir de un id
function getCmpFromID(id) {
    var tipo = id.replace("cmp-", "").split("-")[0];
    // Recorrer todos los componentes de ese tipo
    for (var i = 0; i < componentes[tipo].length; i++) {
        if (componentes[tipo][i][0] == id) {
            return componentes[tipo][i];
        }
    }
    return null;
}

function getDimensionesDefault(tipo) {
    var dimensiones = {
        "placabase": [[240, 30, 300], [240, 30, 240]],
        "cpu": [[80, 15, 90]],
        "ventilador": [[70, 30, 70]],
        "ram": [[3, 30, 130]],
        "disco": [[100, 145, 25], [80, 22, 3]],
        "fuente": [[150, 85, 150], [125, 63, 100]],
        "gpu": [[215, 110, 38]]
    };
    if (tipo == "placabase") {
        if ($("#inp-extra1").val() == "atx") {
            return dimensiones["placabase"][0];
        }
        else if ($("#inp-extra1").val() == "micro atx") {
            return dimensiones["placabase"][1];
        }
        else return ["", "", ""];
    }
    else if (tipo == "disco") {
        if ($("#inp-extra1").val() == "hdd") {
            return dimensiones["disco"][0];
        }
        else if ($("#inp-extra1").val() == "ssd") {
            return dimensiones["disco"][1];
        }
        else return ["", "", ""];
    }
    else if (tipo == "fuente") {
        if ($("#inp-extra1").val() == "atx") {
            return dimensiones["fuente"][0];
        }
        else if ($("#inp-extra1").val() == "sfx") {
            return dimensiones["fuente"][1];
        }
        else return ["", "", ""];
    }
    else return dimensiones[tipo][0];
}

// Funcion que genera un array con los datos introducidos en los inputs
function generarArrayDatos() {
    var id = $("#inp-nombre").attr("title");
    if (id == undefined) id = null;
    var tipos = ["placabase", "cpu", "ventilador", "ram", "disco", "fuente", "gpu"];

    // Gestionar textura
    var textura = $("#inp-textura").attr("src").replace("assets/texturesComponents/", "");
    if ($("#inp-file2").val() == null) textura = null;
    var datos = [
        id,
        $("#inp-nombre").val(),
        $("#inp-descripcion").val(),
        $("#inp-ancho").val() / 1000,
        $("#inp-alto").val() / 1000,
        $("#inp-fondo").val() / 1000,
        textura,
        $("#inp-marca").val(),
        $("#inp-modelo").val(),
        (tipos.indexOf($("#inp-tipo").val())) + 1,
        id
    ];
    if ($("#inp-extra1").val() != undefined) {
        if ($("#inp-extra1").is("select")) datos.push($('#inp-extra1').find(":selected").text());
        else datos.push($('#inp-extra1').val());
    }
    else datos.push(null);
    if ($("#inp-extra2").val() != undefined) {
        if ($("#inp-extra2").is("select")) datos.push($('#inp-extra2').find(":selected").text());
        else datos.push($('#inp-extra2').val());
    }
    else datos.push(null);
    if ($("#inp-extra3").val() != undefined) {
        if ($("#inp-extra3").is("select")) datos.push($('#inp-extra3').find(":selected").text());
        else datos.push($('#inp-extra3').val());
    }
    else datos.push(null);
    if ($("#inp-extra4").val() != undefined) {
        if ($("#inp-extra4").is("select")) datos.push($('#inp-extra4').find(":selected").text());
        else datos.push($('#inp-extra4').val());
    }
    else datos.push(null);
    if ($("#inp-extra5").val() != undefined) {
        if ($("#inp-extra5").is("select")) datos.push($('#inp-extra5').find(":selected").text());
        else datos.push($('#inp-extra5').val());
    }
    else datos.push(null);
    if ($("#inp-extra6").val() != undefined) {
        if ($("#inp-extra6").is("select")) datos.push($('#inp-extra6').find(":selected").text());
        else datos.push($('#inp-extra6').val());
    }
    else datos.push(null);
    console.log(datos);
    return datos;
}

// Funcion que devuelve un JSON con los tipos de componentes
function getNombresTiposComponentes() {
    return {
        "placabase": "Placa Base",
        "cpu": "CPU",
        "ventilador": "Ventilador",
        "ram": "RAM",
        "disco": "Disco",
        "fuente": "Fuente",
        "gpu": "GPU"
    };
}

// Funcion que devuelve un JSON con los nombres de los campos extra (segun el tipo)
function getNombresCamposExtra() {
    return {
        "placabase": {
            "Tipo:": "",
            "Socket CPU:": "",
            "Slots RAM:": "",
            "Slots HDD:": "",
            "Slots SSD:": ""
        },
        "cpu": {
            "Arquitectura:": "",
            "Socket:": "",
            "Núcleos:": "",
            "Frec. Base:": " GHz",
            "Frec. Turbo:": " GHz",
            "Consumo:": " W"
        },
        "ventilador": {
            "Velocidad:": " RPM"
        },
        "ram": {
            "Estándar:": "",
            "Velocidad:": " MHz",
            "Capacidad:": " GB"
        },
        "disco": {
            "Tipo:": "",
            "Velocidad:": " MB/s",
            "Capacidad:": " GB"
        },
        "fuente": {
            "Tipo:": "",
            "Potencia:": " W"
        },
        "gpu": {
            "Memoria:": " GB",
            "VRAM:": " Gbps",
            "Consumo:": " W"
        }
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
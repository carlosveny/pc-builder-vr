/*
    Fichero que gestiona el apartado de las estadisticas (en VR),
    mostrando las estadisticas mas recientes y proporcionando un
    link a la web (sin VR) para ver mas detalles y aplicar filtros
*/

// VARIABLES GLOBALES
var estadisticas = null; // Array de estadisticas de la BD

// Funcion que crea y muestra el menu de las estadisticas
function mostrarEstadisticas() {
    borrarMenuActual();
    elementoMenu("", 1.6, 1.3, "0 1.6 -1.8", 0, "menu-estadisticas", false, "", "1 5");

    // Titulo
    var textTitulo = document.createElement("a-text");
    setAttributes(textTitulo, { position: "0 0.56 0.05", scale: "0.35 0.35 0.35" });
    setAttributes(textTitulo, { value: "Estadísticas", color: "black", align: "center" });
    textTitulo.setAttribute("font-open-sans", "");

    // Boton atras y link a estadisticas.html
    var botonAtras = crearBotonAtras();
    var info = document.createElement("a-text");
    var valor = "Para visualizar todas las estadísticas y poder usar filtros ";
    valor += "puedes usar el siguiente link:\t\t\t\t\t\t\t\t";
    setAttributes(info, { position: "0 -0.5 0.03", scale: "0.3 0.3 0.3" });
    setAttributes(info, { value: valor, color: "black", align: "center" });
    info.setAttribute("wrap-count", "60");
    info.setAttribute("font-open-sans", "");
    var link = document.createElement("a-text");
    valor = "Estadísticas (Sin VR)";
    setAttributes(link, { position: "0.2 -0.53 0.03", scale: "0.2 0.2 0.2" });
    setAttributes(link, { value: valor, color: "blue", align: "center", class: "raycastable" });
    setAttributes(link, { geometry: "primitive:plane; height: 0.3; width: 2" });
    link.setAttribute("onclick", "redirectEstadisticas()");
    link.setAttribute("material", "opacity: 0.0; transparent: true");
    link.setAttribute("font-open-sans", "");
    link.setAttribute("hc-sound", "");

    // Append
    document.getElementById("menu-estadisticas").appendChild(textTitulo);
    document.getElementById("menu-estadisticas").appendChild(botonAtras);
    document.getElementById("menu-estadisticas").appendChild(info);
    document.getElementById("menu-estadisticas").appendChild(link);

    // Mostrar aviso si no hay sesion iniciada
    if (getActualUsername() == "") {
        var text = document.createElement("a-text");
        var valor = "Aviso: No se muestran estadísticas porque no has iniciado sesión.";
        setAttributes(text, { position: "0 0.45 0.03", scale: "0.27 0.27 0.27" });
        setAttributes(text, { value: valor, color: "red", align: "center" });
        text.setAttribute("wrap-count", "60");
        text.setAttribute("font-open-sans", "");
        document.getElementById("menu-estadisticas").appendChild(text);
    }
    else cargarEstadisticas();
}

// Funcion que carga 5 (o menos) estadisticas del usuario registrado
function cargarEstadisticas() {
    var tit1 = document.createElement("a-text");
    setAttributes(tit1, { position: "-0.71 0.34 0.03", scale: "0.19 0.19 0.19" });
    setAttributes(tit1, { value: "Usuario", color: "black", align: "left" });
    tit1.setAttribute("font-open-sans", "");
    var tit2 = document.createElement("a-text");
    setAttributes(tit2, { position: "-0.35 0.34 0.03", scale: "0.19 0.19 0.19" });
    setAttributes(tit2, { value: "Prueba", color: "black", align: "left" });
    tit2.setAttribute("font-open-sans", "");
    var tit3 = document.createElement("a-text");
    setAttributes(tit3, { position: "0.15 0.34 0.03", scale: "0.19 0.19 0.19" });
    setAttributes(tit3, { value: "Fecha", color: "black", align: "left" });
    tit3.setAttribute("font-open-sans", "");
    var tit4 = document.createElement("a-text");
    setAttributes(tit4, { position: "0.41 0.34 0.03", scale: "0.19 0.19 0.19" });
    setAttributes(tit4, { value: "Tiempo", color: "black", align: "left" });
    tit4.setAttribute("font-open-sans", "");
    var tit5 = document.createElement("a-text");
    setAttributes(tit5, { position: "0.61 0.34 0.03", scale: "0.19 0.19 0.19" });
    setAttributes(tit5, { value: "Punt.", color: "black", align: "left" });
    tit5.setAttribute("font-open-sans", "");
    document.getElementById("menu-estadisticas").appendChild(tit1);
    document.getElementById("menu-estadisticas").appendChild(tit2);
    document.getElementById("menu-estadisticas").appendChild(tit3);
    document.getElementById("menu-estadisticas").appendChild(tit4);
    document.getElementById("menu-estadisticas").appendChild(tit5);

    if (estadisticas == null || estadisticas.length == 0) {
        var aviso = document.createElement("a-text");
        var valor = "Aún no hay datos para este usuario, juega algún nivel.";
        setAttributes(aviso, { position: "0 0.1 0.03", scale: "0.24 0.24 0.24" });
        setAttributes(aviso, { value: valor, color: "#d12d1b", align: "center" });
        aviso.setAttribute("font-open-sans", "");
        document.getElementById("menu-estadisticas").appendChild(aviso);
        return;
    }

    var y = 0.25;
    var max = estadisticas.length;
    if (estadisticas.length > 5) max = 5;
    for (var i = 0; i < max; i++) {
        var est1 = document.createElement("a-text");
        setAttributes(est1, { position: "-0.71 " + y + " 0.03", scale: "0.18 0.18 0.18" });
        setAttributes(est1, { value: actualUsername, color: "#404040", align: "left" });
        est1.setAttribute("font-open-sans", "");
        var est2 = document.createElement("a-text");
        setAttributes(est2, { position: "-0.35 " + y + " 0.03", scale: "0.18 0.18 0.18" });
        setAttributes(est2, { value: estadisticas[i][1], color: "#404040", align: "left" });
        est2.setAttribute("font-open-sans", "");
        var est3 = document.createElement("a-text");
        setAttributes(est3, { position: "0.15 " + y + " 0.03", scale: "0.18 0.18 0.18" });
        setAttributes(est3, { value: estadisticas[i][2], color: "#404040", align: "left" });
        est3.setAttribute("font-open-sans", "");
        var est4 = document.createElement("a-text");
        setAttributes(est4, { position: "0.43 " + y + " 0.03", scale: "0.18 0.18 0.18" });
        setAttributes(est4, { value: formatSeconds(estadisticas[i][3]), color: "#404040", align: "left" });
        est4.setAttribute("font-open-sans", "");
        var est5 = document.createElement("a-text");
        setAttributes(est5, { position: "0.61 " + y + " 0.03", scale: "0.18 0.18 0.18" });
        setAttributes(est5, { value: dosDecimales(estadisticas[i][4]), color: "#404040", align: "left" });
        est5.setAttribute("font-open-sans", "");

        document.getElementById("menu-estadisticas").appendChild(est1);
        document.getElementById("menu-estadisticas").appendChild(est2);
        document.getElementById("menu-estadisticas").appendChild(est3);
        document.getElementById("menu-estadisticas").appendChild(est4);
        document.getElementById("menu-estadisticas").appendChild(est5);
        y = y - 0.12;
    }


}

/* ---------------------------------------------------------------------------- */

// FUNCIONES AUXILIARES

// Funcion que redirige a linkedin
function redirectEstadisticas() {
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl.is('vr-mode')) sceneEl.exitVR();
    window.open(
        'estadisticas.html', '_blank'
    );
}

// Funcion que devuelve el valor dado en 2 decimales siempre
function dosDecimales(valor) {
    return (Math.round(valor * 100) / 100).toFixed(2);
}
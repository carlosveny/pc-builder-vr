/*
    Fichero que se encarga de mostrar todas las estadisticas de
    la base de datos. Se permite aplicar filtros y buscar determinados
    nombres de usuario
*/

// VARIABLES GLOBALES
var estadisticas; // objeto que contiene todas las estadisticas
var tabla = null;
var fPrueba = "null"; // para los filtros
var fUsuario = "null"; // para los filtros
var estPerPage = 5; // cantidad de estadisticas por pagina

// Funcion que se ejecuta cuando se carga la pagina
function loaded() {
    window.onresize = modificarDimensiones;
    peticionEstadisticas();
    cargarGrafico();
    cargarMapa();
}

// Funcion que hace la tabla mas pequeña o mas grande segun la pantalla
function modificarDimensiones() {
    if (window.innerWidth > 700) {
        $("#tabla").removeClass("table-sm");
    }
    else {
        $("#tabla").removeClass("table-sm");
        $("#tabla").addClass("table-sm");
    }
}

// Funcion que actualiza la tabla de las estadisticas aplicando los filtros
function actualizarTabla(tipo, valor) {
    // Vaciar tabla
    if (tabla != null) tabla.destroy();
    $('#tabla-cuerpo').empty();

    // Actualizar variables filtros
    if (tipo == "prueba") fPrueba = valor;
    else if (tipo == "usuario") fUsuario = valor;

    for (var i = 0; i < estadisticas.length; i++) {
        // Saltar si no cumple los filtros
        if (fPrueba != "null" && fUsuario != "null") {
            if (fPrueba != estadisticas[i][2] || fUsuario != estadisticas[i][1]) continue;
        }
        else if (fPrueba != "null") {
            if (fPrueba != estadisticas[i][2]) continue;
        }
        else if (fUsuario != "null") {
            if (fUsuario != estadisticas[i][1]) continue;
        }

        var fila = document.createElement("tr");
        // Numero
        var num = document.createElement("th");
        num.setAttribute("scope", "row");
        num.innerHTML = (i + 1);
        // Usuario
        var usuario = document.createElement("td");
        if (estadisticas[i][1] == 1) {
            usuario.innerHTML = estadisticas[i][7];
            usuario.classList.add("registrado");
        }
        else {
            usuario.innerHTML = estadisticas[i][0];
            usuario.classList.add("no-registrado");
        }
        // Prueba
        var prueba = document.createElement("td");
        prueba.innerHTML = estadisticas[i][2];
        // Fecha
        var fecha = document.createElement("td");
        fecha.innerHTML = estadisticas[i][3];
        // Tiempo
        var tiempo = document.createElement("td");
        tiempo.innerHTML = formatSeconds(estadisticas[i][4]);
        // Puntuacion
        var puntuacion = document.createElement("td");
        puntuacion.innerHTML = dosDecimales(estadisticas[i][5]);

        // Appends
        fila.appendChild(num);
        fila.appendChild(usuario);
        fila.appendChild(prueba);
        fila.appendChild(fecha);
        fila.appendChild(tiempo);
        fila.appendChild(puntuacion);
        document.getElementById("tabla-cuerpo").appendChild(fila);
    }

    // Sorting
    tabla = $('#tabla').DataTable({
        "lengthMenu": [[5, 10, 20, -1], [5, 10, 20, "Todas"]],
        "order": [[5, 'desc']],
        "columnDefs": [
            { "title": "#", "targets": 0 },
            { "title": "Usuario", "targets": 1 },
            { "title": "Prueba", "targets": 2 },
            { "title": "Fecha", "targets": 3 },
            { "title": "Tiempo", "targets": 4 },
            { "title": "Puntuación", "targets": 5 },

            { "searchable": false, "targets": [0, 2, 3, 4, 5] },
            { "orderable": false, "targets": [0] }
        ],
        "language": {
            "search": "Buscar usuario: ",
            "lengthMenu": "Mostrar _MENU_ estadísticas por página",
            "zeroRecords": "Ningún resultado.",
            "info": "Mostrando página _PAGE_ de _PAGES_",
            "infoEmpty": "No hay registros disponibles.",
            "infoFiltered": "(filtered from _MAX_ total records)",
            "paginate": {
                "next": "Siguiente",
                "previous": "Anterior"
            },
        }
    });

    $('.dataTables_length').addClass('bs-select');

    // Actualizar variable de longitud por pagina
    tabla.on('length.dt', function () {
        estPerPage = tabla.page.info().length;
    });
    tabla.page.len(estPerPage).draw();

    // Actualizar id (#) cada vez que se modifica la tabla
    tabla.on('order.dt search.dt', function () {
        let i = 1;

        tabla.cells(null, 0, { search: 'applied', order: 'applied' }).every(function (cell) {
            this.data(i++);
        });
    }).draw();
}

// Funcion que carga el dropdown de las pruebas con las pruebas actuales
function cargarDropdownPruebas(pruebas) {
    $('#filtros-pruebas').empty();

    // Opcion inicial (Todas)
    var def = document.createElement("option");
    def.setAttribute("value", "null");
    def.setAttribute("selected", "");
    def.innerHTML = "Todas";
    document.getElementById("filtros-pruebas").appendChild(def);

    // Opciones de cada tarea
    for (var i = 0; i < pruebas.length; i++) {
        var option = document.createElement("option");
        option.setAttribute("value", pruebas[i]);
        option.innerHTML = pruebas[i];
        document.getElementById("filtros-pruebas").appendChild(option);
    }
}

// Funcion que inicializa y ajusta los eventos del dropdown de columnas
function cargarDropdownColumnas() {
    // Inicializar
    $("#filtros-columnas option[value='1']").attr("selected", "");
    $("#filtros-columnas option[value='2']").attr("selected", "");
    $("#filtros-columnas option[value='3']").attr("selected", "");
    $("#filtros-columnas option[value='4']").attr("selected", "");
    $("#filtros-columnas option[value='5']").attr("selected", "");

    $('#filtros-columnas').multiSelect({
        'noneText': 'Seleccionar ',
        'allText': 'Todas'
    });

    // Eventos al hacer click
    $('#filtros-columnas').change(function () {
        // Desmarcar todo
        tabla.column(1).visible(false);
        tabla.column(2).visible(false);
        tabla.column(3).visible(false);
        tabla.column(4).visible(false);
        tabla.column(5).visible(false);

        var seleccionado = $(this).val();
        for (var i = 0; i < seleccionado.length; i++) {
            tabla.column(seleccionado[i]).visible(true);
        }
        $(tabla).width("100%");
    });
}

// Funcion que carga el grafico de las visitas
function cargarGrafico() {
    var random = Math.floor(Math.random() * 1000);
    Highcharts.getJSON(
        'json/visitas_contador.json?'+random,
        function (data) {
            Highcharts.chart('grafico-visitas', {
                chart: {
                    zoomType: 'x',
                    backgroundColor: "#fdfdff"
                },
                title: {
                    text: 'Visitas al juego durante el transcurso del tiempo'
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Haz click y arrastra en el gráfico para hacer zoom' : 'Usa los dedos para hacer zoom en el gráfico'
                },
                xAxis: {
                    title: {
                        text: 'Fecha'
                    },
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Número de visitas'
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.getOptions().colors[2]],
                                [1, Highcharts.color(Highcharts.getOptions().colors[2]).setOpacity(0).get('rgba')]
                            ]
                        },
                        marker: {
                            radius: 2
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null
                    }
                },
                series: [{
                    type: 'area',
                    name: 'Visitas',
                    data: data
                }]
            });
        }
    );
}

// Funcion que carga el mapa con la localizacion de las visitas
function cargarMapa() {
    var random = Math.floor(Math.random() * 1000);
    $.getJSON('json/visitas_mapa.json?'+random, function (paises) {
        // Obtener el valor maximo de visitas
        var valores = [];
        for (var i=0; i<paises.length; i++) {
            valores.push(paises[i][1]);
        }
        var maximo = Math.max(...valores);
        console.log(maximo);
        
        // Dibujar mapa
        Highcharts.mapChart('mapa-visitas', {
            chart: {
                map: 'custom/world',
                backgroundColor: "#fdfdff"
            },
            title: {
                text: 'Visitas al juego por países'
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            tooltip: {
                pointFormat: '{point.name}: <b>{point.value}</b>'
            },
            colorAxis: {
                min: 0,
                max: maximo,
                minColor: '#ffffff',
                maxColor: '#1686cc'
            },
            series: [{
                data: paises,
                name: 'Visitas',
                states: {
                    hover: {
                        color: '#ffd689'
                    }
                }
            }],
            legend: {
                title: {
                    text: 'Número de visitas',
                }
            },
            credits: {
                enabled: false
            },
            accessibility: {
                description: 'Mapa que muestra la cantidad de visitas al juego según el país',
                rangeDescription: 'Rango: 0 a 100 visitas',
                point: {
                    valueSuffix: '€'
                }
            }
        });
    });
}

/* ---------------------------------------------------------------------------- */

// FUNCIONES POST Y GET

// Funcion que solicita a la BD todas las estadisticas
function peticionEstadisticas() {
    spinnerLoading(true);
    $.get("php/consult.php", {
        tabla: "estadisticas"
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
                var datos = JSON.parse(data);
                estadisticas = datos["estadisticas"]; // actualizar variable global
                actualizarTabla(null, "null");
                cargarDropdownPruebas(datos["pruebas"]);
                cargarDropdownColumnas();
            }
        });
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

// Funcion que convierte segundos a minutos:segundos
function formatSeconds(time) {
    var minutes = ("0" + Math.floor(time / 60)).slice(-2);
    var seconds = ('0' + Math.floor(time % 60)).slice(-2);
    return minutes + ':' + seconds;
}

// Funcion que devuelve el valor dado en 2 decimales siempre
function dosDecimales(valor) {
    return (Math.round(valor * 100) / 100).toFixed(2);
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
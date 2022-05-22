/*
	Fichero que incluye todos los componentes usados, excepto los de interaccion
	que se encuentran en el fichero correspondiente (interaccion.js)
*/

// Componente para reproducir sonido al pasar el raton por encima y clickar
AFRAME.registerComponent('hc-sound', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			document.querySelector("#hover-sound").play();
		});
		this.el.addEventListener('click', function (evt) {
			document.querySelector("#click-sound").play();
			var musica = document.querySelector("#background-music");
			if (musica.paused && volumenMusica > 0.005) musica.play();
		});
	}
});

// Componente para reproducir el sonido de fin de partida
AFRAME.registerComponent('fin-sound', {
	init: function () {
		document.querySelector("#fin-sound").play();
	}
});

// Componente para resaltar los elementos del menu al pasar el cursor
// Aviso: la entidad tiene que tener class="raycastable" para que funcione
AFRAME.registerComponent('highlight', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			//nombre = this.firstChild.object3D.value;
			//actual = (antiguo+0.05) + " " + (antiguo+0.05) + " " + (antiguo+0.05);
			this.firstChild.setAttribute("color", "black");
			this.firstChild.emit("menuBiggerAnimation", null, false);
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.firstChild.setAttribute("color", "#1d521d");
			this.firstChild.emit("menuSmallerAnimation", null, false);
		});
	}
});

// Componentes para resaltar botones
AFRAME.registerComponent('highlight-amarillo', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			//alert("hola");
			this.setAttribute("color", "#a3fffc");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#fff7bd");
		});
	}
});
AFRAME.registerComponent('highlight-verde', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			this.setAttribute("color", "#8eff7d");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#caffc2");
		});
		this.el.addEventListener('click', function (evt) {
			// Revisar que exista (en el display de los componentes no existe)
			if (document.getElementById("ajustes-option1-border") == null) {
				return;
			}
			// Eliminar el seleccionado de las opciones y seleccionar la actual
			document.getElementById("ajustes-option1-border").setAttribute("color", "#a8a8a8");
			document.getElementById("ajustes-option2-border").setAttribute("color", "#a8a8a8");
			document.getElementById("ajustes-option3-border").setAttribute("color", "#a8a8a8");
			document.getElementById("ajustes-option4-border").setAttribute("color", "#a8a8a8");
			this.parentElement.setAttribute("color", "black");
		});
	}
});
AFRAME.registerComponent('highlight-gris', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			//alert("hola");
			this.setAttribute("color", "#bfbfbf");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#ededed");
		});
		this.el.addEventListener('click', function (evt) {
			// Eliminar el seleccionado de las opciones y seleccionar la actual
			deseleccionarInputs();
			this.parentElement.setAttribute("color", "black");
		});
	}
});
AFRAME.registerComponent('highlight-azul', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			this.setAttribute("color", "#4058cf");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#407bcf");
		});
	}
});
AFRAME.registerComponent('highlight-azul2', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			this.setAttribute("color", "#c4caff");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#dbdfff");
		});
	}
});
AFRAME.registerComponent('highlight-rojo', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			this.setAttribute("color", "#ffbaba");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#ffdbdb");
		});
	}
});
AFRAME.registerComponent('highlight-componente', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			this.setAttribute("color", "#d4e2ff");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#ebf1ff");
		});
	}
});
AFRAME.registerComponent('highlight-avatar', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			//alert("hola");
			this.setAttribute("color", "#d4ffdf");

		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "");

		});
		this.el.addEventListener('click', function (evt) {
			// Eliminar el seleccionado de las opciones y seleccionar la actual
			deseleccionarInputsAvatar();
			this.parentElement.setAttribute("color", "black");
		});
	}
});
AFRAME.registerComponent('highlight-mostrar', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			this.setAttribute("color", "green");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#86eba1");

		});
		this.el.addEventListener('click', function (evt) {
			this.parentElement.parentElement.children[0].setAttribute("color", "#9c9c9c");
			this.parentElement.parentElement.children[1].setAttribute("color", "#9c9c9c");
			this.parentElement.setAttribute("color", "black");
		});
	}
});
AFRAME.registerComponent('highlight-ocultar', {
	init: function () {
		this.el.addEventListener('mouseenter', function (evt) {
			this.setAttribute("color", "red");
		});
		this.el.addEventListener('mouseleave', function (evt) {
			this.setAttribute("color", "#fa9d9d");

		});
		this.el.addEventListener('click', function (evt) {
			this.parentElement.parentElement.children[0].setAttribute("color", "#9c9c9c");
			this.parentElement.parentElement.children[1].setAttribute("color", "#9c9c9c");
			this.parentElement.setAttribute("color", "black");
		});
	}
});

AFRAME.registerComponent('font-open-sans', {
	init: function () {
		this.el.setAttribute("font", "assets/fonts/OpenSans-Regular-msdf.json");
		this.el.setAttribute("font-image", "assets/fonts/OpenSans-Regular.png");
		this.el.setAttribute("negate", "false");
	}
});

// Componente que registra los eventos del teclado
AFRAME.registerComponent('keyboard-functions', {
	init: function () {
		// for referencing issues
		let self = this;

		// input event triggered when user presses enter
		this.el.addEventListener('superkeyboardinput', function (event) {
			let text = event.detail.value;
			//cambiar el campo de input
			document.getElementById(getInputId()).setAttribute("value", text);

			//borrar el texto del teclado, cerrarlo y deseleccionar campo inputs
			deseleccionarInputs();
			self.el.setAttribute("super-keyboard", "value", "");
			self.el.remove();
			//alert(text);
			// text also accessible via: self.el.getAttribute("super-keyboard")["value"]
		});

		// dismiss event triggered when user closes keyboard
		this.el.addEventListener('superkeyboarddismiss', function (event) {
			console.log("Input cleared.");

			//borrar el texto del teclado, cerrarlo y deseleccionar campo inputs
			deseleccionarInputs();
			self.el.setAttribute("super-keyboard", "value", "");
			self.el.remove();
		});
	},
});

// Componente que gestiona los eventos al pulsar botones de los controllers
AFRAME.registerComponent('controller-cmp', {
	init: function () {
		// Modifica el raycaster del teclado segun el gatillo del controller pulsado
		this.el.addEventListener('triggerdown', function(evt){
			kbRaycaster = "#" + this.getAttribute("id");
		});

		// Boton para centrar el player en la zona central
		this.el.addEventListener('xbuttondown', function(evt){
			console.log("Boton 'X' pulsado");
			// El jugador esta dentro
			if (inside) {
				centerPlayer(0, -15.7, "0 180 0");
			}
			// El jugador esta fuera
			else {
				centerPlayer(0, 0, "0 0 0");
			}
		});

		// Boton para mostrar/ocultar el menu de musica
		this.el.addEventListener('ybuttondown', function(evt){
			console.log("Boton 'Y' pulsado");
			menuMusica(volumenMusica);
		});
	}
});

// Componente que dibuja una mesa
AFRAME.registerComponent('mesa-ordenadores', {
	init: function () {
		var el = this.el
		el.setAttribute("geometry", "primitive: box; width: 1.5; depth: 3.5; height: 0.06");
		el.setAttribute("material", "src: #centerMenuTexture; repeat: 1 5");
		//el.setAttribute("shadow", "");
		var p1 = document.createElement("a-box");
		setAttributes(p1, { position: "0.72 -0.415 -1.72", width: "0.06", depth: "0.06", height: "0.77", src: "#sideMenuTexture" });
		var p2 = document.createElement("a-box");
		setAttributes(p2, { position: "-0.72 -0.415 -1.72", width: "0.06", depth: "0.06", height: "0.77", src: "#sideMenuTexture" });
		var p3 = document.createElement("a-box");
		setAttributes(p3, { position: "0.72 -0.415 1.72", width: "0.06", depth: "0.06", height: "0.77", src: "#sideMenuTexture" });
		var p4 = document.createElement("a-box");
		setAttributes(p4, { position: "-0.72 -0.415 1.72", width: "0.06", depth: "0.06", height: "0.77", src: "#sideMenuTexture" });
		el.appendChild(p1);
		el.appendChild(p2);
		el.appendChild(p3);
		el.appendChild(p4);

		// Ordenadores
		var o1 = document.createElement("a-box");
		setAttributes(o1, { position: "0.5 0.05 1", width: "0.26", height: "0.01", depth: "0.35", src: "#laptopKbTexture" });
		var o11 = document.createElement("a-box");
		setAttributes(o11, { position: "-0.17 0.12 0", rotation: "0 0 -70", width: "0.26", height: "0.01", depth: "0.35", color: "gray", multisrc: "src2:#laptopScreenTexture" });
		var o2 = document.createElement("a-box");
		setAttributes(o2, { position: "0.5 0.05 0", width: "0.26", height: "0.01", depth: "0.35", src: "#laptopKbTexture" });
		var o22 = document.createElement("a-box");
		setAttributes(o22, { position: "-0.17 0.12 0", rotation: "0 0 -70", width: "0.26", height: "0.01", depth: "0.35", color: "gray", multisrc: "src2:#laptopScreenTexture" });
		var o3 = document.createElement("a-box");
		setAttributes(o3, { position: "0.5 0.05 -1", width: "0.26", height: "0.01", depth: "0.35", src: "#laptopKbTexture" });
		var o33 = document.createElement("a-box");
		setAttributes(o33, { position: "-0.17 0.12 0", rotation: "0 0 -70", width: "0.26", height: "0.01", depth: "0.35", color: "gray", multisrc: "src2:#laptopScreenTexture" });
		var o4 = document.createElement("a-box");
		setAttributes(o4, { position: "-0.5 0.05 1", rotation: "0 180 0", width: "0.26", height: "0.01", depth: "0.35", src: "#laptopKbTexture" });
		var o44 = document.createElement("a-box");
		setAttributes(o44, { position: "-0.17 0.12 0", rotation: "0 0 -70", width: "0.26", height: "0.01", depth: "0.35", color: "gray", multisrc: "src2:#laptopScreenTexture" });
		var o5 = document.createElement("a-box");
		setAttributes(o5, { position: "-0.5 0.05 0", rotation: "0 180 0", width: "0.26", height: "0.01", depth: "0.35", src: "#laptopKbTexture" });
		var o55 = document.createElement("a-box");
		setAttributes(o55, { position: "-0.17 0.12 0", rotation: "0 0 -70", width: "0.26", height: "0.01", depth: "0.35", color: "gray", multisrc: "src2:#laptopScreenTexture" });
		var o6 = document.createElement("a-box");
		setAttributes(o6, { position: "-0.5 0.05 -1", rotation: "0 180 0", width: "0.26", height: "0.01", depth: "0.35", src: "#laptopKbTexture" });
		var o66 = document.createElement("a-box");
		setAttributes(o66, { position: "-0.17 0.12 0", rotation: "0 0 -70", width: "0.26", height: "0.01", depth: "0.35", color: "gray", multisrc: "src2:#laptopScreenTexture" });
		o1.appendChild(o11);
		el.appendChild(o1);
		o2.appendChild(o22);
		el.appendChild(o2);
		o3.appendChild(o33);
		el.appendChild(o3);
		o4.appendChild(o44);
		el.appendChild(o4);
		o5.appendChild(o55);
		el.appendChild(o5);
		o6.appendChild(o66);
		el.appendChild(o6);
	}
});
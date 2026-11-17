const $ = (id) => document.getElementById(id);

const CLAVE_RESERVAS = "ihc-reservas-v1";

const canchas = [
  {
    id: 1,
    nombre: "Cancha Central",
    deporte: "Fútbol",
    comuna: "Providencia",
    direccion: "Calle de Ejemplo 120",
    precio: 20000,
    descripcion: "Cancha de fútbol de superficie sintética.",
    servicios: "Iluminación y camarines",
  },
  {
    id: 2,
    nombre: "Complejo Los Leones",
    deporte: "Fútbol",
    comuna: "Ñuñoa",
    direccion: "Avenida de Demostración 450",
    precio: 18000,
    descripcion: "Espacio deportivo para partidos entre amistades.",
    servicios: "Camarines y estacionamiento",
  },
  {
    id: 3,
    nombre: "Polideportivo Sur",
    deporte: "Fútbol",
    comuna: "San Joaquín",
    direccion: "Pasaje Ficticio 80",
    precio: 15000,
    descripcion: "Cancha para actividades deportivas recreativas.",
    servicios: "Iluminación",
  },
  {
    id: 4,
    nombre: "Cancha Verde",
    deporte: "Básquetbol",
    comuna: "Macul",
    direccion: "Calle de Ejemplo 220",
    precio: 12000,
    descripcion: "Cancha de básquetbol para grupos recreativos.",
    servicios: "Camarines y graderías",
  },
  {
    id: 5,
    nombre: "Centro Deportivo Andes",
    deporte: "Tenis",
    comuna: "Las Condes",
    direccion: "Avenida de Demostración 900",
    precio: 16000,
    descripcion: "Cancha de tenis para práctica recreativa.",
    servicios: "Iluminación y camarines",
  },
  {
    id: 6,
    nombre: "Centro Recreativo Norte",
    deporte: "Vóleibol",
    comuna: "Providencia",
    direccion: "Pasaje Ficticio 310",
    precio: 14000,
    descripcion: "Cancha de vóleibol para encuentros grupales.",
    servicios: "Camarines",
  },
];

const horas = ["17:00", "18:00", "19:00", "20:00", "21:00"];

const estado = {
  filtros: null,
  cancha: null,
  hora: null,
  confirmando: false,
};

let reservas = cargarReservas();

function cargarReservas() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_RESERVAS) || "[]");

    if (!Array.isArray(datos)) return [];

    return datos.filter(
      (reserva) =>
        reserva &&
        Number.isInteger(reserva.canchaId) &&
        typeof reserva.fecha === "string" &&
        typeof reserva.hora === "string",
    );
  } catch {
    return [];
  }
}

function guardarReservas() {
  try {
    localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
    return true;
  } catch {
    return false;
  }
}

function fechaLocalHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function fechaLegible(fecha) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function dinero(monto) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(monto);
}

function rangoHorario(hora) {
  const inicio = Number(hora.split(":")[0]);
  const termino = String(inicio + 1).padStart(2, "0");

  return `${hora} – ${termino}:00`;
}

function cambiarPantalla(id) {
  document.querySelectorAll(".pantalla").forEach((pantalla) => {
    pantalla.hidden = pantalla.id !== id;
  });

  const etapa = {
    inicio: "busqueda",
    resultados: "eleccion",
    detalle: "eleccion",
    horarios: "eleccion",
    resumen: "confirmacion",
    confirmacion: "confirmacion",
  }[id];

  document.querySelectorAll(".progreso li").forEach((paso) => {
    if (paso.id === `paso-${etapa}`) {
      paso.setAttribute("aria-current", "step");
    } else {
      paso.removeAttribute("aria-current");
    }
  });

  $(`titulo-${id}`).focus();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function escribirDatos(contenedorId, filas) {
  const contenedor = $(contenedorId);
  contenedor.replaceChildren();

  filas.forEach(([etiqueta, valor]) => {
    const fila = document.createElement("div");
    const termino = document.createElement("dt");
    const descripcion = document.createElement("dd");

    termino.textContent = etiqueta;
    descripcion.textContent = valor;

    fila.append(termino, descripcion);
    contenedor.append(fila);
  });
}

function estaOcupado(canchaId, fecha, hora) {
  const dia = Number(fecha.slice(-2));
  const indice = horas.indexOf(hora);

  const ocupadoDeEjemplo = (canchaId + dia + indice) % 4 === 0;

  const reservadoLocalmente = reservas.some(
    (reserva) =>
      reserva.canchaId === canchaId &&
      reserva.fecha === fecha &&
      reserva.hora === hora,
  );

  const horarioPasado =
    fecha === fechaLocalHoy() &&
    new Date(`${fecha}T${hora}:00`).getTime() <= Date.now();

  return ocupadoDeEjemplo || reservadoLocalmente || horarioPasado;
}

function mostrarResultados() {
  const { deporte, comuna, fecha } = estado.filtros;

  const resultados = canchas.filter(
    (cancha) =>
      cancha.deporte === deporte &&
      (comuna === "Todas" || cancha.comuna === comuna) &&
      horas.some((hora) => !estaOcupado(cancha.id, fecha, hora)),
  );

  $("resumen-busqueda").textContent =
    `${deporte} · ${comuna === "Todas" ? "Todas las comunas" : comuna}` +
    ` · ${fechaLegible(fecha)}`;

  $("cantidad-resultados").textContent =
    `${resultados.length} cancha(s) con horarios disponibles`;

  const lista = $("lista-canchas");
  lista.replaceChildren();

  if (resultados.length === 0) {
    const aviso = document.createElement("p");
    aviso.className = "aviso";
    aviso.textContent =
      "No hay canchas disponibles para esta búsqueda. " +
      "Modifica la comuna, la fecha o el deporte.";

    lista.append(aviso);
  }

  resultados.forEach((cancha) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const etiqueta = document.createElement("span");
    etiqueta.className = "estado";
    etiqueta.textContent = "Con horarios disponibles";

    const titulo = document.createElement("h2");
    titulo.textContent = cancha.nombre;

    const ubicacion = document.createElement("p");
    ubicacion.textContent = `${cancha.deporte} · ${cancha.comuna}`;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `${dinero(cancha.precio)} por hora`;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton principal ancho";
    boton.textContent = "Ver cancha";
    boton.setAttribute("aria-label", `Ver cancha: ${cancha.nombre}`);
    boton.addEventListener("click", () => abrirDetalle(cancha));

    tarjeta.append(etiqueta, titulo, ubicacion, precio, boton);
    lista.append(tarjeta);
  });

  cambiarPantalla("resultados");
}

function abrirDetalle(cancha) {
  estado.cancha = cancha;
  estado.hora = null;

  $("titulo-detalle").textContent = cancha.nombre;
  $("descripcion-cancha").textContent = cancha.descripcion;

  escribirDatos("datos-cancha", [
    ["Deporte", cancha.deporte],
    ["Comuna", cancha.comuna],
    ["Dirección ficticia", cancha.direccion],
    ["Servicios", cancha.servicios],
    ["Precio por hora", dinero(cancha.precio)],
    ["Fecha", fechaLegible(estado.filtros.fecha)],
  ]);

  cambiarPantalla("detalle");
}

function actualizarSeleccion() {
  document.querySelectorAll(".horario:not(:disabled)").forEach((boton) => {
    const seleccionado = boton.dataset.hora === estado.hora;

    boton.setAttribute("aria-pressed", String(seleccionado));
    boton.querySelector("span").textContent = seleccionado
      ? "Seleccionado"
      : "Disponible";
  });

  $("seleccion-horario").textContent = estado.hora
    ? `Horario seleccionado: ${rangoHorario(estado.hora)}.`
    : "Aún no has seleccionado un horario.";

  $("continuar-resumen").disabled = !estado.hora;
}

function mostrarHorarios() {
  const { cancha, filtros } = estado;

  if (estado.hora && estaOcupado(cancha.id, filtros.fecha, estado.hora)) {
    estado.hora = null;
  }

  $("contexto-horarios").textContent =
    `${cancha.nombre} · ${fechaLegible(filtros.fecha)}` +
    ` · ${dinero(cancha.precio)} por hora`;

  const lista = $("lista-horarios");
  lista.replaceChildren();

  horas.forEach((hora) => {
    const ocupado = estaOcupado(cancha.id, filtros.fecha, hora);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "horario";
    boton.dataset.hora = hora;
    boton.disabled = ocupado;

    const titulo = document.createElement("strong");
    titulo.textContent = hora;

    const etiqueta = document.createElement("span");
    etiqueta.textContent = ocupado ? "No disponible" : "Disponible";

    if (!ocupado) {
      boton.setAttribute("aria-pressed", "false");

      boton.addEventListener("click", () => {
        estado.hora = hora;
        actualizarSeleccion();
      });
    }

    boton.append(titulo, etiqueta);
    lista.append(boton);
  });

  actualizarSeleccion();
  cambiarPantalla("horarios");
}

function filasReserva() {
  return [
    ["Cancha", estado.cancha.nombre],
    ["Deporte", estado.cancha.deporte],
    ["Comuna", estado.cancha.comuna],
    ["Dirección ficticia", estado.cancha.direccion],
    ["Fecha", fechaLegible(estado.filtros.fecha)],
    ["Horario", rangoHorario(estado.hora)],
    ["Duración", "1 hora"],
    ["Precio simulado total", dinero(estado.cancha.precio)],
  ];
}

function mostrarResumen() {
  if (!estado.hora) return;

  $("error-reserva").hidden = true;
  escribirDatos("datos-resumen", filasReserva());
  cambiarPantalla("resumen");
}

function confirmarReserva() {
  if (estado.confirmando || !estado.hora) return;

  reservas = cargarReservas().concat(
    reservas.filter(
      (reserva) =>
        !cargarReservas().some(
          (guardada) => guardada.codigo === reserva.codigo,
        ),
    ),
  );

  if (estaOcupado(estado.cancha.id, estado.filtros.fecha, estado.hora)) {
    $("error-reserva").textContent =
      "Este horario ya no está disponible. Vuelve y selecciona otro.";
    $("error-reserva").hidden = false;
    return;
  }

  estado.confirmando = true;
  $("confirmar-reserva").disabled = true;

  const codigo =
    `CAN-${Date.now().toString(36).toUpperCase()}-` +
    Math.random().toString(36).slice(2, 5).toUpperCase();

  reservas.push({
    codigo,
    canchaId: estado.cancha.id,
    fecha: estado.filtros.fecha,
    hora: estado.hora,
    precio: estado.cancha.precio,
  });

  const guardada = guardarReservas();

  $("codigo-reserva").textContent = codigo;
  escribirDatos("datos-confirmacion", filasReserva());

  $("estado-guardado").textContent = guardada
    ? "La reserva se guardó con éxito."
    : "La reserva se conservará solo mientras esta página permanezca abierta.";

  cambiarPantalla("confirmacion");

  estado.confirmando = false;
  $("confirmar-reserva").disabled = false;
}

$("formulario-busqueda").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = $("fecha").value;
  $("fecha").min = fechaLocalHoy();

  if (fecha < fechaLocalHoy()) {
    $("fecha").setCustomValidity("Selecciona hoy o una fecha futura.");
    $("fecha").reportValidity();
    return;
  }

  $("fecha").setCustomValidity("");

  estado.filtros = {
    deporte: $("deporte").value,
    comuna: $("comuna").value,
    fecha,
  };

  estado.cancha = null;
  estado.hora = null;

  mostrarResultados();
});

$("fecha").addEventListener("input", () => {
  $("fecha").setCustomValidity("");
});

document.querySelectorAll("[data-volver]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const destino = boton.dataset.volver;

    if (destino === "horarios") {
      mostrarHorarios();
    } else if (destino === "resultados") {
      mostrarResultados();
    } else {
      cambiarPantalla(destino);
    }
  });
});

$("ver-horarios").addEventListener("click", mostrarHorarios);
$("continuar-resumen").addEventListener("click", mostrarResumen);
$("confirmar-reserva").addEventListener("click", confirmarReserva);

$("nueva-busqueda").addEventListener("click", () => {
  estado.cancha = null;
  estado.hora = null;
  cambiarPantalla("inicio");
});

$("fecha").min = fechaLocalHoy();
$("fecha").value = fechaLocalHoy();

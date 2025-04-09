let servicios = [];
let serviciosSeleccionados = [];
let modoEdicion = false;
let turnoEditandoId = null;

const listaServicios = document.getElementById("listaServicios");
const alertFlotante = document.createElement("div");
alertFlotante.id = "alertFlotante";
document.body.appendChild(alertFlotante);

function Turno(servicio, fecha, hora, cliente) {
  this.id = servicio.id;
  this.nombre = servicio.nombre;
  this.duracion = servicio.duracion;
  this.precio = servicio.precio;
  this.fecha = fecha;
  this.hora = hora;
  this.cliente = cliente;
}

function validarNombre(valor) {
  return /^[a-zA-Z\s]{2,30}$/.test(valor);
}
function validarEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}
function validarTelefono(valor) {
  return /^[0-9]{6,15}$/.test(valor);
}
function horaValida(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h >= 11 && h <= 19;
}
function horaEsFutura(fecha, hora) {
  const ahora = new Date();
  const fechaSeleccionada = new Date(`${fecha}T${hora}`);
  return fechaSeleccionada.getTime() > ahora.getTime();
}

async function cargarServicios() {
  if (!localStorage.getItem("servicios")) {
    try {
      const res = await fetch("./data/servicios.json");
      const data = await res.json();
      localStorage.setItem("servicios", JSON.stringify(data));
      servicios = data;
    } catch (err) {
      console.error("Error al cargar servicios:", err);
    }
  } else {
    servicios = JSON.parse(localStorage.getItem("servicios"));
  }
  mostrarServicios();
}

function mostrarServicios() {
  listaServicios.innerHTML = "";
  servicios.forEach(servicio => {
    const div = document.createElement("div");
    div.classList.add("servicio");
    div.innerHTML = `
      <h3>${servicio.nombre}</h3>
      <p><strong>Duración:</strong> ${servicio.duracion}</p>
      <p><strong>Precio:</strong> $${servicio.precio}</p>
      <button class="btn-agendar" data-id="${servicio.id}">Seleccionar</button>
    `;
    listaServicios.appendChild(div);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-agendar")) {
    const id = parseInt(e.target.dataset.id);
    const servicio = servicios.find(s => s.id === id);
    if (servicio && !serviciosSeleccionados.some(s => s.id === id)) {
      serviciosSeleccionados.push(servicio);
      actualizarAlertFlotante();
    }
  }

  if (e.target.classList.contains("btn-remover")) {
    const index = parseInt(e.target.dataset.index);
    serviciosSeleccionados.splice(index, 1);
    actualizarAlertFlotante();
  }
});

function actualizarAlertFlotante() {
  if (serviciosSeleccionados.length === 0) {
    alertFlotante.innerHTML = "";
    alertFlotante.style.display = "none";
    return;
  }

  const total = serviciosSeleccionados.reduce((sum, s) => sum + s.precio, 0);
  alertFlotante.innerHTML = `
    <div class="alert-box">
      <h3>Servicios Seleccionados</h3>
      <ul>
        ${serviciosSeleccionados.map((s, i) => `
          <li>${s.nombre} - $${s.precio}
          <button class="btn-remover" data-index="${i}">❌</button></li>
        `).join("")}
      </ul>
      <p><strong>Total: $${total}</strong></p>
      <button id="finalizarSeleccion">Finalizar</button>
    </div>
  `;
  alertFlotante.style.display = "block";

  setTimeout(() => {
    const finalizarBtn = document.getElementById("finalizarSeleccion");
    if (finalizarBtn) {
      finalizarBtn.addEventListener("click", () => abrirModalMultiple());
    }
  }, 0);
}

function abrirModalMultiple() {
  const modal = document.getElementById("reserva");
  modal.classList.remove("oculto");

  const today = new Date().toISOString().split("T")[0];
  const calendario = document.getElementById("calendario");

  if (serviciosSeleccionados.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Atención",
      text: "Debes seleccionar al menos un servicio antes de continuar.",
      confirmButtonColor: "#3085d6"
    });
    cerrarModal();
    return;
  }
  

  calendario.innerHTML = `
    <h3>Selecciona Fecha y Hora</h3>
    ${serviciosSeleccionados.map((s, i) => `
      <div class="turno-item">
        <h4>${s.nombre}</h4>
        <input type="date" class="fechaSeleccionada" data-id="${i}" min="${today}" required>
        <select class="horaSeleccionada" data-id="${i}" required>
          <option value="">Seleccionar hora</option>
          <option value="11:00">11:00</option>
          <option value="12:00">12:00</option>
          <option value="13:00">13:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
          <option value="17:00">17:00</option>
          <option value="18:00">18:00</option>
          <option value="19:00">19:00</option>
        </select>
      </div>
    `).join("")}
  `;
}

function abrirModalEdicion(turno, index) {
  modoEdicion = true;
  turnoEditandoId = index;

  const modal = document.getElementById("reserva");
  modal.classList.remove("oculto");

  const calendario = document.getElementById("calendario");
  calendario.innerHTML = `
    <h3>Editar Fecha y Hora</h3>
    <div class="turno-item">
      <select id="editarServicio">
        ${servicios.map(s => `
          <option value="${s.id}" ${s.id === turno.id ? "selected" : ""}>${s.nombre}</option>
        `).join("")}
      </select>
      <input type="date" id="editarFecha" value="${turno.fecha}" min="${new Date().toISOString().split("T")[0]}" required>
      <select id="editarHora" required>
        <option value="">Seleccionar hora</option>
        ${["11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"]
          .map(h => `<option value="${h}" ${h === turno.hora ? "selected" : ""}>${h}</option>`).join("")}
      </select>
    </div>
  `;

  document.getElementById("clienteNombre").value = turno.cliente.nombre;
  document.getElementById("clienteApellido").value = turno.cliente.apellido;
  document.getElementById("clienteEmail").value = turno.cliente.email;
  document.getElementById("clienteTelefono").value = turno.cliente.telefono;
}

function confirmarTurnos() {
  const nombre = document.getElementById("clienteNombre").value.trim();
  const apellido = document.getElementById("clienteApellido").value.trim();
  const email = document.getElementById("clienteEmail").value.trim();
  const telefono = document.getElementById("clienteTelefono").value.trim();

  if (!validarNombre(nombre) || !validarNombre(apellido)) return mostrarError("Nombre o apellido inválido.");
  if (!validarEmail(email)) return mostrarError("Email inválido.");
  if (!validarTelefono(telefono)) return mostrarError("Teléfono inválido.");

  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  if (modoEdicion) {
    const idServicio = parseInt(document.getElementById("editarServicio").value);
    const fecha = document.getElementById("editarFecha").value;
    const hora = document.getElementById("editarHora").value;

    if (!fecha || !hora || !horaValida(hora)) return mostrarError("Fecha u hora inválida.");
    const hoy = new Date().toISOString().split("T")[0];
    if (fecha === hoy && !horaEsFutura(fecha, hora)) return mostrarError("No se puede agendar en una hora que ya pasó.");

    const duplicado = turnos.some((t, i) => i !== turnoEditandoId && t.fecha === fecha && t.hora === hora && t.id === idServicio);
    if (duplicado) return mostrarError("Ese turno ya está reservado.");

    const servicio = servicios.find(s => s.id === idServicio);
    turnos[turnoEditandoId] = new Turno(servicio, fecha, hora, { nombre, apellido, email, telefono });
  } else {
    const nuevos = serviciosSeleccionados.map((s, i) => {
      const fecha = document.querySelector(`.fechaSeleccionada[data-id="${i}"]`).value;
      const hora = document.querySelector(`.horaSeleccionada[data-id="${i}"]`).value;
      return new Turno(s, fecha, hora, { nombre, apellido, email, telefono });
    });

    if (nuevos.some(t => {
      if (!t.fecha || !t.hora || !horaValida(t.hora)) return true;
      const hoy = new Date().toISOString().split("T")[0];
      return t.fecha === hoy && !horaEsFutura(t.fecha, t.hora);
    })) {
      return mostrarError("Completa fecha y hora válidas. No se puede agendar en horas pasadas.");
    }

    const duplicado = nuevos.some(n => turnos.some(t => t.fecha === n.fecha && t.hora === n.hora && t.id === n.id));
    if (duplicado) return mostrarError("Uno de los turnos ya está reservado.");

    turnos = [...turnos, ...nuevos];
    serviciosSeleccionados = [];
    actualizarAlertFlotante();
  }

  localStorage.setItem("turnos", JSON.stringify(turnos));
  mostrarTurnos();
  cerrarModal();
  mostrarConfirmacion("✅⬇️¡Tu turno fue agendado con éxito!");
}

function mostrarError(msg) {
  const error = document.getElementById("errorReserva");
  error.textContent = msg;
  error.style.display = "block";
}

function mostrarConfirmacion(msg) {
  const mensaje = document.getElementById("mensajeConfirmacion");
  mensaje.textContent = msg;
  mensaje.classList.remove("oculto");
  setTimeout(() => mensaje.classList.add("oculto"), 3000);
}

function cerrarModal() {
  document.getElementById("reserva").classList.add("oculto");
  document.getElementById("formReserva").reset();
  document.getElementById("errorReserva").style.display = "none";
  modoEdicion = false;
  turnoEditandoId = null;
}

function mostrarTurnos() {
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const contenedor = document.getElementById("turnosAgendados");
  contenedor.innerHTML = "";

  turnos.forEach((t, i) => {
    const div = document.createElement("div");
    div.classList.add("turno-item");
    div.innerHTML = `
      <h3>${t.nombre}</h3>
      <p><strong>Fecha:</strong> ${t.fecha} - <strong>Hora:</strong> ${t.hora}</p>
      <p><strong>Cliente:</strong> ${t.cliente.nombre} ${t.cliente.apellido} (${t.cliente.email})</p>
      <p><strong>Tel:</strong> ${t.cliente.telefono}</p>
      <button class="btn-editar" data-index="${i}">Editar</button>
      <button class="btn-eliminar" data-index="${i}">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });

  document.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      const turnos = JSON.parse(localStorage.getItem("turnos"));
      abrirModalEdicion(turnos[index], index);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      const turnos = JSON.parse(localStorage.getItem("turnos"));
      turnos.splice(index, 1);
      localStorage.setItem("turnos", JSON.stringify(turnos));
      mostrarTurnos();
    });
  });
}

document.getElementById("cerrarModal").addEventListener("click", cerrarModal);
document.getElementById("confirmarReserva").addEventListener("click", confirmarTurnos);
document.getElementById("eliminarTodosTurnos").addEventListener("click", () => {
  localStorage.removeItem("turnos");
  mostrarTurnos();
});

cargarServicios();
mostrarTurnos();

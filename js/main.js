let servicios = [];
let serviciosSeleccionados = [];

const listaServicios = document.getElementById("listaServicios");
const alertFlotante = document.createElement("div");
alertFlotante.id = "alertFlotante";
document.body.appendChild(alertFlotante);


async function cargarServicios() {
  if (!localStorage.getItem("servicios")) {
    try {
      const response = await fetch("./data/servicios.json");
      if (!response.ok) throw new Error("Error al cargar el JSON");
      const data = await response.json();
      localStorage.setItem("servicios", JSON.stringify(data));
      servicios = data;
    } catch (error) {
      console.error("Error:", error);
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
    const servicioId = parseInt(e.target.dataset.id);
    const servicio = servicios.find(s => s.id === servicioId);
    if (servicio && !serviciosSeleccionados.some(s => s.id === servicioId)) {
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

  document.getElementById("finalizarSeleccion").addEventListener("click", abrirModalMultiple);
}


function abrirModalMultiple() {
  alertFlotante.style.display = "none";
  const modal = document.getElementById("reserva");
  modal.classList.remove("oculto");

  const today = new Date().toISOString().split("T")[0];

  document.getElementById("calendario").innerHTML = `
    <h3>Selecciona Fecha y Hora</h3>
    ${serviciosSeleccionados.map((s, i) => `
      <div class="turno-item">
        <h4>${s.nombre}</h4>
        <input type="date" class="fechaSeleccionada" data-id="${i}" min="${today}" required>
        <input type="time" class="horaSeleccionada" data-id="${i}" min="11:00" max="19:00" required>
      </div>
    `).join("")}
  `;
}


function confirmarTurnos() {
  const nombre = document.getElementById("clienteNombre").value.trim();
  const apellido = document.getElementById("clienteApellido").value.trim();
  const email = document.getElementById("clienteEmail").value.trim();
  const telefono = document.getElementById("clienteTelefono").value.trim();

  if (!nombre || !apellido || !email || !telefono) {
    mostrarError("Debes completar todos los datos del cliente.");
    return;
  }

  const nuevosTurnos = serviciosSeleccionados.map((s, i) => ({
    ...s,
    fecha: document.querySelector(`.fechaSeleccionada[data-id="${i}"]`).value,
    hora: document.querySelector(`.horaSeleccionada[data-id="${i}"]`).value,
    cliente: { nombre, apellido, email, telefono }
  }));

  if (nuevosTurnos.some(t => !t.fecha || !t.hora)) {
    mostrarError("Todos los servicios deben tener fecha y hora.");
    return;
  }

  const anteriores = JSON.parse(localStorage.getItem("turnos")) || [];
  const actualizados = [...anteriores, ...nuevosTurnos];
  localStorage.setItem("turnos", JSON.stringify(actualizados));

  serviciosSeleccionados = [];
  actualizarAlertFlotante();
  mostrarTurnos();
  document.getElementById("reserva").classList.add("oculto");


}


function mostrarError(msg) {
  const error = document.getElementById("errorReserva");
  error.textContent = msg;
  error.style.display = "block";
}


function mostrarTurnos() {
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const contenedor = document.getElementById("turnosAgendados");

  if (!contenedor) return;

  if (turnos.length === 0) {
    contenedor.innerHTML = "<p>No hay turnos agendados.</p>";
    return;
  }

  contenedor.innerHTML = "";
  turnos.forEach(t => {
    contenedor.innerHTML += `
      <div class="turno-item">
        <h3>${t.nombre}</h3>
        <p><strong>Fecha:</strong> ${t.fecha} - <strong>Hora:</strong> ${t.hora}</p>
        <p><strong>Cliente:</strong> ${t.cliente.nombre} ${t.cliente.apellido} (${t.cliente.email})</p>
        <p><strong>Tel:</strong> ${t.cliente.telefono}</p>
      </div>
    `;
  });
}


const eliminarTodosBtn = document.getElementById("eliminarTodosTurnos");
if (eliminarTodosBtn) {
  eliminarTodosBtn.addEventListener("click", () => {
    localStorage.removeItem("turnos");
    mostrarTurnos();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  cargarServicios();
  mostrarTurnos();

  const cerrarBtn = document.getElementById("cerrarModal");
  if (cerrarBtn) {
    cerrarBtn.addEventListener("click", () => {
      document.getElementById("reserva").classList.add("oculto");
    });
  }

  const confirmarBtn = document.getElementById("confirmarReserva");
  if (confirmarBtn) {
    confirmarBtn.addEventListener("click", confirmarTurnos);
  }
});

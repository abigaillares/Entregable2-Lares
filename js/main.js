const servicios = [
    { id: 1, nombre: "Manicuría Semipermanente", duracion: "1h 30m", precio: 22000 },
    { id: 2, nombre: "Manicuría Tradicional Secado Rápido", duracion: "1h", precio: 18000 },
    { id: 3, nombre: "Extensiones de Uñas", duracion: "2h", precio: 30000 },
    { id: 4, nombre: "Capping Gel", duracion: "1h 30m", precio: 25000 },
    { id: 5, nombre: "Pedicuría", duracion: "1h", precio: 15000 },
    { id: 6, nombre: "Pestañas y Cejas", duracion: "45m", precio: 12000 },
    { id: 7, nombre: "Servicios Masculinos", duracion: "1h", precio: 20000 },
    { id: 8, nombre: "Masajes Relajantes", duracion: "1h 30m", precio: 28000 }
];

if (!localStorage.getItem("servicios")) {
    localStorage.setItem("servicios", JSON.stringify(servicios));
}


const obtenerServicios = () => JSON.parse(localStorage.getItem("servicios")) || [];


let serviciosSeleccionados = [];


const listaServicios = document.getElementById("listaServicios");
const alertFlotante = document.createElement("div");
alertFlotante.id = "alertFlotante";
document.body.appendChild(alertFlotante);

function mostrarServicios() {
    listaServicios.innerHTML = "";

    obtenerServicios().forEach(servicio => {
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

mostrarServicios();

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-agendar")) {
        const servicioId = parseInt(e.target.dataset.id);
        const servicio = obtenerServicios().find(s => s.id === servicioId);

        if (servicio) {
            if (!serviciosSeleccionados.some(s => s.id === servicioId)) {
                serviciosSeleccionados.push(servicio);
            } else {
                serviciosSeleccionados = serviciosSeleccionados.filter(s => s.id !== servicioId);
            }
            actualizarAlertFlotante();
        }
    }
});

function actualizarAlertFlotante() {
    if (serviciosSeleccionados.length === 0) {
        alertFlotante.innerHTML = "";
        alertFlotante.style.display = "none";
        return;
    }

    let total = serviciosSeleccionados.reduce((sum, s) => sum + s.precio, 0);
    alertFlotante.innerHTML = `
        <div class="alert-box">
            <p><strong>${serviciosSeleccionados.length} servicios seleccionados</strong></p>
            <p>Total: $${total}</p>
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

    document.getElementById("calendario").innerHTML = `
        <h2>Selecciona Fecha y Hora</h2>
        ${serviciosSeleccionados.map((s, i) => `
            <div class="turno-item">
                <h3>${s.nombre}</h3>
                <input type="date" class="fechaSeleccionada" data-id="${i}">
                <input type="time" class="horaSeleccionada" data-id="${i}">
            </div>
        `).join("")}
        <button id="confirmarReserva">Confirmar Turnos</button>
    `;

    document.getElementById("confirmarReserva").addEventListener("click", confirmarTurnos);
}

function confirmarTurnos() {
    let turnos = serviciosSeleccionados.map((s, i) => ({
        ...s,
        fecha: document.querySelector(`.fechaSeleccionada[data-id="${i}"]`).value,
        hora: document.querySelector(`.horaSeleccionada[data-id="${i}"]`).value
    }));

    if (turnos.some(t => !t.fecha || !t.hora)) {
        Swal.fire("Error", "Debes seleccionar fecha y hora para todos los servicios.", "error");
        return;
    }

    localStorage.setItem("turnos", JSON.stringify(turnos));
    serviciosSeleccionados = [];
    actualizarAlertFlotante();
    mostrarTurnos();
    document.getElementById("reserva").classList.add("oculto");
}

function mostrarTurnos() {
    const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const contenedorTurnos = document.getElementById("turnosAgendados") || document.createElement("div");
    contenedorTurnos.id = "turnosAgendados";
    document.body.appendChild(contenedorTurnos);
    contenedorTurnos.style.position = "absolute";
    contenedorTurnos.style.top = "10px";
    contenedorTurnos.style.left = "10px";
    contenedorTurnos.style.width = "250px";

    if (turnos.length === 0) {
        contenedorTurnos.innerHTML = "<p>No hay turnos agendados.</p>";
        return;
    }

    contenedorTurnos.innerHTML = "<h2>Turnos Agendados</h2>";
    turnos.forEach((turno, index) => {
        contenedorTurnos.innerHTML += `
            <div class="turno-item">
                <h3>${turno.nombre}</h3>
                <p>${turno.fecha} - ${turno.hora}</p>
                <button class="btn-eliminar" data-index="${index}">Eliminar</button>
            </div>
        `;
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            let index = e.target.dataset.index;
            turnos.splice(index, 1);
            localStorage.setItem("turnos", JSON.stringify(turnos));
            mostrarTurnos();
        });
    });
}

mostrarTurnos();

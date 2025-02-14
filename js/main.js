// Array para almacenar turnos
const turnos = [];

// Función para agendar un turno
function agendarTurno(nombre, fecha) {
    if (nombre && fecha) {
        turnos.push({ nombre, fecha });
        console.log(`✅ Turno agendado: ${nombre} - ${fecha}`);
        alert(`Turno agendado para ${nombre} el ${fecha}`);
    } else {
        alert("❌ Datos inválidos. Intente nuevamente.");
    }
}

// Función para mostrar todos los turnos
function listarTurnos() {
    if (turnos.length === 0) {
        console.log("⚠️ No hay turnos agendados.");
        alert("No hay turnos registrados.");
        return;
    }

    console.log("📅 Lista de turnos:");
    turnos.forEach((turno, index) => {
        console.log(`${index + 1}. ${turno.nombre} - ${turno.fecha}`);
    });
}

// Función para cancelar un turno por número
function cancelarTurno(numero) {
    let index = parseInt(numero) - 1;
    
    if (!isNaN(index) && index >= 0 && index < turnos.length) {
        let eliminado = turnos.splice(index, 1);
        alert(`❌ Turno de ${eliminado[0].nombre} cancelado.`);
        console.log(`🗑️ Turno eliminado: ${eliminado[0].nombre} - ${eliminado[0].fecha}`);
    } else {
        alert("❌ Número de turno inválido.");
    }
}

// Función principal del simulador
function iniciarSimulador() {
    let opcion;
    do {
        opcion = prompt("Seleccione una opción:\n1️⃣ Agendar Turno\n2️⃣ Ver Turnos\n3️⃣ Cancelar Turno\n4️⃣ Salir");
        
        switch (opcion) {
            case "1":
                let nombre = prompt("Ingrese el nombre del cliente:");
                let fecha = prompt("Ingrese la fecha del turno (DD/MM/AAAA):");
                agendarTurno(nombre, fecha);
                break;
            case "2":
                listarTurnos();
                break;
            case "3":
                listarTurnos();
                let num = prompt("Ingrese el número de turno a cancelar:");
                cancelarTurno(num);
                break;
            case "4":
                alert("👋 Saliendo del simulador.");
                break;
            default:
                alert("⚠️ Opción no válida. Intente nuevamente.");
        }
    } while (opcion !== "4");
}

// Iniciar simulador al cargar la página
iniciarSimulador();

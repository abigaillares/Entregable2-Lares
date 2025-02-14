const turnos = [];


function esFechaValida(fecha) {
    let partes = fecha.split("/");
    
    if (partes.length !== 3) {
        return false; 
    }

    let dia = parseInt(partes[0]);
    let mes = parseInt(partes[1]);
    let anio = parseInt(partes[2]);

    
    if (isNaN(dia) || isNaN(mes) || isNaN(anio)) {
        return false;
    }
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || anio < 2024) {
        return false;
    }

    return true;
}

function agendarTurno() {
    let nombre = prompt("Ingrese el nombre del cliente:");
    
    if (!nombre) {
        alert("❌ Nombre inválido. Intente nuevamente.");
        return;
    }

    let fecha;
    do {
        fecha = prompt("Ingrese la fecha del turno (DD/MM/AAAA):");
        if (!esFechaValida(fecha)) {
            alert("⚠️ Fecha inválida. Use el formato DD/MM/AAAA y valores numéricos correctos.");
        }
    } while (!esFechaValida(fecha));

    turnos.push({ nombre, fecha });
    console.log(`✅ Turno agendado: ${nombre} - ${fecha}`);
    alert(`Turno agendado para ${nombre} el ${fecha}`);
}

function listarTurnos() {
    if (turnos.length === 0) {
        console.log("⚠️ No hay turnos agendados.");
        alert("No hay turnos registrados.");
        return;
    }

    let mensaje = "📅 Lista de turnos:\n";
    turnos.forEach((turno, index) => {
        mensaje += `${index + 1}. ${turno.nombre} - ${turno.fecha}\n`;
    });

    console.log(mensaje);
    alert(mensaje);
}

function cancelarTurno() {
    if (turnos.length === 0) {
        alert("⚠️ No hay turnos para cancelar.");
        return;
    }

    listarTurnos();
    let numero = prompt("Ingrese el número de turno a cancelar:");

    let index = parseInt(numero) - 1;
    
    if (!isNaN(index) && index >= 0 && index < turnos.length) {
        let eliminado = turnos.splice(index, 1);
        alert(`❌ Turno de ${eliminado[0].nombre} cancelado.`);
        console.log(`🗑️ Turno eliminado: ${eliminado[0].nombre} - ${eliminado[0].fecha}`);
    } else {
        alert("❌ Número de turno inválido.");
    }
} 

function iniciarSimulador() {
    let opcion;
    do {
        opcion = prompt("Seleccione una opción:\n1️⃣ Agendar Turno\n2️⃣ Ver Turnos\n3️⃣ Cancelar Turno\n4️⃣ Salir");
        
        switch (opcion) {
            case "1":
                agendarTurno();
                break;
            case "2":
                listarTurnos();
                break;
            case "3":
                cancelarTurno();
                break;
            case "4":
                alert("👋 Saliendo del simulador.");
                break;
            default:
                alert("⚠️ Opción no válida. Intente nuevamente.");
        }
    } while (opcion !== "4");
}

iniciarSimulador();

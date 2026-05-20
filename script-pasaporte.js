document.addEventListener("DOMContentLoaded", () => {
    
    // Tu base de datos real integrada
    const databaseRutas = [
        { "id": "ruta-toledo-enigma", "titulo": "Toledo: El Enigma de la Ciudad Imperial", "ciudad": "Toledo", "clase": "sello-toledo", "codigo": "TLD-A" },
        { "id": "ruta-madrid-alatriste", "titulo": "El Madrid de los Austrias: Alatriste", "ciudad": "Madrid", "clase": "sello-madrid", "codigo": "MAD-A" },
        { "id": "ruta-baztan-dolores", "titulo": "Valle del Baztán: Mitología", "ciudad": "Baztán", "clase": "sello-baztan", "codigo": "BZN-M" },
        { "id": "ruta-madrid-reina-roja", "titulo": "Madrid: El Mapa de Antonia Scott", "ciudad": "Madrid", "clase": "sello-madrid", "codigo": "MAD-RR" },
        { "id": "ruta-roma-posteguillo", "titulo": "Roma: El Ascenso del César", "ciudad": "Roma", "clase": "sello-roma", "codigo": "RMA-C" }
    ];

    const selector = document.getElementById("selector-ruta-pasaporte");
    const btnEstampar = document.getElementById("btn-estampar-sello");
    const contenedorSellos = document.getElementById("contenedor-sellos-tinta");
    const contadorStats = document.getElementById("stats-rutas-contador");

    // Inicializar el Pasaporte
    poblarSelector();
    refrescarPasaporteCompleto();

    // Evento al cambiar la selección de la ruta
    selector.addEventListener("change", () => {
        const rutaId = selector.value;
        if (!rutaId) {
            btnEstampar.disabled = true;
            cambiarEstiloBotón("defecto");
            return;
        }

        btnEstampar.disabled = false;
        const yaEstampado = comprobarSelloExistente(rutaId);
        
        if (yaEstampado) {
            cambiarEstiloBotón("validado");
        } else {
            cambiarEstiloBotón("disponible");
        }
    });

    // Evento al hacer clic en Estampar
    btnEstampar.addEventListener("click", () => {
        const rutaId = selector.value;
        if (!rutaId) return;

        let sellosRegistrados = JSON.parse(localStorage.getItem("sellosPasaporte")) || [];
        
        if (!sellosRegistrados.some(s => s.id === rutaId)) {
            // Obtenemos la fecha de hoy formateada de forma compacta
            const hoy = new Date();
            const fechaString = `${hoy.getDate()} ${hoy.toLocaleString('es-ES', { month: 'short' }).toUpperCase()} ${hoy.getFullYear()}`;

            // Guardamos el registro del sello
            sellosRegistrados.push({ id: rutaId, fecha: fechaString });
            localStorage.setItem("sellosPasaporte", JSON.stringify(sellosRegistrados));

            // Actualizar interfaz
            refrescarPasaporteCompleto();
            cambiarEstiloBotón("validado");
        }
    });

    // Inyectar opciones en el SELECT
    function poblarSelector() {
        databaseRutas.forEach(ruta => {
            const opt = document.createElement("option");
            opt.value = ruta.id;
            opt.textContent = ruta.titulo;
            selector.appendChild(opt);
        });
    }

    // Comprobar si la ID ya tiene visado
    function comprobarSelloExistente(id) {
        const sellos = JSON.parse(localStorage.getItem("sellosPasaporte")) || [];
        return sellos.some(s => s.id === id);
    }

    // Refrescar paneles visuales e indicadores
    function refrescarPasaporteCompleto() {
        const sellosLogueados = JSON.parse(localStorage.getItem("sellosPasaporte")) || [];
        contenedorSellos.innerHTML = "";

        // Pintar sellos activos
        sellosLogueados.forEach(selloGuardado => {
            const datosPropios = databaseRutas.find(r => r.id === selloGuardado.id);
            if (datosPropios) {
                const elementoSello = document.createElement("div");
                elementoSello.className = `sello-oficial ${datosPropios.clase}`;
                elementoSello.innerHTML = `
                    <h5>★ IMMIGRATION ★</h5>
                    <div>${datosPropios.ciudad}</div>
                    <div class="fecha-entrada">${selloGuardado.fecha}</div>
                    <span class="meta-sello">PERMITTED ENTRY - ${datosPropios.codigo}</span>
                `;
                contenedorSellos.appendChild(elementoSello);
            }
        });

        // Actualizar estadísticas de la página de identidad
        contadorStats.textContent = `${sellosLogueados.length} / ${databaseRutas.length}`;
    }

    // Cambiar estados del botón de control
    function cambiarEstiloBotón(estado) {
        if (estado === "validado") {
            btnEstampar.className = "btn-accion-estampar ya-estampado";
            btnEstampar.innerHTML = `<i class="fa-solid fa-check-double"></i> ¡Ruta Sellada y Autorizada!`;
            btnEstampar.disabled = true;
        } else if (estado === "disponible") {
            btnEstampar.className = "btn-accion-estampar";
            btnEstampar.innerHTML = `<i class="fa-solid fa-stamp"></i> Estampar Sello de Viaje`;
            btnEstampar.disabled = false;
        } else {
            btnEstampar.className = "btn-accion-estampar";
            btnEstampar.innerHTML = `<i class="fa-solid fa-ink-pen"></i> Estampar Sello de Viaje`;
        }
    }
    const btnReiniciar = document.getElementById("btn-reiniciar-pasaporte");

if (btnReiniciar) {
    btnReiniciar.addEventListener("click", () => {
        // Pedimos confirmación al usuario para que no lo borre por error
        const confirmar = confirm("¿Estás seguro de que quieres borrar todos tus sellos y reiniciar tu pasaporte?");
        
        if (confirmar) {
            // Borramos el registro del almacenamiento del navegador
            localStorage.removeItem("sellosPasaporte");
            
            // Si también usaste la lista de 'rutasCompletadas' en el checklist, bórrala aquí:
            localStorage.removeItem("rutasCompletadas"); 
            
            // Refrescamos la interfaz para que los sellos desaparezcan visualmente
            refrescarPasaporteCompleto();
            
            // Reseteamos el botón de estampar si había algo seleccionado
            cambiarEstiloBotón("defecto");
            if (selector) selector.value = ""; 
            
            alert("Pasaporte reiniciado con éxito. ¡Listo para una nueva aventura!");
        }
    });
}
});
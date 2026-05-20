document.addEventListener("DOMContentLoaded", () => {

const contenedor = document.getElementById("biblioteca-container");
const buscador = document.getElementById("buscador");

let datosGlobales = [];

/* =========================
   MODAL
========================= */
const modal = document.createElement("div");
modal.classList.add("modal");
modal.innerHTML = `<div class="modal-content" id="modal-content"></div>`;
document.body.appendChild(modal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
  }
});

/* =========================
   CARGA JSON
========================= */
fetch("libros.json")
  .then(res => res.json())
  .then(data => {
    datosGlobales = data;
    renderizar(data);
    // DENTRO DEL .then(data => { ... }) de tu script de libros:

const params = new URLSearchParams(window.location.search);
const busquedaPrevia = params.get("buscar");

if (busquedaPrevia) {
  buscador.value = busquedaPrevia; // Pone el nombre del autor en el input
  // Reutiliza tu lógica de filtrado actual
  const filtrado = data.map(autor => {
      const obrasFiltradas = (autor.obras || []).filter(libro =>
        libro.titulo.toLowerCase().includes(busquedaPrevia.toLowerCase()) ||
        autor.autor.toLowerCase().includes(busquedaPrevia.toLowerCase())
      );
      return { ...autor, obras: obrasFiltradas };
    }).filter(autor => autor.obras.length > 0);
    
  renderizar(filtrado);
} else {
  renderizar(data);
}
  })
  .catch(err => {
    console.error("Error cargando JSON:", err);
    contenedor.innerHTML = "<p>Error cargando datos</p>";
  });

/* =========================
   RENDER SOLO PORTADAS
========================= */
function renderizar(data) {
  contenedor.innerHTML = "";

  data.forEach(autor => {
    if (!autor.obras) return;

    autor.obras.forEach(libro => {
      const item = document.createElement("div");
      item.classList.add("book-cover");

      const img = document.createElement("img");
      img.src = libro.portada_url || "https://via.placeholder.com/150";
      img.alt = libro.titulo;

      item.appendChild(img);

      item.addEventListener("click", () => mostrarDetalle(autor, libro));

      contenedor.appendChild(item);
    });
  });
}

/* =========================
   MODAL DETALLE
========================= */
function mostrarDetalle(autor, libro) {
  const modalContent = document.getElementById("modal-content");

  const lugares = Array.isArray(libro.lugares_clave)
    ? libro.lugares_clave.map(l =>
        `<p><strong>${l.nombre}</strong>: ${l.descripcion}</p>`
      ).join("")
    : "";

  const otrosLibros = (autor.obras || []).filter(b => b.titulo !== libro.titulo);

  modalContent.innerHTML = `
    <button id="closeModal">✕</button>

    <h2>${libro.titulo}</h2>
    <p><strong>Autor:</strong> ${autor.autor}</p>
    <p><strong>Género:</strong> ${autor.genero_principal}</p>

    <img src="${libro.portada_url}" class="modal-img">

    ${lugares ? `<h3>Lugares clave</h3>${lugares}` : ""}

    ${otrosLibros.length ? `
      <h3>Más libros del autor</h3>
      <ul>
        ${otrosLibros.map(b => `<li>${b.titulo}</li>`).join("")}
      </ul>
    ` : ""}
  `;

  modal.classList.add("show");
}

/* cerrar modal */
document.addEventListener("click", (e) => {
  if (e.target.id === "closeModal") {
    modal.classList.remove("show");
  }
});

/* =========================
   BUSCADOR
========================= */
buscador.addEventListener("input", (e) => {
  const valor = e.target.value.toLowerCase().trim();

  if (!valor) {
    renderizar(datosGlobales);
    return;
  }

  const filtrado = datosGlobales
    .map(autor => {
      const obrasFiltradas = (autor.obras || []).filter(libro =>
        libro.titulo.toLowerCase().includes(valor) ||
        autor.autor.toLowerCase().includes(valor)
      );

      return {
        ...autor,
        obras: obrasFiltradas
      };
    })
    .filter(autor => autor.obras.length > 0);

  renderizar(filtrado);
});

});
/* =========================
   MODAL DETALLE (Actualizado)
========================= */
function mostrarDetalle(autor, libro) {
  const modalContent = document.getElementById("modal-content");

  const lugares = Array.isArray(libro.lugares_clave)
    ? libro.lugares_clave.map(l =>
        `<p><strong>${l.nombre}</strong>: ${l.descripcion}</p>`
      ).join("")
    : "";

  const otrosLibros = (autor.obras || []).filter(b => b.titulo !== libro.titulo);

  // --- NUEVA LÓGICA DE BOTÓN DE RUTA ---
  // El ID de la ruta suele ser 'ruta-' seguido de algo descriptivo. 
  // Podrías añadir "ruta_id" a tu libros.json para hacerlo exacto.
  const botonRuta = `<a href="rutas.html" class="btn-ir-ruta">Ver Ruta Literaria de este libro</a>`;

  modalContent.innerHTML = `
    <button id="closeModal">✕</button>

    <h2>${libro.titulo}</h2>
    <p><strong>Autor:</strong> ${autor.autor}</p>
    <p><strong>Género:</strong> ${autor.genero_principal}</p>

    <img src="${libro.portada_url}" class="modal-img">

    ${lugares ? `<h3>Lugares clave</h3>${lugares}` : ""}

    <div style="margin: 20px 0;">
        ${botonRuta} 
    </div>

    ${otrosLibros.length ? `
      <h3>Más libros del autor</h3>
      <ul>
        ${otrosLibros.map(b => `<li>${b.titulo}</li>`).join("")}
      </ul>
    ` : ""}
  `;

  modal.classList.add("show");
}
// Simulamos que cargamos esto de tu rutas.json (necesitas que tus rutas tengan 'id', 'ciudad' y 'genero')
// Ejemplo de estructura esperada en el JSON: { id: "ruta-zafon", titulo: "Ruta de Zafón", ciudad: "Barcelona", genero: "Misterio" }

document.addEventListener("DOMContentLoaded", () => {
    let rutasGlobales = [];
    
    // 1. Cargar rutas y arrancar el pasaporte
    fetch("rutas.json")
        .then(res => res.json())
        .then(data => {
            rutasGlobales = data;
            renderizarRutas(data);
            actualizarPasaporte(); // Comprueba el estado guardado al iniciar
        });

    // 2. Renderizar las tarjetas de rutas
    function renderizarRutas(rutas) {
        const container = document.getElementById("rutas-container");
        container.innerHTML = "";

        rutas.forEach(ruta => {
            const card = document.createElement("div");
            card.classList.add("ruta-card");

            // Averiguar si esta ruta ya fue completada anteriormente por el usuario
            const completadas = JSON.parse(localStorage.getItem("rutasCompletadas")) || [];
            const esCompletada = completadas.includes(ruta.id);

            card.innerHTML = `
                <div class="ruta-banner" style="background-image: url('${ruta.imagen || 'https://via.placeholder.com/180'}')">
                    <div class="ruta-overlay">
                        <span class="ruta-libro-tag">${ruta.libro_titulo}</span>
                    </div>
                </div>
                <div class="ruta-body">
                    <h3>${ruta.titulo}</h3>
                    <p class="ruta-meta">${ruta.ciudad} | ${ruta.genero}</p>
                    <p class="ruta-descripcion">${ruta.descripcion}</p>
                    
                    <button class="btn-mapa-interactivo">Ver Mapa</button>
                    
                    <button class="btn-completar ${esCompletada ? 'completada' : ''}" data-id="${ruta.id}">
                        <i class="${esCompletada ? 'fa-solid fa-square-check' : 'fa-regular fa-square'}"></i> 
                        ${esCompletada ? '¡Ruta Completada!' : 'Marcar como completada'}
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

        // Escuchar los clics en los botones de completar
        configurarBotonesCompletar();
    }

    // 3. Manejar el clic en "Marcar como completada"
    function configurarBotonesCompletar() {
        document.querySelectorAll(".btn-completar").forEach(boton => {
            boton.addEventListener("click", (e) => {
                const botonClickeado = e.currentTarget;
                const rutaId = botonClickeado.getAttribute("data-id");
                let completadas = JSON.parse(localStorage.getItem("rutasCompletadas")) || [];

                if (completadas.includes(rutaId)) {
                    // Si ya estaba, la quitamos (desmarcar)
                    completadas = completadas.filter(id => id !== rutaId);
                    botonClickeado.classList.remove("completada");
                    botonClickeado.innerHTML = `<i class="fa-regular fa-square"></i> Marcar como completada`;
                } else {
                    // Si no estaba, la añadimos
                    completadas.push(rutaId);
                    botonClickeado.classList.add("completada");
                    botonClickeado.innerHTML = `<i class="fa-solid fa-square-check"></i> ¡Ruta Completada!`;
                }

                // Guardamos la nueva lista en el navegador
                localStorage.setItem("rutasCompletadas", JSON.stringify(completadas));
                
                // Recalculamos el pasaporte y las medallas
                actualizarPasaporte();
            });
        });
    }
});
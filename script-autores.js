document.addEventListener("DOMContentLoaded", () => {
  const contenedorAutores = document.getElementById("autores-container");
  const buscador = document.getElementById("buscador"); // Si decides poner buscador en autores

  let autoresGlobales = [];

  /* =========================
     CARGA JSON DE AUTORES
  ========================= */
  fetch("autores.json")
    .then(res => res.json())
    .then(data => {
      autoresGlobales = data;
      // Comprobar si hay un filtro en la URL (ej: autores.html?id=dolores-redondo)
      const params = new URLSearchParams(window.location.search);
      const autorId = params.get("id");

      if (autorId) {
        const filtrado = data.filter(a => a.id === autorId);
        renderizarAutores(filtrado);
      } else {
        renderizarAutores(data);
      }
    })
    .catch(err => {
      console.error("Error cargando autores:", err);
      if(contenedorAutores) contenedorAutores.innerHTML = "<p>Error al cargar autores</p>";
    });

  /* =========================
     RENDERIZAR TARJETAS
  ========================= */
  function renderizarAutores(data) {
    if (!contenedorAutores) return;
    contenedorAutores.innerHTML = "";

    if (data.length === 0) {
      contenedorAutores.innerHTML = "<p>No se encontraron autores.</p>";
      return;
    }

    data.forEach(autor => {
      const card = document.createElement("div");
      card.classList.add("autor-card");

      card.innerHTML = `
        <img src="${autor.foto}" alt="${autor.nombre}" class="autor-foto">
        <h3>${autor.nombre}</h3>
        <p class="autor-estilo"><strong>Estilo:</strong> ${autor.estilo}</p>
        <p class="autor-bio">${autor.biografia}</p>
        <a href="index.html?buscar=${encodeURIComponent(autor.nombre)}" class="btn-ver-libros">
          Ver libros de ${autor.nombre.split(' ')[0]}
        </a>
      `;

      contenedorAutores.appendChild(card);
    });
  }

  /* =========================
     BUSCADOR (OPCIONAL)
  ========================= */
  if (buscador) {
    buscador.addEventListener("input", (e) => {
      const valor = e.target.value.toLowerCase().trim();
      const filtrados = autoresGlobales.filter(a => 
        a.nombre.toLowerCase().includes(valor) || 
        a.estilo.toLowerCase().includes(valor)
      );
      renderizarAutores(filtrados);
    });
  }
});
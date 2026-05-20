document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("rutas-container");
    let userMarker = null;
    let markersDeParadas = {}; // Para guardar los pines y abrirlos por código

    async function cargarRutas() {
        try {
            const res = await fetch("rutaliteraria.json"); 
            const rutas = await res.json();
            
            contenedor.innerHTML = ""; 

            rutas.forEach(ruta => {
                renderizarTarjetaRuta(ruta);
            });
        } catch (err) {
            console.error("Error cargando las rutas:", err);
            contenedor.innerHTML = "<p>Error al cargar las rutas.</p>";
        }
    }

    function renderizarTarjetaRuta(ruta) {
        const card = document.createElement("div");
        card.className = "ruta-card";

        const paradasHTML = ruta.paradas.map(p => `
            <div class="parada-item" id="parada-${ruta.id}-${p.orden}">
                <div class="parada-icon"><i class="fas fa-${p.icono}"></i></div>
                <div class="parada-info">
                    <h4>${p.lugar}</h4>
                    <p>${p.detalle}</p>
                </div>
            </div>
        `).join("");

        card.innerHTML = `
            <div class="ruta-banner" style="background-image: url('${ruta.imagen_banner}')">
                <div class="ruta-overlay"><span class="ruta-libro-tag">${ruta.libro}</span></div>
            </div>
            <div class="ruta-body">
                <h3>${ruta.titulo}</h3>
                <p class="ruta-descripcion">${ruta.descripcion_corta}</p>
                <div id="map-${ruta.id}" class="mapa-estilo" style="height: 350px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #333;"></div>
                <div class="timeline">${paradasHTML}</div>
                <button class="btn-mapa-interactivo" id="btn-gps-${ruta.id}">
                    <i class="fas fa-location-arrow"></i> Activar Modo Paseo (GPS)
                </button>
            </div>
        `;
        contenedor.appendChild(card);
        inicializarMapa(ruta);

        document.getElementById(`btn-gps-${ruta.id}`).addEventListener("click", () => {
            activarGPS(ruta);
        });
    }

    function inicializarMapa(ruta) {
        if (ruta.paradas.length > 0 && ruta.paradas[0].coords) {
            const map = L.map(`map-${ruta.id}`).setView(ruta.paradas[0].coords, 15);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            markersDeParadas[ruta.id] = [];

            ruta.paradas.forEach(p => {
                if (p.coords) {
                    const marker = L.marker(p.coords)
                        .addTo(map)
                        .bindPopup(`<b>${p.lugar}</b><br>${p.detalle}`);
                    
                    // Guardamos la referencia del marcador y sus datos
                    markersDeParadas[ruta.id].push({
                        instancia: marker,
                        coords: p.coords,
                        nombre: p.lugar,
                        orden: p.orden
                    });
                }
            });

            window[`mapInstance_${ruta.id}`] = map;
        }
    }

    function activarGPS(ruta) {
        if (!navigator.geolocation) return alert("GPS no disponible");

        const map = window[`mapInstance_${ruta.id}`];
        alert(`Iniciando ruta: ${ruta.titulo}. El mapa detectará cuando llegues a un punto clave.`);

        navigator.geolocation.watchPosition(
            (pos) => {
                const userCoords = [pos.coords.latitude, pos.coords.longitude];

                if (userMarker) {
                    userMarker.setLatLng(userCoords);
                } else {
                    userMarker = L.circleMarker(userCoords, {
                        color: '#ffffff', fillColor: '#007bff', fillOpacity: 1, radius: 10, weight: 3
                    }).addTo(map);
                }

                map.panTo(userCoords);

                // --- LÓGICA DE PROXIMIDAD ---
                verificarProximidad(userCoords, ruta.id);
            },
            (err) => console.warn(err),
            { enableHighAccuracy: true }
        );
    }

    function verificarProximidad(userCoords, rutaId) {
        const RADIO_AVISO = 20; // metros para considerar que "has llegado"

        markersDeParadas[rutaId].forEach(punto => {
            const distancia = L.latLng(userCoords).distanceTo(L.latLng(punto.coords));

            if (distancia < RADIO_AVISO) {
                // 1. Abre el globo informativo en el mapa automáticamente
                if (!punto.instancia.isPopupOpen()) {
                    punto.instancia.openPopup();
                    
                    // 2. Efecto visual en la lista (timeline)
                    const element = document.getElementById(`parada-${rutaId}-${punto.orden}`);
                    if (element) {
                        element.style.background = "#e3f2fd"; // Color de resaltado
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        });
    }
// ... (resto del código igual hasta llegar a inicializarMapa)

function inicializarMapa(ruta) {
    // Usamos setTimeout para dar tiempo al navegador a renderizar el HTML
    setTimeout(() => {
        const mapContainer = document.getElementById(`map-${ruta.id}`);
        
        if (mapContainer && ruta.paradas.length > 0 && ruta.paradas[0].coords) {
            
            // Si el mapa ya estaba inicializado, lo eliminamos para evitar errores
            if (window[`mapInstance_${ruta.id}`]) {
                window[`mapInstance_${ruta.id}`].remove();
            }

            const map = L.map(`map-${ruta.id}`).setView(ruta.paradas[0].coords, 15);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            markersDeParadas[ruta.id] = [];

            ruta.paradas.forEach(p => {
                if (p.coords) {
                    const marker = L.marker(p.coords)
                        .addTo(map)
                        .bindPopup(`<b>${p.lugar}</b><br>${p.detalle}`);
                    
                    markersDeParadas[ruta.id].push({
                        instancia: marker,
                        coords: p.coords,
                        nombre: p.lugar,
                        orden: p.orden
                    });
                }
            });

            window[`mapInstance_${ruta.id}`] = map;
            
            // Forzar a Leaflet a recalcular el tamaño del contenedor
            map.invalidateSize();
        }
    }, 200); // 200ms de espera son suficientes
}
function inicializarMapa(ruta) {
    setTimeout(() => {
        const mapContainer = document.getElementById(`map-${ruta.id}`);
        
        // Verificamos si la parada tiene coords (ahora que las has puesto en el JSON)
        if (mapContainer && ruta.paradas.length > 0 && ruta.paradas[0].coords) {
            
            const map = L.map(`map-${ruta.id}`).setView(ruta.paradas[0].coords, 15);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            markersDeParadas[ruta.id] = [];

            ruta.paradas.forEach(p => {
                if (p.coords) {
                    const marker = L.marker(p.coords)
                        .addTo(map)
                        .bindPopup(`<b>${p.lugar}</b><br>${p.detalle}`);
                    
                    markersDeParadas[ruta.id].push({
                        instancia: marker,
                        coords: p.coords,
                        nombre: p.lugar,
                        orden: p.orden
                    });
                }
            });

            window[`mapInstance_${ruta.id}`] = map;
            map.invalidateSize(); // Esto arregla fallos de renderizado
        } else {
            console.error(`Faltan coordenadas en el JSON para la ruta: ${ruta.id}`);
        }
    }, 300); 
}
    cargarRutas();
});
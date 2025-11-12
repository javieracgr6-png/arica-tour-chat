class AricaGoApp {
    constructor() {
        this.atracciones = [];
        this.categoriaActual = 'todos';
        this.init();
    }

    async init() {
        await this.cargarDatos();
        this.setupEventListeners();
        this.mostrarDestacados();
    }

    async cargarDatos() {
        try {
            const response = await fetch('/data/atracciones.json');
            this.atracciones = await response.json();
            console.log('✅ Datos cargados correctamente');
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
    }

    setupEventListeners() {
        // Categorías
        document.querySelectorAll('.category').forEach(cat => {
            cat.addEventListener('click', (e) => {
                const categoria = e.target.getAttribute('data-category');
                this.filtrarPorCategoria(categoria);
            });
        });

        // Búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.buscarAtracciones(e.target.value);
        });
    }

    filtrarPorCategoria(categoria) {
        this.categoriaActual = categoria;
        
        // Actualizar categorías activas
        document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
        });
        document.querySelector(`[data-category="${categoria}"]`).classList.add('active');

        // Mostrar resultados
        if (categoria === 'todos') {
            this.mostrarDestacados();
        } else {
            this.mostrarResultados(categoria);
        }
    }

    mostrarDestacados() {
        const container = document.getElementById('cardsContainer');
        const destacados = this.atracciones.destacados.map(id => 
            this.encontrarAtraccionPorId(id)
        ).filter(Boolean);

        this.renderizarTarjetas(destacados, container);
    }

    mostrarResultados(categoria) {
        const container = document.getElementById('cardsContainer');
        const resultados = this.atracciones[categoria] || [];
        this.renderizarTarjetas(resultados, container);
    }

    buscarAtracciones(termino) {
        if (termino.length < 2) {
            this.filtrarPorCategoria(this.categoriaActual);
            return;
        }

        const resultados = [];
        Object.keys(this.atracciones).forEach(categoria => {
            if (Array.isArray(this.atracciones[categoria])) {
                this.atracciones[categoria].forEach(atraccion => {
                    if (this.coincideBusqueda(atraccion, termino)) {
                        resultados.push(atraccion);
                    }
                });
            }
        });

        const container = document.getElementById('cardsContainer');
        this.renderizarTarjetas(resultados, container);
    }

    coincideBusqueda(atraccion, termino) {
        const busqueda = termino.toLowerCase();
        return (
            atraccion.nombre.toLowerCase().includes(busqueda) ||
            atraccion.descripcion.toLowerCase().includes(busqueda) ||
            atraccion.ubicacion.toLowerCase().includes(busqueda) ||
            (atraccion.especialidades && atraccion.especialidades.some(esp => 
                esp.toLowerCase().includes(busqueda)
            ))
        );
    }

    encontrarAtraccionPorId(id) {
        for (let categoria in this.atracciones) {
            if (Array.isArray(this.atracciones[categoria])) {
                const encontrado = this.atracciones[categoria].find(a => a.id === id);
                if (encontrado) return encontrado;
            }
        }
        return null;
    }

    renderizarTarjetas(atracciones, container) {
        if (atracciones.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron resultados</h3>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = atracciones.map(atraccion => `
            <div class="card" onclick="app.mostrarDetalle(${atraccion.id})">
                <div class="card-image" style="background-image: url('${atraccion.imagen}')">
                    <div class="card-badge">${this.getCategoriaNombre(atraccion.categoria)}</div>
                </div>
                <div class="card-content">
                    <h3>${atraccion.nombre}</h3>
                    <div class="card-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${atraccion.ubicacion} • ${atraccion.distancia}</span>
                    </div>
                    <p class="card-description">${atraccion.descripcion}</p>
                    <div class="card-features">
                        <span><i class="fas fa-clock"></i> ${atraccion.horario}</span>
                        <span><i class="fas fa-tag"></i> ${atraccion.precio}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getCategoriaNombre(categoria) {
        const nombres = {
            'playas': 'Playa',
            'gastronomia': 'Gastronomía',
            'cultura': 'Cultural',
            'aventura': 'Aventura'
        };
        return nombres[categoria] || categoria;
    }

    mostrarDetalle(id) {
        const atraccion = this.encontrarAtraccionPorId(id);
        if (!atraccion) return;

        // Aquí implementarías el modal de detalles
        console.log('Mostrar detalle:', atraccion);
        alert(`Detalles de: ${atraccion.nombre}\n\n${atraccion.descripcion}`);
    }
}

// Inicializar la aplicación
const app = new AricaGoApp();

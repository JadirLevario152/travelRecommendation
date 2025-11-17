// travel_recommendation.js
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    
    let travelData = {};
    
    // Cargar datos de la API JSON
    async function loadTravelData() {
        try {
            const response = await fetch('travel_recommendation_api.json');
            if (!response.ok) {
                throw new Error('Error al cargar los datos de la API');
            }
            travelData = await response.json();
            console.log('Datos cargados correctamente:', travelData);
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al cargar las recomendaciones. Por favor, intenta más tarde.');
        }
    }
    
    // Función para buscar recomendaciones
    function searchRecommendations() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            showMessage('Por favor, ingresa un término de búsqueda.');
            return;
        }
        
        console.log('Buscando:', searchTerm);
        
        // Normalizar términos de búsqueda
        const normalizedTerm = searchTerm
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""); // Remover acentos
        
        const results = [];
        
        // Buscar por categorías principales
        if (matchesCategory(normalizedTerm, ['beach', 'beaches', 'playa', 'playas'])) {
            console.log('Búsqueda de playas detectada');
            if (travelData.beaches) {
                results.push(...travelData.beaches.slice(0, 2)); // Máximo 2 resultados
            }
        }
        
        if (matchesCategory(normalizedTerm, ['temple', 'templos', 'templo', 'temple'])) {
            console.log('Búsqueda de templos detectada');
            if (travelData.temples) {
                results.push(...travelData.temples.slice(0, 2)); // Máximo 2 resultados
            }
        }
        
        if (matchesCategory(normalizedTerm, ['country', 'countries', 'país', 'paises'])) {
            console.log('Búsqueda de países detectada');
            if (travelData.countries) {
                // Para países, tomar ciudades de diferentes países
                travelData.countries.slice(0, 2).forEach(country => {
                    if (country.cities && country.cities.length > 0) {
                        results.push(country.cities[0]); // Primera ciudad de cada país
                    }
                });
            }
        }
        
        // Búsqueda específica por nombre de destino
        if (results.length === 0) {
            searchSpecificDestinations(normalizedTerm, results);
        }
        
        // Mostrar resultados
        displayResults(results, searchTerm);
    }
    
    // Función para verificar coincidencias de categoría
    function matchesCategory(searchTerm, keywords) {
        return keywords.some(keyword => 
            searchTerm.includes(keyword) || keyword.includes(searchTerm)
        );
    }
    
    // Función para búsqueda específica de destinos
    function searchSpecificDestinations(searchTerm, results) {
        // Buscar en países
        if (travelData.countries) {
            travelData.countries.forEach(country => {
                // Buscar por nombre del país
                if (country.name.toLowerCase().includes(searchTerm)) {
                    if (country.cities && country.cities.length > 0) {
                        results.push(...country.cities.slice(0, 2));
                    }
                }
                
                // Buscar en ciudades
                country.cities.forEach(city => {
                    if (city.name.toLowerCase().includes(searchTerm) && 
                        !results.some(r => r.name === city.name)) {
                        results.push(city);
                    }
                });
            });
        }
        
        // Buscar en templos
        if (travelData.temples) {
            travelData.temples.forEach(temple => {
                if (temple.name.toLowerCase().includes(searchTerm) && 
                    !results.some(r => r.name === temple.name)) {
                    results.push(temple);
                }
            });
        }
        
        // Buscar en playas
        if (travelData.beaches) {
            travelData.beaches.forEach(beach => {
                if (beach.name.toLowerCase().includes(searchTerm) && 
                    !results.some(r => r.name === beach.name)) {
                    results.push(beach);
                }
            });
        }
    }
    
    // Función para mostrar resultados
    function displayResults(results, searchTerm) {
        if (results.length === 0) {
            showMessage(`No se encontraron destinos que coincidan con "${searchTerm}".`);
            return;
        }
        
        let html = '';
        results.forEach((destination, index) => {
            if (index >= 4) return; // Limitar a 4 resultados máximo
            
            html += `
                <div class="destination-card">
                    <div class="destination-img" style="background-image: url('${destination.imageUrl}')"></div>
                    <div class="destination-info">
                        <h4>${destination.name}</h4>
                        <p>${destination.description}</p>
                        <button class="visit-btn" onclick="visitDestination('${destination.name}')">
                            Visit
                        </button>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
    }
    
    // Función para mostrar mensajes
    function showMessage(message) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>${message}</p>
            </div>
        `;
    }
    
    // Función para limpiar resultados (Tarea 9)
    function clearResults() {
        searchInput.value = '';
        showMessage('Ingresa un destino o palabra clave para buscar recomendaciones.');
        console.log('Resultados limpiados');
    }
    
    // Función global para visitar destino
    window.visitDestination = function(destinationName) {
        alert(`¡Visitando: ${destinationName}!\n\nEsta funcionalidad estaría disponible en una versión completa del sitio.`);
    };
    
    // Event listeners
    searchBtn.addEventListener('click', searchRecommendations);
    resetBtn.addEventListener('click', clearResults);
    
    // Permitir búsqueda con Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRecommendations();
        }
    });
    
    // Cargar datos cuando la página esté lista
    loadTravelData();
});
// Golden Routes Dynamic Data Loading
document.addEventListener('DOMContentLoaded', async () => {
    await loadRoutes();
});

async function loadRoutes() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/routes`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
            console.error('Failed to load routes:', result.message);
            showError('Error al cargar las rutas');
            return;
        }

        const routes = result.data;
        displayRoutes(routes);
        updateImpactStats(routes);

    } catch (error) {
        console.error('Error loading routes:', error);
        showError('Error de conexión al cargar las rutas');
    }
}

function displayRoutes(routes) {
    const routesContainer = document.getElementById('routes-container');
    
    if (!routesContainer) {
        console.error('Routes container not found');
        return;
    }

    // Clear existing content
    routesContainer.innerHTML = '';

    if (routes.length === 0) {
        routesContainer.innerHTML = '<p class="no-routes">No hay rutas disponibles en este momento.</p>';
        return;
    }

    // Separate routes by status
    const activeRoutes = routes.filter(route => route.status === 'active');
    const planningRoutes = routes.filter(route => route.status === 'planning');
    const inactiveRoutes = routes.filter(route => route.status === 'inactive');

    // Display active routes first
    displayRoutesByStatus(activeRoutes, routesContainer, 'active');
    displayRoutesByStatus(planningRoutes, routesContainer, 'planning');
    // Optionally display inactive routes
    if (inactiveRoutes.length > 0) {
        displayRoutesByStatus(inactiveRoutes, routesContainer, 'inactive');
    }
}

function displayRoutesByStatus(routes, container, status) {
    routes.forEach(route => {
        const routeItem = createRouteElement(route, status);
        container.appendChild(routeItem);
    });
}

function createRouteElement(route, status) {
    const routeItem = document.createElement('div');
    routeItem.className = 'route-item';

    const statusLabels = {
        'active': 'Activa',
        'planning': 'En Planificación',
        'inactive': 'Inactiva'
    };

    const statusLabel = statusLabels[status] || status;

    routeItem.innerHTML = `
        <div class="route-header">
            <h3>${escapeHtml(route.name)}</h3>
            <span class="route-status ${status}">${statusLabel}</span>
        </div>
        <div class="route-path">
            <span class="origin">${escapeHtml(route.origin)}</span>
            <span class="arrow">→</span>
            <span class="destination">${escapeHtml(route.destination)}</span>
        </div>
        <p>${escapeHtml(route.description || 'Sin descripción disponible')}</p>
        <div class="route-stats">
            ${route.frequency ? `<span class="stat">📅 ${escapeHtml(route.frequency)}</span>` : ''}
            <span class="stat">👥 ${route.participants_count || 0}+ participantes</span>
            <span class="stat">🏛️ ${route.spaces_established || 0} espacios establecidos</span>
        </div>
    `;

    return routeItem;
}

function updateImpactStats(routes) {
    // Calculate total participants across all active routes
    const activeRoutes = routes.filter(route => route.status === 'active');
    const totalParticipants = activeRoutes.reduce((sum, route) => sum + (route.participants_count || 0), 0);
    const totalSpaces = activeRoutes.reduce((sum, route) => sum + (route.spaces_established || 0), 0);

    // Count unique provinces (destinations)
    const uniqueDestinations = new Set();
    activeRoutes.forEach(route => {
        if (route.destination) {
            // Extract province name (before any dash or comma)
            const province = route.destination.split(/[-,]/)[0].trim();
            uniqueDestinations.add(province);
        }
    });

    // Update the impact numbers if elements exist
    const provinceElement = document.querySelector('.impact-stats .impact-card:first-child .impact-number');
    const participantsElement = document.querySelector('.impact-stats .impact-card:nth-child(2) .impact-number');

    if (provinceElement) {
        provinceElement.textContent = uniqueDestinations.size;
    }

    if (participantsElement) {
        participantsElement.textContent = `${totalParticipants}+`;
    }

    // Optionally add spaces established if needed
    // You could create a third impact card for this
}

function showError(message) {
    const routesContainer = document.getElementById('routes-container');
    if (routesContainer) {
        routesContainer.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <p>Por favor, inténtalo de nuevo más tarde.</p>
            </div>
        `;
    }
}

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

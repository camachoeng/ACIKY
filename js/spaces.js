// Spaces page functionality
const API_URL = 'http://127.0.0.1:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
    await loadSpaces();
});

async function loadSpaces() {
    try {
        const response = await fetch(`${API_URL}/spaces`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error loading spaces');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
            displaySpaces(result.data);
        }
    } catch (error) {
        console.error('Error loading spaces:', error);
        showError('No se pudieron cargar los espacios. Por favor, intenta más tarde.');
    }
}

function displaySpaces(spaces) {
    // Separate community and instructor spaces
    const communitySpace = spaces.find(space => 
        space.name.toLowerCase().includes('casa-museo') || 
        space.name.toLowerCase().includes('comunitario')
    );
    
    const instructorSpaces = spaces.filter(space => 
        !space.name.toLowerCase().includes('casa-museo') && 
        !space.name.toLowerCase().includes('comunitario')
    );

    // Display community space
    if (communitySpace) {
        displayCommunitySpace(communitySpace);
    }

    // Display instructor spaces
    if (instructorSpaces.length > 0) {
        displayInstructorSpaces(instructorSpaces);
    }
}

function displayCommunitySpace(space) {
    const communitySection = document.querySelector('.community-space-section .space-card');
    
    if (!communitySection) return;

    const mapLink = space.location || '#';
    const imageUrl = space.image || '../../images/activities/clases.jpg';
    const phone = space.phone || '';
    const email = space.email || '';
    const whatsappNumber = phone.replace(/[^0-9]/g, '');

    communitySection.innerHTML = `
        <div class="space-image">
            <img src="${imageUrl}" alt="${space.name}" class="space-img">
        </div>
        <div class="space-info">
            <h3 class="space-name">${space.name}</h3>
            <div class="space-details">
                <div class="location-info">
                    <p class="address">
                        <strong>📍 Dirección:</strong><br>
                        ${space.address || 'No especificada'}
                    </p>
                </div>
                
                ${phone || email ? `
                <div class="contact-info">
                    <p><strong>📞 Contacto:</strong></p>
                    <div class="contact-methods">
                        ${phone ? `
                        <a href="tel:${phone}" class="contact-link">📱 ${phone}</a>
                        <a href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener" class="contact-link">💬 WhatsApp</a>
                        ` : ''}
                        ${email ? `
                        <a href="mailto:${email}" class="contact-link">✉️ ${email}</a>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${space.disciplines && space.disciplines.length > 0 ? `
                <div class="amenities-info">
                    <p><strong>✨ Disciplinas:</strong></p>
                    <div class="amenities-grid">
                        ${space.disciplines.map(d => `<span class="amenity">${d}</span>`).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="contact-actions">
                    <a href="../schedule.html" class="btn-primary">Reservar Clase</a>
                    <a href="${mapLink}" target="_blank" rel="noopener" class="btn-secondary">
                        📍 Ver en Mapa
                    </a>
                </div>
            </div>
        </div>
    `;
}

function displayInstructorSpaces(spaces) {
    const instructorsGrid = document.querySelector('.instructors-grid');
    
    if (!instructorsGrid) return;

    instructorsGrid.innerHTML = spaces.map(space => createInstructorCard(space)).join('');
}

function createInstructorCard(space) {
    const mapLink = space.location || '#';
    const imageUrl = space.image || '../../images/spaces/default.jpg';
    const phone = space.phone || '';
    const email = space.email || '';
    const whatsappNumber = phone.replace(/[^0-9]/g, '');
    
    // Format instructors info
    const instructorsInfo = space.instructors && space.instructors.length > 0 
        ? `
            <div class="instructor-info">
                <h4 class="instructor-name">👥 ${space.instructors.map(i => i.username).join(', ')}</h4>
                <p class="instructor-specialty">Instructores de Kundalini Yoga</p>
            </div>
        `
        : '';

    const badge = space.instructors && space.instructors.length > 1 
        ? 'Instructores ACIKY' 
        : 'Instructora ACIKY';

    return `
        <div class="space-card instructor-card">
            <div class="space-image">
                <img src="${imageUrl}" alt="${space.name}" class="space-img">
                <div class="instructor-badge">${badge}</div>
            </div>
            <div class="space-info">
                <h3 class="space-name">${space.name}</h3>
                ${instructorsInfo}
                
                <div class="space-details">
                    ${space.address ? `
                    <p class="address">
                        <strong>📍</strong> ${space.address}
                    </p>
                    ` : ''}
                    
                    ${phone || email ? `
                    <div class="contact-info">
                        <p><strong>📞 Contacto:</strong></p>
                        <div class="contact-methods">
                            ${phone ? `
                            <a href="tel:${phone}" class="contact-link">📱 ${phone}</a>
                            <a href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener" class="contact-link">💬 WhatsApp</a>
                            ` : ''}
                            ${email ? `
                            <a href="mailto:${email}" class="contact-link">✉️ ${email}</a>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}

                    ${space.disciplines && space.disciplines.length > 0 ? `
                    <div class="class-types">
                        <p><strong>🧘‍♀️ Clases Disponibles:</strong></p>
                        <div class="types-grid">
                            ${space.disciplines.map(d => `<span class="class-type">${d}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="contact-actions">
                        ${whatsappNumber ? `
                        <a href="https://wa.me/${whatsappNumber}?text=Hola,%20me%20interesa%20información%20sobre%20las%20clases" target="_blank" rel="noopener" class="btn-primary">Reservar Clase</a>
                        ` : ''}
                        ${mapLink && mapLink !== '#' ? `
                        <a href="${mapLink}" target="_blank" rel="noopener" class="btn-secondary">📍 Ver Ubicación</a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    const instructorsGrid = document.querySelector('.instructors-grid');
    if (instructorsGrid) {
        instructorsGrid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }
}

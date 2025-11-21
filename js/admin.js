// Admin Panel JavaScript for ACIKY
// Handles blog posts and activities CRUD operations

const API_BASE = window.location.hostname === 'camachoeng.github.io'
    ? 'https://aciky-backend-298cb7d6b0a8.herokuapp.com/api'
    : 'http://127.0.0.1:3000/api';

// Check admin authentication on page load
(async function() {
    try {
        const response = await fetch(`${API_BASE}/auth/check`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.isAuthenticated) {
            alert('Debes iniciar sesión para acceder al panel de administración');
            window.location.href = 'login.html';
            return;
        }
        
        // Note: Backend doesn't return role in current implementation
        // For now, any authenticated user can access admin
        // You may want to add role checking in the future
        
    } catch (error) {
        console.error('Auth check failed:', error);
        alert('Error de autenticación');
        window.location.href = 'login.html';
    }
})();

// ========== TAB SWITCHING ==========
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load data for the tab (async to avoid blocking)
        if (tabName === 'blog' && !document.getElementById('blogList').querySelector('table')) {
            setTimeout(() => loadBlogPosts(), 0);
        } else if (tabName === 'activities' && !document.getElementById('activitiesList').querySelector('table')) {
            setTimeout(() => loadActivities(), 0);
        }
    });
});

// Load initial data
loadBlogPosts();
loadTeachers();

// ========== LOAD TEACHERS ==========
let teachersCache = [];

async function loadTeachers() {
    try {
        const response = await fetch(`${API_BASE}/users/teachers`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            teachersCache = result.data;
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

function populateTeacherDropdown() {
    const select = document.getElementById('activityTeacher');
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Selecciona un profesor...</option>';
    
    teachersCache.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.username} (${teacher.role})`;
        select.appendChild(option);
    });
}

// ========== BLOG POSTS CRUD ==========

async function loadBlogPosts() {
    const blogList = document.getElementById('blogList');
    blogList.innerHTML = '<div class="loading">Cargando artículos...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/blog?published=false&limit=100`, {
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (!result.success || !result.data || result.data.length === 0) {
            blogList.innerHTML = '<p style="text-align: center; padding: 40px;">No hay artículos. Crea tu primer artículo.</p>';
            return;
        }
        
        let html = `
            <table class="content-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Slug</th>
                        <th>Categoría</th>
                        <th>Estado</th>
                        <th>Vistas</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        result.data.forEach(post => {
            const date = new Date(post.published_at || post.created_at).toLocaleDateString('es-ES');
            const status = post.published ? 
                '<span class="status-badge status-published">Publicado</span>' : 
                '<span class="status-badge status-draft">Borrador</span>';
            
            html += `
                <tr>
                    <td>${post.title}</td>
                    <td>${post.slug}</td>
                    <td>${post.category || '-'}</td>
                    <td>${status}</td>
                    <td>${post.views || 0}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn-edit" onclick="editBlogPost(${post.id})">Editar</button>
                        <button class="btn-delete" onclick="deleteBlogPost(${post.id}, '${post.title.replace(/'/g, "\\'")}' )">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        blogList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogList.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Error al cargar artículos</p>';
    }
}

function openBlogModal(postId = null) {
    document.getElementById('blogModal').style.display = 'block';
    document.getElementById('blogModalTitle').textContent = postId ? 'Editar Artículo' : 'Nuevo Artículo';
    
    // Only reset form if creating new post (not editing)
    if (!postId) {
        document.getElementById('blogForm').reset();
        document.getElementById('blogId').value = '';
    }
    
    document.getElementById('blogError').style.display = 'none';
    document.getElementById('blogSuccess').style.display = 'none';
}

function closeBlogModal() {
    document.getElementById('blogModal').style.display = 'none';
}

async function editBlogPost(postId) {
    try {
        const response = await fetch(`${API_BASE}/blog?published=false&limit=100`, {
            credentials: 'include'
        });
        const result = await response.json();
        const post = result.data.find(p => p.id === postId);
        
        if (!post) {
            alert('Artículo no encontrado');
            return;
        }
        
        // Set all form values BEFORE opening modal
        document.getElementById('blogId').value = post.id;
        document.getElementById('blogTitle').value = post.title;
        document.getElementById('blogSlug').value = post.slug;
        document.getElementById('blogExcerpt').value = post.excerpt || '';
        document.getElementById('blogContent').value = post.content || '';
        document.getElementById('blogCategory').value = post.category || '';
        document.getElementById('blogTags').value = post.tags || '';
        document.getElementById('blogImage').value = post.featured_image || '';
        document.getElementById('blogPublished').checked = post.published;
        
        // Open modal AFTER setting values
        openBlogModal(postId);
    } catch (error) {
        console.error('Error loading post:', error);
        alert('Error al cargar el artículo');
    }
}

async function deleteBlogPost(postId, title) {
    if (!confirm(`¿Estás seguro de eliminar el artículo "${title}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/blog/${postId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Artículo eliminado exitosamente');
            loadBlogPosts();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error al eliminar el artículo');
    }
}

document.getElementById('blogForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const postId = document.getElementById('blogId').value;
    const errorDiv = document.getElementById('blogError');
    const successDiv = document.getElementById('blogSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const data = {
        title: document.getElementById('blogTitle').value.trim(),
        slug: document.getElementById('blogSlug').value.trim(),
        excerpt: document.getElementById('blogExcerpt').value.trim(),
        content: document.getElementById('blogContent').value.trim(),
        category: document.getElementById('blogCategory').value,
        tags: document.getElementById('blogTags').value.trim(),
        featured_image: document.getElementById('blogImage').value.trim(),
        published: document.getElementById('blogPublished').checked
    };
    
    if (!data.title || !data.slug || !data.content) {
        errorDiv.textContent = 'Por favor completa los campos requeridos';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const url = postId ? `${API_BASE}/blog/${postId}` : `${API_BASE}/blog`;
        const method = postId ? 'PUT' : 'POST';
        
        
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        
        if (result.success) {
            successDiv.textContent = postId ? 'Artículo actualizado exitosamente' : 'Artículo creado exitosamente';
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                closeBlogModal();
                loadBlogPosts();
            }, 1500);
        } else {
            errorDiv.textContent = result.message || 'Error al guardar el artículo';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error saving post:', error);
        errorDiv.textContent = 'Error de conexión al guardar el artículo';
        errorDiv.style.display = 'block';
    }
});

// ========== ACTIVITIES CRUD ==========

async function loadActivities() {
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = '<div class="loading">Cargando clases...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/activities?active=false&limit=100`, {
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (!result.success || !result.data || result.data.length === 0) {
            activitiesList.innerHTML = '<p style="text-align: center; padding: 40px;">No hay clases. Crea tu primera clase.</p>';
            return;
        }
        
        let html = `
            <table class="content-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Horario</th>
                        <th>Ubicación</th>
                        <th>Nivel</th>
                        <th>Estado</th>
                        <th>Destacada</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        result.data.forEach(activity => {
            const status = activity.active ? 
                '<span class="status-badge status-active">Activa</span>' : 
                '<span class="status-badge status-inactive">Inactiva</span>';
            const featured = activity.featured ? '⭐' : '-';
            
            html += `
                <tr>
                    <td>${activity.icon && activity.icon !== '?' ? activity.icon + ' ' : ''}${activity.name}</td>
                    <td>${activity.schedule || '-'}</td>
                    <td>${activity.location || '-'}</td>
                    <td>${activity.difficulty_level || 'all'}</td>
                    <td>${status}</td>
                    <td>${featured}</td>
                    <td>
                        <button class="btn-edit" onclick="editActivity(${activity.id})">Editar</button>
                        <button class="btn-delete" onclick="deleteActivity(${activity.id}, '${activity.name.replace(/'/g, "\\'")}' )">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        activitiesList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading activities:', error);
        activitiesList.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Error al cargar clases</p>';
    }
}

function openActivityModal(activityId = null) {
    // Populate teacher dropdown first
    populateTeacherDropdown();
    
    document.getElementById('activityModal').style.display = 'block';
    document.getElementById('activityModalTitle').textContent = activityId ? 'Editar Clase' : 'Nueva Clase';
    
    // Only reset form if creating new activity (not editing)
    if (!activityId) {
        document.getElementById('activityForm').reset();
        document.getElementById('activityId').value = '';
        document.getElementById('activityActive').checked = true;
    }
    
    document.getElementById('activityError').style.display = 'none';
    document.getElementById('activitySuccess').style.display = 'none';
}

function closeActivityModal() {
    document.getElementById('activityModal').style.display = 'none';
}

async function editActivity(activityId) {
    try {
        const response = await fetch(`${API_BASE}/activities/${activityId}`, {
            credentials: 'include'
        });
        const result = await response.json();
        const activity = result.data;
        
        if (!activity) {
            alert('Clase no encontrada');
            return;
        }
        
        // Set all form values BEFORE opening modal
        document.getElementById('activityId').value = activity.id;
        document.getElementById('activityName').value = activity.name;
        document.getElementById('activityShortDesc').value = activity.short_description || '';
        document.getElementById('activityDescription').value = activity.description || '';
        document.getElementById('activitySchedule').value = activity.schedule || '';
        document.getElementById('activityDuration').value = activity.duration || '';
        document.getElementById('activityLocation').value = activity.location || '';
        document.getElementById('activityTeacher').value = activity.teacher_id || activity.instructor_id || '';
        document.getElementById('activityPrice').value = activity.price || '';
        document.getElementById('activityIcon').value = activity.icon || '';
        document.getElementById('activityLevel').value = activity.difficulty_level || 'all';
        document.getElementById('activityActive').checked = activity.active;
        document.getElementById('activityFeatured').checked = activity.featured;
        
        // Open modal AFTER setting values
        openActivityModal(activityId);
    } catch (error) {
        console.error('Error loading activity:', error);
        alert('Error al cargar la clase');
    }
}

async function deleteActivity(activityId, name) {
    if (!confirm(`¿Estás seguro de eliminar la clase "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/activities/${activityId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Clase eliminada exitosamente');
            loadActivities();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Error al eliminar la clase');
    }
}

document.getElementById('activityForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const activityId = document.getElementById('activityId').value;
    const errorDiv = document.getElementById('activityError');
    const successDiv = document.getElementById('activitySuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const name = document.getElementById('activityName').value.trim();
    const shortDesc = document.getElementById('activityShortDesc').value.trim();
    const description = document.getElementById('activityDescription').value.trim();
    const schedule = document.getElementById('activitySchedule').value.trim();
    const location = document.getElementById('activityLocation').value.trim();
    
    const data = {
        name: name,
        short_description: shortDesc,
        description: description || shortDesc || name, // Use short_description or name if description is empty
        schedule: schedule,
        duration: parseInt(document.getElementById('activityDuration').value) || null,
        location: location,
        teacher_id: parseInt(document.getElementById('activityTeacher').value) || null,
        price: parseFloat(document.getElementById('activityPrice').value) || null,
        icon: document.getElementById('activityIcon').value.trim(),
        difficulty_level: document.getElementById('activityLevel').value,
        active: document.getElementById('activityActive').checked,
        featured: document.getElementById('activityFeatured').checked
    };
    
    if (!data.name || !data.schedule || !data.location) {
        errorDiv.textContent = 'Por favor completa los campos requeridos (Nombre, Horario y Ubicación)';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const url = activityId ? `${API_BASE}/activities/${activityId}` : `${API_BASE}/activities`;
        const method = activityId ? 'PUT' : 'POST';
        
       
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        
        if (result.success) {
            successDiv.textContent = activityId ? 'Clase actualizada exitosamente' : 'Clase creada exitosamente';
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                closeActivityModal();
                loadActivities();
            }, 1500);
        } else {
            errorDiv.textContent = result.message || 'Error al guardar la clase';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error saving activity:', error);
        errorDiv.textContent = 'Error de conexión al guardar la clase';
        errorDiv.style.display = 'block';
    }
});

// Close modals when clicking outside
window.onclick = function(event) {
    const blogModal = document.getElementById('blogModal');
    const activityModal = document.getElementById('activityModal');
    
    if (event.target === blogModal) {
        closeBlogModal();
    }
    if (event.target === activityModal) {
        closeActivityModal();
    }
};

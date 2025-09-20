// Manual scroll for activities grid
// Move manual scroll event listeners to main DOMContentLoaded block below
// Insert a floating aside with a customizable quote and author
function insertYogiQuote(phrase, author) {
    // Remove any existing quote aside
    var oldRight = document.querySelector('.right');
    if (oldRight) oldRight.remove();
    var right = document.createElement('div');
    right.className = 'right';
    right.innerHTML = `<blockquote>“${phrase}”</blockquote><cite>– ${author}</cite>`;
    // Insert after header (which is inserted by common.js)
    var header = document.querySelector('header');
    if (header && header.nextSibling) {
        header.parentNode.insertBefore(right, header.nextSibling);
    } else if (header) {
        header.parentNode.appendChild(right);
    } else {
        document.body.insertBefore(right, document.body.firstChild);
    }
}
// common.js
// Dynamically insert header and footer for all pages

document.addEventListener('DOMContentLoaded', function() {
        // Header
    const header = document.createElement('header');
    header.style.backgroundImage = "url('images/logo_aciky2.png')";
    header.innerHTML = `
        <a id="header-logo-link" href="index.html" title="Inicio">Inicio</a>
        <h1>ACIKY - Yoga para Todos</h1>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    // Promo slider logic (homepage only)
    if (document.getElementById('promo-slider')) {
        const slides = document.querySelectorAll('.promo-slide');
        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 3000);
    }

        // Manual scroll for activities grid (after all DOM insertions)
    var leftBtn = document.querySelector('.scroll-left');
    var rightBtn = document.querySelector('.scroll-right');
    var grid = document.querySelector('.activities-grid');
    var autoScrollInterval = null;
    var autoScrollPaused = false;
    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollPaused = false;
        autoScrollInterval = setInterval(autoScrollActivities, 16);
    }
    function pauseAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollPaused = true;
    }
    if (leftBtn && rightBtn && grid) {
        leftBtn.addEventListener('click', function(e) {
            e.preventDefault();
            pauseAutoScroll();
            grid.scrollBy({ left: -100, behavior: 'smooth' });
            setTimeout(startAutoScroll, 1200);
        });
        rightBtn.addEventListener('click', function(e) {
            e.preventDefault();
            pauseAutoScroll();
            grid.scrollBy({ left: 100, behavior: 'smooth' });
            setTimeout(startAutoScroll, 1200);
        });
    }
    // Attach universal drag logic using pointer events (Owl-like polish)
    if (grid) {
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let lastX = 0;
        let velocity = 0;
        let inertiaFrame;
        let dragStarted = false;
    const dragThreshold = 4; // easier to start drag
    const maxVelocity = 14; // even lower max velocity
    const friction = 0.88; // softer stop
    const minVelocity = 0.12; // minimum for inertia
        // Add grab cursor
        grid.style.cursor = 'grab';
        grid.addEventListener('pointerdown', function(e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isDragging = true;
            dragStarted = false;
            grid.setPointerCapture(e.pointerId);
            grid.classList.add('dragging');
            grid.style.cursor = 'grabbing';
            startX = e.clientX;
            lastX = startX;
            scrollLeft = grid.scrollLeft;
            velocity = 0;
            if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
            pauseAutoScroll();
            document.body.style.userSelect = 'none';
        });
        grid.addEventListener('pointermove', function(e) {
            if (!isDragging) return;
            const x = e.clientX;
            const moved = Math.abs(x - startX);
            if (!dragStarted && moved > dragThreshold) dragStarted = true;
            if (!dragStarted) return;
            const walk = (startX - x) / 2.2;
            grid.scrollLeft = scrollLeft + walk;
            velocity = Math.max(-maxVelocity, Math.min(maxVelocity, lastX - x));
            lastX = x;
        });
        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            dragStarted = false;
            grid.classList.remove('dragging');
            grid.style.cursor = 'grab';
            document.body.style.userSelect = '';
            function inertia() {
                if (Math.abs(velocity) > minVelocity) {
                    grid.scrollLeft += velocity;
                    velocity *= friction;
                    inertiaFrame = requestAnimationFrame(inertia);
                } else {
                    startAutoScroll();
                }
            }
            inertia();
        }
        grid.addEventListener('pointerup', endDrag);
        grid.addEventListener('pointercancel', endDrag);
        grid.addEventListener('pointerleave', function(e) {
            if (isDragging) endDrag(e);
        });
    }

    // Activities grid auto-scroll (homepage only)
    const activitiesGrid = document.querySelector('.activities-grid');
    if (activitiesGrid) {
        let scrollAmount = 0;
        let direction = 1;
        const maxScroll = activitiesGrid.scrollWidth - activitiesGrid.clientWidth;
        function autoScrollActivities() {
            if (!activitiesGrid || autoScrollPaused) return;
            // If at end, reverse direction
            if (activitiesGrid.scrollLeft >= maxScroll) direction = -1;
            if (activitiesGrid.scrollLeft <= 0) direction = 1;
            activitiesGrid.scrollLeft += direction * 1.2; // Adjust speed here
        }
        startAutoScroll();
    }
    // Nav below header, inside a scrollable div
    const navScroll = document.createElement('div');
    navScroll.className = 'nav-scroll';
    navScroll.innerHTML = `
        <nav>
            <ul>
                <li><a href="schedule.html">Clases</a></li>
                <li class="has-submenu">
                    <a>Galería</a>
                    <ul class="submenu">
                        <li><a href="gallery.html">Posturas</a></li>
                    </ul>
                </li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="testimonials.html">Testimonios</a></li>
                <li><a href="about.html">Sobre Nosotros</a></li>
            </ul>
        </nav>
    `;
    header.insertAdjacentElement('afterend', navScroll);

        // Mobile-first submenu toggle
    function setupMobileSubmenuToggle() {
        // Only enable on touch devices or small screens
        const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 900;
        if (!isMobile) return;
        document.querySelectorAll('.has-submenu > a').forEach(function(parentLink) {
            parentLink.addEventListener('click', function(e) {
                const parentLi = parentLink.closest('.has-submenu');
                if (parentLi) {
                    // Prevent navigation if submenu exists
                    if (parentLink.getAttribute('href') === '#' || parentLi.querySelector('.submenu')) {
                        e.preventDefault();
                    }
                    // Toggle .open class
                    parentLi.classList.toggle('open');
                    // Close other open submenus
                    document.querySelectorAll('.has-submenu.open').forEach(function(li) {
                        if (li !== parentLi) li.classList.remove('open');
                    });
                }
            });
        });
        // Close submenu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.has-submenu')) {
                document.querySelectorAll('.has-submenu.open').forEach(function(li) {
                    li.classList.remove('open');
                });
            }
        });
    }
    setupMobileSubmenuToggle();

    // Footer
    const footer = document.createElement('footer');
    footer.innerHTML = `<p>&copy; 2025 ACIKY</p>`;
    document.body.appendChild(footer);
});

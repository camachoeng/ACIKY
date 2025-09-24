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
        // Slower interval for card-by-card scrolling (every 3 seconds)
        autoScrollInterval = setInterval(autoScrollActivities, 3000);
    }
    function pauseAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollPaused = true;
    }
    if (leftBtn && rightBtn && grid) {
        leftBtn.addEventListener('click', function(e) {
            e.preventDefault();
            pauseAutoScroll();
            // Scroll by one card width
            const cardWidth = grid.querySelector('.activity-card')?.offsetWidth || 180;
            const gap = parseInt(getComputedStyle(grid).gap) || 32;
            grid.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
            setTimeout(startAutoScroll, 2000);
        });
        rightBtn.addEventListener('click', function(e) {
            e.preventDefault();
            pauseAutoScroll();
            // Scroll by one card width
            const cardWidth = grid.querySelector('.activity-card')?.offsetWidth || 180;
            const gap = parseInt(getComputedStyle(grid).gap) || 32;
            grid.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
            setTimeout(startAutoScroll, 2000);
        });
    }
    // Simple drag scrolling for activities grid
    if (grid) {
        let isDragging = false;
        let hasMouseMoved = false;
        let startX = 0;
        let scrollLeft = 0;
        
        // Mouse events for desktop drag
        grid.addEventListener('mousedown', function(e) {
            // Only start drag on empty space, not on links
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return; // Let links work normally
            }
            
            isDragging = true;
            hasMouseMoved = false;
            startX = e.pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            grid.style.cursor = 'grabbing';
            
            // Pause auto-scroll during manual interaction
            pauseAutoScroll();
            
            e.preventDefault(); // Only prevent on drag start, not on links
        });
        
        grid.addEventListener('mouseleave', function() {
            isDragging = false;
            hasMouseMoved = false;
            grid.style.cursor = 'grab';
            // Resume auto-scroll after a delay
            setTimeout(() => startAutoScroll(), 2000);
        });
        
        grid.addEventListener('mouseup', function() {
            isDragging = false;
            hasMouseMoved = false;
            grid.style.cursor = 'grab';
            // Resume auto-scroll after a delay
            setTimeout(() => startAutoScroll(), 2000);
        });
        
        grid.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            hasMouseMoved = true;
            const x = e.pageX - grid.offsetLeft;
            const distance = x - startX;
            grid.scrollLeft = scrollLeft - distance;
            
            e.preventDefault();
        });
        
        // Set initial cursor
        grid.style.cursor = 'grab';
    }

    // Updated auto-scroll for card-by-card scrolling (homepage only)
    const activitiesGrid = document.querySelector('.activities-grid');
    if (activitiesGrid) {
        let currentCardIndex = 0;
        let direction = 1;
        
        function getCardWidth() {
            const card = activitiesGrid.querySelector('.activity-card');
            if (!card) return 180; // fallback width
            const cardStyle = getComputedStyle(card);
            const cardWidth = card.offsetWidth;
            const cardMargin = parseInt(cardStyle.marginRight) || 0;
            const gap = parseInt(getComputedStyle(activitiesGrid).gap) || 32; // 2em default
            return cardWidth + gap;
        }
        
        function getTotalCards() {
            return activitiesGrid.querySelectorAll('.activity-card').length;
        }
        
        function autoScrollActivities() {
            if (!activitiesGrid || autoScrollPaused) return;
            
            const cardWidth = getCardWidth();
            const totalCards = getTotalCards();
            const maxIndex = totalCards - 1;
            
            // Move to next/previous card
            currentCardIndex += direction;
            
            // Reverse direction at ends
            if (currentCardIndex >= maxIndex) {
                direction = -1;
                currentCardIndex = maxIndex;
            }
            if (currentCardIndex <= 0) {
                direction = 1;
                currentCardIndex = 0;
            }
            
            // Smooth scroll to the target card
            const targetScrollLeft = currentCardIndex * cardWidth;
            activitiesGrid.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
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

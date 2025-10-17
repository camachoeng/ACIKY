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
    header.innerHTML = `
        <a id="header-logo-link" href="index.html" title="Inicio">Inicio</a>
        <h1>ACIKY - Yoga para Todos</h1>
    `;
    document.body.insertBefore(header, document.body.firstChild);

        // Manual scroll for activities grid (after all DOM insertions)
    var leftBtn = document.querySelector('.scroll-left');
    var rightBtn = document.querySelector('.scroll-right');
    var grid = document.querySelector('.activities-grid');
    var autoScrollInterval = null;
    var autoScrollPaused = false;
    var isAutoScrolling = false; // Shared flag for auto-scroll detection
    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollPaused = false;
        // Faster auto-scroll for better UX (3 seconds)
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
            
            // Use requestAnimationFrame to avoid forced reflow
            requestAnimationFrame(() => {
                const cardWidth = grid.querySelector('.activity-card')?.offsetWidth || 180;
                const gap = parseInt(getComputedStyle(grid).gap) || 32;
                grid.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
            });
            
            // Shorter pause after manual interaction (6 seconds)
            setTimeout(startAutoScroll, 6000);
        });
        
        rightBtn.addEventListener('click', function(e) {
            e.preventDefault();
            pauseAutoScroll();
            
            // Use requestAnimationFrame to avoid forced reflow
            requestAnimationFrame(() => {
                const cardWidth = grid.querySelector('.activity-card')?.offsetWidth || 180;
                const gap = parseInt(getComputedStyle(grid).gap) || 32;
                grid.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
            });
            
            // Shorter pause after manual interaction (6 seconds)
            setTimeout(startAutoScroll, 6000);
        });
    }
    // Simple drag scrolling for activities grid
    if (grid) {
        let isDragging = false;
        let hasMouseMoved = false;
        let startX = 0;
        let scrollLeft = 0;
        let preventClick = false;
        let userScrollTimeout = null;
        
        // Check if this is a touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Pause auto-scroll when user manually scrolls (but not during auto-scroll)
        grid.addEventListener('scroll', function() {
            // Only pause if this is a user-initiated scroll, not auto-scroll
            if (!isAutoScrolling) {
                pauseAutoScroll();
                
                // Clear previous timeout
                if (userScrollTimeout) clearTimeout(userScrollTimeout);
                
                // Resume auto-scroll after user stops scrolling (5 seconds)
                userScrollTimeout = setTimeout(() => {
                    startAutoScroll();
                }, 5000);
            }
        }, { passive: true });
        
        // Add mouse drag functionality for desktop (always enabled)
        // Mouse events for desktop drag
        grid.addEventListener('mousedown', function(e) {
            // Only start drag on empty space, not on links
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return; // Let links work normally
            }
            
            isDragging = true;
            hasMouseMoved = false;
            preventClick = false;
            startX = e.pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            grid.style.cursor = 'grabbing';
            
            // Pause auto-scroll during manual interaction
            pauseAutoScroll();
            
            e.preventDefault();
        });
        
            grid.addEventListener('mouseleave', function() {
                isDragging = false;
                hasMouseMoved = false;
                preventClick = false;
                grid.style.cursor = 'grab';
                // Resume auto-scroll after shorter delay (6 seconds)
                setTimeout(() => startAutoScroll(), 6000);
            });
            
            grid.addEventListener('mouseup', function() {
                isDragging = false;
                grid.style.cursor = 'grab';
                // Resume auto-scroll after shorter delay (6 seconds)
                setTimeout(() => startAutoScroll(), 6000);            // Reset prevent flag after a short delay
            setTimeout(() => {
                hasMouseMoved = false;
                preventClick = false;
            }, 10);
        });
        
        grid.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            hasMouseMoved = true;
            preventClick = true;
            const x = e.pageX - grid.offsetLeft;
            const distance = x - startX;
            grid.scrollLeft = scrollLeft - distance;
            
            e.preventDefault();
        });
        
        // Prevent clicks after dragging
        grid.addEventListener('click', function(e) {
            if (preventClick) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
        
        // Set initial cursor
        grid.style.cursor = 'grab';
    }

    // Updated auto-scroll for card-by-card scrolling (homepage only)
    const activitiesGrid = document.querySelector('.activities-grid');
    if (activitiesGrid) {
        let currentCardIndex = 0;
        let direction = 1;
        let cachedCardWidth = null;
        let lastWindowWidth = window.innerWidth;
        
        // Initialize to show first card properly on load
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                activitiesGrid.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Desktop: scroll slightly to show first card better
                activitiesGrid.scrollTo({ left: 20, behavior: 'smooth' });
            }
        }, 500);
        
        function getCardWidth() {
            // Cache card width and only recalculate on window resize
            if (cachedCardWidth === null || window.innerWidth !== lastWindowWidth) {
                const card = activitiesGrid.querySelector('.activity-card');
                if (!card) return 180; // fallback width
                
                // For mobile, use just the card width for precise card-by-card scrolling
                if (window.innerWidth <= 768) {
                    cachedCardWidth = card.offsetWidth;
                } else {
                    // For desktop, include gap for proper spacing
                    const gap = parseInt(getComputedStyle(activitiesGrid).gap) || 32;
                    cachedCardWidth = card.offsetWidth + gap;
                }
                
                lastWindowWidth = window.innerWidth;
            }
            return cachedCardWidth;
        }
        
        function getTotalCards() {
            return activitiesGrid.querySelectorAll('.activity-card').length;
        }
        
        function autoScrollActivities() {
            if (!activitiesGrid || autoScrollPaused) return;
            
            // Set flag to indicate this is auto-scrolling
            isAutoScrolling = true;
            
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                const cardWidth = getCardWidth();
                const totalCards = getTotalCards();
                const maxIndex = totalCards - 1;
                
                // Move to next/previous card
                currentCardIndex += direction;
                
                // Reverse direction at ends with shorter pause
                if (currentCardIndex >= maxIndex) {
                    direction = -1;
                    currentCardIndex = maxIndex;
                } else if (currentCardIndex <= 0) {
                    direction = 1;
                    currentCardIndex = 0;
                }
                
                // Calculate target scroll position
                let targetScrollLeft;
                if (window.innerWidth <= 768) {
                    // Mobile: precise card positioning
                    targetScrollLeft = currentCardIndex * cardWidth;
                } else {
                    // Desktop: account for proper spacing and container positioning
                    const containerPadding = 20; // Account for container padding
                    targetScrollLeft = (currentCardIndex * cardWidth) + containerPadding;
                }
                
                // Smooth scroll to the target card
                activitiesGrid.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth'
                });
                
                // Reset flag after scrolling
                setTimeout(() => {
                    isAutoScrolling = false;
                }, 800);
            });
        }
        
        startAutoScroll();
        
        // Invalidate cached dimensions on window resize
        window.addEventListener('resize', () => {
            cachedCardWidth = null;
        });
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

    // Enhanced touch support for activity cards
    function setupActivityTouchSupport() {
        const activityCards = document.querySelectorAll('.activity-card');
        
        // Check if device supports touch
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            activityCards.forEach(card => {
                let touchStartTime = 0;
                let touchStartY = 0;
                let touchStartX = 0;
                
                card.addEventListener('touchstart', function(e) {
                    touchStartTime = Date.now();
                    const touch = e.touches[0];
                    touchStartY = touch.clientY;
                    touchStartX = touch.clientX;
                }, { passive: true });
                
                card.addEventListener('touchend', function(e) {
                    const touchDuration = Date.now() - touchStartTime;
                    
                    // Only handle short taps, not scrolls
                    if (touchDuration < 300 && e.cancelable) {
                        const touch = e.changedTouches[0];
                        const deltaY = Math.abs(touch.clientY - touchStartY);
                        const deltaX = Math.abs(touch.clientX - touchStartX);
                        
                        // If movement was minimal (not a scroll), it's a tap
                        if (deltaY < 10 && deltaX < 10) {
                            e.preventDefault();
                            card.classList.toggle('touched');
                            
                            // Remove touched class from other cards
                            activityCards.forEach(otherCard => {
                                if (otherCard !== card) {
                                    otherCard.classList.remove('touched');
                                }
                            });
                            
                            // Navigate to link after a short delay
                            setTimeout(() => {
                                const link = card.querySelector('a');
                                if (link && link.href) {
                                    window.location.href = link.href;
                                }
                            }, 150);
                        }
                    }
                }, { passive: false });
                
                // Remove touched class when scrolling starts
                card.addEventListener('touchmove', function(e) {
                    const touch = e.touches[0];
                    const deltaY = Math.abs(touch.clientY - touchStartY);
                    const deltaX = Math.abs(touch.clientX - touchStartX);
                    
                    // If significant movement, remove touched state
                    if (deltaY > 10 || deltaX > 10) {
                        card.classList.remove('touched');
                    }
                }, { passive: true });
            });
            
            // Remove all touched classes when tapping outside
            document.addEventListener('touchend', function(e) {
                if (!e.target.closest('.activity-card') && e.cancelable) {
                    activityCards.forEach(card => {
                        card.classList.remove('touched');
                    });
                }
            }, { passive: false });
        }
    }
    
    // Initialize touch support after DOM is fully loaded
    setupActivityTouchSupport();

    // Gallery Slider Auto-slide (gallery page only)
    function initializeGallerySliders() {
        const sliders = document.querySelectorAll('.gallery-slider');
        
        sliders.forEach(slider => {
            const images = slider.querySelectorAll('.slider-img');
            let currentSlide = 0;
            let slideInterval;
            
            if (images.length <= 1) return; // Skip if only one image
            
            // Initialize first image as active
            images[0].classList.add('active');
            
            // Auto-slide function
            function nextSlide() {
                images[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % images.length;
                images[currentSlide].classList.add('active');
            }
            
            // Start auto-sliding every 3 seconds
            slideInterval = setInterval(nextSlide, 3000);
            
            // Pause on hover, resume on mouse leave
            slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
            slider.addEventListener('mouseleave', () => {
                slideInterval = setInterval(nextSlide, 3000);
            });
        });
    }
    
    // Initialize gallery sliders
    initializeGallerySliders();

    // Footer
    const footer = document.createElement('footer');
    footer.innerHTML = `<p>&copy; 2025 ACIKY</p>`;
    document.body.appendChild(footer);
});

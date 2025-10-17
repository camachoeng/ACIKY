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
    // Use requestAnimationFrame to defer heavy DOM operations
    requestAnimationFrame(() => {
        // Header
        const header = document.createElement('header');
        // Detect the correct path to index.html based on current location
        const currentPath = window.location.pathname;
        let homeLink = 'index.html';
        let imagePath = 'images/';
        
        // Count directory depth by counting slashes and removing the filename
        const pathParts = currentPath.split('/').filter(part => part !== '');
        // Remove the filename (last part) if it ends with .html
        const dirDepth = pathParts.length - (pathParts[pathParts.length - 1]?.includes('.html') ? 1 : 0);
        
        if (dirDepth > 0) {
            const prefix = '../'.repeat(dirDepth);
            homeLink = prefix;
            imagePath = prefix + 'images/';
        }
        
        header.innerHTML = `
            <a id="header-logo-link" href="${homeLink}" title="Inicio">ACIKY</a>
            <h1>ACIKY - Yoga para Todos</h1>
        `;
        
        // Use document fragment to minimize reflows
        const fragment = document.createDocumentFragment();
        fragment.appendChild(header);

        // Cache DOM elements and dimensions to reduce repeated queries
        const leftBtn = document.querySelector('.scroll-left');
        const rightBtn = document.querySelector('.scroll-right');
        const grid = document.querySelector('.activities-grid');
        let cachedCardDimensions = null;
        let autoScrollInterval = null;
        let autoScrollPaused = false;
        let isAutoScrolling = false;
        let autoScrollActivitiesFunc = null; // Will be set later when function is defined
        
        // Cache card dimensions to avoid repeated measurements
        function getCachedCardDimensions() {
            if (!cachedCardDimensions) {
                const card = grid?.querySelector('.activity-card');
                if (card) {
                    cachedCardDimensions = {
                        width: card.offsetWidth,
                        gap: parseInt(getComputedStyle(grid).gap) || 32
                    };
                } else {
                    cachedCardDimensions = { width: 180, gap: 32 };
                }
            }
            return cachedCardDimensions;
        }
        
        function startAutoScroll() {
            if (autoScrollInterval) clearInterval(autoScrollInterval);
            autoScrollPaused = false;
            if (autoScrollActivitiesFunc) {
                autoScrollInterval = setInterval(autoScrollActivitiesFunc, 3000);
            }
        }
        
        function pauseAutoScroll() {
            if (autoScrollInterval) clearInterval(autoScrollInterval);
            autoScrollPaused = true;
        }
        
        if (leftBtn && rightBtn && grid) {
            leftBtn.addEventListener('click', function(e) {
                e.preventDefault();
                pauseAutoScroll();
                
                const dimensions = getCachedCardDimensions();
                grid.scrollBy({ 
                    left: -(dimensions.width + dimensions.gap), 
                    behavior: 'smooth' 
                });
                
                setTimeout(startAutoScroll, 6000);
            });
            
            rightBtn.addEventListener('click', function(e) {
                e.preventDefault();
                pauseAutoScroll();
                
                const dimensions = getCachedCardDimensions();
                grid.scrollBy({ 
                    left: dimensions.width + dimensions.gap, 
                    behavior: 'smooth' 
                });
                
                setTimeout(startAutoScroll, 6000);
            });
            
            // Invalidate cache on resize
            window.addEventListener('resize', () => {
                cachedCardDimensions = null;
            }, { passive: true });
        }
        // Optimize drag scrolling for activities grid
        if (grid) {
            let isDragging = false;
            let hasMouseMoved = false;
            let startX = 0;
            let scrollLeft = 0;
            let preventClick = false;
            let userScrollTimeout = null;
            
            // Throttle scroll events to improve performance
            let scrollTimeout = null;
            grid.addEventListener('scroll', function() {
                if (scrollTimeout) return; // Throttle scroll events
                
                scrollTimeout = setTimeout(() => {
                    if (!isAutoScrolling) {
                        pauseAutoScroll();
                        clearTimeout(userScrollTimeout);
                        userScrollTimeout = setTimeout(() => {
                            startAutoScroll();
                        }, 5000);
                    }
                    scrollTimeout = null;
                }, 50);
            }, { passive: true });
        
            // Optimize mouse drag functionality
            let dragStartData = { x: 0, scrollLeft: 0 };
            
            grid.addEventListener('mousedown', function(e) {
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    return;
                }
                
                isDragging = true;
                hasMouseMoved = false;
                preventClick = false;
                
                // Cache values to avoid repeated calculations
                dragStartData.x = e.pageX - grid.offsetLeft;
                dragStartData.scrollLeft = grid.scrollLeft;
                
                grid.style.cursor = 'grabbing';
                pauseAutoScroll();
                e.preventDefault();
            }, { passive: false });
            
            grid.addEventListener('mouseleave', function() {
                isDragging = false;
                hasMouseMoved = false;
                preventClick = false;
                grid.style.cursor = 'grab';
                setTimeout(() => startAutoScroll(), 6000);
            }, { passive: true });
            
            grid.addEventListener('mouseup', function() {
                isDragging = false;
                grid.style.cursor = 'grab';
                setTimeout(() => startAutoScroll(), 6000);
                
                // Use requestAnimationFrame for cleanup
                requestAnimationFrame(() => {
                    hasMouseMoved = false;
                    preventClick = false;
                });
            }, { passive: true });
            
            // Use passive event for better performance
            grid.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                
                hasMouseMoved = true;
                preventClick = true;
                
                // Use cached values
                const x = e.pageX - grid.offsetLeft;
                const distance = x - dragStartData.x;
                grid.scrollLeft = dragStartData.scrollLeft - distance;
            }, { passive: true });
            
            grid.addEventListener('click', function(e) {
                if (preventClick) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, { capture: true, passive: false });
            
            grid.style.cursor = 'grab';
        }

        // Defer auto-scroll initialization to avoid blocking main thread
        requestAnimationFrame(() => {
            const activitiesGrid = document.querySelector('.activities-grid');
            if (activitiesGrid) {
                let currentCardIndex = 0;
                let direction = 1;
                let cachedScrollData = {
                    cardWidth: null,
                    totalCards: null,
                    lastWindowWidth: window.innerWidth
                };
                
                // Initialize to show first card properly on load
                setTimeout(() => {
                    if (window.innerWidth <= 768) {
                        activitiesGrid.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        activitiesGrid.scrollTo({ left: 20, behavior: 'smooth' });
                    }
                }, 500);
                
                function updateCachedScrollData() {
                    const card = activitiesGrid.querySelector('.activity-card');
                    if (!card) {
                        cachedScrollData = { cardWidth: 180, totalCards: 0, lastWindowWidth: window.innerWidth };
                        return;
                    }
                    
                    if (window.innerWidth <= 768) {
                        cachedScrollData.cardWidth = card.offsetWidth;
                    } else {
                        const gap = parseInt(getComputedStyle(activitiesGrid).gap) || 32;
                        cachedScrollData.cardWidth = card.offsetWidth + gap;
                    }
                    
                    cachedScrollData.totalCards = activitiesGrid.querySelectorAll('.activity-card').length;
                    cachedScrollData.lastWindowWidth = window.innerWidth;
                }
                
                autoScrollActivitiesFunc = function autoScrollActivities() {
                    if (!activitiesGrid || autoScrollPaused) return;
                    
                    // Update cache if needed
                    if (cachedScrollData.cardWidth === null || window.innerWidth !== cachedScrollData.lastWindowWidth) {
                        updateCachedScrollData();
                    }
                    
                    isAutoScrolling = true;
                    
                    const { cardWidth, totalCards } = cachedScrollData;
                    const maxIndex = totalCards - 1;
                    
                    currentCardIndex += direction;
                    
                    if (currentCardIndex >= maxIndex) {
                        direction = -1;
                        currentCardIndex = maxIndex;
                    } else if (currentCardIndex <= 0) {
                        direction = 1;
                        currentCardIndex = 0;
                    }
                    
                    let targetScrollLeft;
                    if (window.innerWidth <= 768) {
                        targetScrollLeft = currentCardIndex * cardWidth;
                    } else {
                        targetScrollLeft = (currentCardIndex * cardWidth) + 20;
                    }
                    
                    activitiesGrid.scrollTo({
                        left: targetScrollLeft,
                        behavior: 'smooth'
                    });
                    
                    setTimeout(() => {
                        isAutoScrolling = false;
                    }, 800);
                }
                
                startAutoScroll();
                
                // Throttled resize handler
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        cachedScrollData.cardWidth = null;
                    }, 150);
                }, { passive: true });
            }
        });
        // Nav below header, inside a scrollable div
        const navScroll = document.createElement('div');
        navScroll.className = 'nav-scroll';
        
        // Determine the correct path prefix based on current location
        let pagePrefix = 'pages/';
        if (dirDepth === 1) {
            pagePrefix = '';  // We're in pages directory
        } else if (dirDepth === 2) {
            pagePrefix = '../';  // We're in pages/subdirectory (like pages/cards/)
        }
        
        navScroll.innerHTML = `
            <nav>
                <ul>
                    <li><a href="${pagePrefix}schedule.html">Clases</a></li>
                    <li class="has-submenu">
                        <a>Galería</a>
                        <ul class="submenu">
                            <li><a href="${pagePrefix}gallery.html">Posturas</a></li>
                        </ul>
                    </li>
                    <li><a href="${pagePrefix}blog.html">Blog</a></li>
                    <li><a href="${pagePrefix}testimonials.html">Testimonios</a></li>
                    <li><a href="${pagePrefix}about.html">Sobre Nosotros</a></li>
                </ul>
            </nav>
        `;
        
        // Add navigation to fragment
        fragment.appendChild(navScroll);
        
        // Insert all elements at once to minimize reflows
        document.body.insertBefore(fragment, document.body.firstChild);

        // Defer menu setup to avoid blocking
        setTimeout(() => {
            function setupMobileSubmenuToggle() {
                const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 900;
                if (!isMobile) return;
                
                const submenuLinks = document.querySelectorAll('.has-submenu > a');
                submenuLinks.forEach(function(parentLink) {
                    parentLink.addEventListener('click', function(e) {
                        const parentLi = parentLink.closest('.has-submenu');
                        if (parentLi) {
                            if (parentLink.getAttribute('href') === '#' || parentLi.querySelector('.submenu')) {
                                e.preventDefault();
                            }
                            parentLi.classList.toggle('open');
                            
                            // Close other open submenus efficiently
                            const openMenus = document.querySelectorAll('.has-submenu.open');
                            for (let li of openMenus) {
                                if (li !== parentLi) li.classList.remove('open');
                            }
                        }
                    });
                });
                
                // Close submenu when clicking outside
                document.addEventListener('click', function(e) {
                    if (!e.target.closest('.has-submenu')) {
                        const openMenus = document.querySelectorAll('.has-submenu.open');
                        for (let li of openMenus) {
                            li.classList.remove('open');
                        }
                    }
                }, { passive: true });
            }
            setupMobileSubmenuToggle();
        }, 100);

        // Defer touch support setup to avoid blocking
        setTimeout(() => {
            const activityCards = document.querySelectorAll('.activity-card');
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            if (isTouchDevice && activityCards.length > 0) {
                const touchData = new Map(); // Use Map for better performance
                
                activityCards.forEach(card => {
                    card.addEventListener('touchstart', function(e) {
                        const touch = e.touches[0];
                        touchData.set(card, {
                            startTime: Date.now(),
                            startY: touch.clientY,
                            startX: touch.clientX
                        });
                    }, { passive: true });
                    
                    card.addEventListener('touchend', function(e) {
                        const data = touchData.get(card);
                        if (!data) return;
                        
                        const touchDuration = Date.now() - data.startTime;
                        
                        if (touchDuration < 300 && e.cancelable) {
                            const touch = e.changedTouches[0];
                            const deltaY = Math.abs(touch.clientY - data.startY);
                            const deltaX = Math.abs(touch.clientX - data.startX);
                            
                            if (deltaY < 10 && deltaX < 10) {
                                e.preventDefault();
                                card.classList.toggle('touched');
                                
                                // Efficiently remove touched class from other cards
                                for (let otherCard of activityCards) {
                                    if (otherCard !== card) {
                                        otherCard.classList.remove('touched');
                                    }
                                }
                                
                                setTimeout(() => {
                                    const link = card.querySelector('a');
                                    if (link?.href) {
                                        window.location.href = link.href;
                                    }
                                }, 150);
                            }
                        }
                        touchData.delete(card);
                    }, { passive: false });
                    
                    card.addEventListener('touchmove', function(e) {
                        const data = touchData.get(card);
                        if (!data) return;
                        
                        const touch = e.touches[0];
                        const deltaY = Math.abs(touch.clientY - data.startY);
                        const deltaX = Math.abs(touch.clientX - data.startX);
                        
                        if (deltaY > 10 || deltaX > 10) {
                            card.classList.remove('touched');
                        }
                    }, { passive: true });
                });
                
                document.addEventListener('touchend', function(e) {
                    if (!e.target.closest('.activity-card') && e.cancelable) {
                        for (let card of activityCards) {
                            card.classList.remove('touched');
                        }
                    }
                }, { passive: false });
            }
        }, 150);

        // Defer gallery slider initialization
        setTimeout(() => {
            const sliders = document.querySelectorAll('.gallery-slider');
            
            if (sliders.length > 0) {
                sliders.forEach(slider => {
                    const images = slider.querySelectorAll('.slider-img');
                    if (images.length <= 1) return;
                    
                    let currentSlide = 0;
                    let slideInterval;
                    
                    images[0].classList.add('active');
                    
                    function nextSlide() {
                        images[currentSlide].classList.remove('active');
                        currentSlide = (currentSlide + 1) % images.length;
                        images[currentSlide].classList.add('active');
                    }
                    
                    slideInterval = setInterval(nextSlide, 3000);
                    
                    slider.addEventListener('mouseenter', () => {
                        clearInterval(slideInterval);
                    }, { passive: true });
                    
                    slider.addEventListener('mouseleave', () => {
                        slideInterval = setInterval(nextSlide, 3000);
                    }, { passive: true });
                });
            }
        }, 300);

        // Footer - defer to end
        setTimeout(() => {
            const footer = document.createElement('footer');
            footer.innerHTML = `<p>&copy; 2025 ACIKY</p>`;
            document.body.appendChild(footer);
        }, 200);
        
    }); // End requestAnimationFrame
});

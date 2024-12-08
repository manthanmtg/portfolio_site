// Initialize mobile menu functionality
const initMobileMenu = () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && !navLinks.contains(e.target)) {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        // Close mobile menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
};

// Load header component and initialize mobile menu
const loadHeader = () => {
    const headerComponent = document.getElementById('header-component');
    if (headerComponent) {
        // Get the correct path based on current page location
        const headerPath = window.location.pathname.includes('/pages/') 
            ? '../components/header.html' 
            : '/components/header.html';
            
        fetch(headerPath)
            .then(response => response.text())
            .then(html => {
                headerComponent.innerHTML = html;
                initMobileMenu();
            })
            .catch(() => {
                // Retry with alternative path if first attempt fails
                const altPath = window.location.pathname.includes('/pages/') 
                    ? '/components/header.html' 
                    : '../components/header.html';
                return fetch(altPath)
                    .then(response => response.text())
                    .then(html => {
                        headerComponent.innerHTML = html;
                        initMobileMenu();
                    });
            });
    }
};

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', loadHeader);

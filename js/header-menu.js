// Initialize mobile menu functionality
function initMobileMenu() {
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
}

// Initialize header with data from data.json
async function initHeader() {
    try {
        // Determine if we're in a subdirectory
        const isSubdirectory = window.location.pathname.includes('/pages/');
        const dataPath = isSubdirectory ? '../data.json' : './data.json';
        
        const response = await fetch(dataPath);
        const data = await response.json();

        // Set logo
        const logo = document.querySelector('.nav-logo');
        if (logo) {
            logo.textContent = data.navigation.logo;
        }

        // Set navigation links
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.innerHTML = data.navigation.links
                .map(link => {
                    // Adjust href for subdirectory pages
                    let href = link.href;
                    if (isSubdirectory && !href.startsWith('#')) {
                        href = '../' + href;
                    } else if (isSubdirectory && href.startsWith('#')) {
                        href = '../' + href;
                    }
                    return `<li><a href="${href}" data-nav-link>${link.text}</a></li>`;
                })
                .join('');
        }

        // Initialize mobile menu
        initMobileMenu();

        // Update active state for current page
        updateActiveNavLink();
    } catch (error) {
        console.error('Error initializing header:', error);
    }
}

// Update active navigation link based on current page
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('[data-nav-link]');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href')?.replace('/', '') || '';
        const currentPathClean = currentPath.replace('/', '');
        
        if (currentPathClean === '') {
            // Home page
            if (href === '/' || href === '') {
                link.classList.add('active');
            }
        } else if (currentPathClean === href || currentPathClean.startsWith(href.split('#')[0])) {
            link.classList.add('active');
        }
    });
}

// Initialize header when component is loaded
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.path.includes('header.html')) {
        initHeader();
    }
});

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

// Initialize mobile menu when component is loaded
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.path.includes('header.html')) {
        initMobileMenu();
    }
});

// Load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        console.log(`Loading component: ${componentPath} into ${elementId}`);
        const response = await fetch(componentPath);
        const html = await response.text();
        console.log(`Component HTML loaded:`, html);
        
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id ${elementId} not found`);
            return;
        }
        
        element.innerHTML = html;
        console.log(`Component HTML inserted into ${elementId}`);
        
        // Dispatch event when component is loaded
        document.dispatchEvent(new CustomEvent('componentLoaded', {
            detail: {
                id: elementId,
                path: componentPath
            }
        }));
        console.log(`Dispatched componentLoaded event for ${elementId}`);
        
        // Update active navigation link
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
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}
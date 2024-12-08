document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./data.json');
        const data = await response.json();
        
        // Function to update footer content
        const updateFooter = () => {
            console.log('Updating footer...');
            const footer = document.querySelector('.footer');
            if (!footer) {
                console.log('Footer element not found');
                return;
            }

            // Update contact section
            const sectionTitle = footer.querySelector('.section-title');
            console.log('Section title element:', sectionTitle);
            if (sectionTitle) {
                sectionTitle.textContent = data.contact.title;
                console.log('Updated section title to:', data.contact.title);
            }

            const contactGrid = footer.querySelector('.contact-grid');
            console.log('Contact grid element:', contactGrid);
            if (contactGrid) {
                contactGrid.innerHTML = data.contact.items
                    .map(item => createContactCard(item))
                    .join('');
                console.log('Updated contact grid with items:', data.contact.items);
            }

            // Update copyright and social links
            const copyright = footer.querySelector('.copyright');
            const socialLinks = footer.querySelector('.social-links');
            
            if (copyright) {
                copyright.textContent = data.footer.copyright;
                console.log('Updated copyright');
            }
            
            if (socialLinks) {
                socialLinks.innerHTML = data.footer.socialLinks
                    .map(link => `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.label}">
                            <i class="${link.icon}"></i>
                        </a>
                    `).join('');
                console.log('Updated social links');
            }
        };

        function createContactCard(item) {
            const hasLink = item.link !== undefined;
            const cardElement = hasLink ? 'a' : 'div';
            const card = document.createElement(cardElement);
            
            card.className = 'contact-card';
            if (hasLink) {
                card.href = item.link;
                card.target = '_blank';
            }
            
            card.innerHTML = `
                <div class="contact-icon">
                    <i class="${item.icon}"></i>
                </div>
                <div class="contact-info">
                    <h3>${item.label}</h3>
                    <p>${item.value}</p>
                </div>
            `;
            
            return card.outerHTML;
        }

        // Function to update main content
        const updateMainContent = () => {
            // Update meta information
            document.title = data.meta.title;

            // Update hero section
            const heroH1 = document.querySelector('.hero-text-wrapper h1');
            const heroH2 = document.querySelector('.hero-text-wrapper h2');
            const tagline = document.querySelector('.tagline');
            const quote = document.querySelector('.personal-quote');
            const heroSocialLinks = document.querySelector('.hero .social-links');
            const scrollText = document.querySelector('.scroll-text');

            if (heroH1) heroH1.textContent = data.hero.name;
            if (heroH2) heroH2.innerHTML = `${data.hero.title} <span class="company">${data.hero.company}</span>`;
            if (tagline) tagline.textContent = data.hero.tagline;
            if (quote) quote.textContent = data.hero.quote;
            if (scrollText) scrollText.textContent = data.ui.scrollText;

            if (heroSocialLinks) {
                heroSocialLinks.innerHTML = data.hero.socialLinks
                    .map(link => `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link">
                            <i class="${link.icon}"></i>
                        </a>
                    `).join('');
            }

            // Update about section
            const aboutTitle = document.querySelector('#about .section-title');
            const aboutSubtitle = document.querySelector('.about-text h3');
            const aboutDesc = document.querySelector('.about-text > p');
            const highlights = document.querySelector('.highlights');
            const skillCategories = document.querySelector('.skill-categories');

            if (aboutTitle) aboutTitle.textContent = data.about.title;
            if (aboutSubtitle) aboutSubtitle.textContent = data.about.subtitle;
            if (aboutDesc) aboutDesc.textContent = data.about.description;

            if (highlights) {
                highlights.innerHTML = data.about.highlights
                    .map(highlight => `
                        <div class="highlight-item">
                            <i class="${highlight.icon}"></i>
                            <h4>${highlight.title}</h4>
                            <p>${highlight.description}</p>
                        </div>
                    `).join('');
            }

            if (skillCategories) {
                skillCategories.innerHTML = Object.entries(data.about.skills)
                    .map(([category, skills]) => `
                        <div class="skill-category">
                            <h3>${category}</h3>
                            <div class="skills">
                                ${skills.map(skill => `
                                    <div class="skill">
                                        <i class="${skill.icon}"></i>
                                        <span>${skill.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('');
            }

            // Update experience section
            const experienceTitle = document.querySelector('#experience .section-title');
            const timeline = document.querySelector('.timeline');

            if (experienceTitle) experienceTitle.textContent = data.experience.title;

            if (timeline) {
                timeline.innerHTML = data.experience.jobs
                    .map(job => `
                        <div class="timeline-item">
                            <div class="timeline-content">
                                <h3>${job.title}</h3>
                                <p class="company">${job.company}</p>
                                <p class="duration">${job.period}</p>
                                <ul class="responsibilities">
                                    ${job.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('');
            }

            // Update projects section
            const projectsTitle = document.querySelector('#projects .section-title');
            const projectsGrid = document.querySelector('.projects-grid');

            if (projectsTitle) projectsTitle.textContent = data.projects.title;

            if (projectsGrid) {
                projectsGrid.innerHTML = data.projects.items
                    .map(project => `
                        <div class="project-card">
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                            <div class="tech-stack">
                                ${project.techStack.map(tech => `<span>${tech}</span>`).join('')}
                            </div>
                            <a href="${project.link}" class="project-link">View Project</a>
                        </div>
                    `).join('');
            }

            // Update research section
            const researchTitle = document.querySelector('#research .section-title');
            const researchGrid = document.querySelector('.research-grid');

            if (researchTitle) researchTitle.textContent = data.research.title;

            if (researchGrid) {
                researchGrid.innerHTML = data.research.papers
                    .map(paper => `
                        <div class="research-card">
                            <h3>${paper.title}</h3>
                            <p>${paper.publication}</p>
                            <a href="${paper.link}" class="paper-link">Read Paper</a>
                        </div>
                    `).join('');
            }

            // Update contact section
            const contactTitle = document.querySelector('.contact-section .section-title');
            const contactGrid = document.querySelector('.contact-grid');

            if (contactTitle) contactTitle.textContent = data.contact.title;

            if (contactGrid) {
                contactGrid.innerHTML = data.contact.items
                    .map(item => createContactCard(item))
                    .join('');
            }
        };

        // Initial update of main content
        updateMainContent();

        // Update content when components are loaded
        document.addEventListener('componentLoaded', (event) => {
            console.log('Component loaded:', event.detail);
            if (event.detail.id === 'footer-component') {
                console.log('Footer component loaded, updating content...');
                // Wait for the next tick to ensure DOM is updated
                setTimeout(updateFooter, 0);
            }
        });

        // Initial footer update
        updateFooter();

    } catch (error) {
        console.error('Error:', error);
    }
});

// Scroll indicator functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
let scrollTimeout;

function isEndOfPage() {
    return window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight;
}

function hideScrollIndicator() {
    scrollIndicator.style.opacity = '0';
}

function showScrollIndicator() {
    if (!isEndOfPage()) {
        scrollIndicator.style.opacity = '1';
    }
}

window.addEventListener('scroll', () => {
    // Hide while scrolling
    hideScrollIndicator();
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Show after scrolling stops (unless at end of page)
    scrollTimeout = setTimeout(() => {
        if (!isEndOfPage()) {
            showScrollIndicator();
        }
    }, 1000);
    
    // Hide at end of page
    if (isEndOfPage()) {
        hideScrollIndicator();
    }
});

// Show initially (after a delay)
setTimeout(showScrollIndicator, 1000);

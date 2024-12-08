document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/data.json');
        const data = await response.json();
        
        // Update meta information
        document.title = data.meta.title;
        
        // Update navigation
        document.querySelector('.logo').textContent = data.navigation.logo;
        const navLinks = document.querySelector('.nav-links');
        navLinks.innerHTML = data.navigation.links
            .map(link => `<li><a href="${link.href}">${link.text}</a></li>`)
            .join('');
        
        // Update hero section
        document.querySelector('.hero-text-wrapper h1').textContent = data.hero.name;
        document.querySelector('.hero-text-wrapper h2').innerHTML = 
            `${data.hero.title} <span class="company">${data.hero.company}</span>`;
        document.querySelector('.tagline').textContent = data.hero.tagline;
        document.querySelector('.personal-quote').textContent = data.hero.quote;
        
        // Update social links
        const socialLinks = document.querySelector('.social-links');
        socialLinks.innerHTML = data.hero.socialLinks
            .map(link => `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link">
                    <i class="${link.icon}"></i>
                </a>
            `).join('');
        
        // Update about section
        document.querySelector('#about .section-title').textContent = data.about.title;
        document.querySelector('.about-text h3').textContent = data.about.subtitle;
        document.querySelector('.about-text > p').textContent = data.about.description;
        
        // Update highlights
        const highlights = document.querySelector('.highlights');
        highlights.innerHTML = data.about.highlights
            .map(highlight => `
                <div class="highlight-item">
                    <i class="${highlight.icon}"></i>
                    <h4>${highlight.title}</h4>
                    <p>${highlight.description}</p>
                </div>
            `).join('');
        
        // Update skills
        const skillsGrid = document.querySelector('.skills-grid');
        skillsGrid.innerHTML = Object.entries(data.about.skills)
            .map(([category, skills]) => `
                <div class="skill-category">
                    <h4>${category}</h4>
                    <ul class="skill-list">
                        ${skills.map(skill => `
                            <li><i class="${skill.icon}"></i>${skill.name}</li>
                        `).join('')}
                    </ul>
                </div>
            `).join('');
        
        // Update experience section
        document.querySelector('#experience .section-title').textContent = data.experience.title;
        const timeline = document.querySelector('.timeline');
        timeline.innerHTML = data.experience.jobs
            .map(job => `
                <div class="timeline-item">
                    <h3>${job.title}</h3>
                    <h4>${job.company}</h4>
                    <p class="timeline-date">${job.period}</p>
                    ${job.responsibilities.map(resp => `<p>• ${resp}</p>`).join('')}
                </div>
            `).join('');
        
        // Update projects section
        document.querySelector('#projects .section-title').textContent = data.projects.title;
        const projectsGrid = document.querySelector('.projects-grid');
        projectsGrid.innerHTML = data.projects.items
            .map(project => `
                <div class="project-card">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="tech-stack">${project.techStack.join(' • ')}</div>
                    <a href="${project.link}" class="project-link">View Project</a>
                </div>
            `).join('');

        // Update research section
        document.querySelector('#research .section-title').textContent = data.research.title;
        const researchGrid = document.querySelector('.research-grid');
        researchGrid.innerHTML = data.research.papers
            .map(paper => `
                <div class="paper-item">
                    <h3>${paper.title}</h3>
                    <p>${paper.publication}</p>
                    <a href="${paper.link}" class="paper-link">Read Paper</a>
                </div>
            `).join('');

        // Update articles section
        document.querySelector('#articles .section-title').textContent = data.articles.title;
        const articlesGrid = document.querySelector('.articles-grid');
        articlesGrid.innerHTML = data.articles.items
            .map(article => `
                <div class="article-card">
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <a href="${article.link}" class="article-link">Read Article</a>
                </div>
            `).join('');

        // Update contact section
        document.querySelector('#contact .section-title').textContent = data.contact.title;
        const contactContent = document.querySelector('.contact-content');
        contactContent.innerHTML = `
            <div class="contact-info">
                ${data.contact.items.map(item => `
                    <div class="contact-item">
                        <i class="${item.icon}"></i>
                        <p>${item.label}: ${item.link ? 
                            `<a href="${item.link}" ${item.link.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${item.value}</a>` : 
                            item.value}</p>
                    </div>
                `).join('')}
            </div>
        `;

        // Update footer
        document.querySelector('.copyright').innerHTML = `&copy;${data.footer.copyright}`;
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

// Scroll indicator functionality
function isEndOfPage() {
    return (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
}

function hideScrollIndicator() {
    document.querySelector('.scroll-indicator').style.opacity = '0';
}

function showScrollIndicator() {
    if (!isEndOfPage()) {
        document.querySelector('.scroll-indicator').style.opacity = '1';
    }
}

window.addEventListener('scroll', () => {
    hideScrollIndicator();
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(showScrollIndicator, 1000);
    
    if (isEndOfPage()) {
        hideScrollIndicator();
    }
});

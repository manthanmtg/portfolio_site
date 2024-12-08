document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('../data/blogs.json');
        const data = await response.json();
        
        // Update page title and description
        document.querySelector('.page-title').textContent = data.title;
        document.querySelector('.page-description').textContent = data.description;

        // Extract all unique tags
        const allTags = new Set();
        data.blogs.forEach(blog => {
            if (blog.type === 'series') {
                blog.series_items.forEach(item => {
                    item.tags.forEach(tag => allTags.add(tag));
                });
            } else {
                blog.tags.forEach(tag => allTags.add(tag));
            }
        });

        // Populate tags filter
        const tagsFilter = document.getElementById('tagsFilter');
        Array.from(allTags).sort().forEach(tag => {
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-filter';
            tagBtn.textContent = tag;
            tagBtn.addEventListener('click', () => {
                tagBtn.classList.toggle('active');
                filterBlogs();
            });
            tagsFilter.appendChild(tagBtn);
        });

        // Render blogs
        const blogsContainer = document.querySelector('.blogs-container');
        renderBlogs(data.blogs, blogsContainer);

        // Setup search functionality
        const searchInput = document.getElementById('searchBlogs');
        searchInput.addEventListener('input', filterBlogs);

        function renderBlogs(blogs, container) {
            container.innerHTML = blogs.map(blog => {
                if (blog.type === 'series') {
                    return `
                        <div class="blog-series">
                            <div class="series-header" onclick="this.parentElement.classList.toggle('expanded')">
                                <h2>${blog.title}</h2>
                                <p>${blog.description}</p>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="series-items">
                                ${blog.series_items.map(item => `
                                    <div class="blog-card" data-tags='${JSON.stringify(item.tags)}'>
                                        <h3>${item.title}</h3>
                                        <p>${item.description}</p>
                                        <div class="blog-meta">
                                            <span class="date">${formatDate(item.date)}</span>
                                            <div class="tags">
                                                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                            </div>
                                        </div>
                                        <a href="${item.link}" class="read-more">Read More</a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="blog-card" data-tags='${JSON.stringify(blog.tags)}'>
                            <h3>${blog.title}</h3>
                            <p>${blog.description}</p>
                            <div class="blog-meta">
                                <span class="date">${formatDate(blog.date)}</span>
                                <div class="tags">
                                    ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                            <a href="${blog.link}" class="read-more">Read More</a>
                        </div>
                    `;
                }
            }).join('');
        }

        function filterBlogs() {
            const searchTerm = searchInput.value.toLowerCase();
            const activeTags = Array.from(document.querySelectorAll('.tag-filter.active')).map(btn => btn.textContent);
            
            const blogCards = document.querySelectorAll('.blog-card');
            const blogSeries = document.querySelectorAll('.blog-series');

            blogCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const tags = JSON.parse(card.dataset.tags);
                
                const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
                const matchesTags = activeTags.length === 0 || activeTags.every(tag => tags.includes(tag));
                
                card.style.display = matchesSearch && matchesTags ? 'block' : 'none';
            });

            blogSeries.forEach(series => {
                const visibleCards = Array.from(series.querySelectorAll('.blog-card')).some(card => 
                    card.style.display !== 'none'
                );
                series.style.display = visibleCards ? 'block' : 'none';
            });
        }

        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

    } catch (error) {
        console.error('Error loading blogs:', error);
    }
});

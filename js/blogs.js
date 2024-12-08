document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('../data/blogs.json');
        const data = await response.json();
        
        // Update page title and description
        document.querySelector('h1').textContent = data.title;
        document.querySelector('header p').textContent = data.description;

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
            tagBtn.className = 'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ' +
                             'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';
            tagBtn.textContent = tag;
            tagBtn.addEventListener('click', () => {
                // Toggle active state
                if (tagBtn.classList.contains('bg-gray-100')) {
                    tagBtn.classList.remove('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
                    tagBtn.classList.add('bg-blue-500', 'text-white', 'hover:bg-blue-600', 'dark:bg-blue-600', 'dark:hover:bg-blue-700');
                } else {
                    tagBtn.classList.remove('bg-blue-500', 'text-white', 'hover:bg-blue-600', 'dark:bg-blue-600', 'dark:hover:bg-blue-700');
                    tagBtn.classList.add('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
                }
                filterAndRenderBlogs(data.blogs);
            });
            tagsFilter.appendChild(tagBtn);
        });

        // Render blogs initially
        const blogsContainer = document.querySelector('.blogs-container');
        renderBlogs(data.blogs, blogsContainer);

        // Setup search functionality
        const searchInput = document.getElementById('searchBlogs');
        searchInput.addEventListener('input', () => filterAndRenderBlogs(data.blogs));

        function filterAndRenderBlogs(blogs) {
            const searchTerm = searchInput.value.toLowerCase();
            const activeTags = Array.from(document.querySelectorAll('button.bg-blue-500')).map(btn => btn.textContent);
            
            // Filter blogs based on search and tags
            const filteredBlogs = blogs.map(blog => {
                if (blog.type === 'series') {
                    // Filter series items
                    const filteredItems = blog.series_items.filter(item => {
                        const matchesSearch = item.title.toLowerCase().includes(searchTerm) || 
                                           item.description.toLowerCase().includes(searchTerm);
                        const matchesTags = activeTags.length === 0 || 
                                          activeTags.every(tag => item.tags.includes(tag));
                        return matchesSearch && matchesTags;
                    });
                    
                    // Only include series if it has matching items
                    return filteredItems.length > 0 ? { ...blog, series_items: filteredItems } : null;
                } else {
                    const matchesSearch = blog.title.toLowerCase().includes(searchTerm) || 
                                        blog.description.toLowerCase().includes(searchTerm);
                    const matchesTags = activeTags.length === 0 || 
                                      activeTags.every(tag => blog.tags.includes(tag));
                    return matchesSearch && matchesTags ? blog : null;
                }
            }).filter(Boolean); // Remove null entries

            // Render filtered blogs
            renderBlogs(filteredBlogs, blogsContainer);
        }

        function renderBlogs(blogs, container) {
            container.innerHTML = blogs.map(blog => {
                if (blog.type === 'series') {
                    return `
                        <div class="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <div class="cursor-pointer p-6 border-b border-gray-100 dark:border-gray-700" data-series-toggle>
                                <div class="flex justify-between items-center">
                                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">${blog.title}</h2>
                                    <i class="fas fa-chevron-down text-gray-400 transform transition-transform duration-300"></i>
                                </div>
                                <p class="mt-2 text-gray-600 dark:text-gray-300">${blog.description}</p>
                            </div>
                            <div class="series-items hidden p-6">
                                <div class="grid gap-6">
                                    ${blog.series_items.map(item => renderBlogCard(item)).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    return renderBlogCard(blog);
                }
            }).join('');

            // Add event listeners for series expansion
            document.querySelectorAll('[data-series-toggle]').forEach(header => {
                header.addEventListener('click', () => {
                    const seriesContainer = header.closest('.col-span-1');
                    const seriesItems = seriesContainer.querySelector('.series-items');
                    const icon = header.querySelector('.fa-chevron-down');
                    
                    // Toggle the hidden class
                    seriesItems.classList.toggle('hidden');
                    
                    // Rotate the icon
                    if (seriesItems.classList.contains('hidden')) {
                        icon.style.transform = 'rotate(0deg)';
                    } else {
                        icon.style.transform = 'rotate(180deg)';
                    }
                });
            });
        }

        function renderBlogCard(blog) {
            return `
                <div class="blog-card group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-tags='${JSON.stringify(blog.tags)}'>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-3">${blog.title}</h3>
                        <p class="text-gray-600 dark:text-gray-300 mb-4">${blog.description}</p>
                        
                        <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                <i class="far fa-calendar-alt mr-2"></i>${formatDate(blog.date)}
                            </span>
                            <div class="flex flex-wrap gap-2">
                                ${blog.tags.map(tag => `
                                    <span class="px-2 py-1 text-xs font-medium rounded-full 
                                               bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <a href="${blog.link}" target="_blank" class="inline-flex items-center mt-4 px-4 py-2 rounded-lg text-sm font-medium 
                                                    text-white bg-blue-500 hover:bg-blue-600 
                                                    transition-all duration-200 transform group-hover:translate-x-1">
                            Read More
                            <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
        }

        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        }

    } catch (error) {
        console.error('Error loading blogs:', error);
    }
});

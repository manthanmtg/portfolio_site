let allEntries = [];
let filteredEntries = [];
let currentPage = 1;
const entriesPerPage = 5;
let activeFilters = {
    time: 'all',
    month: 'all',
    category: 'all',
    tags: new Set(),
    search: ''
};

// Get month name in three-letter format
function getMonthName(date) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months[date.getMonth()];
}

// Calculate how many months to load
function calculateMonthsToLoad() {
    // Default to loading 3 months of entries
    return 3;
}

// Load and initialize the page
async function initializePage() {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const monthsToLoad = calculateMonthsToLoad();
        const startYear = currentYear - 10; // Don't go back more than 10 years
        
        allEntries = [];
        let currentMonth = currentDate.getMonth();
        let year = currentYear;
        let monthsLoaded = 0;
        let monthsChecked = 0;
        
        // TODO: Change this 12 to 120, if updates are done to this webpage
        while (monthsToLoad > monthsLoaded && year >= startYear && monthsChecked < 12) { // 120 months = 10 years
            const monthName = getMonthName(new Date(year, currentMonth));
            const url = `../data/tool_notes/${year}/${monthName}/entries.json`;
            
            try {
                // First check if file exists using HEAD request
                const checkResponse = await fetch(url, { method: 'HEAD' });
                if (checkResponse.ok) {
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log('Loading entries from:', url);
                    // Update notes_path to include full relative path for each entry
                    const entriesWithPath = data.entries.map(entry => {
                        console.log('Original notes_path:', entry.notes_path);
                        const fullPath = `data/tool_notes/${year}/${monthName}/${entry.notes_path}`;
                        console.log('Full notes_path:', fullPath);
                        return {
                            ...entry,
                            notes_path: fullPath
                        };
                    });
                    allEntries.push(...entriesWithPath);
                    monthsLoaded++;
                }
            } catch (error) {
                // Silently continue if file not found
            }
            
            monthsChecked++;
            
            // Move to previous month
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                year--;
            }
        }
        
        if (allEntries.length === 0) {
            const toolEntries = document.getElementById('toolEntries');
            toolEntries.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500 dark:text-gray-400">No entries found</p>
                </div>
            `;
            return;
        }
        
        // Sort entries by date (newest first)
        allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Initialize tag cloud
        const allTags = new Set();
        allEntries.forEach(entry => {
            entry.tags.forEach(tag => allTags.add(tag));
        });
        renderTagCloud(Array.from(allTags));
        
        // Initialize category filter
        const allCategories = new Set(allEntries.map(entry => entry.category));
        renderCategoryFilter(Array.from(allCategories));
        
        // Initial render
        applyFilters();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error in initializePage:', error);
        throw error;
    }
}

function setupEventListeners() {
    // Time filter
    const timeFilter = document.getElementById('timeFilter');
    const monthFilter = document.getElementById('monthFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    timeFilter.addEventListener('change', (e) => {
        activeFilters.time = e.target.value;
        if (e.target.value === 'all') {
            monthFilter.classList.add('hidden');
            activeFilters.month = 'all';
        } else {
            monthFilter.classList.remove('hidden');
        }
        currentPage = 1;
        applyFilters();
    });

    // Month filter
    monthFilter.addEventListener('change', (e) => {
        activeFilters.month = e.target.value;
        currentPage = 1;
        applyFilters();
    });

    // Category filter
    categoryFilter.addEventListener('change', (e) => {
        activeFilters.category = e.target.value;
        currentPage = 1;
        applyFilters();
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            activeFilters.search = e.target.value.toLowerCase();
            currentPage = 1;
            applyFilters();
        }, 300);
    });
}

function renderTagCloud(tags) {
    const tagCloud = document.getElementById('tagCloud');
    tagCloud.innerHTML = '';
    
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = tag;
        tagElement.classList.add('tag-pill');
        
        if (activeFilters.tags.has(tag)) {
            tagElement.classList.add('active');
        }
        
        tagElement.addEventListener('click', () => {
            if (activeFilters.tags.has(tag)) {
                activeFilters.tags.delete(tag);
                tagElement.classList.remove('active');
            } else {
                activeFilters.tags.add(tag);
                tagElement.classList.add('active');
            }
            currentPage = 1;
            applyFilters();
        });
        
        tagCloud.appendChild(tagElement);
    });
}

function renderCategoryFilter(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

function applyFilters() {
    filteredEntries = allEntries.filter(entry => {
        // Time and month filter
        if (activeFilters.time !== 'all') {
            const entryDate = new Date(entry.date);
            const currentDate = new Date();
            
            if (activeFilters.time === 'thisMonth') {
                if (entryDate.getMonth() !== currentDate.getMonth() || 
                    entryDate.getFullYear() !== currentDate.getFullYear()) {
                    return false;
                }
            } else if (activeFilters.time === 'thisYear') {
                if (entryDate.getFullYear() !== currentDate.getFullYear()) {
                    return false;
                }
                if (activeFilters.month !== 'all' && 
                    entryDate.getMonth() !== parseInt(activeFilters.month) - 1) {
                    return false;
                }
            }
        }

        // Category filter
        if (activeFilters.category !== 'all' && entry.category !== activeFilters.category) {
            return false;
        }

        // Tag filter
        if (activeFilters.tags.size > 0) {
            if (!entry.tags.some(tag => activeFilters.tags.has(tag))) {
                return false;
            }
        }

        // Search filter
        if (activeFilters.search) {
            const searchText = activeFilters.search.toLowerCase();
            return entry.title.toLowerCase().includes(searchText) ||
                   entry.content.toLowerCase().includes(searchText) ||
                   entry.description.toLowerCase().includes(searchText) ||
                   entry.tags.some(tag => tag.toLowerCase().includes(searchText));
        }

        return true;
    });

    renderEntries(true);
}

function renderEntries(reset = false) {
    const container = document.getElementById('toolEntries');
    const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
    
    if (reset) {
        container.innerHTML = '';
    }
    
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const entriesToShow = filteredEntries.slice(start, end);
    
    entriesToShow.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('bg-white', 'dark:bg-gray-800', 'rounded-lg', 'p-6', 'shadow-sm', 'hover:shadow-md', 'transition-shadow', 'duration-200', 'animate-in');
        entryElement.id = `entry-${entry.date}`;
        
        const date = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        entryElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">${entry.title}</h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">${date}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-2 italic">${entry.description}</p>
            <p class="text-gray-700 dark:text-gray-300 mb-4">${entry.content}</p>
            <div class="flex justify-between items-center flex-wrap gap-4">
                <div class="flex flex-wrap gap-2">
                    ${entry.tags.map(tag => 
                        `<span class="tag-pill bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">${tag}</span>`
                    ).join('')}
                </div>
                <span class="category-pill category-${entry.category}">${entry.category}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
                <button onclick="showNotes('${entry.notes_path}')" class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                    <i class="fas fa-book-open mr-2"></i>View Notes
                </button>
                ${entry.references ? entry.references.map(ref => 
                    `<a href="${ref.url}" target="_blank" class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <i class="fas fa-external-link-alt mr-2"></i>${ref.title}
                    </a>`
                ).join('') : ''}
            </div>
        `;
        
        container.appendChild(entryElement);
    });
    
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.classList.add('px-3', 'py-2', 'rounded-lg', 'bg-white', 'dark:bg-gray-800', 'border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-700', 'disabled:opacity-50', 'disabled:cursor-not-allowed');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderEntries(true);
        }
    });
    pagination.appendChild(prevButton);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('px-3', 'py-2', 'rounded-lg', 'border', 'border-gray-300', 'dark:border-gray-600', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
        
        if (i === currentPage) {
            pageButton.classList.add('bg-primary', 'text-white', 'border-primary');
            pageButton.classList.remove('hover:bg-gray-50', 'dark:hover:bg-gray-700');
        } else {
            pageButton.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
        }
        
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderEntries(true);
        });
        pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.classList.add('px-3', 'py-2', 'rounded-lg', 'bg-white', 'dark:bg-gray-800', 'border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-700', 'disabled:opacity-50', 'disabled:cursor-not-allowed');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderEntries(true);
        }
    });
    pagination.appendChild(nextButton);
}

function setupNotesModal() {
    const modal = document.getElementById('notesModal');
    if (!modal) return;
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function showNotes(notesPath) {
    const modal = document.getElementById('notesModal');
    const notesContent = modal.querySelector('.prose') || modal.querySelector('div');
    if (!modal || !notesContent) return;
    
    try {
        // First check if file exists
        const checkResponse = await fetch(`../${notesPath}`, { method: 'HEAD' });
        if (!checkResponse.ok) {
            notesContent.innerHTML = '<p class="text-gray-500">Notes not available</p>';
            modal.style.display = 'flex';
            return;
        }
        
        const response = await fetch(`../${notesPath}`);
        if (!response.ok) {
            throw new Error('Failed to fetch notes');
        }
        const markdown = await response.text();
        notesContent.innerHTML = marked.parse(markdown);
        modal.style.display = 'flex';
        
        // Highlight code blocks if highlight.js is available
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        notesContent.innerHTML = '<p class="text-gray-500">Unable to load notes</p>';
        modal.style.display = 'flex';
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    console.log('Page loaded, initializing...');
    initializePage().then(() => {
        if (window.location.hash) {
            const entryId = window.location.hash.slice(1);
            const element = document.getElementById(`entry-${entryId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }).catch(error => {
        console.error('Initialization failed:', error);
    });
});

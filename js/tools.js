let allEntries = [];
let filteredEntries = [];
let currentPage = 1;
const entriesPerPage = 10;
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
        
        // TODO: Change this 6 to 120, if updates are done to this webpage
        while (monthsToLoad > monthsLoaded && year >= startYear && monthsChecked < 6) { // 120 months = 10 years
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
    const timeFilter = document.getElementById('timeFilter');
    const monthFilter = document.getElementById('monthFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    timeFilter.addEventListener('change', () => {
        const selectedYear = timeFilter.value;
        if (selectedYear === 'all') {
            monthFilter.classList.add('hidden');
        } else {
            monthFilter.classList.remove('hidden');
        }
        currentPage = 1;
        applyFilters();
    });

    monthFilter.addEventListener('change', () => {
        currentPage = 1;
        applyFilters();
    });

    categoryFilter.addEventListener('change', () => {
        currentPage = 1;
        applyFilters();
    });

    searchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        applyFilters();
    }, 300));

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderEntries(false);
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
        const entryDate = new Date(entry.date);
        const selectedYear = document.getElementById('timeFilter').value;
        const selectedMonth = document.getElementById('monthFilter').value;
        const selectedCategory = document.getElementById('categoryFilter').value;
        const searchQuery = document.getElementById('searchInput')?.value?.toLowerCase() || '';

        // Year filter
        if (selectedYear !== 'all') {
            if (entryDate.getFullYear().toString() !== selectedYear) {
                return false;
            }
            // Month filter (only if year is selected)
            if (selectedMonth !== 'all' && entryDate.getMonth() + 1 !== parseInt(selectedMonth)) {
                return false;
            }
        }

        // Category filter
        if (selectedCategory !== 'all' && entry.category !== selectedCategory) {
            return false;
        }

        // Tag filter
        if (activeFilters.tags.size > 0) {
            if (!entry.tags.some(tag => activeFilters.tags.has(tag))) {
                return false;
            }
        }

        // Search filter
        if (searchQuery) {
            const searchText = searchQuery.toLowerCase();
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
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (reset) {
        container.innerHTML = '';
        currentPage = 1;
    }

    // Calculate indices for entries to show
    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const entriesToShow = filteredEntries.slice(startIdx, endIdx);
    
    // If no entries found, show a message
    if (filteredEntries.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                No entries found matching your filters.
            </div>
        `;
        loadMoreBtn.classList.add('hidden');
        return;
    }
    
    // Render entries
    entriesToShow.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('bg-white', 'dark:bg-gray-800', 'rounded-lg', 'p-6', 'shadow-sm', 'hover:shadow-md', 'transition-shadow', 'duration-200', 'animate-in');
        
        const date = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        entryElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${entry.title}</h3>
                    <time class="text-sm text-gray-500 dark:text-gray-400">${date}</time>
                </div>
                <span class="category-pill ${getCategoryClass(entry.category)}">${entry.category}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4">${entry.content}</p>
            <div class="flex flex-wrap gap-2">
                ${entry.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
                ${entry.notes_path ? `
                    <button onclick="showNotes('${entry.notes_path}')" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                        <i class="fas fa-book-open"></i>
                        Read More
                    </button>
                ` : ''}
                ${entry.references ? entry.references.map(ref => 
                    `<a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <i class="fas fa-external-link-alt"></i>
                        ${ref.title}
                    </a>`
                ).join('') : ''}
            </div>
        `;
        
        container.appendChild(entryElement);
    });

    // Show total entries count
    const totalEntriesCount = document.createElement('div');
    totalEntriesCount.className = 'text-center text-gray-500 dark:text-gray-400 mt-4';
    totalEntriesCount.textContent = `Showing ${Math.min(endIdx, filteredEntries.length)} of ${filteredEntries.length} entries`;
    container.appendChild(totalEntriesCount);

    // Show/hide load more button
    if (endIdx >= filteredEntries.length) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

function getCategoryClass(category) {
    switch (category) {
        case 'category1':
            return 'bg-red-100 text-red-800';
        case 'category2':
            return 'bg-orange-100 text-orange-800';
        case 'category3':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

document.addEventListener('mousedown', function(event) {
    const modal = document.getElementById('notesModal');
    
    if (modal && modal.style.display === 'flex') {
        // Check if click is outside the modal content
        if (!event.target.closest('.relative') && 
            !event.target.closest('[onclick*="showNotes"]')) {
            modal.style.display = 'none';
        }
    }
});

async function showNotes(notesPath) {
    const modal = document.getElementById('notesModal');
    const notesContent = modal.querySelector('.prose') || modal.querySelector('div');
    if (!modal || !notesContent) return;
    
    try {
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

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

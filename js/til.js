let allEntries = [];
let filteredEntries = [];
let currentPage = 1;
const entriesPerPage = 5;
let activeFilters = {
    time: 'all',
    month: 'all',
    tags: new Set(),
    search: ''
};

// Load and initialize the page
async function initializePage() {
    try {
        const response = await fetch('../data/today_learnt.json');
        const data = await response.json();
        allEntries = data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Initialize tag cloud
        const allTags = new Set();
        allEntries.forEach(entry => {
            entry.tags.forEach(tag => allTags.add(tag));
        });
        renderTagCloud(Array.from(allTags));
        
        // Initial render
        applyFilters();
        
        // Set up event listeners
        setupEventListeners();
        setupNotesModal();
    } catch (error) {
        console.error('Error loading TIL entries:', error);
    }
}

function setupEventListeners() {
    // Time filter
    const timeFilter = document.getElementById('timeFilter');
    const monthFilter = document.getElementById('monthFilter');

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

    // Search input
    const searchInput = document.getElementById('searchInput');
    let debounceTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            activeFilters.search = e.target.value.toLowerCase();
            currentPage = 1;
            applyFilters();
        }, 300);
    });

    // Load more button
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++;
        renderEntries(false);
    });
}

function renderTagCloud(tags) {
    const tagCloud = document.getElementById('tagCloud');
    tagCloud.innerHTML = '';
    
    tags.sort().forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = tag;
        tagElement.classList.add('tag-pill', 'bg-gray-100', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-100', 'hover:bg-primary', 'hover:text-white');
        
        if (activeFilters.tags.has(tag)) {
            tagElement.classList.add('bg-primary', 'text-white');
        }
        
        tagElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            
            if (activeFilters.tags.has(tag)) {
                activeFilters.tags.delete(tag);
                tagElement.classList.remove('bg-primary', 'text-white');
                tagElement.classList.add('bg-gray-100', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-100');
            } else {
                activeFilters.tags.add(tag);
                tagElement.classList.remove('bg-gray-100', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-100');
                tagElement.classList.add('bg-primary', 'text-white');
            }
            currentPage = 1;
            applyFilters();
        });
        
        tagCloud.appendChild(tagElement);
    });
}

function applyFilters() {
    filteredEntries = allEntries.filter(entry => {
        // Time and month filter
        if (activeFilters.time !== 'all') {
            const entryDate = new Date(entry.date);
            const entryYear = entryDate.getFullYear().toString();
            
            if (entryYear !== activeFilters.time) return false;
            
            if (activeFilters.month !== 'all') {
                const entryMonth = entryDate.getMonth().toString();
                if (entryMonth !== activeFilters.month) return false;
            }
        }
        
        // Tag filter
        if (activeFilters.tags.size > 0) {
            if (!entry.tags.some(tag => activeFilters.tags.has(tag))) return false;
        }
        
        // Search filter
        if (activeFilters.search) {
            const searchText = activeFilters.search.toLowerCase();
            return entry.title.toLowerCase().includes(searchText) ||
                   entry.content.toLowerCase().includes(searchText) ||
                   entry.tags.some(tag => tag.toLowerCase().includes(searchText));
        }
        
        return true;
    });
    
    renderEntries(true);
}

function renderEntries(reset = false) {
    const container = document.getElementById('entriesContainer');
    const template = document.getElementById('entryTemplate');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (reset) {
        container.innerHTML = '';
    }
    
    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const entriesToRender = filteredEntries.slice(startIdx, endIdx);
    
    entriesToRender.forEach(entry => {
        const entryElement = template.content.cloneNode(true);
        const article = entryElement.querySelector('article');
        
        // Set entry ID for permalink
        const entryId = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        article.id = entryId;
        
        // Fill in the content
        article.querySelector('h2').textContent = entry.title;
        article.querySelector('time').textContent = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        article.querySelector('p').textContent = entry.content;
        
        // Set difficulty badge
        const difficultyBadge = article.querySelector('.difficulty-badge');
        difficultyBadge.textContent = entry.difficulty;
        difficultyBadge.classList.add(`difficulty-${entry.difficulty}`);
        
        // Add references
        const referencesContainer = article.querySelector('.references');
        entry.references.forEach(ref => {
            const refLink = document.createElement('a');
            refLink.href = ref.url;
            refLink.target = '_blank';
            refLink.rel = 'noopener noreferrer';
            refLink.className = 'block text-primary hover:underline';
            refLink.innerHTML = `<i class="fas fa-external-link-alt mr-2"></i>${ref.title}`;
            referencesContainer.appendChild(refLink);
        });
        
        // Add tags
        const tagsContainer = article.querySelector('.tags');
        entry.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.textContent = tag;
            tagSpan.className = 'tag-pill bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
            tagsContainer.appendChild(tagSpan);
        });
        
        // Add copy link functionality
        const copyBtn = article.querySelector('.copy-link-btn');
        copyBtn.addEventListener('click', () => {
            const url = `${window.location.origin}${window.location.pathname}#${entryId}`;
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-link"></i>';
                }, 2000);
            });
        });
        
        // Handle notes button
        const notesBtn = article.querySelector('.notes-btn');
        if (entry.notes_md) {
            notesBtn.classList.remove('hidden');
            notesBtn.addEventListener('click', () => showNotes(entry.notes_md));
        }
        
        container.appendChild(entryElement);
    });
    
    // Update load more button visibility
    loadMoreBtn.style.display = endIdx >= filteredEntries.length ? 'none' : 'inline-block';
    
    // If there are no entries, show a message
    if (filteredEntries.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'text-center text-gray-500 dark:text-gray-400 py-8';
        noResults.innerHTML = '<i class="fas fa-search mb-2 text-2xl"></i><p>No entries found</p>';
        container.appendChild(noResults);
    }
}

// Set up notes modal functionality
function setupNotesModal() {
    const modal = document.getElementById('notesModal');
    const closeBtn = document.getElementById('closeNotesModal');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });
}

// Function to load and display notes
async function showNotes(notesPath) {
    const modal = document.getElementById('notesModal');
    const notesContent = document.getElementById('notesContent');
    
    try {
        const response = await fetch(notesPath);
        if (!response.ok) throw new Error('Failed to load notes');
        
        const markdownText = await response.text();
        // Convert markdown to HTML (you'll need to add marked.js to your HTML)
        notesContent.innerHTML = marked.parse(markdownText);
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } catch (error) {
        console.error('Error loading notes:', error);
        notesContent.innerHTML = '<p class="text-red-500">Failed to load notes. Please try again later.</p>';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// Check for URL hash on load and scroll to entry if present
window.addEventListener('load', () => {
    initializePage().then(() => {
        if (window.location.hash) {
            const targetEntry = document.querySelector(window.location.hash);
            if (targetEntry) {
                targetEntry.scrollIntoView({ behavior: 'smooth' });
                targetEntry.classList.add('ring-2', 'ring-primary');
                setTimeout(() => {
                    targetEntry.classList.remove('ring-2', 'ring-primary');
                }, 2000);
            }
        }
    });
});

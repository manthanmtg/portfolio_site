// Global variables
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
let selectedTags = new Set();

// Get month name in three-letter format
function getMonthName(date) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months[date.getMonth()];
}

// Calculate how many months to load
function calculateMonthsToLoad() {
    // Default to loading just the current month
    return 1;
}

// Load entries for specific year and month
async function loadEntriesForYearMonth(year, month) {
    allEntries = [];
    
    // Get current date for comparison
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = getMonthName(now).toLowerCase();
    
    // Only show streak container for current month or all months of current year
    const streakContainer = document.getElementById('streakContainer');
    if (streakContainer) {
        if ((year === currentYear && (month === currentMonth || month === 'all')) || 
            (year === 'all' && currentYear === now.getFullYear().toString())) {
            streakContainer.style.display = 'flex';
        } else {
            streakContainer.style.display = 'none';
            // Early return for streak calculation if not current month
            if (year !== currentYear || (month !== currentMonth && month !== 'all')) {
                // Continue with loading entries
                await loadEntries();
                return;
            }
        }
    }
    
    async function loadEntries() {
        if (month === 'all') {
            // Load all months for the selected year
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            for (const m of months) {
                try {
                    const url = `../data/til_notes/${year}/${m}/entries.json`;
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        const entriesWithPath = data.entries.map(entry => ({
                            ...entry,
                            notes_path: entry.notes_md ? 
                                `data/til_notes/${year}/${m}/${entry.notes_md}` :
                                `data/til_notes/${year}/${m}/${entry.notes_path}`
                        }));
                        allEntries = [...allEntries, ...entriesWithPath];
                    }
                } catch (error) {
                    // Silently continue if no entries found
                }
            }
        } else if (year === 'all') {
            // Load all years and months
            const years = ['2023', '2024', '2025'];
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            
            for (const y of years) {
                for (const m of months) {
                    try {
                        const url = `../data/til_notes/${y}/${m}/entries.json`;
                        const response = await fetch(url);
                        
                        if (response.ok) {
                            const data = await response.json();
                            const entriesWithPath = data.entries.map(entry => ({
                                ...entry,
                                notes_path: entry.notes_md ? 
                                    `data/til_notes/${y}/${m}/${entry.notes_md}` :
                                    `data/til_notes/${y}/${m}/${entry.notes_path}`
                            }));
                            allEntries = [...allEntries, ...entriesWithPath];
                        }
                    } catch (error) {
                        // Silently continue if no entries found
                    }
                }
            }
        } else {
            // Load specific year and month
            try {
                const url = `../data/til_notes/${year}/${month}/entries.json`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    allEntries = data.entries.map(entry => ({
                        ...entry,
                        notes_path: entry.notes_md ? 
                            `data/til_notes/${year}/${month}/${entry.notes_md}` :
                            `data/til_notes/${year}/${month}/${entry.notes_path}`
                    }));
                }
            } catch (error) {
                // Show error in UI instead of console
                document.getElementById('entriesContainer').innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500 dark:text-gray-400">Error loading entries</p>
                    </div>
                `;
            }
        }
        
        // Sort entries by date in descending order
        allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate streak only if container is visible
        if (streakContainer && streakContainer.style.display !== 'none') {
            const streak = calculateStreak(allEntries);
            updateStreakDisplay(streak);
        }
        
        filterEntries();
        updateTagCloud();
        
        if (allEntries.length === 0) {
            document.getElementById('entriesContainer').innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500 dark:text-gray-400">No entries found</p>
                </div>
            `;
        }
    }
    
    await loadEntries();
}

// Calculate streak from entries
function calculateStreak(entries) {
    if (!entries || entries.length === 0) return 0;

    // Sort entries by date in descending order
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get current date at midnight for consistent comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get the most recent entry's date
    const lastEntryDate = new Date(sortedEntries[0].date);
    const lastEntryDay = new Date(lastEntryDate.getFullYear(), lastEntryDate.getMonth(), lastEntryDay.getDate());
    
    // If the last entry is more than a day old, streak is broken
    const daysSinceLastEntry = Math.floor((today - lastEntryDay) / (1000 * 60 * 60 * 24));
    if (daysSinceLastEntry > 1) {
        return 0;
    }
    
    // Calculate streak
    let streak = 1;
    let currentDate = lastEntryDay;
    
    // Start from the second entry
    for (let i = 1; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].date);
        const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
        
        // Calculate days between current entry and previous entry
        const daysBetween = Math.floor((currentDate - entryDay) / (1000 * 60 * 60 * 24));
        
        // If there's more than 1 day gap, streak is broken
        if (daysBetween > 1) {
            break;
        }
        
        // If it's a different day (not same day entries), increment streak
        if (daysBetween === 1) {
            streak++;
        }
        
        currentDate = entryDay;
    }
    
    return streak;
}

// Update streak display
function updateStreakDisplay(streak) {
    const streakContainer = document.getElementById('streakContainer');
    if (!streakContainer) return;
    
    if (streak > 0) {
        // Add animation classes
        streakContainer.classList.add('bg-gradient-to-r', 'from-orange-500', 'to-red-500');
        
        // Update streak count with animation
        streakContainer.innerHTML = `
            <i id="streakIcon" class="fas fa-fire text-sm mr-2 text-orange-300 animate-flicker"></i>
            <span class="font-semibold">${streak} day${streak === 1 ? '' : 's'} streak!</span>
            <div class="tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg transition-all duration-200 mb-2 whitespace-nowrap">
                Keep the streak going!
                <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
        `;
    } else {
        // Remove animation classes
        streakContainer.classList.remove('bg-gradient-to-r', 'from-orange-500', 'to-red-500');
        
        // Update with no streak message
        streakContainer.innerHTML = `
            <i class="fas fa-fire text-sm mr-2 text-gray-400"></i>
            <span class="text-gray-600 dark:text-gray-400">No streak yet</span>
            <div class="tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg transition-all duration-200 mb-2 whitespace-nowrap">
                Start your streak by adding an entry today!
                <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
        `;
    }
}

// Get all unique tags from entries
function getAllTags(entries) {
    const tags = new Set();
    entries.forEach(entry => {
        if (entry.tags) {
            entry.tags.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags).sort();
}

// Update tag cloud
function updateTagCloud() {
    const tagContainer = document.getElementById('tagContainer');
    if (!tagContainer) return;

    const allTags = getAllTags(allEntries);
    tagContainer.innerHTML = '';

    allTags.forEach(tag => {
        const tagElement = document.createElement('button');
        tagElement.className = `tag-pill ${selectedTags.has(tag) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'} 
            text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors duration-200`;
        tagElement.textContent = tag;
        
        tagElement.addEventListener('click', () => {
            if (selectedTags.has(tag)) {
                selectedTags.delete(tag);
            } else {
                selectedTags.add(tag);
            }
            filterEntries();
            updateTagCloud();
        });
        
        tagContainer.appendChild(tagElement);
    });
}

// Filter entries based on all criteria
function filterEntries() {
    const yearFilter = document.getElementById('yearFilter');
    const monthFilter = document.getElementById('monthFilter');
    const searchInput = document.getElementById('searchInput');
    
    const selectedYear = yearFilter.value;
    const selectedMonth = monthFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredEntries = allEntries.filter(entry => {
        // Year filter
        if (selectedYear !== 'all') {
            const entryYear = new Date(entry.date).getFullYear().toString();
            if (entryYear !== selectedYear) return false;
        }
        
        // Month filter
        if (selectedMonth !== 'all') {
            const entryMonth = new Date(entry.date).toLocaleString('en-US', { month: 'short' }).toLowerCase();
            if (entryMonth !== selectedMonth) return false;
        }
        
        // Tag filter
        if (selectedTags.size > 0) {
            if (!entry.tags) return false;
            const hasSelectedTag = Array.from(selectedTags).some(tag => entry.tags.includes(tag));
            if (!hasSelectedTag) return false;
        }
        
        // Search filter
        if (searchTerm) {
            const searchFields = [
                entry.title.toLowerCase(),
                entry.content.toLowerCase(),
                ...(entry.tags || []).map(tag => tag.toLowerCase())
            ];
            return searchFields.some(field => field.includes(searchTerm));
        }
        
        return true;
    });
    
    renderEntries(true);
}

// Set up event listeners
function setupEventListeners() {
    const yearFilter = document.getElementById('yearFilter');
    const monthFilter = document.getElementById('monthFilter');
    const searchInput = document.getElementById('searchInput');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    yearFilter.addEventListener('change', async () => {
        const year = yearFilter.value;
        const month = monthFilter.value;
        await loadEntriesForYearMonth(year, month);
    });

    monthFilter.addEventListener('change', async () => {
        const year = yearFilter.value;
        const month = monthFilter.value;
        await loadEntriesForYearMonth(year, month);
    });

    searchInput.addEventListener('input', () => filterEntries());

    // Load more button click handler
    if (loadMoreBtn) {
        loadMoreBtn.onclick = () => {
            currentPage++;
            renderEntries(false);
        };
    }
}

// Function to update month options based on selected year
function updateMonthOptions(selectedYear, currentMonth) {
    const monthFilter = document.getElementById('monthFilter');
    const options = monthFilter.options;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // First option is always available (All Months)
    options[0].disabled = false;
    
    // Enable/disable months based on year
    for (let i = 1; i < options.length; i++) {
        if (selectedYear === currentYear.toString()) {
            // For current year, only enable months up to current month
            options[i].disabled = i - 1 > currentMonth;
        } else {
            // For other years, enable all months
            options[i].disabled = false;
        }
    }
    
    // If current selection is disabled, switch to "All Months"
    if (monthFilter.selectedOptions[0].disabled) {
        monthFilter.value = 'all';
    }
}

// Render entries
function renderEntries(reset = false) {
    const entriesContainer = document.getElementById('entriesContainer');
    if (!entriesContainer) return;
    
    if (reset) {
        entriesContainer.innerHTML = '';
        currentPage = 1;
    }
    
    if (filteredEntries.length === 0) {
        entriesContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">No entries found</p>
            </div>
        `;
        
        // Hide load more button when no entries
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
        return;
    }
    
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const entriesToShow = filteredEntries.slice(startIndex, endIndex);
    
    entriesToShow.forEach(entry => {
        // Create entry ID for permalink
        const entryId = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const entryElement = document.createElement('article');
        entryElement.id = entryId;
        entryElement.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6';
        
        const difficulty = entry.difficulty || 'medium';
        const difficultyClass = {
            easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }[difficulty] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        
        entryElement.innerHTML = `
            <header class="mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                                ${entry.title}
                            </h2>
                            <span class="difficulty-badge ${difficultyClass} text-sm px-2 py-1 rounded-full">
                                ${difficulty}
                            </span>
                            <button class="copy-link-btn text-gray-400 hover:text-primary transition-colors duration-200" 
                                    title="Copy link to this entry">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                        <time class="text-sm text-gray-500 dark:text-gray-400" datetime="${entry.date}">
                            ${new Date(entry.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </time>
                    </div>
                </div>
            </header>
            <p class="text-gray-600 dark:text-gray-300 mb-4">${entry.content}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${entry.tags ? entry.tags.map(tag => `
                    <span class="tag-pill bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        ${tag}
                    </span>
                `).join('') : ''}
            </div>
            <footer class="flex justify-between items-center mt-4">
                <div class="flex items-center gap-4">
                    <button class="notes-btn text-primary hover:text-primary-dark transition-colors duration-200 flex items-center gap-2 ${entry.notes_md ? '' : 'hidden'}">
                        <i class="fas fa-book-open"></i>
                        <span>Read Notes</span>
                    </button>
                    ${entry.references ? `
                        <div class="references flex flex-col gap-2">
                            ${entry.references.map(ref => `
                                <a href="${ref.url}" target="_blank" rel="noopener noreferrer" 
                                   class="text-gray-500 hover:text-primary transition-colors duration-200 flex items-center gap-2">
                                    <i class="fas fa-external-link-alt"></i>
                                    <span>${ref.title}</span>
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </footer>
        `;
        
        // Add copy link functionality
        const copyBtn = entryElement.querySelector('.copy-link-btn');
        copyBtn.addEventListener('click', () => {
            const url = `${window.location.origin}${window.location.pathname}#${entryId}`;
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-link"></i>';
                }, 2000);
            });
        });
        
        // Add notes button functionality
        const notesBtn = entryElement.querySelector('.notes-btn');
        if (notesBtn && entry.notes_md) {
            notesBtn.addEventListener('click', () => {
                showNotes(entry.notes_path);
            });
        }
        
        entriesContainer.appendChild(entryElement);
    });
    
    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (endIndex < filteredEntries.length) {
            loadMoreBtn.style.display = 'inline-block';
            // Make sure we have the click handler
            loadMoreBtn.onclick = () => {
                currentPage++;
                renderEntries(false);
            };
        } else {
            loadMoreBtn.style.display = 'none';
        }
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
    const closeBtn = document.getElementById('closeNotesModal');
    
    // Setup close handlers
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // Close on button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    try {
        // Add ../ to the path since we're in pages directory
        const fixedPath = `../${notesPath}`;
        const response = await fetch(fixedPath);
        if (!response.ok) throw new Error('Failed to load notes');
        
        const markdownText = await response.text();
        // Configure marked to use Prism.js for syntax highlighting
        marked.setOptions({
            highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            },
            gfm: true,  // GitHub Flavored Markdown
            breaks: true,
            headerIds: true,     // Enable header IDs
            mangle: false,      // Don't mangle header IDs
        });
        
        // Convert markdown to HTML with syntax highlighting
        notesContent.innerHTML = marked.parse(markdownText);
        
        // Highlight any code blocks that were added dynamically
        Prism.highlightAllUnder(notesContent);
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } catch (error) {
        // Show error in UI instead of console
        notesContent.innerHTML = '<p class="text-red-500">Failed to load notes. Please try again later.</p>';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// Initialize the page
async function initializePage() {
    // Set default selections in dropdowns
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    
    if (yearSelect) yearSelect.value = new Date().getFullYear().toString();
    if (monthSelect) {
        const currentMonth = getMonthName(new Date()).toLowerCase();
        updateMonthOptions(new Date().getFullYear().toString(), currentMonth);
        monthSelect.value = currentMonth;
    }

    // Load entries for the current month
    await loadEntriesForYearMonth(new Date().getFullYear().toString(), getMonthName(new Date()).toLowerCase());
    
    // Set up event listeners after initial load
    setupEventListeners();
    setupNotesModal();
}

// Start the page
document.addEventListener('DOMContentLoaded', initializePage);

// ==========================================================
// File: header.js
// Purpose: Consolidates all header-related functionality:
//           dynamically loading HTML partials and managing
//           all interactive features.
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3'; // Your API Key
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    
    // --- Step 1: Define a function to load and inject HTML partials ---
    async function loadPartial(filePath, elementId) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
            }
            const htmlContent = await response.text();
            const placeholder = document.getElementById(elementId);
            if (placeholder) {
                placeholder.innerHTML = htmlContent;
            }
            
            // --- Step 2: After loading, initialize interactive features ---
            if (elementId === 'header-placeholder') {
                initializeHeaderFeatures();
            }
            if (elementId === 'footer-placeholder') {
                updateLastModifiedDate();
            }

        } catch (error) {
            console.error(`Error loading partial for ${elementId}:`, error);
        }
    }

    // --- Step 3: Function to initialize all header features ---
    function initializeHeaderFeatures() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        const accountButton = document.getElementById('accountButton');
        const searchToggleButton = document.getElementById('searchToggleButton');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mainNav = document.querySelector('.main-nav');
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        const searchInput = document.getElementById('searchInput');
        const searchControls = document.querySelector('.input-controls');
        const clearSearchButton = document.getElementById('clearSearchButton');
        const micButton = document.getElementById('micButton');
        const voiceSearchModal = document.getElementById('voiceSearchModal');
        const modalCloseButton = document.getElementById('modalCloseButton');
        const searchSuggestions = document.getElementById('searchSuggestions');
        const searchButton = document.getElementById('searchButton');

        function toggleDropdown(dropdownMenu, toggleButton) {
            const isActive = dropdownMenu.classList.contains('active');
            closeAllDropdowns();
            if (!isActive) {
                dropdownMenu.classList.add('active');
                toggleButton.setAttribute('aria-expanded', 'true');
            } else {
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        }

        function closeAllDropdowns() {
            document.querySelectorAll('.dropdown-menu, .account-dropdown-content').forEach(menu => {
                menu.classList.remove('active');
            });
            document.querySelectorAll('.dropdown-toggle, #accountButton').forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'false');
            });
        }

        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                event.preventDefault();
                const dropdownMenu = document.getElementById(toggle.getAttribute('aria-controls'));
                toggleDropdown(dropdownMenu, toggle);
            });
        });

        accountButton.addEventListener('click', () => {
            const accountDropdown = document.getElementById('accountDropdown');
            toggleDropdown(accountDropdown, accountButton);
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.dropdown, .account-menu, .search-bar-container, .mobile-menu-toggle')) {
                closeAllDropdowns();
            }
        });

        searchToggleButton.addEventListener('click', () => {
            const searchBar = document.getElementById('search-bar-container');
            searchBar.classList.toggle('active');
            closeAllDropdowns();
        });

        searchInput.addEventListener('input', () => {
            if (searchInput.value.length > 0) {
                searchControls.classList.add('active');
            } else {
                searchControls.classList.remove('active');
            }
        });

        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            searchControls.classList.remove('active');
            searchSuggestions.innerHTML = '';
            searchInput.focus();
        });

        micButton.addEventListener('click', () => {
            voiceSearchModal.classList.add('active');
        });

        modalCloseButton.addEventListener('click', () => {
            voiceSearchModal.classList.remove('active');
        });

        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.toggle('light-mode', currentTheme === 'light');
        } else if (!prefersDarkScheme.matches) {
            document.body.classList.add('light-mode');
        }

        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
        });

        mobileMenuToggle.addEventListener('click', () => {
            const isNavOpen = mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', isNavOpen);
            closeAllDropdowns();
        });

        const scrollToTopBtn = document.getElementById('scrollToTopBtn');

        window.onscroll = function() {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        };

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        async function fetchAndPopulateGenres() {
            const genreList = document.getElementById('genresDropdown');
            const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.genres) {
                    data.genres.forEach(genre => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.textContent = genre.name;
                        a.href = `genres.html?genreId=${genre.id}`;
                        a.classList.add('dropdown-link');
                        li.appendChild(a);
                        genreList.appendChild(li);
                    });
                }
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        }
        
        fetchAndPopulateGenres();

        // ==========================================================
        // ENHANCED CODE FOR SEARCH BAR FUNCTIONALITY
        // ==========================================================
        let debounceTimeout;

        async function fetchSearchSuggestions(query) {
            if (query.length < 3) {
                searchSuggestions.innerHTML = '';
                return;
            }

            const url = `${TMDB_BASE_URL}/search/multi?query=${query}&api_key=${API_KEY}`;
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                searchSuggestions.innerHTML = '';
                
                if (data.results && data.results.length > 0) {
                    data.results.slice(0, 5).forEach(result => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        
                        let itemName = '';
                        let mediaType = result.media_type;
                        let href = '#'; // Default href

                        if (mediaType === 'movie' || mediaType === 'tv') {
                            itemName = result.title || result.name;
                            href = `details.html?id=${result.id}&type=${mediaType}`;
                        } else if (mediaType === 'person') {
                            itemName = result.name;
                            href = `cast.html?actorId=${result.id}`; // Correct URL for cast page
                        }
                        
                        if (itemName) {
                            a.textContent = itemName;
                            a.href = href;
                            a.classList.add('suggestion-item');
                            li.appendChild(a);
                            searchSuggestions.appendChild(li);
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching search suggestions:', error);
            }
        }
        
        async function handleSearchSubmit() {
            const query = searchInput.value.trim();
            if (query.length === 0) return;

            const url = `${TMDB_BASE_URL}/search/multi?query=${query}&api_key=${API_KEY}`;
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    const firstResult = data.results[0];
                    let redirectUrl = '';
                    
                    if (firstResult.media_type === 'person') {
                        // Redirect to cast.html with only the actorId
                        redirectUrl = `cast.html?actorId=${firstResult.id}`;
                    } else if (firstResult.media_type === 'movie' || firstResult.media_type === 'tv') {
                        // Redirect to details.html for movies and TV shows
                        redirectUrl = `details.html?id=${firstResult.id}&type=${firstResult.media_type}`;
                    }
                    
                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    } else {
                        console.log('No relevant search results found for the query:', query);
                    }
                } else {
                    console.log('No search results found for the query:', query);
                }
            } catch (error) {
                console.error('Error during search:', error);
            }
        }

        searchInput.addEventListener('keyup', (event) => {
            const query = event.target.value.trim();
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            debounceTimeout = setTimeout(() => {
                fetchSearchSuggestions(query);
            }, 500);
        });

        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearchSubmit();
            }
        });

        searchButton.addEventListener('click', (event) => {
            event.preventDefault();
            handleSearchSubmit();
        });
        
        document.addEventListener('click', (event) => {
            const searchBarContainer = document.querySelector('.search-bar-container');
            if (!searchBarContainer.contains(event.target)) {
                searchSuggestions.innerHTML = '';
            }
        });
    }

    // --- Step 4: Function to handle last modified date ---
    function updateLastModifiedDate() {
        const lastModifiedSpan = document.getElementById('last-modified');
        if (lastModifiedSpan) {
            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            lastModifiedSpan.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    // --- Step 5: Initial calls to load the partials ---
    loadPartial('partials/header.html', 'header-placeholder'); 
    loadPartial('partials/footer.html', 'footer-placeholder');
});
// ==========================================================
// File: header.js
// Purpose: Consolidates all header-related functionality:
//          dynamically loading HTML partials and managing
//          all interactive features.
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

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
            // THIS IS THE CRITICAL PART: This function is called ONLY AFTER
            // the header content has been inserted into the DOM.
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
        
        // New elements for search bar functionality
        const searchInput = document.getElementById('searchInput');
        const searchControls = document.querySelector('.input-controls');
        const clearSearchButton = document.getElementById('clearSearchButton');
        const micButton = document.getElementById('micButton');
        const voiceSearchModal = document.getElementById('voiceSearchModal');
        const modalCloseButton = document.getElementById('modalCloseButton');

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

        // New functionality for search bar input
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
            searchInput.focus(); // Keep focus on the input
        });

        // New functionality for voice search modal
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
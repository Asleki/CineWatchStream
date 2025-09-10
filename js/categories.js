// =====================
// js/categories.js
// =====================

// =====================
// API Configuration
// =====================
const TMDB_API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// =====================
// DOM Elements
// =====================
const categoryTitleEl = document.getElementById('categoryTitle');
const categoryGridEl = document.getElementById('categoryGrid');
const loadingSpinnerEl = document.getElementById('loadingSpinner');
const loadMoreBtnEl = document.getElementById('loadMoreBtn'); // Added Load More button element

// =====================
// Global State for Pagination
// =====================
let currentPage = 1;
let totalPages = 1;
let currentEndpoint = '';
let currentMediaType = '';

// =====================
// Utility Functions
// =====================

/**
 * Fetches data from a specified TMDb API endpoint.
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} params - Optional query parameters.
 * @returns {Promise<object>} The JSON response data.
 */
async function fetchData(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);

    for (const key in params) {
        if (params[key]) {
            url.searchParams.append(key, params[key]);
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching data from TMDb API for ${endpoint}: ${response.status} ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network or API error for TMDb:`, error);
        return null;
    }
}

/**
 * Creates and appends a single show card to the grid.
 * @param {object} show - The show data.
 * @param {HTMLElement} container - The grid container element.
 * @param {string} mediaType - The type of media ('movie' or 'tv').
 */
function createShowCard(show, container, mediaType) {
    if (!show || !show.poster_path) return;

    const card = document.createElement('a');
    card.classList.add('show-card');
    
    // Crucially, this links to details.html and passes the id and type
    card.href = `details.html?id=${show.id}&type=${mediaType}`;
    card.setAttribute('aria-label', `Details for ${show.title || show.name}`);

    const posterUrl = `${TMDB_IMAGE_URL}${show.poster_path}`;
    const title = show.title || show.name;
    const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
    const year = new Date(show.release_date || show.first_air_date).getFullYear();

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="show-rating">${rating}</div>
        <h4 class="show-title">${title}</h4>
        <p class="show-year">${year}</p>
    `;
    container.appendChild(card);
}

/**
 * Populates the category page with content from the API.
 */
async function populateCategoryPage() {
    loadingSpinnerEl.style.display = 'block';

    const urlParams = new URLSearchParams(window.location.search);
    const categoryName = urlParams.get('categoryName');
    const endpoint = urlParams.get('endpoint');
    const mediaType = urlParams.get('type');
    
    // Store values for pagination
    currentEndpoint = endpoint;
    currentMediaType = mediaType;

    if (categoryName && endpoint && mediaType) {
        // Update the page title and header
        categoryTitleEl.textContent = categoryName;
        document.getElementById('pageTitle').textContent = `CineWatch - ${categoryName}`;

        const data = await fetchData(endpoint);

        loadingSpinnerEl.style.display = 'none';

        if (data && data.results && data.results.length > 0) {
            totalPages = data.total_pages; // Get the total number of pages
            data.results.forEach(show => {
                createShowCard(show, categoryGridEl, mediaType);
            });
            // Show the button if there are more pages to load
            if (currentPage < totalPages) {
                loadMoreBtnEl.style.display = 'block';
            }
        } else {
            categoryGridEl.innerHTML = '<p class="error-message">No content available for this category.</p>';
        }
    } else {
        categoryTitleEl.textContent = 'Invalid Category';
        categoryGridEl.innerHTML = '<p class="error-message">Please select a category from the home page.</p>';
        loadingSpinnerEl.style.display = 'none';
    }
}

/**
 * Handles the Load More button click to fetch the next page.
 */
loadMoreBtnEl.addEventListener('click', async () => {
    currentPage++;
    if (currentPage <= totalPages) {
        loadMoreBtnEl.style.display = 'none';
        loadingSpinnerEl.style.display = 'block';

        const data = await fetchData(currentEndpoint, { page: currentPage });
        loadingSpinnerEl.style.display = 'none';

        if (data && data.results) {
            data.results.forEach(show => {
                createShowCard(show, categoryGridEl, currentMediaType);
            });
            if (currentPage < totalPages) {
                loadMoreBtnEl.style.display = 'block';
            }
        }
    }
});

// =====================
// Main Execution
// =====================
document.addEventListener('DOMContentLoaded', populateCategoryPage);
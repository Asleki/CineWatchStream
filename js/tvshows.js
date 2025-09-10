// =====================
// js/tvshows.js
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
const pageHeadingEl = document.getElementById('pageHeading');
const tvShowsGridEl = document.getElementById('tvShowsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const loadingSpinnerEl = document.getElementById('loadingSpinner');
const loadMoreBtnEl = document.getElementById('loadMoreBtn'); // Added element

// =====================
// Global State for Pagination
// =====================
let currentPage = 1;
let totalPages = 1;
let currentEndpoint = '';

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
    url.searchParams.append('page', params.page || 1); // Use page from params, default to 1

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching data for ${endpoint}: ${response.status} ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network or API error:`, error);
        return null;
    }
}

/**
 * Creates and appends a single TV show card to the grid.
 * @param {object} show - The TV show data.
 * @param {HTMLElement} container - The grid container element.
 */
function createShowCard(show, container) {
    if (!show || !show.poster_path) return;

    const card = document.createElement('a');
    card.classList.add('show-card');
    card.href = `details.html?id=${show.id}&type=tv`;
    card.setAttribute('aria-label', `Details for ${show.name}`);

    const posterUrl = `${TMDB_IMAGE_URL}${show.poster_path}`;
    const title = show.name;
    const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
    const year = new Date(show.first_air_date).getFullYear();

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="show-rating">${rating}</div>
        <h4 class="show-title">${title}</h4>
        <p class="show-year">${year}</p>
    `;
    container.appendChild(card);
}

/**
 * Renders the TV show cards to the grid.
 * @param {Array<object>} shows - The list of TV shows to render.
 * @param {boolean} clear - Whether to clear the grid before rendering.
 */
function renderShows(shows, clear = false) {
    if (clear) {
        tvShowsGridEl.innerHTML = '';
    }
    if (!shows || shows.length === 0) {
        if (clear) {
            tvShowsGridEl.innerHTML = '<p class="error-message">No TV shows found for this filter.</p>';
        }
        return;
    }
    shows.forEach(show => {
        createShowCard(show, tvShowsGridEl);
    });
}

/**
 * Handles fetching and rendering TV shows based on the selected filter.
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @param {string} title - The title to display on the page.
 */
async function filterShows(endpoint, title) {
    loadingSpinnerEl.style.display = 'block';
    loadMoreBtnEl.style.display = 'none'; // Hide button while loading
    
    // Reset pagination state and endpoint
    currentPage = 1;
    currentEndpoint = endpoint;
    pageHeadingEl.textContent = title;

    const data = await fetchData(currentEndpoint, { page: currentPage });
    loadingSpinnerEl.style.display = 'none';

    if (data && data.results) {
        totalPages = data.total_pages;
        renderShows(data.results, true); // Clear and render new shows
        if (currentPage < totalPages) {
            loadMoreBtnEl.style.display = 'block';
        }
    } else {
        tvShowsGridEl.innerHTML = '<p class="error-message">Could not load content.</p>';
    }
}

// =====================
// Event Listeners for Filters and Load More
// =====================
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const endpoint = `/tv/${btn.dataset.endpoint}`;
        const title = `${btn.textContent} TV Shows`;
        filterShows(endpoint, title);
    });
});

loadMoreBtnEl.addEventListener('click', async () => {
    currentPage++;
    if (currentPage <= totalPages) {
        loadMoreBtnEl.style.display = 'none';
        loadingSpinnerEl.style.display = 'block';
        
        const data = await fetchData(currentEndpoint, { page: currentPage });
        loadingSpinnerEl.style.display = 'none';

        if (data && data.results) {
            renderShows(data.results, false); // Append new shows
            if (currentPage < totalPages) {
                loadMoreBtnEl.style.display = 'block';
            }
        }
    }
});

// =====================
// Initial Page Load
// =====================
document.addEventListener('DOMContentLoaded', () => {
    filterShows('/tv/popular', 'Popular TV Shows');
});
// =====================
// js/network-details.js
// =====================

// =====================
// API Configuration
// =====================
const TMDB_API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
const TMDB_LOGO_URL = 'https://image.tmdb.org/t/p/h60';

// =====================
// DOM Elements
// =====================
// New Hero Section Elements
const heroSectionEl = document.getElementById('heroSection');
const heroPosterEl = document.getElementById('heroPoster');
const heroShowNameEl = document.getElementById('heroShowName');
const heroNetworkLogoEl = document.getElementById('heroNetworkLogo');
const heroNetworkNameEl = document.getElementById('heroNetworkName');
const heroVisitNetworkBtn = document.getElementById('heroVisitNetworkBtn');
const heroTotalShowsEl = document.getElementById('heroTotalShows');

// Existing DOM Elements for Main Page
const showsContainerEl = document.getElementById('showsContainer');
const loadingSpinnerEl = document.getElementById('loadingSpinner');
const loadMoreBtnEl = document.getElementById('loadMoreBtn');

// =====================
// Global State
// =====================
let currentNetworkId;
let currentPage = 1;
let totalPages = 1;
let allShows = [];
let latestShows = [];
let currentHeroIndex = 0;
let slideshowInterval;

// =====================
// Utility Functions
// =====================
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
 * Creates and returns an HTML element for a show card.
 * @param {object} show - The TV show data.
 * @returns {HTMLElement} The created card element.
 */
function createShowCard(show) {
    const card = document.createElement('a');
    card.classList.add('show-card', 'grid-item');
    card.href = `details.html?id=${show.id}&type=tv`;
    card.setAttribute('aria-label', `Details for ${show.name}`);

    const posterUrl = show.poster_path ? `${TMDB_IMAGE_URL}${show.poster_path}` : 'path/to/placeholder.jpg';
    const title = show.name;
    const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
    const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="show-rating">${rating}</div>
        <h4 class="show-title">${title}</h4>
        <p class="show-year">${year}</p>
    `;

    return card;
}

/**
 * Renders the TV show cards to the container.
 * @param {Array<object>} shows - The list of shows to render.
 * @param {boolean} clear - Whether to clear the container before rendering.
 */
function renderShows(shows, clear = false) {
    if (clear) {
        showsContainerEl.innerHTML = '';
    }
    if (!shows || shows.length === 0) {
        if (clear) {
            showsContainerEl.innerHTML = '<p class="error-message">No TV shows found for this network.</p>';
        }
        return;
    }
    shows.forEach(show => {
        const card = createShowCard(show);
        showsContainerEl.appendChild(card);
    });
}

/**
 * Renders the hero section with a specific show's data.
 * @param {object} show - The show data for the hero.
 * @param {string} networkName - The network's name.
 * @param {string} networkLogoUrl - The network's logo URL.
 * @param {string} networkHomepage - The network's homepage URL.
 * @param {string} totalShows - The total number of shows.
 */
function renderHero(show, networkName, networkLogoUrl, networkHomepage, totalShows) {
    // Set the backdrop
    const backdropUrl = show.backdrop_path ? `${TMDB_BACKDROP_URL}${show.backdrop_path}` : '';
    heroSectionEl.style.backgroundImage = `url('${backdropUrl}')`;

    // Set the poster
    const posterUrl = show.poster_path ? `${TMDB_IMAGE_URL}${show.poster_path}` : 'images/show&movieplaceholder.jpg';
    heroPosterEl.src = posterUrl;
    heroPosterEl.alt = `${show.name} poster`;

    // Set the show name and type
    heroShowNameEl.textContent = show.name;

    // Set network logo and name
    heroNetworkLogoEl.src = networkLogoUrl;
    heroNetworkLogoEl.alt = `${networkName} logo`;

    // Corrected line: Render network name with "Latest from"
    const networkNameSpan = document.createElement('span');
    katex.render(`\\text{Latest from ${networkName}}`, networkNameSpan, {
        throwOnError: false
    });
    heroNetworkNameEl.innerHTML = '';
    heroNetworkNameEl.appendChild(networkNameSpan);
    
    // Set total shows and network homepage link
    heroTotalShowsEl.textContent = `${totalShows} Shows`;
    heroVisitNetworkBtn.href = networkHomepage;
}
/**
 * Fetches the 3 latest shows for the hero section and handles URL parameters.
 */
async function fetchHeroData() {
    const urlParams = new URLSearchParams(window.location.search);
    currentNetworkId = urlParams.get('id');
    const networkLogoUrl = urlParams.get('logo') ? decodeURIComponent(urlParams.get('logo')) : '';
    const networkHomepage = urlParams.get('homepage') ? decodeURIComponent(urlParams.get('homepage')) : '#';
    const totalShows = urlParams.get('total_shows') || 'N/A';
    const networkName = urlParams.get('name') || 'Unknown Network';

    if (!currentNetworkId) {
        heroSectionEl.innerHTML = '<p class="error-message">Network ID not found in URL.</p>';
        loadingSpinnerEl.style.display = 'none';
        return;
    }

    const showsData = await fetchData('/discover/tv', {
        with_networks: currentNetworkId,
        sort_by: 'first_air_date.desc'
    });
    
    if (showsData && showsData.results) {
        latestShows = showsData.results.slice(0, 3);
        if (latestShows.length > 0) {
            renderHero(latestShows[0], networkName, networkLogoUrl, networkHomepage, totalShows);
            
            if (latestShows.length > 1) {
                slideshowInterval = setInterval(() => {
                    currentHeroIndex = (currentHeroIndex + 1) % latestShows.length;
                    renderHero(latestShows[currentHeroIndex], networkName, networkLogoUrl, networkHomepage, totalShows);
                }, 6000);
            }
        } else {
            heroSectionEl.innerHTML = '<p class="error-message">No recent shows found for this network.</p>';
        }
    } else {
        heroSectionEl.innerHTML = '<p class="error-message">Failed to load hero content.</p>';
    }
}

/**
 * Fetches and displays the main list of shows for the network.
 */
async function fetchMainShows(clear = false) {
    loadingSpinnerEl.style.display = 'block';
    loadMoreBtnEl.style.display = 'none';

    // Fetch TV shows for the network
    const showsData = await fetchData('/discover/tv', {
        with_networks: currentNetworkId,
        page: currentPage,
        sort_by: 'popularity.desc'
    });
    
    loadingSpinnerEl.style.display = 'none';

    if (showsData && showsData.results) {
        totalPages = showsData.total_pages;
        if (clear) {
            allShows = showsData.results;
        } else {
            allShows.push(...showsData.results);
        }
        renderShows(showsData.results, clear);
        if (currentPage < totalPages) {
            loadMoreBtnEl.style.display = 'block';
        }
    } else {
        showsContainerEl.innerHTML = '<p class="error-message">Could not load TV shows. Please check the network ID or API key.</p>';
    }
}

// =====================
// Event Listeners
// =====================
loadMoreBtnEl.addEventListener('click', () => {
    currentPage++;
    if (currentPage <= totalPages) {
        fetchMainShows(false);
    }
});

// =====================
// Initial Page Load
// =====================
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentNetworkId = urlParams.get('id');

    if (currentNetworkId) {
        fetchHeroData();
        fetchMainShows(true);
    } else {
        showsContainerEl.innerHTML = '<p class="error-message">Network ID not found in URL.</p>';
    }
});
// =====================
// js/tvnetworks.js
// =====================

// =====================
// API Configuration
// =====================
const TMDB_API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_LOGO_URL = 'https://image.tmdb.org/t/p/h60';

// A curated list of network IDs from your list, with duplicates removed for efficiency.
const NETWORK_IDS = [
    213, 88, 453, 1024, 2, 49, 6, 21, 71, 19, 16, 581, 174, 95, 151, 188, 167, 158, 191
];

// =====================
// DOM Elements
// =====================
const networksGridEl = document.getElementById('networksGrid');
const loadingSpinnerEl = document.getElementById('loadingSpinner');

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
 * Creates and appends a single network card to the grid.
 * @param {object} network - The network data.
 * @param {number} totalShows - The total number of shows for this network.
 * @param {HTMLElement} container - The grid container element.
 */
function createNetworkCard(network, totalShows, container) {
    // Only proceed if network data is valid
    if (!network || !network.id) return;
    
    // Create the logo HTML only if a logo path exists
    const logoUrl = network.logo_path ? `${TMDB_LOGO_URL}${network.logo_path}` : '';
    const encodedLogoUrl = encodeURIComponent(logoUrl);
    const encodedHomepage = encodeURIComponent(network.homepage || '');

    const card = document.createElement('a');
    card.classList.add('network-card');
    // Corrected line: Added the &name parameter
    card.href = `network-details.html?id=${network.id}&logo=${encodedLogoUrl}&homepage=${encodedHomepage}&total_shows=${totalShows}&name=${encodeURIComponent(network.name)}`;
    card.setAttribute('aria-label', `Details for ${network.name}`);

    const logoHtml = network.logo_path ? 
        `<img src="${TMDB_LOGO_URL}${network.logo_path}" alt="${network.name} logo" class="network-logo" loading="lazy">` : '';
    
    // Fallback values for missing data
    const headquarters = network.headquarters || 'N/A';
    const homepageText = network.homepage ? new URL(network.homepage).hostname : 'N/A';

    card.innerHTML = `
        ${logoHtml}
        <div class="card-body">
            <h4 class="network-title">${network.name}</h4>
            <p class="network-location"><i class="fas fa-map-marker-alt"></i>${headquarters}</p>
            <p class="network-homepage"><i class="fas fa-home"></i><a href="${network.homepage}" target="_blank" rel="noopener noreferrer">${homepageText}</a></p>
        </div>
    `;
    container.appendChild(card);
}

/**
 * Fetches network details and show count, then populates the page.
 */
async function populateNetworksPage() {
    loadingSpinnerEl.style.display = 'block';
    
    // Fetch details and total show count for all networks concurrently
    const promises = NETWORK_IDS.map(id => 
        Promise.all([
            fetchData(`/network/${id}`),
            fetchData('/discover/tv', { with_networks: id })
        ])
    );

    const allNetworkData = await Promise.all(promises);
    loadingSpinnerEl.style.display = 'none';

    if (allNetworkData.length > 0) {
        allNetworkData.forEach(([network, showsData]) => {
            if (network) {
                const totalShows = showsData ? showsData.total_results : 0;
                createNetworkCard(network, totalShows, networksGridEl);
            }
        });
        
        if (networksGridEl.childElementCount === 0) {
            networksGridEl.innerHTML = '<p class="error-message">Could not load network details for any of the curated networks.</p>';
        }
    } else {
        networksGridEl.innerHTML = '<p class="error-message">Could not load any network information. Please check your API key or network connection.</p>';
    }
}

// =====================
// Main Execution
// =====================
document.addEventListener('DOMContentLoaded', populateNetworksPage);
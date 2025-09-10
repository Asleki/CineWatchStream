// =====================
// js/details.js
// =====================
// This script is dedicated to fetching detailed information for a single movie or TV show
// from both the TMDb and OMDB APIs, populating the details.html page, and handling
// related interactive features like trailers, cast navigation, and dynamic content loading.

// =====================
// API Configuration
// =====================
const TMDB_API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3'; // Your TMDb API key
const OMDB_API_KEY = 'e195a3b0'; // Your OMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
const TMDB_PROFILE_URL = 'https://image.tmdb.org/t/p/w185';

// =====================
// DOM Elements
// =====================
const detailsPageHero = document.getElementById('details-page-hero');
const showPoster = document.getElementById('show-poster');
const showTitle = document.getElementById('show-title');
const showSynopsis = document.getElementById('show-synopsis');
const showDetailsContainer = document.getElementById('show-details-container');
const awardsContainer = document.getElementById('awards-container');
const playTrailerBtn = document.getElementById('play-trailer-btn');
const castContainer = document.getElementById('cast-container');
const statusContainer = document.getElementById('status-container');
const reviewsContainer = document.getElementById('review-container');
const recommendationsContainer = document.getElementById('recommendations-carousel');
const trailerModal = document.getElementById('trailer-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

// =====================
// Utility Functions
// =====================

/**
 * Fetches data from a specified API endpoint.
 * @param {string} api - 'tmdb' or 'omdb'.
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} params - Optional query parameters.
 * @returns {Promise<object>} The JSON response data.
 */
async function fetchData(api, endpoint, params = {}) {
    let url;
    if (api === 'tmdb') {
        url = new URL(`${TMDB_BASE_URL}${endpoint}`);
        url.searchParams.append('api_key', TMDB_API_KEY);
    } else if (api === 'omdb') {
        url = new URL(`${OMDB_BASE_URL}`);
        url.searchParams.append('apikey', OMDB_API_KEY);
    } else {
        console.error('Invalid API specified:', api);
        return null;
    }
    
    for (const key in params) {
        if (params[key]) {
            url.searchParams.append(key, params[key]);
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching data from ${api} API for ${endpoint}: ${response.status} ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network or API error for ${api}:`, error);
        return null;
    }
}

/**
 * Updates the SEO-related meta tags in the document head.
 * @param {object} tmdbData - The primary data object from TMDb.
 * @param {object} omdbData - The secondary data object from OMDB.
 */
function updateSEO(tmdbData, omdbData) {
    const title = tmdbData.title || tmdbData.name || 'CineWatch';
    const tagline = omdbData?.Awards ? ` | Awards: ${omdbData.Awards}` : '';
    const description = tmdbData.overview || 'A comprehensive guide to movies and TV shows.';
    const posterUrl = `${TMDB_IMAGE_URL}${tmdbData.poster_path}`;
    const url = window.location.href;

    // Standard meta tags
    document.getElementById('pageTitle').textContent = `CineWatch - ${title}`;
    document.getElementById('metaDescription').setAttribute('content', description);
    document.getElementById('metaKeywords').setAttribute('content', `${title}, ${tmdbData.genres.map(g => g.name).join(', ')}, ${omdbData?.Actors}, CineWatch`);

    // Open Graph (Social Media) tags
    document.getElementById('ogTitle').setAttribute('content', `${title}${tagline}`);
    document.getElementById('ogDescription').setAttribute('content', description);
    document.getElementById('ogUrl').setAttribute('content', url);
    document.getElementById('ogImage').setAttribute('content', posterUrl);
    document.getElementById('ogImageAlt').setAttribute('content', `${title} Poster`);
    
    // Twitter Card tags
    document.getElementById('twitterTitle').setAttribute('content', `${title}${tagline}`);
    document.getElementById('twitterDescription').setAttribute('content', description);
    document.getElementById('twitterImage').setAttribute('content', posterUrl);

    document.getElementById('canonicalUrl').setAttribute('href', url);
}

// =====================
// Population Functions
// =====================

/**
 * Creates a detailed show card for the recommendations carousel.
 * @param {object} show - The show object from the API.
 * @param {HTMLElement} container - The container to append the card to.
 */
function createRecommendationCard(show, container) {
    if (!show || !show.poster_path) return;

    const card = document.createElement('a');
    card.href = `details.html?id=${show.id}&mediaType=${show.media_type}`;
    card.classList.add('show-card');
    card.setAttribute('aria-label', `Details for ${show.title || show.name}`);

    const poster = document.createElement('img');
    poster.src = `${TMDB_IMAGE_URL}${show.poster_path}`;
    poster.alt = show.title || show.name;
    poster.loading = 'lazy';
    poster.onerror = () => {
        poster.src = 'images/placeholder-poster.png'; // Fallback image
        poster.alt = 'Image not available';
    };

    const rating = document.createElement('div');
    rating.classList.add('show-rating');
    const voteAverage = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
    rating.textContent = voteAverage;

    const title = document.createElement('h4');
    title.classList.add('show-title');
    title.textContent = show.title || show.name;

    card.appendChild(poster);
    card.appendChild(rating);
    card.appendChild(title);
    container.appendChild(card);
}

/**
 * Populates the main hero section with show details.
 * @param {object} tmdbData - The TMDB show data.
 * @param {object} omdbData - The OMDB show data.
 */
function populateHeroSection(tmdbData, omdbData) {
    // Set backdrop image
    if (tmdbData.backdrop_path) {
        detailsPageHero.style.backgroundImage = `url(${TMDB_BACKDROP_URL}${tmdbData.backdrop_path})`;
    } else {
        detailsPageHero.style.backgroundImage = `url('https://placehold.co/1920x1080/282828/f0f0f0?text=Backdrop+Not+Available')`;
    }

    // Set poster image
    if (tmdbData.poster_path) {
        showPoster.src = `${TMDB_IMAGE_URL}${tmdbData.poster_path}`;
    } else {
        showPoster.src = 'images/placeholder-poster.png';
    }
    showPoster.alt = tmdbData.title || tmdbData.name;

    // Set title and synopsis
    showTitle.textContent = tmdbData.title || tmdbData.name;
    showSynopsis.textContent = tmdbData.overview || 'No synopsis available.';

    // Populate details section with TMDB and OMDB data
    const detailsHtml = `
        <div class="details-section-row">
            <i class="fas fa-calendar-alt"></i>
            <span>${(tmdbData.release_date || tmdbData.first_air_date || 'N/A').split('-')[0]}</span>
        </div>
        <div class="details-section-row">
            <i class="fas fa-clock"></i>
            <span>${tmdbData.runtime ? `${tmdbData.runtime} min` : tmdbData.episode_run_time ? `${tmdbData.episode_run_time[0]} min` : 'N/A'}</span>
        </div>
        <div class="details-section-row">
            <i class="fas fa-tag"></i>
            <span>${tmdbData.genres.map(g => g.name).join(', ') || 'N/A'}</span>
        </div>
        <div class="details-section-row">
            <i class="fas fa-globe"></i>
            <span>${tmdbData.original_language.toUpperCase() || 'N/A'}</span>
        </div>
    `;
    showDetailsContainer.innerHTML = detailsHtml;
    
    // Add ratings from OMDB
    if (omdbData && omdbData.Ratings) {
        const ratingsHtml = omdbData.Ratings.map(rating => {
            return `
                <div class="details-section-row">
                    <i class="fas fa-star" style="color: var(--rating-star-filled);"></i>
                    <span>${rating.Source}: ${rating.Value}</span>
                </div>
            `;
        }).join('');
        showDetailsContainer.innerHTML += ratingsHtml;
    }


    // Add network logos if available
    const networksHtml = tmdbData.networks?.length ? tmdbData.networks.map(network => {
        if (network.logo_path) {
            return `<div class="network-badge"><img src="${TMDB_IMAGE_URL}${network.logo_path}" alt="${network.name} logo"></div>`;
        }
        return `<div class="network-badge">${network.name}</div>`;
    }).join('') : '';
    showDetailsContainer.innerHTML += networksHtml;


    // Add awards from OMDB
    if (omdbData && omdbData.Awards && omdbData.Awards !== 'N/A') {
        const awardsHtml = `<div class="details-section-row awards-section"><span>${omdbData.Awards}</span></div>`;
        awardsContainer.innerHTML = awardsHtml;
    }
} // This is the misplaced brace that causes the syntax error. The functions below this should not be outside the main execution block.

/**
 * Populates the cast section.
 * @param {string} mediaType - 'movie' or 'tv'.
 * @param {string} showId - The show ID.
 * @param {string} backdropPath - The show's backdrop URL for the cast page.
 */
async function populateCast(mediaType, showId, backdropPath) {
    const spinner = document.getElementById('spinnerCast');
    if (spinner) spinner.style.display = 'block';

    const castData = await fetchData('tmdb', `/${mediaType}/${showId}/credits`);
    if (spinner) spinner.style.display = 'none';

    if (castData && castData.cast) {
        castData.cast.slice(0, 10).forEach(member => { // Limit to 10 main cast members
            if (!member.profile_path) return;
            const card = document.createElement('a');
            card.href = `CineWatch-cast.html?actorId=${member.id}&backdrop=${backdropPath}`;
            card.classList.add('card');
            card.innerHTML = `
                <img src="${TMDB_PROFILE_URL}${member.profile_path}" alt="${member.name}">
                <h4>${member.name}</h4>
                <p>${member.character}</p>
            `;
            castContainer.appendChild(card);
        });
    } else {
        castContainer.innerHTML = '<p class="error-message">Cast information not available.</p>';
    }
}

/**
 * Populates the status section based on media type.
 * @param {object} tmdbData - The TMDB show data.
 */
function populateStatus(tmdbData) {
    const statusHeader = document.getElementById('status-header');
    const statusText = document.getElementById('status-text');
    const seasonsContainer = document.getElementById('seasons-container');

    statusText.textContent = tmdbData.status || 'N/A';
    if (tmdbData.media_type === 'movie') {
        // Movies just need the status
        seasonsContainer.style.display = 'none';
    } else if (tmdbData.media_type === 'tv' && tmdbData.seasons) {
        // TV shows need seasons
        statusHeader.innerHTML += `<button id="seasons-btn" class="main-btn">Seasons</button>`;
        const seasonsBtn = document.getElementById('seasons-btn');
        seasonsBtn.addEventListener('click', () => {
            seasonsContainer.innerHTML = '';
            tmdbData.seasons.forEach(season => {
                if (!season.poster_path) return;
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <img src="${TMDB_IMAGE_URL}${season.poster_path}" alt="${season.name}">
                    <div class="overlay">${season.name}</div>
                `;
                seasonsContainer.appendChild(card);
                // Add event listener to dynamically load episodes
                card.addEventListener('click', () => loadEpisodes(tmdbData.id, season.season_number));
            });
        });
    }
    document.getElementById('spinnerStatus').style.display = 'none';
}

/**
 * Loads and displays episodes for a selected season.
 * @param {number} showId - The TV show ID.
 * @param {number} seasonNumber - The season number.
 */
async function loadEpisodes(showId, seasonNumber) {
    const seasonDetails = document.getElementById('season-details');
    seasonDetails.innerHTML = '<div class="spinner-small"></div>';

    const episodesData = await fetchData('tmdb', `/tv/${showId}/season/${seasonNumber}`);

    if (episodesData && episodesData.episodes) {
        seasonDetails.innerHTML = `
            <h3>Season ${seasonNumber} Episodes</h3>
            <div class="grid-container episodes-grid"></div>
        `;
        const episodesGrid = seasonDetails.querySelector('.episodes-grid');
        episodesData.episodes.forEach(episode => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${TMDB_IMAGE_URL}${episode.still_path}" alt="${episode.name}">
                <h4>${episode.episode_number}. ${episode.name}</h4>
                <p>${episode.overview || 'No overview available.'}</p>
            `;
            episodesGrid.appendChild(card);
        });
    } else {
        seasonDetails.innerHTML = '<p class="error-message">Episodes not available.</p>';
    }
}

/**
 * Populates the reviews section.
 * @param {string} mediaType - 'movie' or 'tv'.
 * @param {string} showId - The show ID.
 */
async function populateReviews(mediaType, showId) {
    const spinner = document.getElementById('spinnerReviews');
    if (spinner) spinner.style.display = 'block';

    const reviewsData = await fetchData('tmdb', `/${mediaType}/${showId}/reviews`);
    if (spinner) spinner.style.display = 'none';

    const reviewsCount = document.getElementById('review-count');
    reviewsCount.textContent = `(${reviewsData?.total_results || 0})`;

    const reviewContainer = document.getElementById('review-container');

    if (reviewsData && reviewsData.results && reviewsData.results.length > 0) {
        const review = reviewsData.results[0]; // Display the first review
        const content = review.content;
        const truncatedContent = content.length > 300 ? `${content.substring(0, 300)}...` : content;
        
        const reviewHtml = `
            <div class="review-summary">
                <h4>A review by ${review.author}</h4>
                <p class="review-meta">
                    ${review.author_details.rating ? `<i class="fas fa-star"></i> ${review.author_details.rating}` : ''} |
                    Posted on ${new Date(review.created_at).toLocaleDateString()}
                </p>
                <p id="review-text">${truncatedContent}</p>
                ${content.length > 300 ? `<button id="read-more-btn" class="read-more-btn">Read the rest</button>` : ''}
            </div>
        `;
        reviewContainer.innerHTML = reviewHtml;

        const readMoreBtn = document.getElementById('read-more-btn');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', () => {
                document.getElementById('review-text').textContent = content;
                readMoreBtn.style.display = 'none';
            });
        }
    } else {
        reviewContainer.innerHTML = '<p class="error-message">No reviews available.</p>';
    }
}

/**
 * Populates the recommendations section.
 * @param {string} mediaType - 'movie' or 'tv'.
 * @param {string} showId - The show ID.
 */
async function populateRecommendations(mediaType, showId) {
    const spinner = document.getElementById('spinnerRecommendations');
    if (spinner) spinner.style.display = 'block';

    const recommendationsData = await fetchData('tmdb', `/${mediaType}/${showId}/recommendations`);
    if (spinner) spinner.style.display = 'none';

    if (recommendationsData && recommendationsData.results && recommendationsData.results.length > 0) {
        recommendationsData.results.slice(0, 10).forEach(show => {
            show.media_type = mediaType;
            createRecommendationCard(show, recommendationsContainer);
        });
    } else {
        recommendationsContainer.innerHTML = '<p class="error-message">No recommendations available.</p>';
    }
}

/**
 * Opens a modal with a video carousel.
 * @param {string} mediaType - 'movie' or 'tv'.
 * @param {string} showId - The show ID.
 */
async function openTrailerModal(mediaType, showId) {
    const trailerCarousel = document.getElementById('trailer-carousel');
    trailerCarousel.innerHTML = '<div class="spinner"></div>';
    trailerModal.style.display = 'flex';

    const videosData = await fetchData('tmdb', `/${mediaType}/${showId}/videos`);
    
    if (videosData && videosData.results && videosData.results.length > 0) {
        trailerCarousel.innerHTML = '';
        videosData.results.forEach(video => {
            if (video.site === 'YouTube') {
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${video.key}`;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                trailerCarousel.appendChild(iframe);
            }
        });
    } else {
        trailerCarousel.innerHTML = '<p class="error-message">No trailers or videos available.</p>';
    }
}


// =====================
// Main Execution
// =====================

document.addEventListener('DOMContentLoaded', async () => {
    // Get show ID and media type from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get('id');
    const mediaType = urlParams.get('type');
    
    if (!showId || !mediaType) {
        console.error('Missing show ID or media type in URL.');
        showTitle.textContent = 'Error: No content specified.';
        return;
    }

    try {
        // Fetch primary data from TMDb
        const tmdbData = await fetchData('tmdb', `/${mediaType}/${showId}`);
        if (!tmdbData) throw new Error('Failed to fetch TMDb data.');
        
        // Use TMDB's IMDb ID to fetch data from OMDB
        const omdbData = await fetchData('omdb', '', { i: tmdbData.imdb_id });
        
        // Populate all sections
        populateHeroSection(tmdbData, omdbData);
        populateCast(mediaType, showId, tmdbData.backdrop_path);
        populateStatus(tmdbData);
        populateReviews(mediaType, showId);
        populateRecommendations(mediaType, showId);
        updateSEO(tmdbData, omdbData);
        
        // Event listener for play trailer button
        if (playTrailerBtn) {
            playTrailerBtn.addEventListener('click', () => openTrailerModal(mediaType, showId));
        }

        // Event listener for closing modal
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                trailerModal.style.display = 'none';
                const iframe = document.querySelector('#trailer-carousel iframe');
                if (iframe) iframe.src = iframe.src; // Stop the video
            });
        }

    } catch (error) {
        console.error('Error in main execution:', error);
        showTitle.textContent = 'Error: Failed to load content.';
    }

    
});
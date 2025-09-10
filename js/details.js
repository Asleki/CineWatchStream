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
    const description = tmdbData.overview || 'A comprehensive guide to movies and TV shows.';
    const posterUrl = `${TMDB_IMAGE_URL}${tmdbData.poster_path}`;
    const url = window.location.href;

    // Standard meta tags
    document.getElementById('pageTitle').textContent = `CineWatch - ${title}`;
    document.getElementById('metaDescription').setAttribute('content', description);
    document.getElementById('metaKeywords').setAttribute('content', `${title}, ${tmdbData.genres.map(g => g.name).join(', ')}, ${omdbData?.Actors}, CineWatch`);

    // Open Graph (Social Media) tags
    document.getElementById('ogTitle').setAttribute('content', title);
    document.getElementById('ogDescription').setAttribute('content', description);
    document.getElementById('ogUrl').setAttribute('content', url);
    document.getElementById('ogImage').setAttribute('content', posterUrl);
    document.getElementById('ogImageAlt').setAttribute('content', `${title} Poster`);
    
    // Twitter Card tags
    document.getElementById('twitterTitle').setAttribute('content', title);
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
 * @param {string} mediaType - 'movie' or 'tv'.
 */
function populateHeroSection(tmdbData, omdbData, mediaType) {
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
    let detailsHtml = `
        <div class="details-section-row">
            <i class="fas fa-calendar-alt"></i>
            <span>${(tmdbData.release_date || tmdbData.first_air_date || 'N/A').split('-')[0]}</span>
        </div>
    `;

    // Add runtime only if it is a movie
    if (mediaType === 'movie') {
        detailsHtml += `
            <div class="details-section-row">
                <i class="fas fa-clock"></i>
                <span>${tmdbData.runtime ? `${tmdbData.runtime} min` : 'N/A'}</span>
            </div>
        `;
    }
    
    detailsHtml += `
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
}
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
 * For TV shows, it provides a link to a separate seasons page.
 * @param {object} tmdbData - The TMDB show data.
 * @param {string} mediaType - The media type from the URL.
 */
function populateStatus(tmdbData, mediaType) {
    const statusHeader = document.getElementById('status-header');
    const statusText = document.getElementById('status-text');
    const seasonsContainer = document.getElementById('seasons-container');
    const spinnerStatus = document.getElementById('spinnerStatus');

    statusText.textContent = tmdbData.status || 'N/A';
    if (mediaType === 'movie') {
        // Movies just need the status
        seasonsContainer.style.display = 'none';
    } else if (mediaType === 'tv' && tmdbData.seasons) {
        // For TV shows, create a link to the seasons page
        const seasonsLink = document.createElement('a');
        seasonsLink.id = 'seasons-btn';
        seasonsLink.classList.add('main-btn');
        seasonsLink.textContent = 'Seasons';
        seasonsLink.href = `CineWatch-seasons.html?id=${tmdbData.id}&type=${mediaType}`;
        statusHeader.appendChild(seasonsLink);

        // Hide the seasons grid as it is no longer used
        seasonsContainer.style.display = 'none';
    }

    // Hide the spinner once the status has been populated
    if (spinnerStatus) {
        spinnerStatus.style.display = 'none';
    }
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
        const truncatedContent = content.length > 300 ? `${content.substring(0, 0)}...` : content;
        
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
            const reviewTextElement = document.getElementById('review-text');

            readMoreBtn.addEventListener('click', () => {
                if (reviewTextElement.textContent.includes('...')) {
                    // Expand the text
                    reviewTextElement.textContent = content;
                    readMoreBtn.textContent = 'Read less';
                } else {
                    // Truncate the text
                    reviewTextElement.textContent = `${content.substring(0, 300)}...`;
                    readMoreBtn.textContent = 'Read the rest';
                }
            });
        }
    } else {
        reviewContainer.innerHTML = '<p class="error-message">No reviews available.</p>';
    }

    // Add "Read All Reviews" button if there's more than one review
    if (reviewsData && reviewsData.total_results > 1) {
        const readAllBtn = document.createElement('a');
        readAllBtn.id = 'read-all-reviews-btn';
        readAllBtn.classList.add('main-btn');
        readAllBtn.textContent = 'Read All Reviews';
        readAllBtn.href = `CineWatch-reviews.html?id=${showId}&type=${mediaType}`;
        reviewContainer.appendChild(readAllBtn);
    }
}

/**
 * Populates the recommendations section.
 * @param {string} mediaType - 'movie' or 'tv'.
 * @param {string} showId - The show ID.
 */
async function populateRecommendations(mediaType, showId) {
    // Correctly reference the HTML elements
    const spinner = document.getElementById('spinnerRecommendations');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const recommendationsCarousel = document.getElementById('recommendations-carousel');

    if (spinner) spinner.style.display = 'block';

    const recommendationsData = await fetchData('tmdb', `/${mediaType}/${showId}/recommendations`);

    // Fix: Hide the spinner regardless of the outcome
    if (spinner) spinner.style.display = 'none';

    if (recommendationsData && recommendationsData.results && recommendationsData.results.length > 0) {
        recommendationsData.results.slice(0, 10).forEach(show => {
            show.media_type = mediaType;
            createRecommendationCard(show, recommendationsCarousel);
        });
    } else {
        recommendationsContainer.innerHTML = '<p class="error-message">No recommendations available.</p>';
    }
}
/**
 * Populates the recommendations section.
 * @param {string} mediaType - 'movie' or 'tv'.
 * @param {string} showId - The show ID.
 */
async function populateRecommendations(mediaType, showId) {
    const spinner = document.getElementById('spinnerRecommendations');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const recommendationsCarousel = document.getElementById('recommendations-carousel');
    
    if (spinner) spinner.style.display = 'block';

    const recommendationsData = await fetchData('tmdb', `/${mediaType}/${showId}/recommendations`);

    if (spinner) spinner.style.display = 'none';

    if (recommendationsData && recommendationsData.results && recommendationsData.results.length > 0) {
        recommendationsData.results.slice(0, 10).forEach(show => {
            show.media_type = mediaType;
            createRecommendationCard(show, recommendationsCarousel);
        });
        
        // After populating, set up the navigation buttons
        setupCarouselNavigation();
    } else {
        recommendationsContainer.innerHTML = '<p class="error-message">No recommendations available.</p>';
    }
}

// Sets up the functionality for the carousel navigation buttons
function setupCarouselNavigation() {
    const carousel = document.getElementById('recommendations-container');
    const prevBtn = document.getElementById('prev-recommendations');
    const nextBtn = document.getElementById('next-recommendations');

    if (carousel && prevBtn && nextBtn) {
        // Scroll the carousel to the left
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: -200, // You can adjust this value
                behavior: 'smooth'
            });
        });

        // Scroll the carousel to the right
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: 200, // You can adjust this value
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Creates and appends a single recommendation card to the carousel.
 * @param {object} show - The show data.
 * @param {HTMLElement} container - The carousel container element.
 */
function createRecommendationCard(show, container) {
    const card = document.createElement('a');
    card.classList.add('show-card');
    card.href = `details.html?id=${show.id}&type=${show.media_type}`;
    
    // Check for a valid poster image
    const posterUrl = show.poster_path 
        ? `${TMDB_IMAGE_URL}${show.poster_path}` 
        : 'https://via.placeholder.com/300x450.png?text=No+Image';

    // Get the title and year
    const title = show.title || show.name;
    const year = show.release_date || show.first_air_date ? new Date(show.release_date || show.first_air_date).getFullYear() : null;

    // Conditionally display the year if it exists and is not NaN
    const yearHtml = year && !isNaN(year) ? `<p>${year}</p>` : '';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x450.png?text=Image+Error';">
        <div class="card-info">
            <h4>${title}</h4>
            ${yearHtml}
        </div>
    `;

    container.appendChild(card);
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
    
    // Clear the spinner
    trailerCarousel.innerHTML = '';
    
    if (videosData && videosData.results && videosData.results.length > 0) {
        // Filter for YouTube trailers and other clips
        const trailers = videosData.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
        const clips = videosData.results.filter(video => video.type !== 'Trailer' && video.site === 'YouTube');
        const allVideos = [...trailers, ...clips];
        
        // Logic for single trailer vs. multiple videos
        if (allVideos.length === 1) {
            // If only one video, embed it directly
            const video = allVideos[0];
            trailerCarousel.innerHTML = `
                <div class="video-player-single">
                    <iframe 
                        src="https://www.youtube.com/embed/${video.key}?autoplay=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        title="${video.name}"
                    ></iframe>
                </div>
            `;
        } else if (allVideos.length > 1) {
            // If multiple videos, create a scrollable grid
            allVideos.forEach(video => {
                createVideoCard(video, trailerCarousel);
            });
        }
    } else {
        trailerCarousel.innerHTML = '<p class="error-message">No trailers or videos available.</p>';
    }
}

/**
 * Creates a video card for a modal carousel.
 * @param {object} video - The video data from TMDB.
 * @param {HTMLElement} container - The container to append the card to.
 */
function createVideoCard(video, container) {
    const videoCard = document.createElement('div');
    videoCard.classList.add('video-card');
    
    videoCard.innerHTML = `
        <div class="thumbnail-wrapper">
            <img src="https://img.youtube.com/vi/${video.key}/mqdefault.jpg" alt="${video.name}" class="video-thumbnail">
            <i class="fas fa-play-circle play-icon"></i>
        </div>
        <div class="video-info">
            <h4>${video.name}</h4>
            <p>${video.type}</p>
        </div>
    `;

    // Add click event to play the video in the modal
    videoCard.addEventListener('click', () => {
        container.innerHTML = `
            <div class="video-player">
                <iframe 
                    src="https://www.youtube.com/embed/${video.key}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    title="${video.name}"
                ></iframe>
            </div>
        `;
    });
    
    container.appendChild(videoCard);
}

// Event listeners to handle the modal's open and close states
if (playTrailerBtn) {
    playTrailerBtn.addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const mediaType = urlParams.get('type');
        const showId = urlParams.get('id');
        openTrailerModal(mediaType, showId);
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        trailerModal.style.display = 'none';
        const iframe = trailerModal.querySelector('iframe');
        if (iframe) {
            iframe.src = ''; // Stop the video from playing in the background
        }
    });
}

// Close the modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === trailerModal) {
        trailerModal.style.display = 'none';
        const iframe = trailerModal.querySelector('iframe');
        if (iframe) {
            iframe.src = '';
        }
    }
});

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
        populateCast(mediaType, showId, tmdbData.backdrop_path);
        populateStatus(tmdbData, mediaType); 
        populateReviews(mediaType, showId);
        populateRecommendations(mediaType, showId);
        updateSEO(tmdbData, omdbData);
        populateHeroSection(tmdbData, omdbData, mediaType);
        
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
    // Inside the DOMContentLoaded event listener, after your other code...

    const navButtons = document.querySelectorAll('.nav-button');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Prevent default button behavior
            e.preventDefault();

            // Get the ID of the section to scroll to from the data attribute
            const sectionId = button.dataset.section;
            const targetSection = document.getElementById(sectionId);

            if (targetSection) {
                // Scroll to the target section smoothly
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    const spinnerStatus = document.getElementById('spinnerStatus');
    if (spinnerStatus) {
        spinnerStatus.style.display = 'none';
    }

    // Scroll-to-top button functionality (if you choose to keep it)
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });
    }
});
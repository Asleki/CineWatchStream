// =====================
// js/trailers.js
// =====================

const TMDB_API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YOUTUBE_THUMBNAIL_URL = 'https://img.youtube.com/vi';

// DOM Elements
const trailersGridContainer = document.getElementById('trailers-grid-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterBarIndicator = document.getElementById('filter-bar-indicator');
const trailerModal = document.getElementById('trailerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const trailerIframe = document.getElementById('trailerIframe');


/**
 * Updates the position and width of the filter bar indicator.
 * @param {HTMLElement} activeButton - The currently active filter button.
 */
function updateFilterIndicator(activeButton) {
    if (activeButton) {
        filterBarIndicator.style.width = `${activeButton.offsetWidth}px`;
        filterBarIndicator.style.transform = `translateX(${activeButton.offsetLeft}px)`;
    }
}


/**
 * Fetches data from a specified TMDb endpoint.
 * @param {string} endpoint - The API endpoint to call.
 * @returns {Promise<object>} The JSON response data.
 */
async function fetchData(endpoint) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    url.searchParams.append('language', 'en-US');

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Network or API error:', error);
        return null;
    }
}

/**
 * Creates and appends a single trailer card to the grid.
 * @param {object} video - The video object from the API.
 * @param {object} show - The parent movie/show object.
 */
function createTrailerCard(video, show) {
    if (!video.key) return;

    const card = document.createElement('div');
    card.classList.add('trailer-card');
    card.setAttribute('data-video-key', video.key);
    card.setAttribute('data-video-name', video.name);
    card.setAttribute('aria-label', `Watch ${video.name}`);

    // Create the trailer thumbnail
    const thumbnailWrapper = document.createElement('div');
    thumbnailWrapper.classList.add('trailer-thumbnail-wrapper');
    const thumbnail = document.createElement('img');
    thumbnail.src = `${YOUTUBE_THUMBNAIL_URL}/${video.key}/maxresdefault.jpg`;
    thumbnail.alt = `Thumbnail for ${video.name}`;
    thumbnail.classList.add('trailer-thumbnail');
    thumbnail.loading = 'lazy';
    thumbnail.onerror = () => {
        thumbnail.src = `${YOUTUBE_THUMBNAIL_URL}/${video.key}/hqdefault.jpg`;
    };

    const playIcon = document.createElement('i');
    playIcon.classList.add('fas', 'fa-play-circle', 'play-icon');
    thumbnailWrapper.appendChild(thumbnail);
    thumbnailWrapper.appendChild(playIcon);

    // Create the info section
    const info = document.createElement('div');
    info.classList.add('trailer-info');
    const showName = document.createElement('h4');
    showName.textContent = show.title || show.name;
    const trailerTitle = document.createElement('p');
    trailerTitle.textContent = video.name;
    info.appendChild(showName);
    info.appendChild(trailerTitle);

    card.appendChild(thumbnailWrapper);
    card.appendChild(info);
    trailersGridContainer.appendChild(card);
    
    // Add click event to open the modal
    card.addEventListener('click', () => {
        trailerIframe.src = `https://www.youtube.com/embed/${video.key}?autoplay=1`;
        trailerModal.style.display = 'flex';
    });
}

/**
 * Fetches the list of shows and then their trailers.
 * @param {string} filter - The API endpoint fragment for the filter.
 */
async function loadTrailers(filter) {
    trailersGridContainer.innerHTML = '<div class="spinner"></div>';

    let mediaType = 'movie';
    let endpoint = `/movie/${filter}`;

    if (filter === 'on_the_air') {
        mediaType = 'tv';
        endpoint = `/tv/${filter}`;
    }

    const showsData = await fetchData(endpoint);

    if (showsData && showsData.results.length > 0) {
        trailersGridContainer.innerHTML = '';

        const showsToProcess = showsData.results.slice(0, 10);
        
        for (const show of showsToProcess) {
            const videosData = await fetchData(`/${mediaType}/${show.id}/videos`);
            
            if (videosData && videosData.results.length > 0) {
                const trailer = videosData.results.find(v => v.type.toLowerCase() === 'trailer' && v.site === 'YouTube');
                
                if (trailer) {
                    createTrailerCard(trailer, show);
                }
            }
        }
        
        if (trailersGridContainer.children.length === 0) {
            trailersGridContainer.innerHTML = '<p class="error-message">No trailers found for this category.</p>';
        }

    } else {
        trailersGridContainer.innerHTML = '<p class="error-message">No content found for this category.</p>';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load for the 'Popular' filter
    loadTrailers('popular');
    
    // Initial position of the filter bar indicator
    const initialButton = document.querySelector('.filter-btn.active');
    if (initialButton) {
        updateFilterIndicator(initialButton);
    }

    // Add click listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateFilterIndicator(e.target);
            const filterType = e.target.dataset.filter;
            loadTrailers(filterType);
        });
    });

    // Close the modal when clicking the close button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            trailerModal.style.display = 'none';
            trailerIframe.src = ''; // Stop the video
        });
    }

    // Close the modal when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target === trailerModal) {
            trailerModal.style.display = 'none';
            trailerIframe.src = '';
        }
    });

});
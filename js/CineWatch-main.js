// =====================
// js/CineWatch-main.js
// =====================
// This script is dedicated to fetching and populating movie and TV show data
// from the TMDb API onto the homepage of the CineWatch website.
// All UI-related logic (header, search bar, dark mode, etc.) is handled by a separate header.js file.

// =====================
// API Configuration
// =====================
const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3'; //  TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
const TMDB_COMPANY_ID_WARNER_BROS = '174';
const TMDB_COMPANY_ID_TYLER_PERRY_STUDIOS = '3096'; // Updated Tyler Perry Studios ID
const TMDB_ACTOR_ID_IKO_UWAIS = '113732';
const TMDB_ACTOR_ID_IDRIS_ELBA = '17605';
const TMDB_ACTOR_ID_ANTHONY_HOPKINS = '4173';
const TMDB_GENRE_ID_DOCUMENTARY = '99';
const TMDB_GENRE_ID_REALITY = '10764';
const TMDB_GENRE_ID_TALK_SHOW = '10767';
const TMDB_GENRE_ID_DRAMA = '18';
const TMDB_GENRE_ID_SCIFI = '878';
const TMDB_GENRE_ID_ACTION = '28';
const TMDB_GENRE_ID_ROMANCE = '10749';
const TMDB_GENRE_ID_HORROR = '27';
const TMDB_GENRE_ID_COMEDY = '35';
const TMDB_ACTOR_ID_JACKIE_CHAN = '18897';
const TMDB_ACTOR_ID_SALMAN_KHAN = '17926';

// =====================
// Utility Functions
// =====================

/**
 * Fetches data from the TMDb API.
 * @param {string} endpoint - The API endpoint to call (e.g., '/movie/popular').
 * @param {object} params - Optional query parameters.
 * @returns {Promise<object>} The JSON response data.
 */
async function fetchData(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    for (const key in params) {
        if (params[key]) {
            url.searchParams.append(key, params[key]);
        }
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching data from ${endpoint}: ${response.status} ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Network or API error:', error);
        return null;
    }
}

/**
 * Creates and appends a show card to a container.
 * @param {object} show - The movie or TV show object from the API.
 * @param {HTMLElement} container - The HTML element to append the card to.
 */
function createShowCard(show, container) {
    if (!show || !show.poster_path) return;

    const card = document.createElement('a');
    card.href = `details.html?id=${show.id}&type=${show.media_type}`;
    card.classList.add('show-card');
    card.setAttribute('aria-label', `Details for ${show.title || show.name}`);

    const poster = document.createElement('img');
    poster.src = `${IMAGE_URL}${show.poster_path}`;
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

    const year = document.createElement('div');
    year.classList.add('show-year');
    const releaseDate = show.release_date || show.first_air_date;
    year.textContent = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

    const title = document.createElement('h4');
    title.classList.add('show-title');
    title.textContent = show.title || show.name;

    card.appendChild(poster);
    card.appendChild(rating);
    card.appendChild(year);
    card.appendChild(title);

    container.appendChild(card);
}

/**
 * Populates a carousel section with fetched shows.
 * @param {string} endpoint - The TMDb API endpoint.
 * @param {HTMLElement} container - The carousel inner container.
 * @param {string} mediaType - 'movie' or 'tv'.
 * @param {number} totalFetch - Total number of results to fetch.
 * @param {number} displayLimit - Number of results to display.
 * @returns {Promise<void>}
 */
async function fetchAndPopulateShows(endpoint, container, mediaType, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    const data = await fetchData(endpoint);
    if (spinner) spinner.style.display = 'none';

    if (data && data.results) {
        const shows = data.results.slice(0, displayLimit);
        shows.forEach(show => {
            show.media_type = mediaType;
            createShowCard(show, container);
        });
    } else {
        container.innerHTML = '<p class="error-message">Failed to load content. Please try again later.</p>';
    }
}

/**
 * Fetches and populates the hero section with a single featured item.
 */
async function fetchFeaturedContent() {
    const heroSection = document.getElementById('heroSection');
    const heroTitle = document.getElementById('heroTitle');
    const heroSynopsis = document.getElementById('heroSynopsis');
    const heroWatchNowBtn = document.getElementById('heroWatchNowBtn');
    const heroAddToPlaylistBtn = document.getElementById('heroAddToPlaylistBtn'); // Changed ID
    
    // Fetch a single trending movie or TV show to feature
    const data = await fetchData('/trending/all/day');
    
    if (data && data.results && data.results.length > 0) {
        const featured = data.results[0];
        const backdropPath = featured.backdrop_path;
        const posterPath = featured.poster_path;
        const title = featured.title || featured.name;
        const synopsis = featured.overview;
        const mediaType = featured.media_type;

        if (backdropPath) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${BACKDROP_URL}${backdropPath})`;
        } else if (posterPath) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${IMAGE_URL}${posterPath})`;
        } else {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://placehold.co/1280x720/282828/f0f0f0?text=CineWatch')`;
        }

        heroTitle.textContent = title;
        heroSynopsis.textContent = synopsis || "A stunning new story to discover.";
        
        // Update the links to point to the details page
        if (heroWatchNowBtn) {
            heroWatchNowBtn.href = `details.html?id=${featured.id}&type=${mediaType}`;
        }
        if (heroAddToPlaylistBtn) {
            heroAddToPlaylistBtn.href = `details.html?id=${featured.id}&type=${mediaType}`;
        }
    } else {
        // Fallback content
        heroTitle.textContent = 'Welcome to CineWatch!';
        heroSynopsis.textContent = 'Your ultimate destination for movies and TV shows. Start exploring!';
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://placehold.co/1280x720/282828/f0f0f0?text=CineWatch')`;
        if (heroWatchNowBtn) heroWatchNowBtn.style.display = 'none';
        if (heroAddToPlaylistBtn) heroAddToPlaylistBtn.style.display = 'none';
    }
}

/**
 * Fetches movies by a specific production company.
 * @param {string} companyId - The TMDb company ID.
 * @param {HTMLElement} container - The container to populate.
 * @param {number} totalFetch - Total number of results to fetch.
 * @param {number} displayLimit - Number of results to display.
 */
async function fetchMoviesByCompany(companyId, container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    const data = await fetchData('/discover/movie', { with_companies: companyId });
    if (spinner) spinner.style.display = 'none';

    if (data && data.results) {
        const shows = data.results.slice(0, displayLimit);
        shows.forEach(show => {
            show.media_type = 'movie';
            createShowCard(show, container);
        });
    } else {
        container.innerHTML = '<p class="error-message">Failed to load content. Please try again later.</p>';
    }
}

/**
 * Sets up the carousel functionality for a given section.
 * @param {string} sectionId - The ID of the section container.
 */
const setupCarousel = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return; // Exit if section doesn't exist

    const carouselInner = section.querySelector('.show-carousel-inner');
    const leftArrow = section.querySelector('.carousel-arrow.left');
    const rightArrow = section.querySelector('.carousel-arrow.right');

    if (carouselInner && leftArrow && rightArrow) {
        leftArrow.addEventListener('click', () => scrollCarousel(carouselInner, 'left'));
        rightArrow.addEventListener('click', () => scrollCarousel(carouselInner, 'right'));
    } else {
        console.warn(`Carousel elements not found for section: ${sectionId}`);
    }
};

/**
 * Handles carousel scrolling.
 * @param {HTMLElement} carousel - The carousel element to scroll.
 * @param {string} direction - 'left' or 'right'.
 */
const scrollCarousel = (carousel, direction) => {
    const scrollAmount = 250; // Adjust as needed
    if (direction === 'left') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
};

/**
 * Fetches and populates content for Warner Bros.
 */
async function fetchWarnerBrosMovies(container, totalFetch, displayLimit) {
    await fetchMoviesByCompany(TMDB_COMPANY_ID_WARNER_BROS, container, totalFetch, displayLimit);
}

/**
 * Fetches and populates content for Tyler Perry Studios.
 */
async function fetchTylerPerryStudiosMovies(container, totalFetch, displayLimit) {
    await fetchMoviesByCompany(TMDB_COMPANY_ID_TYLER_PERRY_STUDIOS, container, totalFetch, displayLimit);
}


/**
 * Fetches movies with a specific genre.
 * @param {string} genreId - The TMDb genre ID.
 * @param {HTMLElement} container - The container to populate.
 * @param {number} totalFetch - Total number of results to fetch.
 * @param {number} displayLimit - Number of results to display.
 */
async function fetchMoviesByGenre(genreId, container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    const data = await fetchData('/discover/movie', { with_genres: genreId });
    if (spinner) spinner.style.display = 'none';

    if (data && data.results) {
        const shows = data.results.slice(0, displayLimit);
        shows.forEach(show => {
            show.media_type = 'movie';
            createShowCard(show, container);
        });
    } else {
        container.innerHTML = '<p class="error-message">Failed to load content. Please try again later.</p>';
    }
}

/**
 * Fetches TV shows with a specific genre.
 * @param {string} genreId - The TMDb genre ID.
 * @param {HTMLElement} container - The container to populate.
 * @param {number} totalFetch - Total number of results to fetch.
 * @param {number} displayLimit - Number of results to display.
 */
async function fetchTvShowsByGenre(genreId, container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    const data = await fetchData('/discover/tv', { with_genres: genreId });
    if (spinner) spinner.style.display = 'none';

    if (data && data.results) {
        const shows = data.results.slice(0, displayLimit);
        shows.forEach(show => {
            show.media_type = 'tv';
            createShowCard(show, container);
        });
    } else {
        container.innerHTML = '<p class="error-message">Failed to load content. Please try again later.</p>';
    }
}


/**
 * Fetches and populates documentaries.
 */
async function fetchDocumentaries(container, totalFetch, displayLimit) {
    await fetchMoviesByGenre(TMDB_GENRE_ID_DOCUMENTARY, container, totalFetch, displayLimit);
}

/**
 * Fetches and populates reality TV shows.
 */
async function fetchRealityTvShows(container, totalFetch, displayLimit) {
    await fetchTvShowsByGenre(TMDB_GENRE_ID_REALITY, container, totalFetch, displayLimit);
}

/**
 * Fetches and populates talk shows.
 */
async function fetchTalkShows(container, totalFetch, displayLimit) {
    await fetchTvShowsByGenre(TMDB_GENRE_ID_TALK_SHOW, container, totalFetch, displayLimit);
}


/**
 * Fetches and populates Bollywood content.
 */
async function fetchBollywoodContent(container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';
    
    const data = await fetchData('/discover/movie', {
        with_original_language: 'hi',
        sort_by: 'popularity.desc',
        'primary_release_date.lte': new Date().toISOString().split('T')[0] // Only released movies
    });
    
    if (spinner) spinner.style.display = 'none';
    if (data && data.results) {
        data.results.slice(0, displayLimit).forEach(show => {
            show.media_type = 'movie';
            createShowCard(show, container);
        });
    } else {
        container.innerHTML = '<p class="error-message">Failed to load Bollywood content.</p>';
    }
}


/**
 * Fetches and populates K-Drama content.
 */
async function fetchKDramaContent(container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';
    const data = await fetchData('/discover/tv', {
        with_original_language: 'ko',
        sort_by: 'popularity.desc'
    });
    if (spinner) spinner.style.display = 'none';
    if (data && data.results) {
        data.results.slice(0, displayLimit).forEach(show => {
            show.media_type = 'tv';
            createShowCard(show, container);
        });
    } else {
        container.innerHTML = '<p class="error-message">Failed to load K-Drama content.</p>';
    }
}

/**
 * Fetches and populates Chinese content.
 */
async function fetchChineseContent(container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    // Prioritize popular Chinese movies, then add TV shows
    const [movieData, tvData] = await Promise.all([
        fetchData('/discover/movie', { with_original_language: 'zh' }),
        fetchData('/discover/tv', { with_original_language: 'zh' })
    ]);
    if (spinner) spinner.style.display = 'none';

    let allContent = [];
    if (movieData && movieData.results) {
        allContent = allContent.concat(movieData.results.map(item => ({ ...item, media_type: 'movie' })));
    }
    if (tvData && tvData.results) {
        allContent = allContent.concat(tvData.results.map(item => ({ ...item, media_type: 'tv' })));
    }
    
    // Shuffle the content to provide a mixed view
    allContent.sort(() => 0.5 - Math.random());
    allContent.slice(0, displayLimit).forEach(show => createShowCard(show, container));

    if (allContent.length === 0) {
        container.innerHTML = '<p class="error-message">Failed to load Chinese content.</p>';
    }
}

/**
 * Fetches and populates Hollywood content (movies and TV shows from the USA).
 */
async function fetchHollywoodContent(container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    const [movieData, tvData] = await Promise.all([
        fetchData('/discover/movie', { with_origin_country: 'US', sort_by: 'popularity.desc' }),
        fetchData('/discover/tv', { with_origin_country: 'US', sort_by: 'popularity.desc' })
    ]);
    if (spinner) spinner.style.display = 'none';

    let allContent = [];
    if (movieData && movieData.results) {
        allContent = allContent.concat(movieData.results.map(item => ({ ...item, media_type: 'movie' })));
    }
    if (tvData && tvData.results) {
        allContent = allContent.concat(tvData.results.map(item => ({ ...item, media_type: 'tv' })));
    }

    // Shuffle and display
    allContent.sort(() => 0.5 - Math.random());
    allContent.slice(0, displayLimit).forEach(show => createShowCard(show, container));

    if (allContent.length === 0) {
        container.innerHTML = '<p class="error-message">Failed to load Hollywood content.</p>';
    }
}

/**
 * Fetches and populates International Hits (popular content from specific actors).
 */
async function fetchInternationalHits(container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    const actorIds = [TMDB_ACTOR_ID_IKO_UWAIS, TMDB_ACTOR_ID_IDRIS_ELBA, TMDB_ACTOR_ID_ANTHONY_HOPKINS];
    const fetchPromises = actorIds.map(id => fetchData(`/person/${id}/combined_credits`));
    const results = await Promise.all(fetchPromises);
    if (spinner) spinner.style.display = 'none';

    let allContent = [];
    results.forEach(data => {
        if (data && data.cast) {
            allContent = allContent.concat(data.cast);
        }
    });

    // Remove duplicates and populate the container
    const uniqueContent = [...new Map(allContent.map(item => [item.id, item])).values()];
    uniqueContent.slice(0, displayLimit).forEach(show => createShowCard(show, container));
    
    if (uniqueContent.length === 0) {
        container.innerHTML = '<p class="error-message">Failed to load content for international hits. There may be no content available for these actors.</p>';
    }
}

/**
 * Fetches and populates Swahili and Kenyan shows.
 */
async function fetchSwahiliAndKenyanShows(container, totalFetch, displayLimit) {
    const spinner = container.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';

    const [swahiliContent, kenyanContent] = await Promise.all([
        fetchData('/discover/tv', { with_original_language: 'sw' }),
        fetchData('/discover/tv', { with_origin_country: 'KE', with_genres: TMDB_GENRE_ID_DRAMA })
    ]);
    if (spinner) spinner.style.display = 'none';

    let allShows = [];
    if (swahiliContent && swahiliContent.results) {
        allShows = allShows.concat(swahiliContent.results.map(item => ({ ...item, media_type: 'tv' })));
    }
    if (kenyanContent && kenyanContent.results) {
        allShows = allShows.concat(kenyanContent.results.map(item => ({ ...item, media_type: 'tv' })));
    }

    // Filter for unique shows and populate
    const uniqueShows = [...new Map(allShows.map(item => [item.id, item])).values()];
    uniqueShows.slice(0, displayLimit).forEach(show => createShowCard(show, container));

    if (uniqueShows.length === 0) {
        container.innerHTML = '<p class="error-message">Failed to load Kenyan Drama. There may be no content available for this category.</p>';
    }
}


// =====================
// Main Execution
// =====================

document.addEventListener('DOMContentLoaded', async () => {

    // Load featured content for hero section
    await fetchFeaturedContent();
    
    // Define categories for easy iteration
    const categories = [
        { id: 'popularTvSection', containerId: 'popularTvContainer', endpoint: '/tv/popular', mediaType: 'tv', customFetch: null, totalFetch: 20, displayLimit: 10 },
        { id: 'trendingMoviesSection', containerId: 'trendingMoviesContainer', endpoint: '/trending/movie/week', mediaType: 'movie', customFetch: null, totalFetch: 20, displayLimit: 10 },
        { id: 'newReleasesTvSection', containerId: 'newReleasesTvContainer', endpoint: '/tv/on_the_air', mediaType: 'tv', customFetch: null, totalFetch: 20, displayLimit: 10 },
        { id: 'documentariesSection', containerId: 'documentariesContainer', endpoint: null, mediaType: 'movie', customFetch: fetchDocumentaries, totalFetch: 20, displayLimit: 10 },
        { id: 'realityTvSection', containerId: 'realityTvContainer', endpoint: null, mediaType: 'tv', customFetch: fetchRealityTvShows, totalFetch: 20, displayLimit: 10 },
        { id: 'talkShowsSection', containerId: 'talkShowsContainer', endpoint: null, mediaType: 'tv', customFetch: fetchTalkShows, totalFetch: 20, displayLimit: 10 },
        { id: 'comingSoonSection', containerId: 'comingSoonContainer', endpoint: '/movie/upcoming', mediaType: 'movie', customFetch: null, totalFetch: 20, displayLimit: 10 },
        { id: 'seasonFinaleSection', containerId: 'seasonFinaleContainer', endpoint: '/tv/top_rated', mediaType: 'tv', customFetch: null, totalFetch: 20, displayLimit: 10 },
        { id: 'kenyanDramaSection', containerId: 'kenyanDramaContainer', endpoint: null, mediaType: 'tv', customFetch: fetchSwahiliAndKenyanShows, totalFetch: 20, displayLimit: 10 },
        { id: 'kDramaSection', containerId: 'kDramaContainer', endpoint: null, mediaType: 'tv', customFetch: fetchKDramaContent, totalFetch: 20, displayLimit: 10 },
        { id: 'hollywoodSection', containerId: 'hollywoodContainer', endpoint: null, mediaType: 'all', customFetch: fetchHollywoodContent, totalFetch: 20, displayLimit: 10 },
        { id: 'bollywoodSection', containerId: 'bollywoodContainer', endpoint: null, mediaType: 'movie', customFetch: fetchBollywoodContent, totalFetch: 20, displayLimit: 10 },
        { id: 'chineseSection', containerId: 'chineseContainer', endpoint: null, mediaType: 'all', customFetch: fetchChineseContent, totalFetch: 20, displayLimit: 10 },
        { id: 'internationalHitsSection', containerId: 'internationalHitsContainer', endpoint: null, mediaType: 'all', customFetch: fetchInternationalHits, totalFetch: 20, displayLimit: 10 },
        { id: 'warnersBrosSection', containerId: 'warnersBrosContainer', endpoint: null, mediaType: 'movie', customFetch: fetchWarnerBrosMovies, totalFetch: 20, displayLimit: 10 },
        { id: 'tylerPerrySection', containerId: 'tylerPerryContainer', endpoint: null, mediaType: 'movie', customFetch: fetchTylerPerryStudiosMovies, totalFetch: 20, displayLimit: 20 }
    ];

    // Create an array of promises for all content fetching operations
    const fetchPromises = categories.map(cat => {
        const containerElement = document.getElementById(cat.containerId);
        if (containerElement) {
            if (cat.customFetch) {
                return cat.customFetch(containerElement, cat.totalFetch, cat.displayLimit);
            } else if (cat.endpoint) {
                return fetchAndPopulateShows(cat.endpoint, containerElement, cat.mediaType, cat.totalFetch, cat.displayLimit);
            }
        }
        return Promise.resolve(); // Resolve immediately if no action is needed
    });

    // Wait for all content to be fetched before setting up carousels
    await Promise.all(fetchPromises);

    // After populating, set up carousels for all relevant sections
    categories.forEach(cat => {
        setupCarousel(cat.id);
    });

    // Sets Last Modified Date in footer (assuming footer.js handles the element,
    // but this is a fail-safe in case the footer is just static HTML)
    const lastModifiedSpan_footer = document.getElementById('last-modified');
    if (lastModifiedSpan_footer) {
        lastModifiedSpan_footer.textContent = new Date(document.lastModified).toLocaleDateString();
    }
});
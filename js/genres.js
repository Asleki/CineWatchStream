// ===============================================
// js/genres.js
// ===============================================

// =====================
// API Configuration
// =====================
const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// =====================
// DOM Elements
// =====================
const genreTitleEl = document.getElementById('genreTitle');
const showsContainerEl = document.getElementById('showsContainer');
const loadingSpinnerEl = document.getElementById('loadingSpinner');
const loadMoreBtnEl = document.getElementById('loadMoreBtn');
const applyFiltersBtnEl = document.getElementById('applyFiltersBtn');

// Filter dropdowns
const sortToggleEl = document.getElementById('sort-toggle');
const sortMenuEl = document.getElementById('sort-menu');
const yearToggleEl = document.getElementById('year-toggle');
const yearMenuEl = document.getElementById('year-menu');
const countryToggleEl = document.getElementById('country-toggle');
const countryMenuEl = document.getElementById('country-menu');
const languageToggleEl = document.getElementById('language-toggle');
const languageMenuEl = document.getElementById('language-menu');
const resetFiltersBtnEl = document.getElementById('resetFiltersBtn');

// =====================
// Global State
// =====================
let currentGenreId;
let currentSort = 'popularity.desc';
let currentYear = '';
let currentCountry = '';
let currentLanguage = '';
let currentPage = 1;
let totalPages = 1;

// =====================
// Utility Functions
// =====================
async function fetchData(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);

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
 */
function createShowCard(show) {
    const card = document.createElement('a');
    card.classList.add('show-card', 'grid-item');
    card.href = `details.html?id=${show.id}&type=movie`;
    card.setAttribute('aria-label', `Details for ${show.title}`);

    const posterUrl = show.poster_path ? `${TMDB_IMAGE_URL}${show.poster_path}` : 'images/show&movieplaceholder.jpg';
    const title = show.title;
    const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
    const year = show.release_date ? new Date(show.release_date).getFullYear() : 'N/A';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="show-rating">${rating}</div>
        <h4 class="show-title">${title}</h4>
        <p class="show-year">${year}</p>
    `;

    return card;
}

/**
 * Renders the movie cards to the container.
 */
function renderMovies(movies, clear = false) {
    if (clear) {
        showsContainerEl.innerHTML = '';
    }
    if (!movies || movies.length === 0) {
        if (clear) {
            showsContainerEl.innerHTML = '<p class="error-message">No movies found for this genre with the selected filters.</p>';
        }
        return;
    }
    movies.forEach(movie => {
        const card = createShowCard(movie);
        showsContainerEl.appendChild(card);
    });
}

// =====================
// Fetching & Rendering
// =====================
async function fetchGenres() {
    const data = await fetchData('/genre/movie/list');
    return data ? data.genres : [];
}

async function fetchMoviesByGenre(clear = false) {
    loadingSpinnerEl.style.display = 'block';
    loadMoreBtnEl.style.display = 'none';

    const params = {
        with_genres: currentGenreId,
        page: currentPage,
        sort_by: currentSort,
        primary_release_year: currentYear,
        'with_original_language': currentLanguage,
        'with_origin_country': currentCountry
    };

    console.log('Sending API request with these parameters:', params);

    const moviesData = await fetchData('/discover/movie', params);

    loadingSpinnerEl.style.display = 'none';

    if (moviesData && moviesData.results) {
        totalPages = moviesData.total_pages;
        renderMovies(moviesData.results, clear);
        if (currentPage < totalPages) {
            loadMoreBtnEl.style.display = 'block';
        }
    } else {
        showsContainerEl.innerHTML = '<p class="error-message">Could not load movies. Please try again later.</p>';
    }
}

// =====================
// Filter Logic
// =====================
function toggleDropdown(menu) {
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
}

function handleFilterClick(event, stateVar, toggleEl, menuEl) {
    event.preventDefault();
    const link = event.target.closest('a');
    if (!link) return;

    const value = link.dataset[stateVar];
    const text = link.textContent;
    
    // Log the values for debugging
    console.log(`Clicked ${stateVar}: value = ${value}, text = ${text}`);

    // Update global state and toggle text
    if (stateVar === 'sort') {
        currentSort = value;
        toggleEl.textContent = text;
    } else if (stateVar === 'year') {
        currentYear = value;
        toggleEl.textContent = text;
    } else if (stateVar === 'country') {
        currentCountry = value;
        toggleEl.textContent = text;
    } else if (stateVar === 'language') {
        currentLanguage = value;
        toggleEl.textContent = text;
    }
    
    // Clear the active class from all links in this menu and add to the clicked one
    Array.from(menuEl.querySelectorAll('.filter-link')).forEach(li => li.classList.remove('active'));
    link.classList.add('active');
}

function populateYearFilter() {
    const currentYear = new Date().getFullYear();
    yearMenuEl.innerHTML = '<li><a href="#" data-year="" class="filter-link active">All Years</a></li>';
    for (let year = currentYear; year >= 1950; year--) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = year;
        a.classList.add('filter-link');
        a.dataset.year = year;
        li.appendChild(a);
        yearMenuEl.appendChild(li);
    }
}

async function populateLanguageFilter() {
    const data = await fetchData('/configuration/languages');
    languageMenuEl.innerHTML = '<li><a href="#" data-language="" class="filter-link active">All Languages</a></li>';
    if (data) {
        data.forEach(lang => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = lang.english_name;
            a.classList.add('filter-link');
            a.dataset.language = lang.iso_639_1;
            li.appendChild(a);
            languageMenuEl.appendChild(li);
        });
    }
}

async function populateCountryFilter() {
    const data = await fetchData('/configuration/countries');
    countryMenuEl.innerHTML = '<li><a href="#" data-country="" class="filter-link active">All Countries</a></li>';
    if (data) {
        data.forEach(country => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = country.english_name;
            a.classList.add('filter-link');
            a.dataset.country = country.iso_3166_1;
            li.appendChild(a);
            countryMenuEl.appendChild(li);
        });
    }
}


// =====================
// Event Listeners
// =====================
loadMoreBtnEl.addEventListener('click', () => {
    currentPage++;
    if (currentPage <= totalPages) {
        fetchMoviesByGenre();
    }
});

// Dropdown Toggles
sortToggleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(sortMenuEl);
});
yearToggleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(yearMenuEl);
});
countryToggleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(countryMenuEl);
});
languageToggleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(languageMenuEl);
});
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
});


// Filter Clicks
sortMenuEl.addEventListener('click', (e) => handleFilterClick(e, 'sort', sortToggleEl, sortMenuEl));
yearMenuEl.addEventListener('click', (e) => handleFilterClick(e, 'year', yearToggleEl, yearMenuEl));
countryMenuEl.addEventListener('click', (e) => handleFilterClick(e, 'country', countryToggleEl, countryMenuEl));
languageMenuEl.addEventListener('click', (e) => handleFilterClick(e, 'language', languageToggleEl, languageMenuEl));

// New: Add event listener for the Apply Filters button
applyFiltersBtnEl.addEventListener('click', () => {
    currentPage = 1;
    fetchMoviesByGenre(true);
});
// Update the Reset Filters button to also apply filters
resetFiltersBtnEl.addEventListener('click', () => {
    currentSort = 'popularity.desc';
    currentYear = '';
    currentCountry = '';
    currentLanguage = '';
    currentPage = 1;
    sortToggleEl.textContent = 'Popularity';
    yearToggleEl.textContent = 'All Years';
    countryToggleEl.textContent = 'All Countries';
    languageToggleEl.textContent = 'All Languages';
    document.querySelectorAll('.filter-link').forEach(link => link.classList.remove('active'));
    document.querySelector('[data-sort="popularity.desc"]').classList.add('active');
    document.querySelector('[data-year=""]').classList.add('active');
    document.querySelector('[data-country=""]').classList.add('active');
    document.querySelector('[data-language=""]').classList.add('active');
    fetchMoviesByGenre(true);
});


// =====================
// Initial Page Load
// =====================
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentGenreId = urlParams.get('genreId');

    if (!currentGenreId) {
        genreTitleEl.textContent = 'Genre Not Found';
        showsContainerEl.innerHTML = '<p class="error-message">Genre ID is missing from the URL.</p>';
        loadingSpinnerEl.style.display = 'none';
        return;
    }

    const genres = await fetchGenres();
    const genre = genres.find(g => g.id == currentGenreId);
    if (genre) {
        genreTitleEl.textContent = `${genre.name} Movies`;
        document.title = `${genre.name} Movies - Filter and Browse`;
    } else {
        genreTitleEl.textContent = 'Genre Not Found';
    }
    
    populateYearFilter();
    populateLanguageFilter();
    populateCountryFilter();
    fetchMoviesByGenre(true);
});
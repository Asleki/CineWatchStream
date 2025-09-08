// Function to show a custom alert message
const showAlert = (message) => {
    const alertBox = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertBox.classList.add('show');
};

// Event listener for the close button on the custom alert
document.getElementById('closeAlertBtn').addEventListener('click', () => {
    document.getElementById('customAlert').classList.remove('show');
});

// Your API Key from The Movie Database (TMDB)
// IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your actual API key
const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';

// Function to create and return a single show card element
const createShowCard = (show) => {
    if (!show.poster_path) {
        return null;
    }

    const card = document.createElement('a');
    card.href = `details.html?id=${show.id}&mediaType=${show.media_type}`;
    card.classList.add('show-card');
    
    const poster = document.createElement('img');
    poster.classList.add('poster');
    poster.src = `https://image.tmdb.org/t/p/w500${show.poster_path}`;
    poster.alt = show.title || show.name;

    const info = document.createElement('div');
    info.classList.add('show-info');

    const rating = document.createElement('span');
    rating.classList.add('rating-pill');
    rating.textContent = (show.vote_average || 0).toFixed(1);

    const title = document.createElement('h4');
    title.classList.add('show-title');
    title.textContent = show.title || show.name;
    
    const year = document.createElement('span');
    year.classList.add('show-year');
    year.textContent = (show.release_date || show.first_air_date || 'N/A').substring(0, 4);

    card.appendChild(poster);
    
    // Corrected bug: Append rating, title, and year to the info container, then append info to the card
    info.appendChild(rating);
    info.appendChild(title);
    info.appendChild(year);
    card.appendChild(info);

    return card;
};

// Global variables for page state
const showGridContainer = document.getElementById('show-grid-container');
const categoryTitle = document.getElementById('category-title');
const pageTitle = document.getElementById('pageTitle');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const filtersForm = document.getElementById('filterForm');
let currentPage = 1;
let totalPages = 1;

// URL parameters to get the category endpoint and name
const urlParams = new URLSearchParams(window.location.search);
const categoryEndpoint = urlParams.get('endpoint');
const categoryName = urlParams.get('categoryName');
const mediaType = urlParams.get('mediaType');

// Function to fetch and display shows based on current filters
const fetchAndDisplayShows = async (page = 1) => {
    try {
        if (page === 1) {
            showGridContainer.innerHTML = `<div class="spinner"></div>`;
            loadMoreBtn.style.display = 'none';
        }

        const urlParts = categoryEndpoint.split('?');
        const originalEndpoint = urlParts[0];
        const originalParams = new URLSearchParams(urlParts[1] || '');
        const filterParams = new URLSearchParams();
        
        // Get filter values from the form
        const formData = new FormData(filtersForm);
        for (let pair of formData.entries()) {
            if (pair[1]) {
                filterParams.set(pair[0], pair[1]);
            }
        }
        
        // Merge original URL parameters and filter parameters
        for (let pair of originalParams.entries()) {
            if (!filterParams.has(pair[0])) {
                filterParams.set(pair[0], pair[1]);
            }
        }
        
        filterParams.append('api_key', API_KEY);
        filterParams.append('language', 'en-US');
        filterParams.append('page', page);

        const url = `https://api.themoviedb.org/3${originalEndpoint}?${filterParams.toString()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        const shows = data.results;
        totalPages = data.total_pages;

        const spinner = document.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }

        if (shows && shows.length > 0) {
            shows.forEach(show => {
                if (!show.media_type) {
                    show.media_type = mediaType;
                }
                const card = createShowCard(show);
                if (card) {
                    showGridContainer.appendChild(card);
                }
            });
        } else if (page === 1) {
            showGridContainer.textContent = 'No shows found with these filters.';
        }

        if (currentPage < totalPages) {
            loadMoreBtn.style.display = 'block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Oops! We could not load the content for this category. Please try again later.');
        loadMoreBtn.style.display = 'none';
    }
};

// Function to populate the year filter dropdown
const populateYearFilter = () => {
    const yearSelect = document.getElementById('year-filter');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
};

// Function to populate the language and country filters
const populateFilters = async () => {
    try {
        const langResponse = await fetch(`https://api.themoviedb.org/3/configuration/languages?api_key=${API_KEY}`);
        const languages = await langResponse.json();
        
        const countryResponse = await fetch(`https://api.themoviedb.org/3/configuration/countries?api_key=${API_KEY}`);
        const countries = await countryResponse.json();

        const langSelect = document.getElementById('language-filter');
        const countrySelect = document.getElementById('country-filter');
        const networkSelect = document.getElementById('network-filter');

        languages.sort((a, b) => a.english_name.localeCompare(b.english_name)).forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.iso_639_1;
            option.textContent = lang.english_name;
            langSelect.appendChild(option);
        });

        countries.sort((a, b) => a.english_name.localeCompare(b.english_name)).forEach(country => {
            const option = document.createElement('option');
            option.value = country.iso_3166_1;
            option.textContent = country.english_name;
            countrySelect.appendChild(option);
        });

        // Hardcoded networks for common platforms
        const networks = [
            { id: '213', name: 'Netflix' },
            { id: '2739', name: 'Disney+' },
            { id: '1024', name: 'Amazon Prime Video' },
            { id: '453', name: 'Hulu' },
            { id: '619', name: 'HBO Max' }
        ];

        networks.forEach(network => {
            const option = document.createElement('option');
            option.value = network.id;
            option.textContent = network.name;
            networkSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error fetching filter options:", error);
    }
};

// Event listeners for filter buttons
filtersForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission
    currentPage = 1;
    fetchAndDisplayShows(currentPage);
});

filtersForm.addEventListener('reset', (e) => {
    setTimeout(() => {
        currentPage = 1;
        fetchAndDisplayShows(currentPage);
    }, 0); // Use a timeout to ensure the form is fully reset
});

loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchAndDisplayShows(currentPage);
});

// Main function to run on page load
const initializePage = () => {
    if (categoryName) {
        categoryTitle.textContent = decodeURIComponent(categoryName);
        pageTitle.textContent = `CineWatch - ${decodeURIComponent(categoryName)}`;
    }

    populateYearFilter();
    populateFilters();
    fetchAndDisplayShows();
};

document.addEventListener('DOMContentLoaded', initializePage);
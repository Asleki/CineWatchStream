// TMDB API key and base URLs
const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/original';
const SMALL_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// API endpoints
const API_ENDPOINTS = {
    popularMovies: `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
    popularTvShows: `${BASE_URL}/tv/popular?api_key=${API_KEY}`,
    newReleasesTv: `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}`,
    trendingMovies: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
};

// HTML elements
const cinemaHero = document.getElementById('cinemaHero');
const tickerText = document.getElementById('tickerText');
const cinemaGuideContainer = document.getElementById('cinemaGuideContainer');
const spinner = document.getElementById('spinnerCinemaGuide');
const countrySelect = document.getElementById('countrySelect');
const citySelect = document.getElementById('citySelect');

// Global data store
let allMoviesAndShows = [];
let cinemaData = [];

// Helper to fetch data from a URL
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Function to fetch simulated cinema guide data from JSON file
async function fetchCinemaGuideData() {
    try {
        const response = await fetch('data/cinemaguide.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error for cinema guide data:', error);
        return null;
    }
}

// Function to update the hero section's background and ticker text
function updateHero() {
    if (allMoviesAndShows.length === 0) return;

    // Filter for movies and shows with backdrops
    const backdrops = allMoviesAndShows.filter(item => item.backdrop_path);

    // Change hero backdrop every 10 seconds
    let backdropIndex = 0;
    setInterval(() => {
        const item = backdrops[backdropIndex % backdrops.length];
        if (item && item.backdrop_path) {
            cinemaHero.style.backgroundImage = `url(${IMAGE_URL}${item.backdrop_path})`;
        }
        backdropIndex++;
    }, 10000);

    // Populate ticker with all titles
    tickerText.innerHTML = '';
    allMoviesAndShows.forEach(item => {
        const title = item.title || item.name;
        if (title) {
            const span = document.createElement('span');
            span.className = 'ticker-item';
            span.textContent = `| ${title} |`;
            tickerText.appendChild(span);
        }
    });
}

// Function to create a single movie card
function createMovieCard(item, hall) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Randomize a showtime and ticket price
    const showtimes = ['10:00 AM', '1:00 PM', '4:30 PM', '7:00 PM', '9:45 PM'];
    const randomShowtime = showtimes[Math.floor(Math.random() * showtimes.length)];
    const ticketPrice = `Ksh. ${Math.floor(Math.random() * 500) + 300}`;
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    
    let episodeInfo = '';
    if (mediaType === 'tv') {
        const isFinale = Math.random() > 0.8;
        if (isFinale) {
            episodeInfo = 'Season Finale';
        } else {
            const episodeNumber = Math.floor(Math.random() * 10) + 1;
            episodeInfo = `S${Math.floor(Math.random() * 5) + 1} E${episodeNumber}`;
        }
    } else {
        episodeInfo = 'Movie';
    }

    const content = `
        <img src="${SMALL_IMAGE_URL}${item.poster_path}" alt="${item.title || item.name} poster" class="movie-poster">
        <div class="movie-details">
            <h4>${item.title || item.name}</h4>
            <p>
                ${item.release_date ? item.release_date.substring(0, 4) : 'N/A'} 
                • 
                ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'} ⭐
            </p>
            <p>${episodeInfo}</p>
            <p>Time: ${randomShowtime} | Price: ${ticketPrice}</p>
            <div class="btn-group">
                <a href="#" class="btn-buy">Buy Ticket</a>
                <a href="details.html?id=${item.id}&type=${mediaType}" class="btn-details">View </a>
            </div>
        </div>
    `;

    card.innerHTML = content;
    return card;
}
// Function to populate the country and city dropdowns
function populateDropdowns(data) {
    // Populate countries
    countrySelect.innerHTML = '<option value="">Select a Country</option>';
    data.forEach(country => {
        const option = document.createElement('option');
        option.value = country.country;
        option.textContent = country.country;
        countrySelect.appendChild(option);
    });

    // Handle city dropdown change based on country selection
    countrySelect.addEventListener('change', (e) => {
        const selectedCountryName = e.target.value;
        const selectedCountry = data.find(c => c.country === selectedCountryName);

        citySelect.innerHTML = '<option value="">Select a City</option>';
        if (selectedCountry) {
            citySelect.disabled = false;
            selectedCountry.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.name;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = true;
        }
    });
}
// Main function to render the cinema guide
async function renderCinemaGuide() {
    spinner.style.display = 'block';
    
    // Fetch all required data
    const [popularMovies, popularTvShows, newReleasesTv, trendingMovies, cinemaHalls] = await Promise.all([
        fetchData(API_ENDPOINTS.popularMovies),
        fetchData(API_ENDPOINTS.popularTvShows),
        fetchData(API_ENDPOINTS.newReleasesTv),
        fetchData(API_ENDPOINTS.trendingMovies),
        fetchCinemaGuideData()
    ]);
    
    // Combine all fetched movies/shows into a single array
    allMoviesAndShows = [
        ...(popularMovies?.results || []).map(item => ({ ...item, media_type: 'movie' })),
        ...(popularTvShows?.results || []).map(item => ({ ...item, media_type: 'tv' })),
        ...(newReleasesTv?.results || []).map(item => ({ ...item, media_type: 'tv' })),
        ...(trendingMovies?.results || [])
    ];
    
    // ⭐ NEW CHECK: Ensure cinemaData is valid before proceeding
    if (!cinemaHalls) {
        cinemaGuideContainer.innerHTML = '<p class="text-center text-red-500">Failed to load cinema guide data. Please check the JSON file path and content.</p>';
        spinner.style.display = 'none';
        return; // Exit the function
    }

    // Get cinema data
    cinemaData = cinemaHalls;
    
    // Shuffle the combined array
    allMoviesAndShows.sort(() => 0.5 - Math.random());
    
    // Update hero and ticker
    updateHero();
    populateDropdowns(cinemaData);

    // Clear previous content
    cinemaGuideContainer.innerHTML = '';
    
    const selectedCountry = countrySelect.value;
    const selectedCity = citySelect.value;
    
    let filteredData = cinemaData;

    // Filter by country if selected
    if (selectedCountry) {
        filteredData = filteredData.filter(c => c.country === selectedCountry);
    }

    // Filter by city if selected
    if (selectedCity) {
        filteredData = filteredData.map(country => {
            return {
                ...country,
                cities: country.cities.filter(city => city.name === selectedCity)
            };
        }).filter(country => country.cities.length > 0);
    }

    // Create and append cinema sections with multiple movie cards
    if (allMoviesAndShows.length > 0 && filteredData.length > 0) {
        filteredData.forEach(country => {
            country.cities.forEach(city => {
                city.cinemaHalls.forEach(hall => {
                    const cinemaHallSection = document.createElement('div');
                    cinemaHallSection.className = 'cinema-hall-section';
                    cinemaHallSection.innerHTML = `<h2>${hall.name}</h2>`;

                    const movieGrid = document.createElement('div');
                    movieGrid.className = 'movie-grid';

                    for (let i = 0; i < 8; i++) {
                        const randomMovie = allMoviesAndShows[Math.floor(Math.random() * allMoviesAndShows.length)];
                        const movieCard = createMovieCard(randomMovie, hall);
                        movieGrid.appendChild(movieCard);
                    }

                    cinemaHallSection.appendChild(movieGrid);
                    cinemaGuideContainer.appendChild(cinemaHallSection);
                });
            });
        });
    } else {
        cinemaGuideContainer.innerHTML = '<p class="text-center text-red-500">Failed to load cinema guide data or no results found for your selection.</p>';
    }

    spinner.style.display = 'none';
}
// Initial call to render the guide
document.addEventListener('DOMContentLoaded', () => {
    renderCinemaGuide();
});
// Refresh data every 15 minutes
setInterval(renderCinemaGuide, 15 * 60 * 1000);

// Add event listeners to re-render the guide when filters change
countrySelect.addEventListener('change', renderCinemaGuide);
citySelect.addEventListener('change', renderCinemaGuide);
const API_KEY = "9c198aabc1df9fa96ea8d65e183cb8a3"; //  TMDb API key
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Utility function to get query parameters from the URL
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}

// Utility function to show a custom alert message
function displayCustomAlert(message, type = 'info') {
    const customAlert = document.getElementById('customAlert');
    const alertIcon = document.getElementById('alertIcon');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlertBtn = document.getElementById('closeAlertBtn');

    alertMessage.textContent = message;
    
    // Set icon and color based on type
    if (type === 'error') {
        alertIcon.className = 'alert-icon fas fa-exclamation-circle error-icon';
    } else if (type === 'success') {
        alertIcon.className = 'alert-icon fas fa-check-circle success-icon';
    } else {
        alertIcon.className = 'alert-icon fas fa-info-circle info-icon';
    }

    customAlert.classList.add('visible');
    
    closeAlertBtn.onclick = () => {
        customAlert.classList.remove('visible');
    };
}

// Function to fetch data from TMDb API
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        displayCustomAlert("Failed to fetch data. Please try again later.", "error");
        return null;
    }
}

// Function to format a date string
function getYear(dateString) {
    return dateString ? new Date(dateString).getFullYear() : 'N/A';
}

// Main function to load seasons and episode data
async function loadSeasonsPage() {
    const params = getQueryParams();
    const showId = params.id;
    const showType = params.type;

    if (!showId) {
        console.error("No TV show ID found in URL.");
        displayCustomAlert("No TV show ID found. Please go back and select a show.", "error");
        return;
    }

    const seasonsContainer = document.getElementById('seasonsContainer');
    const seasonsSpinner = document.getElementById('seasonsSpinner');
    seasonsSpinner.style.display = 'block';

    const heroSection = document.getElementById('heroSection');
    const showTitleElement = document.getElementById('showTitle');
    const showYearElement = document.getElementById('showYear');
    const backButton = document.getElementById('backButton');

    // Add click event listener to the back button
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    try {
        const tvShowData = await fetchData(`/tv/${showId}`);
        if (!tvShowData) return;

        // Populate hero section
        if (tvShowData.backdrop_path) {
            heroSection.style.backgroundImage = `url(${IMAGE_BASE_URL}/w1280${tvShowData.backdrop_path})`;
        } else {
             // Fallback to a placeholder if no backdrop is available
            heroSection.style.backgroundImage = `url(https://placehold.co/1280x720/262626/8c8c8c?text=No+Image)`;
        }
        
        showTitleElement.textContent = tvShowData.name || "N/A";
        showYearElement.textContent = tvShowData.first_air_date ? `(${getYear(tvShowData.first_air_date)})` : "N/A";

        // Display seasons
        if (tvShowData.seasons && tvShowData.seasons.length > 0) {
            seasonsContainer.innerHTML = ''; // Clear spinner
            tvShowData.seasons.forEach(season => {
                if (season.name.toLowerCase().includes("specials")) {
                    return; // Skip seasons with "specials" in the name
                }
                const seasonCard = document.createElement('div');
                seasonCard.className = 'season-card';

                const posterPath = season.poster_path ? `${IMAGE_BASE_URL}/w300${season.poster_path}` : 'https://placehold.co/300x450/2c2c2c/8c8c8c?text=No+Poster';
                
                const cardHtml = `
                    <img src="${posterPath}" alt="${season.name} Poster" class="season-poster">
                    <div class="season-info">
                        <h3>${season.name}</h3>
                        <div class="season-meta">
                            <span class="season-rating">
                                <i class="fas fa-star"></i>
                                ${season.vote_average > 0 ? (season.vote_average * 10).toFixed(0) + '%' : 'N/A'}
                            </span>
                            <span class="season-year">${getYear(season.air_date)}</span>
                            <span>•</span>
                            <span class="season-episodes">${season.episode_count} Episodes</span>
                        </div>
                        <p class="season-overview">${season.overview || "No overview available for this season."}</p>
                        <a href="CineWatch-episodes.html?id=${showId}&season=${season.season_number}" class="view-episodes-btn">View All Episodes</a>
                    </div>
                `;
                seasonCard.innerHTML = cardHtml;
                seasonsContainer.appendChild(seasonCard);
            });
        } else {
            seasonsContainer.innerHTML = '<p class="error-message">No seasons found for this TV show.</p>';
        }

    } catch (error) {
        console.error("Failed to load seasons page:", error);
        seasonsContainer.innerHTML = '<p class="error-message">Failed to load content. Please check your connection and try again.</p>';
    } finally {
        seasonsSpinner.style.display = 'none';
    }
}

window.addEventListener('load', loadSeasonsPage);

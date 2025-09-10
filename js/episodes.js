const API_KEY = "9c198aabc1df9fa96ea8d65e183cb8a3";
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

// Main function to load episode details
async function loadEpisodesPage() {
    const params = getQueryParams();
    const showId = params.id;
    const seasonNumber = params.season;

    if (!showId || !seasonNumber) {
        console.error("Missing show ID or season number in URL.");
        displayCustomAlert("Missing show ID or season number. Please go back and try again.", "error");
        return;
    }

    const heroBackdrop = document.getElementById('heroBackdrop');
    const heroPoster = document.getElementById('heroPoster');
    const heroTitle = document.getElementById('heroTitle');
    const heroYear = document.getElementById('heroYear');
    const episodesCount = document.getElementById('episodesCount');
    const episodesContainer = document.getElementById('episodesContainer');
    const spinnerEpisodes = document.getElementById('spinnerEpisodes');
    
    spinnerEpisodes.style.display = 'block';

    const backToSeasonsBtn = document.getElementById('backToSeasonsBtn');
    backToSeasonsBtn.addEventListener('click', () => {
        window.location.href = `CineWatch-seasons.html?id=${showId}`;
    });

    const backToPreviousSeasonBtn = document.getElementById('backToPreviousSeasonBtn');

    try {
        const showData = await fetchData(`/tv/${showId}`);
        const seasonData = await fetchData(`/tv/${showId}/season/${seasonNumber}`);

        if (!showData || !seasonData) {
            return;
        }

        // Populate hero section
        if (showData.backdrop_path) {
            heroBackdrop.style.backgroundImage = `url(${IMAGE_BASE_URL}/w1280${showData.backdrop_path})`;
        } else {
            heroBackdrop.style.backgroundImage = `url(https://placehold.co/1280x720/121212/e0e0e0?text=No+Image)`;
        }
        
        if (seasonData.poster_path) {
            const posterImg = document.createElement('img');
            posterImg.src = `${IMAGE_BASE_URL}/w300${seasonData.poster_path}`;
            posterImg.alt = `${seasonData.name} Poster`;
            heroPoster.appendChild(posterImg);
        } else {
            const posterImg = document.createElement('img');
            posterImg.src = `https://placehold.co/300x450/121212/e0e0e0?text=No+Poster`;
            posterImg.alt = `No Poster Available`;
            heroPoster.appendChild(posterImg);
        }

        heroTitle.textContent = seasonData.name;
        heroYear.textContent = seasonData.air_date ? `(${getYear(seasonData.air_date)})` : "";
        episodesCount.textContent = `Episodes ${seasonData.episodes.length}`;

        // Handle Previous Season button
        const currentSeasonIndex = showData.seasons.findIndex(s => s.season_number == seasonNumber);
        if (currentSeasonIndex > 0) {
            const previousSeason = showData.seasons[currentSeasonIndex - 1];
            backToPreviousSeasonBtn.style.display = 'inline-flex';
            backToPreviousSeasonBtn.textContent = `← Season ${previousSeason.season_number}`;
            backToPreviousSeasonBtn.addEventListener('click', () => {
                window.location.href = `CineWatch-episodes.html?id=${showId}&season=${previousSeason.season_number}`;
            });
        }

        // Populate episodes container
        episodesContainer.innerHTML = ''; // Clear spinner
        if (seasonData.episodes && seasonData.episodes.length > 0) {
            seasonData.episodes.forEach(episode => {
                const episodeCard = document.createElement('div');
                episodeCard.className = 'episode-card';

                const episodePoster = episode.still_path ? `${IMAGE_BASE_URL}/w500${episode.still_path}` : 'https://placehold.co/500x281/2c2c2c/8c8c8c?text=No+Image';

                const cardHtml = `
                    <img src="${episodePoster}" alt="${episode.name} Still" class="episode-still">
                    <div class="episode-info">
                        <div class="episode-header">
                            <span class="episode-number">${episode.episode_number}</span>
                            <h3>${episode.name || 'Title Not Available'}</h3>
                        </div>
                        <div class="episode-meta">
                            <span class="episode-rating">
                                <i class="fas fa-star"></i>
                                ${episode.vote_average > 0 ? (episode.vote_average * 10).toFixed(0) + '%' : 'N/A'}
                            </span>
                            <span class="episode-release">${episode.air_date}</span>
                            <span>•</span>
                            <span class="episode-runtime">${episode.runtime ? `${episode.runtime}m` : 'N/A'}</span>
                        </div>
                        <p class="episode-overview">${episode.overview || "No overview available for this episode."}</p>
                    </div>
                `;
                episodeCard.innerHTML = cardHtml;
                episodesContainer.appendChild(episodeCard);
            });
        } else {
            episodesContainer.innerHTML = '<p class="error-message">No episodes found for this season.</p>';
        }

    } catch (error) {
        console.error("Failed to load episodes page:", error);
        episodesContainer.innerHTML = '<p class="error-message">Failed to load content. Please check your connection and try again.</p>';
    } finally {
        spinnerEpisodes.style.display = 'none';
    }
}

window.addEventListener('load', loadEpisodesPage);

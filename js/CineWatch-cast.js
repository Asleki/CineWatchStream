/* ==========================================================
   File: CineWatch-cast.js
   Purpose: Fetches and displays cast member details and filmography
   using the TMDb API based on the actorId from the URL.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMAGE_URL = 'https://image.tmdb.org/t/p/original';
    const SMALL_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

    const pageTitleEl = document.getElementById('pageTitle');
    const heroSectionEl = document.getElementById('heroSection');
    const mainContentEl = document.getElementById('mainContent');
    const profileImageEl = document.getElementById('profileImage');
    const actorNameEl = document.getElementById('actorName');
    const actorKnownForEl = document.getElementById('actorKnownFor');
    const actorBioEl = document.getElementById('actorBio');
    const actorBornEl = document.getElementById('actorBorn');
    const filmographyGridEl = document.getElementById('filmographyGrid');
    const loadingMessageEl = document.getElementById('loadingMessage');
    const errorMessageEl = document.getElementById('errorMessage');

    // Function to get actorId from URL
    const getActorIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('actorId');
    };

    // Function to fetch actor details from TMDb API
    const fetchActorDetails = async (actorId) => {
        try {
            const response = await fetch(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}`);
            if (!response.ok) {
                throw new Error('Failed to fetch actor details.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching actor details:', error);
            throw error;
        }
    };

    // Function to fetch actor's filmography from TMDb API
    const fetchActorFilmography = async (actorId) => {
        try {
            const response = await fetch(`${BASE_URL}/person/${actorId}/combined_credits?api_key=${API_KEY}`);
            if (!response.ok) {
                throw new Error('Failed to fetch filmography.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching filmography:', error);
            throw error;
        }
    };

    // Function to create a film card
    const createFilmCard = (media) => {
        const card = document.createElement('a');
        const mediaTitle = media.title || media.name;
        const releaseDate = media.release_date || media.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        const posterPath = media.poster_path ? `${SMALL_IMAGE_URL}${media.poster_path}` : 'https://placehold.co/150x225/2c2c2c/8c8c8c?text=Poster+Unavailable';

        card.href = media.media_type === 'movie' ? `movie.html?movieId=${media.id}` : `tv.html?tvId=${media.id}`;
        card.className = 'film-card';

        card.innerHTML = `
            <img src="${posterPath}" alt="${mediaTitle} Poster">
            <div class="film-info">
                <h4>${mediaTitle}</h4>
                <p class="character">${media.character || 'N/A'}</p>
                <p class="year">${year}</p>
            </div>
        `;
        return card;
    };

    // Main function to load and display the data
    const loadCastPage = async () => {
        const actorId = getActorIdFromUrl();

        if (!actorId) {
            loadingMessageEl.classList.add('hidden');
            errorMessageEl.classList.remove('hidden');
            errorMessageEl.innerHTML = '<p>Error: No actor ID provided in the URL.</p>';
            mainContentEl.classList.add('no-hero');
            return;
        }

        try {
            const actorDetails = await fetchActorDetails(actorId);
            const filmographyData = await fetchActorFilmography(actorId);

            // Hide loading message and show content
            loadingMessageEl.classList.add('hidden');
            mainContentEl.style.display = 'flex';

            // Set page title
            pageTitleEl.textContent = `${actorDetails.name} - CineWatch`;

            // Find a movie with a backdrop and set it as the hero image
            const movieWithBackdrop = filmographyData.cast.find(item => item.backdrop_path);
            if (movieWithBackdrop) {
                heroSectionEl.style.backgroundImage = `url(${IMAGE_URL}${movieWithBackdrop.backdrop_path})`;
            } else {
                heroSectionEl.classList.add('hidden');
                mainContentEl.classList.add('no-hero');
            }

            // Populate actor profile section
            const profileImagePath = actorDetails.profile_path ? `${SMALL_IMAGE_URL}${actorDetails.profile_path}` : 'https://placehold.co/200x300/333333/969696?text=Image';
            profileImageEl.src = profileImagePath;
            profileImageEl.alt = `${actorDetails.name} Profile`;

            actorNameEl.textContent = actorDetails.name;
            actorKnownForEl.textContent = actorDetails.known_for_department || '';

            const bioText = actorDetails.biography.split('\n')[0] || 'Biography not available.';
            actorBioEl.textContent = bioText;

            if (actorDetails.birthday) {
                actorBornEl.textContent = `Born: ${actorDetails.birthday}`;
            } else {
                actorBornEl.textContent = '';
            }

            // Populate filmography grid
            filmographyGridEl.innerHTML = ''; // Clear spinner
            
            // Sort filmography by release date (most recent first)
            const sortedFilmography = filmographyData.cast.sort((a, b) => {
                const dateA = a.release_date || a.first_air_date;
                const dateB = b.release_date || b.first_air_date;
                return new Date(dateB) - new Date(dateA);
            });

            if (sortedFilmography.length > 0) {
                sortedFilmography.forEach(media => {
                    const filmCard = createFilmCard(media);
                    filmographyGridEl.appendChild(filmCard);
                });
            } else {
                filmographyGridEl.innerHTML = '<p class="text-center text-gray-500">No filmography available.</p>';
            }

        } catch (error) {
            loadingMessageEl.classList.add('hidden');
            errorMessageEl.classList.remove('hidden');
            mainContentEl.classList.add('no-hero');
        }
    };

    // Initialize page
    loadCastPage();
});
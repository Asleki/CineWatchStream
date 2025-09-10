/* ==========================================================
   File: cast.js
   Purpose: Handles all dynamic functionality for the Cast & Crew
            page, including fetching actor details and their
            filmography from the TMDB API.
   ========================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3'; // Your API Key
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_PROFILE_URL = 'https://image.tmdb.org/t/p/w300';
    const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w300';
    const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

    // DOM Elements
    const heroSection = document.getElementById('heroSection');
    const mainContent = document.getElementById('mainContent');
    const backButton = document.getElementById('backButton');
    const profileImageElement = document.getElementById('profileImage');
    const actorNameElement = document.getElementById('actorName');
    const actorKnownForElement = document.getElementById('actorKnownFor');
    const actorBioElement = document.getElementById('actorBio');
    const actorBornElement = document.getElementById('actorBorn');
    const filmographyContainer = document.getElementById('filmographyContainer');
    const profileSpinner = document.getElementById('profileSpinner');
    const filmographySpinner = document.getElementById('filmographySpinner');
    const actorProfileContainer = document.getElementById('actorProfile');


    // Get actor ID and backdrop path from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const actorId = urlParams.get('actorId');
    const backdropPath = urlParams.get('backdrop');

    // --- Conditional UI based on URL parameters ---
    if (backdropPath) {
        // Set hero background and adjust main content margin
        heroSection.style.backgroundImage = `url(${TMDB_BACKDROP_URL}${backdropPath})`;
        heroSection.classList.remove('hidden');
        mainContent.classList.remove('no-hero');
    } else {
        // Hide hero section and set fallback margin
        heroSection.classList.add('hidden');
        mainContent.classList.add('no-hero');
    }

    // Check if actorId exists, otherwise display an error
    if (!actorId) {
        actorProfileContainer.innerHTML = '<p class="error-message">Error: No actor ID provided.</p>';
        profileSpinner.style.display = 'none';
        filmographySpinner.style.display = 'none';
        return;
    }

    /**
     * Fetches data from a given TMDB API endpoint.
     * @param {string} endpoint The API endpoint to fetch.
     * @returns {Promise<object|null>} The JSON data or null on error.
     */
    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${API_KEY}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    // Fetch actor details
    const actorData = await fetchData(`/person/${actorId}`);
    profileSpinner.style.display = 'none'; // Hide spinner after fetch

    if (actorData) {
        // Populate actor profile information
        const profileImageSrc = actorData.profile_path 
            ? `${TMDB_PROFILE_URL}${actorData.profile_path}` 
            : 'https://via.placeholder.com/300x450.png?text=No+Image';
        
        profileImageElement.src = profileImageSrc;
        profileImageElement.alt = `Profile photo of ${actorData.name}`;
        profileImageElement.classList.remove('hidden');
        
        actorNameElement.textContent = actorData.name || 'Unknown Actor';
        actorKnownForElement.textContent = actorData.known_for_department || '';
        actorBioElement.textContent = actorData.biography || 'No biography available.';
        actorBornElement.textContent = actorData.birthday ? `Born: ${actorData.birthday}` : '';

    } else {
        actorProfileContainer.innerHTML = '<p class="error-message">Actor not found.</p>';
        return; // Stop execution if actor data isn't found
    }

    // Fetch actor's combined credits (movies and TV shows)
    const creditsData = await fetchData(`/person/${actorId}/combined_credits`);
    filmographySpinner.style.display = 'none'; // Hide spinner

    if (creditsData && creditsData.cast) {
        filmographyContainer.innerHTML = ''; // Clear the spinner element
        
        // Sort credits by release date (newest first)
        const sortedCredits = creditsData.cast.sort((a, b) => {
            const dateA = a.release_date || a.first_air_date || '';
            const dateB = b.release_date || b.first_air_date || '';
            return dateB.localeCompare(dateA);
        });

        sortedCredits.forEach(credit => {
            // Only create a card if a poster is available
            if (credit.poster_path) {
                const card = document.createElement('a');
                const mediaType = credit.media_type;
                
                card.href = `details.html?id=${credit.id}&type=${mediaType}`;
                card.classList.add('film-card');

                const posterSrc = `${TMDB_POSTER_URL}${credit.poster_path}`;
                const title = credit.title || credit.name || 'Untitled';
                const character = credit.character || '';
                const year = credit.release_date ? credit.release_date.substring(0, 4) : 
                             credit.first_air_date ? credit.first_air_date.substring(0, 4) : '';

                card.innerHTML = `
                    <img src="${posterSrc}" alt="${title} poster">
                    <div class="film-info">
                        <h4>${title}</h4>
                        <p class="character">${character}</p>
                        <p class="year">${year}</p>
                    </div>
                `;
                filmographyContainer.appendChild(card);
            }
        });
    } else {
        filmographyContainer.innerHTML = '<p class="text-center text-gray-500">Filmography not available.</p>';
    }

    // Back button functionality
    backButton.addEventListener('click', () => {
        window.history.back();
    });
});

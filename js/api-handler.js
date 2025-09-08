// ==========================================================
// File: api-handler.js
// Purpose: Centralized API configuration and data fetching.
// All other scripts should import or reference this file.
// ==========================================================

const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

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
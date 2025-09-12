/* ==========================================================
   File: CineWatch-playlist.js
   Purpose: Displays all items from the user's playlist saved in localStorage.
   ========================================================== */

import { playlistManager } from './utils/playlist.js';
import { setupPlaylistButtons } from './CineWatch-main.js';

document.addEventListener('DOMContentLoaded', () => {
    const playlistGrid = document.getElementById('playlistGrid');

    // Function to create and display a single playlist item card
    const createPlaylistCard = (item) => {
        const card = document.createElement('div');
        card.className = 'playlist-item';

        const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://placehold.co/180x270/2c2c2c/8c8c8c?text=Poster+Unavailable';
        const title = item.title || item.name;

        card.innerHTML = `
            <a href="details.html?id=${item.id}&type=${item.type}">
                <img src="${posterUrl}" alt="${title}">
                <h3>${title}</h3>
            </a>
            <button class="remove-btn" data-id="${item.id}" data-type="${item.type}" title="Remove from Playlist">&times;</button>
        `;

        return card;
    };

    // Load and display the playlist items on page load
    const loadPlaylist = () => {
        const playlist = playlistManager.getPlaylist();
        playlistGrid.innerHTML = ''; // Clear the container

        if (playlist.length === 0) {
            playlistGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Your playlist is empty.</p>';
        } else {
            playlist.forEach(item => {
                const card = createPlaylistCard(item);
                playlistGrid.appendChild(card);
            });
            // Re-initialize remove buttons after all cards are added
            setupPlaylistButtons('.remove-btn');
        }
    };

    // Initialize the page
    loadPlaylist();
});
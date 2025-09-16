/* ==========================================================
   File: CineWatch-playlist.js
   Purpose: Displays all items from the user's playlist saved in localStorage.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const playlistGrid = document.getElementById('playlistGrid');

    /**
     * Retrieves the playlist from localStorage.
     * @returns {Array<Object>} The playlist array.
     */
    const getPlaylist = () => {
        const playlist = localStorage.getItem('myPlaylist');
        return playlist ? JSON.parse(playlist) : [];
    };

    /**
     * Saves the updated playlist to localStorage.
     * @param {Array<Object>} playlist - The updated playlist array.
     */
    const savePlaylist = (playlist) => {
        localStorage.setItem('myPlaylist', JSON.stringify(playlist));
    };

    /**
     * Removes an item from the playlist and reloads the display.
     * @param {string} itemId - The ID of the item to remove.
     */
    const removeItem = (itemId) => {
        let playlist = getPlaylist();
        const updatedPlaylist = playlist.filter(item => item.id.toString() !== itemId);
        savePlaylist(updatedPlaylist);
        loadPlaylist();
    };

    /**
     * Creates and displays a single playlist item card.
     * @param {object} item - The playlist item object.
     * @returns {HTMLElement} The created card element.
     */
    const createPlaylistCard = (item) => {
        const card = document.createElement('div');
        card.className = 'playlist-item';

        const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://placehold.co/180x270/2c2c2c/8c8c8c?text=Poster+Unavailable';
        const title = item.title || item.name;

        card.innerHTML = `
            <a href="details.html?id=${item.id}&type=${item.media_type}">
                <img src="${posterUrl}" alt="${title}">
                <h3>${title}</h3>
            </a>
            <button class="remove-btn" data-id="${item.id}" title="Remove from Playlist">&times;</button>
        `;

        return card;
    };

    /**
     * Loads and displays the playlist items on page load.
     */
    const loadPlaylist = () => {
        const playlist = getPlaylist();
        playlistGrid.innerHTML = ''; // Clear the container

        if (playlist.length === 0) {
            playlistGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Your playlist is empty.</p>';
        } else {
            playlist.forEach(item => {
                const card = createPlaylistCard(item);
                playlistGrid.appendChild(card);
            });
        }
    };

    // Use event delegation to handle clicks on remove buttons
    playlistGrid.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('remove-btn')) {
            const itemId = target.dataset.id;
            removeItem(itemId);
        }
    });

    // Initialize the page
    loadPlaylist();
});
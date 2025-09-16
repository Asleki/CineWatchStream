// =====================
// js/CineWatch-playlist.js
// =====================

const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const playlistGrid = document.getElementById('playlistGrid');

/**
 * Creates a playlist card with all the show details.
 * @param {object} item - The show item from localStorage.
 */
function createPlaylistCard(item) {
    const card = document.createElement('div');
    card.classList.add('playlist-card');
    card.dataset.id = item.id;

    const posterUrl = item.poster_path ? `${TMDB_IMAGE_URL}${item.poster_path}` : 'images/placeholder-poster.png';
    const year = item.release_date ? new Date(item.release_date).getFullYear() : 'N/A';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${item.title} poster" class="playlist-card-poster">
        <div class="playlist-card-info">
            <h3 class="playlist-card-title">${item.title}</h3>
            <p class="playlist-card-meta">
                <span>${year}</span>
                <span class="dot-divider">·</span>
                <span>${item.genres}</span>
                <span class="dot-divider">·</span>
                <span>${item.language}</span>
            </p>
            <p class="playlist-card-synopsis">${item.overview}</p>
            <div class="playlist-card-actions">
                <a href="details.html?id=${item.id}&type=${item.media_type}" class="btn btn-primary">View Details</a>
                <button class="btn btn-secondary remove-btn"><i class="fas fa-trash-alt"></i> Remove</button>
            </div>
        </div>
    `;

    // Add event listener for the remove button
    card.querySelector('.remove-btn').addEventListener('click', () => {
        removeFromPlaylist(item.id);
    });

    return card;
}

/**
 * Renders the entire playlist from localStorage.
 */
function renderPlaylist() {
    const myPlaylist = JSON.parse(localStorage.getItem('myPlaylist')) || [];
    playlistGrid.innerHTML = ''; // Clear the grid before re-rendering

    if (myPlaylist.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'Your playlist is empty. Add some movies or TV shows to get started!';
        playlistGrid.appendChild(emptyMessage);
    } else {
        myPlaylist.forEach(item => {
            const card = createPlaylistCard(item);
            playlistGrid.appendChild(card);
        });
    }
}

/**
 * Removes an item from the playlist.
 * @param {number} id - The ID of the item to remove.
 */
function removeFromPlaylist(id) {
    let myPlaylist = JSON.parse(localStorage.getItem('myPlaylist')) || [];
    const updatedPlaylist = myPlaylist.filter(item => item.id !== id);
    localStorage.setItem('myPlaylist', JSON.stringify(updatedPlaylist));
    renderPlaylist(); // Re-render the playlist
}

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', renderPlaylist);
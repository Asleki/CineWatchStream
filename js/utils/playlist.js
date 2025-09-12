/* ==========================================================
   File: playlist.js
   Purpose: Handles all playlist management logic using localStorage.
   ========================================================== */

export const playlistManager = {
    // Key for storing the playlist in localStorage
    STORAGE_KEY: 'cineWatchPlaylist',

    // Fetches the current playlist from localStorage.
    getPlaylist: function() {
        const playlistString = localStorage.getItem(this.STORAGE_KEY);
        try {
            return playlistString ? JSON.parse(playlistString) : [];
        } catch (e) {
            console.error("Failed to parse playlist from localStorage:", e);
            return [];
        }
    },

    // Saves the updated playlist to localStorage.
    savePlaylist: function(playlist) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlist));
    },

    // Adds a new item (movie/TV show) to the playlist.
    addItem: function(item) {
        const playlist = this.getPlaylist();
        const existingItem = playlist.find(p => p.id === item.id && p.type === item.type);
        if (!existingItem) {
            playlist.push(item);
            this.savePlaylist(playlist);
            return true; // Item was added
        }
        return false; // Item already exists
    },

    // Removes an item from the playlist by its ID and type.
    removeItem: function(id, type) {
        let playlist = this.getPlaylist();
        playlist = playlist.filter(item => !(item.id === id && item.type === type));
        this.savePlaylist(playlist);
    }
};
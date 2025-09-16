export const playlistManager = {
    getPlaylist: () => {
        const playlist = localStorage.getItem('myPlaylist');
        return playlist ? JSON.parse(playlist) : [];
    },

    savePlaylist: (playlist) => {
        localStorage.setItem('myPlaylist', JSON.stringify(playlist));
    },

    addItem: (item) => {
        const playlist = playlistManager.getPlaylist();
        const existingItem = playlist.find(i => i.id === item.id);
        if (!existingItem) {
            playlist.push(item);
            playlistManager.savePlaylist(playlist);
            return true;
        }
        return false;
    },

    removeItem: (itemId) => {
        let playlist = playlistManager.getPlaylist();
        const updatedPlaylist = playlist.filter(item => item.id.toString() !== itemId.toString());
        playlistManager.savePlaylist(updatedPlaylist);
    }
};
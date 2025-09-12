/* ==========================================================
   File: CineWatch-profile.js
   Purpose: Handles the logic for the user profile page.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is logged in
    // NOTE: This is a placeholder. You need to implement your own
    // authentication check here, for example, by checking for a token
    // in localStorage or a session cookie.
    const isAuthenticated = true; // Placeholder for a real auth check

    if (!isAuthenticated) {
        // Redirect to login or home page if not authenticated
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const profileImage = document.getElementById('profileImage');
    const profilePicUpload = document.getElementById('profile-pic-upload');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const memberSinceDisplay = document.getElementById('memberSinceDisplay');
    const usernameInput = document.getElementById('usernameInput');
    const profileUpdateForm = document.getElementById('profileUpdateForm');
    const statusMessage = document.getElementById('statusMessage');

    // Helper function to show status messages
    function showAlert(message, type) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `status-message ${type}`;
            statusMessage.style.display = 'block';
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000); // Hide after 5 seconds
        }
    }

    // Fetch and display user details
    const fetchUserDetails = async () => {
        // NOTE: Replace this with an actual API call to your backend
        // to fetch the user's data.
        // Placeholder user data
        const userData = {
            username: "Alex_Malunda",
            email: "alex.m@example.com",
            memberSince: "2024-01-15",
            profilePicUrl: "https://i.pravatar.cc/150?u=a" // Placeholder image
        };

        if (userData) {
            usernameDisplay.textContent = userData.username;
            emailDisplay.textContent = userData.email;
            memberSinceDisplay.textContent = new Date(userData.memberSince).toLocaleDateString();
            profileImage.src = userData.profilePicUrl;
            usernameInput.value = userData.username;
        } else {
            // Handle case where user data could not be fetched
            usernameDisplay.textContent = "N/A";
            emailDisplay.textContent = "N/A";
            memberSinceDisplay.textContent = "N/A";
            showAlert("Failed to load user data.", "error");
        }
    };

    // Handle form submission for updating username
    profileUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUsername = usernameInput.value.trim();

        if (newUsername.length < 3) {
            showAlert("Username must be at least 3 characters long.", "error");
            return;
        }

        // NOTE: Replace this with an actual API call to update the username.
        const success = true; // Placeholder for API response
        if (success) {
            usernameDisplay.textContent = newUsername;
            showAlert("Username updated successfully!", "success");
        } else {
            showAlert("Failed to update username. Please try again.", "error");
        }
    });

    // Handle profile picture update
    profilePicUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // NOTE: Replace this with an actual API call to upload the image.
        const imageUrl = URL.createObjectURL(file);
        
        showAlert("Profile picture updated successfully! (Local preview)", "success");
        profileImage.src = imageUrl;

        // Clean up the object URL to free up memory
        profileImage.onload = () => URL.revokeObjectURL(imageUrl);
    });

    // Initial fetch of user details
    fetchUserDetails();
});
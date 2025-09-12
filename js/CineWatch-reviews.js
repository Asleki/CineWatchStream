/* ==========================================================
   File: CineWatch-reviews.js
   Purpose: Fetches and displays all reviews for a movie or TV show.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
    const BASE_URL = 'https://api.themoviedb.org/3';

    const pageTitleEl = document.getElementById('pageTitle');
    const reviewsTitleEl = document.getElementById('reviewsTitle');
    const reviewsSectionEl = document.getElementById('reviewsSection');
    const reviewsSpinnerEl = document.getElementById('reviewsSpinner');
    const noReviewsMessageEl = document.getElementById('noReviewsMessage');
    const errorMessageEl = document.getElementById('errorMessage');

    // Function to get movie/tv ID and type from URL
    const getUrlParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            id: urlParams.get('id'),
            type: urlParams.get('type') // 'movie' or 'tv'
        };
    };

    // Function to fetch reviews from TMDb API
    const fetchReviews = async (id, type) => {
        try {
            const url = `${BASE_URL}/${type}/${id}/reviews?api_key=${API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch reviews.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    };

    // Function to fetch movie/tv details for the page title
    const fetchTitleDetails = async (id, type) => {
        try {
            const url = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch title details.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching title details:', error);
            return null;
        }
    };

    // Function to create a single review card
    const createReviewCard = (review) => {
        const card = document.createElement('div');
        card.className = 'review-card';

        const date = new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const reviewContent = review.content || 'No content provided.';
        const isTruncated = reviewContent.length > 300; // Truncate reviews longer than 300 characters
        const truncatedContent = isTruncated ? reviewContent.substring(0, 300) + '...' : reviewContent;

        card.innerHTML = `
            <div class="review-header">
                <span class="review-author">A review by ${review.author}</span>
                <span class="review-date">Posted on ${date}</span>
            </div>
            <div class="review-body">
                <p class="review-content ${isTruncated ? 'truncated' : ''}">${truncatedContent}</p>
                ${isTruncated ? `<button class="read-more-btn">Read more</button>` : ''}
            </div>
        `;

        if (isTruncated) {
            const readMoreBtn = card.querySelector('.read-more-btn');
            const contentEl = card.querySelector('.review-content');
            readMoreBtn.addEventListener('click', () => {
                const isExpanded = contentEl.classList.toggle('truncated');
                readMoreBtn.textContent = isExpanded ? 'Read more' : 'Read less';
                contentEl.textContent = isExpanded ? truncatedContent : reviewContent;
            });
        }
        return card;
    };

    // Main function to load and display reviews
    const loadReviewsPage = async () => {
        const { id, type } = getUrlParams();

        if (!id || (type !== 'movie' && type !== 'tv')) {
            reviewsSpinnerEl.classList.add('hidden');
            errorMessageEl.classList.remove('hidden');
            errorMessageEl.innerHTML = '<p>Error: Invalid or missing URL parameters.</p>';
            return;
        }

        try {
            const titleDetails = await fetchTitleDetails(id, type);
            if (titleDetails) {
                const title = titleDetails.title || titleDetails.name;
                pageTitleEl.textContent = `${title} Reviews - CineWatch`;
                reviewsTitleEl.textContent = `Reviews for "${title}"`;
            }

            const reviewsData = await fetchReviews(id, type);
            reviewsSpinnerEl.classList.add('hidden');

            if (reviewsData.results.length > 0) {
                reviewsData.results.forEach(review => {
                    const reviewCard = createReviewCard(review);
                    reviewsSectionEl.appendChild(reviewCard);
                });
            } else {
                noReviewsMessageEl.classList.remove('hidden');
            }

        } catch (error) {
            reviewsSpinnerEl.classList.add('hidden');
            errorMessageEl.classList.remove('hidden');
        }
    };

    // Initialize the page
    loadReviewsPage();
});
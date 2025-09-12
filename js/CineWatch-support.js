/* ==========================================================
   File: CineWatch-support.js
   Purpose: Handles the logic for the support page FAQ and search.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const faqsContainer = document.getElementById('faqsContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlertBtn = document.getElementById('closeAlertBtn');

    let allFaqs = [];
    let troubleWords = {};

    // Helper function to show a custom alert
    function showCustomAlert(message) {
        alertMessage.textContent = message;
        customAlert.style.display = 'flex';
    }

    // Close custom alert
    if (closeAlertBtn) {
        closeAlertBtn.addEventListener('click', () => {
            customAlert.style.display = 'none';
        });
    }

    // Function to render FAQs
    function renderFaqs(faqs) {
        faqsContainer.innerHTML = '';
        if (faqs.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
            faqs.forEach(faq => {
                const faqItem = document.createElement('div');
                faqItem.classList.add('faq-item');
                faqItem.innerHTML = `
                    <div class="faq-question">
                        <span>${faq.question}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        ${faq.answer}
                    </div>
                `;
                faqItem.addEventListener('click', () => {
                    faqItem.classList.toggle('active');
                });
                faqsContainer.appendChild(faqItem);
            });
        }
    }

    // Function to handle the search
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();

        // Check if the query is a "trouble word"
        if (troubleWords[query]) {
            showCustomAlert(troubleWords[query]);
            searchInput.value = ''; // Clear the input after response
            renderFaqs(allFaqs); // Show all FAQs again
            return;
        }

        const filteredFaqs = allFaqs.filter(faq => {
            const questionMatch = faq.question.toLowerCase().includes(query);
            const answerMatch = faq.answer.toLowerCase().includes(query);
            const keywordsMatch = faq.keywords.some(keyword => keyword.toLowerCase().includes(query));
            return questionMatch || answerMatch || keywordsMatch;
        });

        renderFaqs(filteredFaqs);
    }

    // Fetch the JSON data
    fetch('data/CineWatch-support.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load support data.');
            }
            return response.json();
        })
        .then(data => {
            allFaqs = data.faqs;
            troubleWords = data.troubleWords;
            renderFaqs(allFaqs);
        })
        .catch(error => {
            console.error('Error fetching support data:', error);
            noResultsMessage.textContent = 'Failed to load support data. Please try again later.';
            noResultsMessage.style.display = 'block';
        });

    // Add event listeners
    searchInput.addEventListener('input', handleSearch);
});
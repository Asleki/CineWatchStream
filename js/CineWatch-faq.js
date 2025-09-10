/* =====================
   js/CineWatch-faq.js
   ===================== */

document.addEventListener('DOMContentLoaded', () => {
    const faqAccordion = document.getElementById('faqAccordion');
    if (faqAccordion) {
        faqAccordion.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (question) {
                const faqItem = question.parentElement;
                
                // Toggle active class on the clicked item
                faqItem.classList.toggle('active');

                // Close all other open items
                document.querySelectorAll('.faq-item.active').forEach(item => {
                    if (item !== faqItem) {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }
});
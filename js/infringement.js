// Functionality for the multi-step infringement form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('infringement-form');
    const steps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const backBtns = document.querySelectorAll('.back-btn');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Handles the transition to the next form step
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = btn.closest('.form-step');
            const nextStepId = btn.getAttribute('data-next-step');
            const nextStep = document.getElementById(nextStepId);

            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            window.scrollTo(0, 0); // Scroll to top on step change
        });
    });

    // Handles the transition back to the previous form step
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = btn.closest('.form-step');
            const prevStepId = btn.getAttribute('data-prev-step');
            const prevStep = document.getElementById(prevStepId);

            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            window.scrollTo(0, 0); // Scroll to top on step change
        });
    });

    // Handles form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real application, you would send the form data to a server here.
        // For this example, we just show the success message.
        form.style.display = 'none';
        document.getElementById('success-modal').style.display = 'block';
        window.scrollTo(0, 0); // Scroll to top after submission
    });

    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    // Smoothly scroll to the top of the page when button is clicked
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
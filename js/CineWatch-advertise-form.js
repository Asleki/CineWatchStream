/* ==========================================================
   File: CineWatch-advertise-form.js
   Purpose: Handles the multi-step form logic and submission.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const packageDisplay = document.getElementById('package-display');
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const adForm = document.getElementById('adForm');
    const successMessage = document.getElementById('successMessage');

    let currentStep = 0;

    // Get package name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const packageName = urlParams.get('package');
    if (packageName) {
        packageDisplay.textContent = `Selected Plan: ${packageName}`;
    } else {
        packageDisplay.textContent = 'No package selected.';
    }

    // Function to update the stepper UI
    function updateStepperUI(stepIndex) {
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        stepContents.forEach((content, index) => {
            if (index === stepIndex) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    // Function to handle form validation for each step
    function validateStep(stepIndex) {
        let isValid = true;
        const currentContent = stepContents[stepIndex];
        const requiredInputs = currentContent.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                isValid = false;
                input.reportValidity(); // Show native browser validation error
            }
        });
        return isValid;
    }

    // Handle button clicks
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('next-btn')) {
            const stepNumber = parseInt(event.target.getAttribute('data-step')) - 1;
            if (validateStep(stepNumber)) {
                currentStep++;
                updateStepperUI(currentStep);
            }
        } else if (event.target.classList.contains('back-btn')) {
            currentStep--;
            updateStepperUI(currentStep);
        }
    });

    // Handle form submission
    adForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (validateStep(2)) {
            // Simulate form submission
            console.log('Form Submitted!');
            console.log('Package:', packageName);
            const formData = new FormData(adForm);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            // Hide the form and show the success message
            adForm.style.display = 'none';
            successMessage.style.display = 'block';
        }
    });

    // Initial UI setup
    updateStepperUI(currentStep);
});
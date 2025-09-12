/* ==========================================================
   File: CineWatch-advertise.js
   Purpose: Handles the dynamic rendering of ad packages and redirecting to the form page.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const packagesContainer = document.getElementById('packagesContainer');

    function renderPackages(packages) {
        packagesContainer.innerHTML = '';
        packages.forEach(pkg => {
            const card = document.createElement('div');
            card.classList.add('package-card');
            card.setAttribute('data-package-name', pkg.name);

            const featuresHtml = pkg.features.map(feature => `
                <li class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${feature}</span>
                </li>
            `).join('');

            card.innerHTML = `
                <div class="package-header">
                    <h2 class="package-name">${pkg.name}</h2>
                    <p class="package-price">${pkg.price} <span>/ year</span></p>
                </div>
                <div class="divider"></div>
                <p class="package-description">${pkg.description}</p>
                <ul class="package-features">
                    ${featuresHtml}
                </ul>
                <button class="select-btn">Select Plan</button>
            `;

            card.addEventListener('click', () => {
                const packageName = pkg.name;
                // Pass the selected package name via URL parameter
                window.location.href = `CineWatch-advertise-form.html?package=${encodeURIComponent(packageName)}`;
            });

            packagesContainer.appendChild(card);
        });
    }

    // Fetch the ad package data
    fetch('data/advertise-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load ad package data.');
            }
            return response.json();
        })
        .then(data => {
            renderPackages(data.ads_packages);
        })
        .catch(error => {
            console.error('Error fetching ad package data:', error);
            packagesContainer.innerHTML = `<p class="error-message">Failed to load ad packages. Please try again later.</p>`;
        });
});
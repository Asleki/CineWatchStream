/*
 * File: js/projects.js
 * Description: Dynamically loads and renders project data for multiple pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Listen for the custom event that signifies all HTML partials are loaded.
    document.addEventListener('partialsLoaded', async () => {
        const projectsData = await fetchProjectsData();
        if (!projectsData) {
            console.error("Failed to load projects data.");
            return;
        }

        // Determine which function to run based on the current page's URL
        const path = window.location.pathname;
        if (path.includes('dev-projects.html')) {
            renderFullProjectsList(projectsData);
        } else if (path.includes('dev-project-detail.html')) {
            renderProjectDetail(projectsData);
        } else if (path.includes('developer.html')) {
            renderDeveloperPageProjects(projectsData);
        }
    });

    async function fetchProjectsData() {
        try {
            const response = await fetch('data/dev-projects.json');
            if (!response.ok) {
                throw new Error('Failed to load project data.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching project data:', error);
            return null;
        }
    }

    function renderDeveloperPageProjects(projects) {
        const projectsGrid = document.getElementById('projects-grid-short');
        if (!projectsGrid) return;
        
        // Take the 6 most recent projects
        const recentProjects = projects.slice(0, 6);

        recentProjects.forEach(project => {
            const cardHtml = `
                <div class="project-card">
                    <div class="project-card-content">
                        <h3>${project.name}</h3>
                        <p>${project.description.slice(0, 100)}...</p>
                    </div>
                    <div class="project-card-footer">
                        <a href="dev-project-detail.html?id=${project.id}" class="btn btn-secondary">
                            View Details <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            projectsGrid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function renderFullProjectsList(projects) {
        const projectsGrid = document.getElementById('projects-grid-full');
        if (!projectsGrid) return;
        
        projects.forEach(project => {
            const skillsHtml = project.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('');
            
            const cardHtml = `
                <div class="project-card">
                    <div class="project-card-content">
                        <h3>${project.name}</h3>
                        <p>${project.description}</p>
                        <div class="skills-list">
                            ${skillsHtml}
                        </div>
                    </div>
                    <div class="project-card-footer">
                        <a href="dev-project-detail.html?id=${project.id}" class="btn btn-secondary">
                            View Details <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            projectsGrid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function renderProjectDetail(projects) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const project = projects.find(p => p.id === projectId);

        const projectDetailContainer = document.getElementById('project-detail');
        if (!project || !projectDetailContainer) {
            projectDetailContainer.innerHTML = '<h1>Project Not Found</h1><p>The requested project could not be found.</p>';
            document.title = 'Project Not Found';
            return;
        }
        
        document.title = `${project.name} - Project Details`;

        const skillsHtml = project.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('');
        const featuresHtml = project.features ? project.features.map(feature => `<li>${feature}</li>`).join('') : '';

        const detailHtml = `
            <h1>${project.name}</h1>
            <div class="project-details-meta">
                <span><i class="fa-solid fa-calendar-alt"></i> Dates: ${project.start_date} - ${project.finish_date}</span>
                <span><i class="fa-solid fa-screwdriver-wrench"></i> Skills: ${project.skills.join(', ')}</span>
            </div>
            <div class="project-description">
                <p>${project.description}</p>
            </div>
            ${project.features ? `
                <div class="project-features">
                    <h3>Key Features</h3>
                    <ul class="features-list">
                        ${featuresHtml}
                    </ul>
                </div>
            ` : ''}
            <div class="project-links">
                <a href="${project.github_link}" target="_blank" rel="noopener noreferrer" class="github-link">
                    <i class="fa-brands fa-github"></i> View on GitHub
                </a>
            </div>
        `;

        projectDetailContainer.innerHTML = detailHtml;
    }
});
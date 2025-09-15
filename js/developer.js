/* ==========================================================
   File: developer.js
   Purpose: Fetches project data from a JSON file and
        dynamically populates the developer's project
        portfolio on the main page.
   ========================================================== */

/**
 * A mapping of skills from the JSON file to their corresponding
 * Font Awesome icon classes.
 * @type {Object.<string, string>}
 */
const SKILL_ICONS = {
    "HTML": "fa-brands fa-html5",
    "CSS": "fa-brands fa-css3-alt",
    "JavaScript": "fa-brands fa-js",
    "Node.js": "fa-brands fa-node-js",
    "MongoDB": "fa-solid fa-database",
    "Python": "fa-brands fa-python",
    "C#": "fa-solid fa-c",
    "SQL": "fa-solid fa-database",
    "JSON": "fa-solid fa-code",
    "Git": "fa-brands fa-git-alt",
    "Tkinter": "fa-solid fa-window-maximize",
    "Express.js": "fa-solid fa-server",
    "RESTful APIs": "fa-solid fa-exchange-alt"
};

/**
 * Creates the HTML for the skill icons based on the skills array.
 * @param {string[]} skills - The array of skills for a project.
 * @returns {string} The HTML string for the skill icons.
 */
function createSkillIcons(skills) {
    return skills.map(skill => {
        const iconClass = SKILL_ICONS[skill] || "fa-solid fa-code"; // Default icon if not found
        return `<span class="skill-icon" title="${skill}"><i class="${iconClass}"></i></span>`;
    }).join('');
}

/**
 * Fetches the project data and dynamically renders the project cards.
 */
async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) {
        console.error("Could not find element with id 'projects-container'.");
        return;
    }

    try {
        const response = await fetch('data/dev-projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();

        // Display only the first 6 projects
        const projectsToShow = projects.slice(0, 6);

        projectsToShow.forEach(project => {
            const projectCard = document.createElement('article');
            projectCard.classList.add('project-card');

            const skillIconsHtml = createSkillIcons(project.skills);

            projectCard.innerHTML = `
                <img src="${project.image}" alt="Image for ${project.name}" class="project-card-image">
                <div class="project-card-content">
                    <h3>${project.name}</h3>
                    <p class="project-tagline">${project.description}</p>
                    <div class="tech-stack">
                        ${skillIconsHtml}
                    </div>
                </div>
                <a href="dev-project-detail.html?id=${project.id}" class="view-details-link">
                    View Details
                </a>
            `;

            projectsContainer.appendChild(projectCard);
        });
    } catch (error) {
        console.error("Failed to load projects:", error);
        projectsContainer.innerHTML = '<p class="error-message">Failed to load projects. Please try again later.</p>';
    }
}

// Event listener to run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadProjects);
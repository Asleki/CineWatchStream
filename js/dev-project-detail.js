/* ==========================================================
   File: dev-project-detail.js
   Purpose: Fetches a single project's details from a JSON file
        based on the URL query parameter and dynamically renders
        the project details page.
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
 * Fetches project data and renders the details for the specified project.
 */
async function loadProjectDetails() {
    // Get the project ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        console.error("No project ID found in URL.");
        return;
    }

    try {
        const response = await fetch('data/dev-projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();

        // Find the project with the matching ID
        const project = projects.find(p => p.id === projectId);

        if (!project) {
            const mainContent = document.querySelector('.developer-profile-container');
            mainContent.innerHTML = `
                <p class="error-message">Project not found.</p>
                <a href="dev-projects.html" class="back-link">
                    <i class="fa-solid fa-arrow-left"></i> Back to Projects
                </a>
            `;
            document.title = "Project Not Found";
            return;
        }

        // Populate the page with the project data
        document.getElementById('project-title').textContent = project.name;
        document.getElementById('project-image').src = project.image;
        document.getElementById('project-description').textContent = project.fullDescription || project.description;
        
        const techStackContainer = document.getElementById('tech-stack-icons');
        if (techStackContainer) {
            techStackContainer.innerHTML = createSkillIcons(project.skills);
        }

        const featuresList = document.getElementById('features-list');
        if (featuresList) {
            featuresList.innerHTML = project.features.map(feature => `<li>${feature}</li>`).join('');
        }

        // Update page title for SEO and usability
        document.title = `${project.name} - Project Details`;

    } catch (error) {
        console.error("Failed to load project details:", error);
        document.querySelector('.developer-profile-container').innerHTML = `<p class="error-message">Failed to load project. Please check your connection.</p>`;
    }
}

// Event listener to run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadProjectDetails);
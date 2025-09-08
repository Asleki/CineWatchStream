// Hardcoded TV show data with detailed cast information
const tvShows = [
    {
        title: "The Witcher",
        cast: [
            { name: "Henry Cavill", bio: "An English actor. He is known for his portrayals of Charles Brandon in The Tudors and Clark Kent / Superman in the DC Extended Universe.", photo: "https://placehold.co/300x450/333/666?text=Henry+Cavill" },
            { name: "Freya Allan", bio: "An English actress. She is best known for her role as Princess Cirilla of Cintra in the Netflix series The Witcher.", photo: "https://placehold.co/300x450/333/666?text=Freya+Allan" },
            { name: "Anya Chalotra", bio: "An English actress. She is known for her role as Yennefer of Vengerberg in the Netflix fantasy series The Witcher.", photo: "https://placehold.co/300x450/333/666?text=Anya+Chalotra" }
        ],
        releaseYear: 2019,
        tmdbRating: 8.2,
        rottenTomatoes: "68%",
        overview: "Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.",
        poster: "https://image.tmdb.org/t/p/w500/A3T0f3V8EaG5BvXjXqgXpT5nO3X.jpg"
    },
    {
        title: "Stranger Things",
        cast: [
            { name: "Millie Bobby Brown", bio: "An English actress. She gained recognition for playing the character Eleven in the Netflix science fiction series Stranger Things.", photo: "https://placehold.co/300x450/333/666?text=Millie+Bobby+Brown" },
            { name: "Finn Wolfhard", bio: "A Canadian actor and musician. His acting roles include Mike Wheeler in the Netflix series Stranger Things.", photo: "https://placehold.co/300x450/333/666?text=Finn+Wolfhard" },
            { name: "Winona Ryder", bio: "An American actress. Known for her portrayals of eccentric characters, she is the recipient of a Golden Globe Award and has been nominated for two Academy Awards.", photo: "https://placehold.co/300x450/333/666?text=Winona+Ryder" }
        ],
        releaseYear: 2016,
        tmdbRating: 8.7,
        rottenTomatoes: "92%",
        overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
        poster: "https://image.tmdb.org/t/p/w500/49z9wV2J6f7pA19d08eE4FhV4qA.jpg"
    },
    {
        title: "The Mandalorian",
        cast: [
            { name: "Pedro Pascal", bio: "A Chilean-American actor. He is known for playing Oberyn Martell in Game of Thrones and Din Djarin in The Mandalorian.", photo: "https://placehold.co/300x450/333/666?text=Pedro+Pascal" },
            { name: "Gina Carano", bio: "An American actress, TV personality, and former mixed martial artist. She played Cara Dune in the first two seasons of The Mandalorian.", photo: "https://placehold.co/300x450/333/666?text=Gina+Carano" },
            { name: "Giancarlo Esposito", bio: "An American actor. He is best known for his portrayal of Gus Fring in the AMC series Breaking Bad and its prequel Better Call Saul.", photo: "https://placehold.co/300x450/333/666?text=Giancarlo+Esposito" }
        ],
        releaseYear: 2019,
        tmdbRating: 8.5,
        rottenTomatoes: "93%",
        overview: "The Mandalorian is set after the fall of the Galactic Empire and before the emergence of the First Order. We follow the travails of a lone gunfighter in the outer reaches of the galaxy far from the authority of the New Republic.",
        poster: "https://image.tmdb.org/t/p/w500/9e0O1f9K3B2KkX08bQ9n6F7p9V6.jpg"
    }
];

// Get DOM elements
const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestionsList');
const detailsContainer = document.getElementById('detailsContainer');

// Function to display TV show details
function displayShowDetails(show) {
    let castHTML = show.cast.map(actor => `
        <div class="cast-card">
            <img src="${actor.photo}" alt="${actor.name} Photo" class="cast-photo">
            <div class="cast-info">
                <h3>${actor.name}</h3>
                <p><strong>Bio:</strong> ${actor.bio}</p>
            </div>
        </div>
    `).join('');

    detailsContainer.innerHTML = `
        <div class="show-card">
            <img src="${show.poster}" alt="${show.title} Poster" class="show-poster">
            <div class="show-info">
                <h3>${show.title}</h3>
                <p><strong>Release Year:</strong> ${show.releaseYear}</p>
                <p><strong>TMDb Rating:</strong> ${show.tmdbRating}</p>
                <p><strong>Rotten Tomatoes:</strong> ${show.rottenTomatoes}</p>
                <p><strong>Overview:</strong> ${show.overview}</p>
                <h4>Cast</h4>
                <div class="cast-list">
                    ${castHTML}
                </div>
            </div>
        </div>
    `;
    window.scrollTo({ top: detailsContainer.offsetTop, behavior: 'smooth' });
}

// Function to display a specific cast member's details
function displayCastDetails(actor) {
    detailsContainer.innerHTML = `
        <div class="cast-card">
            <img src="${actor.photo}" alt="${actor.name} Photo" class="cast-photo">
            <div class="cast-info">
                <h3>${actor.name}</h3>
                <p><strong>Bio:</strong> ${actor.bio}</p>
            </div>
        </div>
    `;
    window.scrollTo({ top: detailsContainer.offsetTop, behavior: 'smooth' });
}

// Event listener for search input
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    suggestionsList.innerHTML = '';
    
    if (searchTerm.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    const filteredSuggestions = [];

    // Search for shows
    tvShows.forEach(show => {
        if (show.title.toLowerCase().includes(searchTerm)) {
            filteredSuggestions.push({ type: 'show', data: show });
        }
    });

    // Search for cast members
    tvShows.forEach(show => {
        show.cast.forEach(actor => {
            if (actor.name.toLowerCase().includes(searchTerm)) {
                // Ensure we don't add the same actor multiple times
                if (!filteredSuggestions.some(s => s.type === 'cast' && s.data.name === actor.name)) {
                    filteredSuggestions.push({ type: 'cast', data: actor });
                }
            }
        });
    });

    if (filteredSuggestions.length > 0) {
        filteredSuggestions.forEach(item => {
            const li = document.createElement('li');
            if (item.type === 'show') {
                li.textContent = item.data.title;
                li.addEventListener('click', () => {
                    displayShowDetails(item.data);
                    searchInput.value = item.data.title;
                    suggestionsList.style.display = 'none';
                });
            } else { // type === 'cast'
                li.textContent = `${item.data.name} (Actor)`;
                li.addEventListener('click', () => {
                    displayCastDetails(item.data);
                    searchInput.value = item.data.name;
                    suggestionsList.style.display = 'none';
                });
            }
            suggestionsList.appendChild(li);
        });
        suggestionsList.style.display = 'block';
    } else {
        suggestionsList.style.display = 'none';
    }
});

// Hide suggestions when clicking outside the search area
document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container')) {
        suggestionsList.style.display = 'none';
    }
});
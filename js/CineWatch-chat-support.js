/* ==========================================================
   File: CineWatch-chat-support.js
   Purpose: Handles the chat bot logic for the support page.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatForm = document.getElementById('chatForm');

    let isLiveAgentMode = false;
    let supportData = {};
    let cinemaData = {};

    // Function to add a message to the chat
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
    }

    // Function to display bot typing indicator
    function showBotTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.textContent = 'Bot is typing...';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    // Function to hide bot typing indicator
    function hideBotTyping(typingDiv) {
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    // Bot's core response logic
    async function getBotResponse(userMessage) {
        const query = userMessage.toLowerCase().trim();

        // 1. Check for live agent request
        const agentKeywords = ['live agent', 'talk to agent', 'human', 'representative', 'connect to support'];
        if (agentKeywords.some(keyword => query.includes(keyword))) {
            addMessage("Connecting you to a live agent. Please wait a moment...", 'bot');
            const typingDiv = showBotTyping();
            setTimeout(() => {
                hideBotTyping(typingDiv);
                isLiveAgentMode = true;
                addMessage("Hello, this is a live agent. How can I assist you today?", 'bot');
            }, 3000); // Simulate a 3-second delay
            return;
        }

        // 2. Check for "trouble words"
        if (supportData.troubleWords[query]) {
            addMessage(supportData.troubleWords[query], 'bot');
            return;
        }

        // 3. Search for FAQ answers
        const faq = supportData.faqs.find(faqItem => {
            const questionMatch = faqItem.question.toLowerCase().includes(query);
            const keywordsMatch = faqItem.keywords.some(keyword => query.includes(keyword));
            return questionMatch || keywordsMatch;
        });

        if (faq) {
            addMessage(faq.answer, 'bot');
            return;
        }

        // 4. Search cinema guide data
        if (cinemaData && cinemaData.length > 0) {
            // Simple keyword search for cinema details
            for (const country of cinemaData) {
                for (const city of country.cities) {
                    for (const cinema of city.cinemaHalls) {
                        const nameMatch = cinema.name.toLowerCase().includes(query);
                        const paymentMatch = (query.includes('payment') || query.includes('pay')) && cinema.paymentMethods.some(method => query.includes(method.toLowerCase()));
                        const transportMatch = (query.includes('transport') || query.includes('get to')) && cinema.transportServices.some(service => query.includes(service.toLowerCase()));
                        const snackMatch = (query.includes('snack') || query.includes('food')) && cinema.snacks.some(snack => query.includes(snack.name.toLowerCase()));

                        if (nameMatch) {
                            addMessage(`The bot can provide details about ${cinema.name}. What would you like to know?`, 'bot');
                            return;
                        }
                        if (paymentMatch) {
                            addMessage(`Imax Nairobi accepts the following payment methods: ${cinema.paymentMethods.join(', ')}.`, 'bot');
                            return;
                        }
                        if (transportMatch) {
                            addMessage(`You can get to Imax Nairobi using: ${cinema.transportServices.join(', ')}.`, 'bot');
                            return;
                        }
                        if (snackMatch) {
                            addMessage(`Yes, Imax Nairobi serves snacks. You can get a ${cinema.snacks[0].name} for ${cinema.snacks[0].price} KES.`, 'bot');
                            return;
                        }
                    }
                }
            }
        }
        
        // 5. Default fallback
        addMessage("I'm sorry, I don't have an answer for that. Would you like to be connected to a live agent?", 'bot');
    }

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessage(userMessage, 'user');
        chatInput.value = '';

        if (isLiveAgentMode) {
            addMessage("Thank you for your message. A live agent is now reviewing your query.", 'bot');
        } else {
            const typingDiv = showBotTyping();
            setTimeout(() => {
                hideBotTyping(typingDiv);
                getBotResponse(userMessage);
            }, 1500); // Simulate a short bot thinking time
        }
    });

    // Fetch required data from JSON files
    async function loadData() {
        try {
            const [supportResponse, cinemaResponse] = await Promise.all([
                fetch('data/CineWatch-support.json'),
                fetch('data/cinemaguide.json')
            ]);
            supportData = await supportResponse.json();
            cinemaData = await cinemaResponse.json();
            addMessage("Hello! I am the CineWatch Support Bot. How can I help you today?", 'bot');
        } catch (error) {
            console.error('Error loading data:', error);
            addMessage("I'm sorry, I am unable to connect right now. Please try again later.", 'bot');
        }
    }

    loadData();
});
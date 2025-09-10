        const API_KEY = '9c198aabc1df9fa96ea8d65e183cb8a3';
        const IMAGE_URL = 'https://image.tmdb.org/t/p/original';
        const SMALL_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

        // Utility function to show custom alerts
        function customAlert(message, type = 'info') {
            const alert = document.getElementById('customAlert');
            const alertMessage = document.getElementById('alertMessage');
            const alertIcon = document.getElementById('alertIcon');

            alertMessage.textContent = message;
            alertIcon.className = 'alert-icon'; // Reset class
            switch (type) {
                case 'success':
                    alertIcon.classList.add('fas', 'fa-check-circle', 'success');
                    break;
                case 'error':
                    alertIcon.classList.add('fas', 'fa-times-circle', 'error');
                    break;
                case 'warning':
                    alertIcon.classList.add('fas', 'fa-exclamation-triangle', 'warning');
                    break;
                default:
                    alertIcon.classList.add('fas', 'fa-info-circle', 'info');
                    break;
            }

            alert.style.display = 'flex';
        }

        document.getElementById('closeAlertBtn').addEventListener('click', () => {
            document.getElementById('customAlert').style.display = 'none';
        });

        // Get elements
        const moviePoster = document.getElementById('moviePoster');
        const movieTitle = document.getElementById('movieTitle');
        const cinemaName = document.getElementById('cinemaName');
        const viewMapBtn = document.getElementById('viewMapBtn');
        const mapModal = document.getElementById('mapModal');
        const mapImageContainer = document.getElementById('mapImageContainer');
        const confirmationModal = document.getElementById('confirmationModal');
        const showtimeContainer = document.getElementById('showtimeContainer');
        const seatContainer = document.getElementById('seatContainer');
        const snacksContainer = document.getElementById('snacksContainer');
        const transportContainer = document.getElementById('transportContainer');
        const paymentContainer = document.getElementById('paymentContainer');
        const totalPriceEl = document.getElementById('totalPrice');
        const summaryItems = document.getElementById('summaryItems');
        const nextStep1Btn = document.getElementById('nextStep1Btn');
        const prevStep2Btn = document.getElementById('prevStep2Btn');
        const nextStep2Btn = document.getElementById('nextStep2Btn');
        const prevStep3Btn = document.getElementById('prevStep3Btn');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

        const step1Content = document.getElementById('step-1-content');
        const step2Content = document.getElementById('step-2-content');
        const step3Content = document.getElementById('step-3-content');
        const step1Indicator = document.getElementById('step-1');
        const step2Indicator = document.getElementById('step-2');
        const step3Indicator = document.getElementById('step-3');

        // Global state
        let currentStep = 1;
        let selectedSeats = [];
        let selectedShowtime = null;
        let selectedSnacks = {};
        let selectedTransport = null;
        let movieData = null;
        let cinemaData = null;
        let seatPrice = 800;
        let transportPrices = {
            'Uber': 450,
            'Bolt': 400,
            'Bus': 100,
            'Tuk-tuk': 250
        };

        const updateTotalPrice = () => {
            let total = 0;
            total += selectedSeats.length * seatPrice;
            for (const snackId in selectedSnacks) {
                total += selectedSnacks[snackId].price * selectedSnacks[snackId].quantity;
            }
            if (selectedTransport) {
                total += transportPrices[selectedTransport];
            }
            totalPriceEl.textContent = `${total} KES`;
            
            // Update summary
            summaryItems.innerHTML = '';
            if (selectedSeats.length > 0) {
                const seatsEl = document.createElement('p');
                seatsEl.innerHTML = `<strong>Tickets:</strong> ${selectedSeats.length} (Seats: ${selectedSeats.join(', ')})`;
                summaryItems.appendChild(seatsEl);
            }
            if (Object.keys(selectedSnacks).length > 0) {
                const snacksEl = document.createElement('p');
                snacksEl.innerHTML = `<strong>Snacks:</strong>`;
                summaryItems.appendChild(snacksEl);
                for (const snackId in selectedSnacks) {
                    const snack = selectedSnacks[snackId];
                    const snackItemEl = document.createElement('p');
                    snackItemEl.innerHTML = `&emsp;${snack.name} x${snack.quantity} - ${snack.price * snack.quantity} KES`;
                    summaryItems.appendChild(snackItemEl);
                }
            }
            if (selectedTransport) {
                const transportEl = document.createElement('p');
                transportEl.innerHTML = `<strong>Transport:</strong> ${selectedTransport} - ${transportPrices[selectedTransport]} KES`;
                summaryItems.appendChild(transportEl);
            }
        };

        const renderSeats = (showtime) => {
            seatContainer.innerHTML = '';
            const occupiedSeats = showtime.occupiedSeats;
            const rows = 8;
            const cols = 12;
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const seatId = `${alphabet[i]}${j + 1}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const seatEl = document.createElement('div');
                    seatEl.className = `seat ${isOccupied ? 'occupied' : 'available'}`;
                    seatEl.textContent = j + 1;
                    seatEl.dataset.seatId = seatId;
                    seatEl.dataset.row = alphabet[i];
                    seatEl.dataset.col = j + 1;
                    if (!isOccupied) {
                        seatEl.addEventListener('click', () => {
                            if (seatEl.classList.contains('selected')) {
                                seatEl.classList.remove('selected');
                                selectedSeats = selectedSeats.filter(seat => seat !== seatId);
                            } else {
                                seatEl.classList.add('selected');
                                selectedSeats.push(seatId);
                            }
                            updateTotalPrice();
                        });
                    }
                    seatContainer.appendChild(seatEl);
                }
            }
        };

        const renderShowtimes = (showtimes) => {
            showtimeContainer.innerHTML = '';
            showtimes.forEach(showtime => {
                const button = document.createElement('button');
                button.className = 'showtime-btn';
                button.textContent = showtime.time;
                button.addEventListener('click', () => {
                    document.querySelectorAll('.showtime-btn').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    selectedShowtime = showtime;
                    selectedSeats = [];
                    renderSeats(selectedShowtime);
                    updateTotalPrice();
                });
                showtimeContainer.appendChild(button);
            });
            // Select the first showtime by default
            if (showtimes.length > 0) {
                showtimeContainer.querySelector('.showtime-btn').click();
            }
        };

        const renderSnacks = (snacks) => {
            snacksContainer.innerHTML = '';
            snacks.forEach((snack, index) => {
                const snackCard = document.createElement('div');
                snackCard.className = 'snack-card';
                snackCard.innerHTML = `
                    <img src="${snack.image}" alt="${snack.name}">
                    <div class="snack-info">
                        <h4>${snack.name}</h4>
                        <p>${snack.price} KES</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-snack-id="${index}">-</button>
                        <span class="quantity-count" id="snack-qty-${index}">0</span>
                        <button class="quantity-btn plus" data-snack-id="${index}">+</button>
                    </div>
                `;
                snacksContainer.appendChild(snackCard);
            });

            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const snackId = e.target.dataset.snackId;
                    if (!selectedSnacks[snackId]) {
                        selectedSnacks[snackId] = { ...snacks[snackId], quantity: 0 };
                    }
                    selectedSnacks[snackId].quantity++;
                    document.getElementById(`snack-qty-${snackId}`).textContent = selectedSnacks[snackId].quantity;
                    updateTotalPrice();
                });
            });

            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const snackId = e.target.dataset.snackId;
                    if (selectedSnacks[snackId] && selectedSnacks[snackId].quantity > 0) {
                        selectedSnacks[snackId].quantity--;
                        document.getElementById(`snack-qty-${snackId}`).textContent = selectedSnacks[snackId].quantity;
                        if (selectedSnacks[snackId].quantity === 0) {
                            delete selectedSnacks[snackId];
                        }
                        updateTotalPrice();
                    }
                });
            });
        };

        const renderTransport = (transportServices) => {
            transportContainer.innerHTML = '';
            transportServices.forEach(service => {
                const transportEl = document.createElement('label');
                transportEl.className = 'transport-option';
                transportEl.innerHTML = `
                    <input type="radio" name="transport" value="${service}">
                    <div class="transport-card">
                        <i class="fas fa-car-side"></i>
                        <span>${service}</span>
                        <span>${transportPrices[service] || 'Price varies'} KES</span>
                    </div>
                `;
                transportContainer.appendChild(transportEl);
            });
            document.querySelectorAll('input[name="transport"]').forEach(input => {
                input.addEventListener('change', (e) => {
                    selectedTransport = e.target.value;
                    updateTotalPrice();
                });
            });
        };

        const renderPaymentMethods = (paymentMethods) => {
            paymentContainer.innerHTML = '';
            const getIcon = (method) => {
                switch (method.toLowerCase()) {
                    case 'm-pesa':
                        return `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_logo.svg/1200px-M-PESA_logo.svg.png" alt="M-Pesa" class="payment-icon">`;
                    case 'cash':
                        return `<i class="fas fa-money-bill-wave"></i>`;
                    case 'visa':
                        return `<i class="fab fa-cc-visa"></i>`;
                    case 'mastercard':
                        return `<i class="fab fa-cc-mastercard"></i>`;
                    default:
                        return `<i class="fas fa-credit-card"></i>`;
                }
            };

            paymentMethods.forEach(method => {
                const paymentEl = document.createElement('label');
                paymentEl.className = 'payment-option';
                paymentEl.innerHTML = `
                    <input type="radio" name="payment" value="${method}" required>
                    <div class="payment-card">
                        ${getIcon(method)}
                        <span>${method}</span>
                    </div>
                `;
                paymentContainer.appendChild(paymentEl);
            });
        };
        
        // Navigation Functions
        const goToStep = (step) => {
            currentStep = step;
            step1Content.classList.remove('active');
            step2Content.classList.remove('active');
            step3Content.classList.remove('active');
            step1Indicator.classList.remove('active');
            step2Indicator.classList.remove('active');
            step3Indicator.classList.remove('active');

            if (step === 1) {
                step1Content.classList.add('active');
                step1Indicator.classList.add('active');
            } else if (step === 2) {
                step2Content.classList.add('active');
                step1Indicator.classList.add('active');
                step2Indicator.classList.add('active');
            } else if (step === 3) {
                step3Content.classList.add('active');
                step1Indicator.classList.add('active');
                step2Indicator.classList.add('active');
                step3Indicator.classList.add('active');
            }
        };

        const initPage = async () => {
            const params = new URLSearchParams(window.location.search);
            const movieId = params.get('movie_id');
            const cinemaId = params.get('cinema_id');
            
            if (!movieId || !cinemaId) {
                customAlert('Invalid movie or cinema selected.', 'error');
                return;
            }

            try {
                // Fetch movie details from TMDB API
                const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
                movieData = await movieResponse.json();

                // Fetch cinema data from your local file
                const cinemaResponse = await fetch('cinemaguide.json');
                const allCinemas = await cinemaResponse.json();
                
                cinemaData = allCinemas.flatMap(c => c.cities)
                                       .flatMap(c => c.cinemaHalls)
                                       .find(hall => hall.id === cinemaId);

                if (!movieData || !cinemaData) {
                    customAlert('Failed to load movie or cinema data.', 'error');
                    return;
                }

                // Render page content
                moviePoster.src = `${SMALL_IMAGE_URL}${movieData.poster_path}`;
                moviePoster.alt = `${movieData.title} poster`;
                movieTitle.textContent = movieData.title;
                cinemaName.textContent = cinemaData.name;

                renderShowtimes(cinemaData.showtimes || []);
                renderSnacks(cinemaData.snacks || []);
                renderTransport(cinemaData.transportServices || []);
                renderPaymentMethods(cinemaData.paymentMethods || []);

                // Event Listeners for Nav
                nextStep1Btn.addEventListener('click', () => {
                    if (selectedSeats.length === 0) {
                        customAlert('Please select at least one seat.', 'warning');
                    } else {
                        goToStep(2);
                    }
                });
                nextStep2Btn.addEventListener('click', () => goToStep(3));
                prevStep2Btn.addEventListener('click', () => goToStep(1));
                prevStep3Btn.addEventListener('click', () => goToStep(2));
                
                // Modal Logic
                viewMapBtn.addEventListener('click', () => {
                    if (cinemaData.mapUrl) {
                        mapImageContainer.innerHTML = `<img src="${cinemaData.mapUrl}" alt="Cinema Location Map">`;
                        mapModal.style.display = 'flex';
                    } else {
                        customAlert('No map available for this cinema.', 'info');
                    }
                });

                document.querySelectorAll('.close-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        btn.closest('.modal').style.display = 'none';
                    });
                });

                window.addEventListener('click', (event) => {
                    if (event.target === mapModal) {
                        mapModal.style.display = 'none';
                    }
                    if (event.target === confirmationModal) {
                        confirmationModal.style.display = 'none';
                    }
                });

                confirmPaymentBtn.addEventListener('click', () => {
                    const confirmationMessageEl = document.getElementById('confirmationMessage');
                    const confirmationContactEl = document.getElementById('confirmationContact');
                    confirmationMessageEl.textContent = cinemaData.welcomeMessage;
                    confirmationContactEl.textContent = `For assistance, contact us at ${cinemaData.contact}`;
                    confirmationModal.style.display = 'flex';
                });

                document.getElementById('closeConfirmationBtn').addEventListener('click', () => {
                    confirmationModal.style.display = 'none';
                });
                
            } catch (error) {
                console.error('Error initializing page:', error);
                customAlert('An error occurred. Please try again later.', 'error');
            }
        };

        document.addEventListener('DOMContentLoaded', initPage);
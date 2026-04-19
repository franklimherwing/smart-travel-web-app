// Configuration
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY'; // Replace with your actual Groq API key
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';

// DOM Elements
const destinationInput = document.getElementById('destination');
const planBtn = document.getElementById('planBtn');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const resultTitle = document.getElementById('resultTitle');
const itineraryContent = document.getElementById('itinerary');

// Event Listeners
planBtn.addEventListener('click', handlePlanTrip);
destinationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handlePlanTrip();
});

/**
 * Main function to handle trip planning
 */
async function handlePlanTrip() {
    const destination = destinationInput.value.trim();

    // Validation
    if (!destination) {
        showError('Please enter a destination');
        return;
    }

    // Hide previous results and errors
    hideError();
    resultsDiv.classList.add('hidden');
    
    // Show loading state
    showLoading();
    planBtn.disabled = true;

    try {
        // Try to get itinerary from Groq API
        const itinerary = await generateItineraryWithGroq(destination);
        displayResults(destination, itinerary);
    } catch (err) {
        console.error('Error generating itinerary:', err);
        
        // Fallback to local data if API fails
        const fallbackItinerary = getFallbackItinerary(destination);
        if (fallbackItinerary) {
            displayResults(destination, fallbackItinerary + '\n\n[Generated from local data - API unavailable]');
        } else {
            showError('Error generating trip. Please try again later.');
        }
    } finally {
        hideLoading();
        planBtn.disabled = false;
    }
}

/**
 * Generate itinerary using Groq API
 */
async function generateItineraryWithGroq(destination) {
    // Check if API key is set
    if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
        throw new Error('Groq API key not configured. Please set GROQ_API_KEY in app.js');
    }

    const prompt = `Create a structured 3-day travel itinerary for ${destination}.

Format your response exactly as follows:

Day 1:
* Morning: [activity]
* Afternoon: [activity]
* Evening: [activity]

Day 2:
* Morning: [activity]
* Afternoon: [activity]
* Evening: [activity]

Day 3:
* Morning: [activity]
* Afternoon: [activity]
* Evening: [activity]

Top Foods to Try:
* [food 1]
* [food 2]
* [food 3]

Travel Tips:
* [tip 1]
* [tip 2]
* [tip 3]

Keep the response concise and practical.`;

    const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            temperature: 0.7,
            max_tokens: 1024,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
    }

    return data.choices[0].message.content;
}

/**
 * Get fallback itinerary from local data
 */
function getFallbackItinerary(destination) {
    const normalized = destination.toLowerCase().trim();
    
    for (const place of DESTINATIONS) {
        if (place.name.toLowerCase() === normalized) {
            return place.itinerary;
        }
    }
    
    return null;
}

/**
 * Display results in the UI
 */
function displayResults(destination, itinerary) {
    resultTitle.textContent = `3-Day Itinerary: ${destination}`;
    itineraryContent.textContent = itinerary;
    resultsDiv.classList.remove('hidden');
    
    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

/**
 * Show loading state
 */
function showLoading() {
    loadingDiv.classList.remove('hidden');
}

/**
 * Hide loading state
 */
function hideLoading() {
    loadingDiv.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
}

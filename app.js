'use strict';

// To add your own API key, open the browser console (F12 or right-click -> Inspect -> Console) and set the GROQ_API_KEY variable with your key.
// Example: const GROQ_API_KEY = 'YOUR_API_KEY_HERE';

const GROQ_API_KEY = null; // Set to null by default

// Original functionality of app.js follows... //

const fetchData = async () => {
    const response = await fetch(`https://example.com/data?api_key=${GROQ_API_KEY}`);
    const data = await response.json();
    console.log(data);
};

fetchData();
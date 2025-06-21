const API_KEY = '1517e49c130de5a98046760c81da6e1a';
const btn = document.getElementById("search");
const result = document.getElementById("result"); 
const loading = document.getElementById("loading");
const cityInput = document.getElementById("city");

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchWeather();
    }
});

btn.addEventListener("click", searchWeather);

function searchWeather() {
    const cityName = cityInput.value.trim();
    
    if (!cityName) {
        showResult("Please enter a city name", "error");
        return;
    }

    loading.style.display = "block";
    result.classList.remove("show");
    btn.disabled = true;
    btn.textContent = "Searching...";

    const encodedCity = encodeURIComponent(cityName);
    const coordsUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}&limit=1&appid=${API_KEY}`;
    
    fetch(coordsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

                return fetch(weatherUrl);
            } else {
                throw new Error("City not found");
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(weatherData => {
            const temperature = Math.round(weatherData.main.temp);
            const feelsLike = Math.round(weatherData.main.feels_like);
            const cityName = weatherData.name;
            const country = weatherData.sys.country;
            const description = weatherData.weather[0].description;
            const humidity = weatherData.main.humidity;
            
            const weatherEmoji = getWeatherEmoji(weatherData.weather[0].main);
            
            const resultText = `
                <span class="weather-icon">${weatherEmoji}</span>
                <strong>${cityName}, ${country}</strong><br>
                Temperature: <strong>${temperature}°C</strong><br>
                Feels like: ${feelsLike}°C<br>
                ${description.charAt(0).toUpperCase() + description.slice(1)}<br>
                Humidity: ${humidity}%
            `;
            
            showResult(resultText, "success");
        })
        .catch(error => {
            console.error('Error:', error);
            let errorMessage = "Unable to fetch weather data";
            
            if (error.message === "City not found") {
                errorMessage = "City not found. Please check the spelling and try again.";
            } else if (error.message.includes("HTTP error")) {
                errorMessage = "Weather service is temporarily unavailable. Please try again later.";
            }
            
            showResult(errorMessage, "error");
        })
        .finally(() => {
            loading.style.display = "none";
            btn.disabled = false;
            btn.innerHTML = "🔍 Get Weather";
        });
}

function showResult(message, type) {
    result.innerHTML = message;
    result.className = `result ${type}`;
    
    setTimeout(() => {
        result.classList.add("show");
    }, 100);
}

function getWeatherEmoji(weatherMain) {
    const emojiMap = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Fog': '🌫️'
    };
    
    return emojiMap[weatherMain] || '🌤️';
}
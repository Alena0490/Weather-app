/*** Weather + position + icon */
//API for position
navigator.geolocation.getCurrentPosition(pos => {
  const { latitude, longitude } = pos.coords;
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
  .then(res => res.json())
  .then(geo => {
    const city = geo.address.city || geo.address.town || geo.address.village || 'Neznámá lokalita';
    document.querySelector('.current-location').textContent = city;
  });

//API for weather
const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,uv_index_max,weathercode&hourly=temperature_2m,weathercode,windspeed_10m&timezone=Europe%2FPrague`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const daily = data.daily;
      const hourly = data.hourly;
      const current = data.current_weather;

//Is Night?
// sunrise/sunset time strings
const sunriseTime = daily.sunrise[0].split('T')[1].slice(0, 5);
const sunsetTime = daily.sunset[0].split('T')[1].slice(0, 5);

// parse them to real Date objects
const now = new Date();
const todayDate = now.toISOString().split('T')[0];
const sunrise = new Date(`${todayDate}T${sunriseTime}:00`);
const sunset = new Date(`${todayDate}T${sunsetTime}:00`);
let night = isNight(now, sunrise, sunset);
 
// TESTING BLOCK ↓ 
// const testWeatherCode = 2; // or null
// let testNight = true;     //

// if (testWeatherCode !== null) current.weathercode = testWeatherCode;
// if (testNight !== null) night = testNight;
// TESTING BLOCK ↑


//Set backround - CSS class
  const weatherClass = mapWeatherCodeToClass(current.weathercode, night);
  document.body.className = ''; 
  document.body.classList.add(weatherClass);

//Get the weather icon
const icon = getWeatherIcon(current.weathercode, night);

//Render 5-day forecast
renderFiveDayForecast(daily); 
//Render 24-hour forecast with sunrise/sunset info
render24hForecast(hourly, sunrise, sunset); 

//Show current time in the top bar
const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
document.querySelector('.current-time').textContent = timeNow;
document.querySelector('.current-time').setAttribute('datetime', timeNow);

//Show current coordinates in the top bar
document.querySelector('.current-location').textContent = 
  `Souřadnice: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

/***Current weather */
//Clear the container before rendering current weather
const weatherContainer = document.querySelector('.current-weather');
weatherContainer.innerHTML = '';

//The box for current temperature
//Create the box for displaying the current temperature
const currentBox = document.createElement('div');
currentBox.classList.add('current-box');

//Container for the temperature value and icon
const tempEl = document.createElement('div');
tempEl.classList.add('current-temp');

//Weather icon element (e.g., sun, clouds, etc.)
const iconSpan = document.createElement('span');
iconSpan.classList.add('weather-icon');
iconSpan.innerHTML = icon;

//Temperature value (e.g., "22 °C")
const valueSpan = document.createElement('span');
valueSpan.classList.add('weather-value');
valueSpan.textContent = `${current.temperature} °C`;

//Combine icon and value into the temperature block
tempEl.appendChild(iconSpan);
tempEl.appendChild(valueSpan);

//Add the temperature block to the main current box
currentBox.appendChild(tempEl);


//Box pro other data
// Create container for additional weather data
const detailsBox = document.createElement('div');
detailsBox.classList.add('weather-details');

// Create wind element with icon and wind speed
const windEl = document.createElement('p');
windEl.classList.add('current-wind');
windEl.innerHTML = `<i class="fa-solid fa-wind"></i> <strong>Vítr: &nbsp;</strong> ${current.windspeed} km/h`;

// Create sunrise element with inline SVG icon and sunrise time
const sunriseEl = document.createElement('p');
sunriseEl.classList.add('sunrise');
sunriseEl.innerHTML = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg class="weather-icon2" aria-label="sunrise icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.25 19C4.25 18.5858 4.58579 18.25 5 18.25H19C19.4142 18.25 19.75 18.5858 19.75 19C19.75 19.4142 19.4142 19.75 19 19.75H5C4.58579 19.75 4.25 19.4142 4.25 19ZM7.25 22C7.25 21.5858 7.58579 21.25 8 21.25H16C16.4142 21.25 16.75 21.5858 16.75 22C16.75 22.4142 16.4142 22.75 16 22.75H8C7.58579 22.75 7.25 22.4142 7.25 22Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3C12.75 3.41421 12.4142 3.75 12 3.75C11.5858 3.75 11.25 3.41421 11.25 3V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L5.85211 4.79145C6.145 5.08434 6.145 5.55921 5.85211 5.85211C5.55921 6.145 5.08434 6.145 4.79145 5.85211L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861ZM19.6011 4.39887C19.894 4.69176 19.894 5.16664 19.6011 5.45953L19.2083 5.85237C18.9154 6.14526 18.4405 6.14526 18.1476 5.85237C17.8547 5.55947 17.8547 5.0846 18.1476 4.79171L18.5405 4.39887C18.8334 4.10598 19.3082 4.10598 19.6011 4.39887ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3C3.41421 11.25 3.75 11.5858 3.75 12C3.75 12.4142 3.41421 12.75 3 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM20.25 12C20.25 11.5858 20.5858 11.25 21 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H21C20.5858 12.75 20.25 12.4142 20.25 12Z" fill="currentColor"/>
<path d="M5.25 12C5.25 13.1778 5.5521 14.2858 6.08267 15.25H2C1.58579 15.25 1.25 15.5858 1.25 16C1.25 16.4142 1.58579 16.75 2 16.75H11.25V11.8107L10.5303 12.5303C10.2374 12.8232 9.76256 12.8232 9.46967 12.5303C9.17678 12.2374 9.17678 11.7626 9.46967 11.4697L11.4697 9.46967C11.7626 9.17678 12.2374 9.17678 12.5303 9.46967L14.5303 11.4697C14.8232 11.7626 14.8232 12.2374 14.5303 12.5303C14.2374 12.8232 13.7626 12.8232 13.4697 12.5303L12.75 11.8107V16.75H22C22.4142 16.75 22.75 16.4142 22.75 16C22.75 15.5858 22.4142 15.25 22 15.25H17.9173C18.4479 14.2858 18.75 13.1778 18.75 12C18.75 8.27208 15.7279 5.25 12 5.25C8.27208 5.25 5.25 8.27208 5.25 12Z" fill="currentColor"/>
</svg> <strong>Východ:&nbsp;</strong> ${sunriseTime}`;

// Create sunset element with inline SVG icon and sunset time
const sunsetEl = document.createElement('p');
sunsetEl.classList.add('sunset');
sunsetEl.innerHTML = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg class="weather-icon2" aria-label="sunset icon"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.25 19C4.25 18.5858 4.58579 18.25 5 18.25H19C19.4142 18.25 19.75 18.5858 19.75 19C19.75 19.4142 19.4142 19.75 19 19.75H5C4.58579 19.75 4.25 19.4142 4.25 19ZM7.25 22C7.25 21.5858 7.58579 21.25 8 21.25H16C16.4142 21.25 16.75 21.5858 16.75 22C16.75 22.4142 16.4142 22.75 16 22.75H8C7.58579 22.75 7.25 22.4142 7.25 22Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3C12.75 3.41421 12.4142 3.75 12 3.75C11.5858 3.75 11.25 3.41421 11.25 3V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L5.85211 4.79145C6.145 5.08434 6.145 5.55921 5.85211 5.85211C5.55921 6.145 5.08434 6.145 4.79145 5.85211L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861ZM19.6011 4.39887C19.894 4.69176 19.894 5.16664 19.6011 5.45953L19.2083 5.85237C18.9154 6.14526 18.4405 6.14526 18.1476 5.85237C17.8547 5.55947 17.8547 5.0846 18.1476 4.79171L18.5405 4.39887C18.8334 4.10598 19.3082 4.10598 19.6011 4.39887ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3C3.41421 11.25 3.75 11.5858 3.75 12C3.75 12.4142 3.41421 12.75 3 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM20.25 12C20.25 11.5858 20.5858 11.25 21 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H21C20.5858 12.75 20.25 12.4142 20.25 12Z" fill="currentColor"/>
<path d="M5.25 12C5.25 13.1778 5.5521 14.2858 6.08267 15.25H2C1.58579 15.25 1.25 15.5858 1.25 16C1.25 16.4142 1.58579 16.75 2 16.75H22C22.4142 16.75 22.75 16.4142 22.75 16C22.75 15.5858 22.4142 15.25 22 15.25H17.9173C18.4479 14.2858 18.75 13.1778 18.75 12C18.75 8.52558 16.125 5.66428 12.75 5.2912V9.18923L13.4697 8.46956C13.7626 8.17666 14.2374 8.17666 14.5303 8.46956C14.8232 8.76245 14.8232 9.23732 14.5303 9.53022L12.5303 11.5302C12.2374 11.8231 11.7626 11.8231 11.4697 11.5302L9.46967 9.53022C9.17678 9.23732 9.17678 8.76245 9.46967 8.46956C9.76256 8.17666 10.2374 8.17666 10.5303 8.46956L11.25 9.18923V5.2912C7.87504 5.66428 5.25 8.52558 5.25 12Z" fill="currentColor"/>
</svg> <strong>Západ:&nbsp;</strong> ${sunsetTime}`;

// Create max temperature element with icon and value
const maxTempEl = document.createElement('p');
maxTempEl.classList.add('max-temp');
maxTempEl.innerHTML = `<i class="fa-solid fa-temperature-high"></i> <strong>Max:&nbsp;</strong> ${daily.temperature_2m_max[0]} °C`;

// Create min temperature element with icon and value
const minTempEl = document.createElement('p');
minTempEl.classList.add('min-temp');
minTempEl.innerHTML = `<i class="fa-solid fa-temperature-low"></i> <strong>Min:&nbsp;</strong> ${daily.temperature_2m_min[0]} °C`;

// Create UV index element with icon and value
const uvIndexEl = document.createElement('p');
uvIndexEl.classList.add('uv-index');
uvIndexEl.innerHTML = `<i class="fa-solid fa-sun"></i> <strong>UV Index:&nbsp;</strong> ${daily.uv_index_max[0]}`;

// Append all detail elements to the container
detailsBox.append( sunriseEl, sunsetEl, maxTempEl, minTempEl, windEl, uvIndexEl);

// 🔧 Adding Items to the main container
weatherContainer.append(currentBox, detailsBox);

    })
    //⚠️ Error handling if the weather data could not be loaded
    .catch(err => {
      document.querySelector('.current-weather').textContent = 'Nepodařilo se načíst data.';  // Display fallback error message
      console.error(err); // Log error for debugging
    });
});

//Weather icons
function getWeatherIcon(code, night = false) {
  if (code === 0) return night ? '<img src="Glass-morphism/moon2.png" alt="full moon icon" class="main-icon">' : '<img src="Glass-morphism/sunny2.png" alt="sun icon" class="main-icon">';         // jasno
  if (code === 1) return night ? '<img src="Glass-morphism/cloudy-moon2.png" alt="full moon with a small cloud icon" class="main-icon">' : '<img src="Glass-morphism/cloudy2.png" alt="sun with a small cloud icon" class="main-icon">';         // skoro jasno
  if (code === 2) return night ? '<img src="Glass-morphism/cloudy-moon2.png" alt="full moon with a cloud icon" class="main-icon">' : '<img src="Glass-morphism/cloudy2.png" alt="sun with a cloud icon" class="main-icon">';           // polojasno
  if (code === 3) return '<img src="Glass-morphism/overcast2.png" alt="a cloud icon" class="main-icon">';
  if (code >= 45 && code <= 48) return '<img src="Glass-morphism/fog2.png" alt="fog icon" class="main-icon">';
  if (code >= 51 && code <= 67) return '<img src="Glass-morphism/rain2.png" alt="a rain cloud icon" class="main-icon">';
  if (code >= 71 && code <= 77) return '<img src="Glass-morphism/snow2.png" alt="a snow cloud icon" class="main-icon">';
  if (code >= 80 && code <= 82) return '<img src="Glass-morphism/showers2.png" alt="a rain cloud with a sun icon" class="main-icon">';
  if (code === 95) return '<img src="Glass-morphism/storm2.png" alt="a storm cloud icon" class="main-icon">';
  if (code > 95) return '<img src="Glass-morphism/hailstorm2.png" alt="a storm cloud icon" class="main-icon">';
  return '❔';
}

/**5 days */
function renderFiveDayForecast(daily) {
  const container = document.querySelector('.forecast-5-day');
  container.innerHTML = '';   // Clear previous content in the 5-day forecast container

   // Loop through the first 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(daily.time[i]); // Convert string to Date object
    const dayName = date.toLocaleDateString('cs-CZ', { weekday: 'short' }); // Get short weekday name in Czech
    const max = daily.temperature_2m_max[i]; // Max temperature of the day
    const min = daily.temperature_2m_min[i]; // Min temperature of the day
    const code = daily.weathercode[i]; // Weather code for icon
    const icon = getWeatherIcon(code);  // Get weather icon

    // Create wrapper for a single forecast item
    const item = document.createElement('div');
    item.classList.add('forecast-item');

    // Create and populate day name element
    const day = document.createElement('p');
    day.classList.add('forecast-day');
    day.innerHTML = `<strong>${dayName}</strong>`;

    // Create and populate weather icon element
    const weatherIcon = document.createElement('p');
    weatherIcon.classList.add('forecast-icon');
    weatherIcon.innerHTML = icon;

    // Create and populate temperature element (min/max)
    const temp = document.createElement('p');
    temp.classList.add('forecast-temp');
    temp.textContent = `${Math.round(min)}° / ${Math.round(max)}°`;

    // Append all parts to the item and then to the container
    item.append(day, weatherIcon, temp);
    container.appendChild(item);
  }
}

/***24 hours */
function render24hForecast(hourly, sunrise, sunset) {
  const container = document.querySelector('.forecast-24h');
  container.innerHTML = ''; // Clear previous content inside the container

// Loop through the first 24 hourly data points
  for (let i = 0; i < 24; i++) {
    const time = new Date(hourly.time[i]); // Convert string to Date object
    const isNightForHour = isNight(time, sunrise, sunset);  // Determine if it's night at this hour
    const timeText = time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }); // Format time, e.g. "03:00"

    const temp = hourly.temperature_2m[i];  // Get temperature for the hour
    const icon = getWeatherIcon(hourly.weathercode[i], isNightForHour); // Get appropriate icon

 // Create wrapper for the hour forecast item
    const item = document.createElement('div');
    item.classList.add('forecast-hour');

    // Create and populate time element
    const timeEl = document.createElement('p');
    timeEl.classList.add('hour-time');
    timeEl.innerHTML = `<strong>${timeText}</strong>`;

    // Create and populate weather icon element
    const weatherIcon = document.createElement('p');
    weatherIcon.classList.add('hour-icon');
    weatherIcon.innerHTML = icon;

    // Create and populate temperature element
    const temperature = document.createElement('p');
    temperature.classList.add('hour-temp');
    temperature.innerHTML = `${temp} °C`;

    // Append all parts to the item and then to the container
    item.append(timeEl, weatherIcon, temperature);
    container.appendChild(item);
  }
}

/***Is night? */
function isNight(now, sunrise, sunset) {
  return now < sunrise || now >= sunset;
}

/***Set page background */
function mapWeatherCodeToClass(code, night = false) {
  if (code === 0) return night ? 'clear-night' : 'sunny';
  if (code === 1 || code === 2) return night ? 'cloudy-night' : 'cloudy';
  if (code === 3) return night ? 'overcast-night' : 'overcast';
  if (code >= 45 && code <= 48) return night ? 'fog-night' : 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return night ? 'rainy-night' : 'rainy';
  if (code >= 71 && code <= 77) return night ? 'snow-night' : 'snow';
  if (code >= 95) return night ? 'storm-night' : 'storm';
  return 'default';
}

/**SET COLORS */
function setColor(input) {
  const lightness = getLightnessFromHex(input.value);
  const nightExceptions = ['clear-night', 'cloudy', 'cloudy-night', 'fog-night', 'storm-night'];
  const isNightMode = nightExceptions.some(cls => document.body.classList.contains(cls));
  
  const baseColor = input.value;
  const brandColor = `oklch(from ${baseColor} calc(l * 2) calc(c * 2) h)`;
  
  document.body.style.setProperty('--base-color', baseColor);
  
  // TEXT COLOR: black or white
const nightModeLightnessThreshold = 75; // night mode (switching point)

// TEXT COLOR: black or white
const textColor = isNightMode
  ? (lightness > nightModeLightnessThreshold ? 'black' : 'white')
  : (lightness > 60 ? 'black' : 'white');

document.body.style.setProperty('--text-color', textColor);
  
  // COMPLEMENTARY COLOR: according to contrast (lightness)
const complementaryThreshold = 37; // night mode (switching point)

const complementaryColor = lightness > complementaryThreshold
  ? '#f0f0f0'
  : 'oklch(from var(--brand-color) calc(l*1.2) c calc(h - 180))';

document.body.style.setProperty('--complementary-color', complementaryColor);

  
  // BRAND COLOR: switch brandColor and fallback (white/basic/black)
let finalBrand;

if (isNightMode) {
  //Night Bacground switch between brandColor and white
  finalBrand = lightness < 20 ? 'white' : brandColor;
} else {
  //Other backgrounds
  if (lightness > 68) {
    finalBrand = 'black';
  } else if (lightness < 20) {
    finalBrand = 'white';
  } else {
    finalBrand = brandColor;
  }
}
  
  document.body.style.setProperty('--brand-color', finalBrand);
  
  // SET localStorage
  localStorage.setItem('baseColor', baseColor);
}

//Reading the hex
function getLightnessFromHex(hex) {
  hex = hex.replace(/^#/, '');
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return +(brightness * 100).toFixed(2); // správný výstup 0–100
}

//Theme color
//Set theme-color meta tag (used by mobile browsers for UI coloring)
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const baseColor = getComputedStyle(document.body).getPropertyValue('--base-color').trim();

if (themeColorMeta && baseColor) {
    themeColorMeta.setAttribute('content', baseColor);
}

// Color input & reset button setup
const colorInput = document.querySelectorAll('#primary_color, #primary_color_watch');
const resetButtons = document.querySelectorAll('.reset'); // Změna: vybírám všechna reset tlačítka

// Show reset button when user picks a custom color
colorInput.forEach(input => {
  input.addEventListener('input', function () {
  setColor(this);
  //Show all reset buttons
  resetButtons.forEach(btn => {
    btn.style.display = 'inline-block';
  });
}); 
});

//Reset button logic – restores default color and hides reset icon
resetButtons.forEach(resetBtn => {
  resetBtn.addEventListener('click', () => {
    colorInput.forEach(input => {
      input.value = defaultColor;
      setColor(input);
    });
    localStorage.setItem('baseColor', defaultColor);
    //Hide both reset buttons
    resetButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  });
});

//Load color from localStorage on page load
const storedColor = localStorage.getItem('baseColor');
const defaultColor = '#572768';

if (storedColor) {
  colorInput.forEach(input => {
    input.value = storedColor;
    setColor(input);
  });
  // Show/hide both reset buttons
  const shouldShow = storedColor !== defaultColor;
  resetButtons.forEach(btn => {
    btn.style.display = shouldShow ? 'inline-block' : 'none';
  });
} else {
  colorInput.forEach(input => {
    input.value = defaultColor;
    setColor(input);
  });
  resetButtons.forEach(btn => {
    btn.style.display = 'none';
  });
}

// Watch mode fallback – input added after loading
const watchInput = document.querySelector('#primary_color_watch');

if (watchInput && !watchInput.dataset.bound) {
  watchInput.addEventListener('input', function () {
    setColor(this);
    resetButtons.forEach(btn => {
      btn.style.display = 'inline-block';
    });
  });
  watchInput.dataset.bound = true;
}

/** 24 hours - Scrollling */
//When clicking the right arrow – scrolls 3 forecast boxes to the right
document.querySelector('.scroll-right').addEventListener('click', () => {
// Get one forecast box to calculate its width
  const hourBox = document.querySelector('.forecast-hour');
  if (!hourBox) return; // Exit if no forecast box is found

const boxWidth = hourBox.getBoundingClientRect().width;
const step = boxWidth * 3; // Scroll by 3 boxes at a time

const container = document.querySelector('.forecast-24h'); // The horizontal scroll container
const maxScroll = container.scrollWidth - container.clientWidth;  // Maximum scroll value

// Scroll to the right unless already at the end
if (container.scrollLeft + step <= maxScroll) {
  container.scrollLeft += step;
} else {
  container.scrollLeft = maxScroll; // Snap to end if step goes too far
}
});

// When clicking the left arrow – scrolls 3 forecast boxes to the left
document.querySelector('.scroll-left').addEventListener('click', () => {
// Get one forecast box to calculate its width
  const hourBox = document.querySelector('.forecast-hour');
  if (!hourBox) return; // Exit if no forecast box is found

  const boxWidth = hourBox.getBoundingClientRect().width;
  const step = boxWidth * 3; // Scroll by 3 boxes at a time

  const container = document.querySelector('.forecast-24h');
  // Scroll to the left unless already at the beginning
  if (container.scrollLeft - step >= 0) {
    container.scrollLeft -= step;
  } else {
    container.scrollLeft = 0; // Snap to start if step goes too far back
  }
});







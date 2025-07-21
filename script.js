/*** Weather + poloha + ikona */

navigator.geolocation.getCurrentPosition(pos => {
  const { latitude, longitude } = pos.coords;
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
  .then(res => res.json())
  .then(geo => {
    const city = geo.address.city || geo.address.town || geo.address.village || 'Neznámá lokalita';
    document.querySelector('.current-location').textContent = city;

  });

const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,uv_index_max,weathercode&hourly=temperature_2m,weathercode,windspeed_10m&timezone=Europe%2FPrague`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const daily = data.daily;
      const hourly = data.hourly;
      const current = data.current_weather;

      const icon = getWeatherIcon(current.weathercode);

       renderFiveDayForecast(daily); // 5 dní
       render24hForecast(hourly); // 24 h

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
document.querySelector('.current-time').textContent = timeNow;
document.querySelector('.current-time').setAttribute('datetime', timeNow);

document.querySelector('.current-location').textContent = 
  `Souřadnice: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

/***Current weather */
      const weatherContainer = document.querySelector('.current-weather');
weatherContainer.innerHTML = '';

// 🟣 Samostatný box pro aktuální teplotu
const currentBox = document.createElement('div');
currentBox.classList.add('current-box');

const tempEl = document.createElement('p');
tempEl.classList.add('current-temp');

const iconSpan = document.createElement('span');
iconSpan.classList.add('weather-icon');
iconSpan.innerHTML = icon;

const valueSpan = document.createElement('span');
valueSpan.classList.add('weather-value');
valueSpan.textContent = `${current.temperature} °C`;

tempEl.appendChild(iconSpan);
tempEl.appendChild(valueSpan);

currentBox.appendChild(tempEl);


// 🟣 Box pro ostatní údaje
const detailsBox = document.createElement('div');
detailsBox.classList.add('weather-details');

const windEl = document.createElement('p');
windEl.classList.add('current-wind');
windEl.innerHTML = `<i class="fa-solid fa-wind"></i> <strong>Vítr:</strong> ${current.windspeed} km/h`;

const sunriseTime = daily.sunrise[0].split('T')[1].slice(0, 5);
const sunsetTime = daily.sunset[0].split('T')[1].slice(0, 5);

const sunriseEl = document.createElement('p');
sunriseEl.classList.add('sunrise');
sunriseEl.innerHTML = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg class="weather-icon2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.25 19C4.25 18.5858 4.58579 18.25 5 18.25H19C19.4142 18.25 19.75 18.5858 19.75 19C19.75 19.4142 19.4142 19.75 19 19.75H5C4.58579 19.75 4.25 19.4142 4.25 19ZM7.25 22C7.25 21.5858 7.58579 21.25 8 21.25H16C16.4142 21.25 16.75 21.5858 16.75 22C16.75 22.4142 16.4142 22.75 16 22.75H8C7.58579 22.75 7.25 22.4142 7.25 22Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3C12.75 3.41421 12.4142 3.75 12 3.75C11.5858 3.75 11.25 3.41421 11.25 3V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L5.85211 4.79145C6.145 5.08434 6.145 5.55921 5.85211 5.85211C5.55921 6.145 5.08434 6.145 4.79145 5.85211L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861ZM19.6011 4.39887C19.894 4.69176 19.894 5.16664 19.6011 5.45953L19.2083 5.85237C18.9154 6.14526 18.4405 6.14526 18.1476 5.85237C17.8547 5.55947 17.8547 5.0846 18.1476 4.79171L18.5405 4.39887C18.8334 4.10598 19.3082 4.10598 19.6011 4.39887ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3C3.41421 11.25 3.75 11.5858 3.75 12C3.75 12.4142 3.41421 12.75 3 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM20.25 12C20.25 11.5858 20.5858 11.25 21 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H21C20.5858 12.75 20.25 12.4142 20.25 12Z" fill="currentColor"/>
<path d="M5.25 12C5.25 13.1778 5.5521 14.2858 6.08267 15.25H2C1.58579 15.25 1.25 15.5858 1.25 16C1.25 16.4142 1.58579 16.75 2 16.75H11.25V11.8107L10.5303 12.5303C10.2374 12.8232 9.76256 12.8232 9.46967 12.5303C9.17678 12.2374 9.17678 11.7626 9.46967 11.4697L11.4697 9.46967C11.7626 9.17678 12.2374 9.17678 12.5303 9.46967L14.5303 11.4697C14.8232 11.7626 14.8232 12.2374 14.5303 12.5303C14.2374 12.8232 13.7626 12.8232 13.4697 12.5303L12.75 11.8107V16.75H22C22.4142 16.75 22.75 16.4142 22.75 16C22.75 15.5858 22.4142 15.25 22 15.25H17.9173C18.4479 14.2858 18.75 13.1778 18.75 12C18.75 8.27208 15.7279 5.25 12 5.25C8.27208 5.25 5.25 8.27208 5.25 12Z" fill="currentColor"/>
</svg> <strong>Východ:</strong> ${sunriseTime}`;

const sunsetEl = document.createElement('p');
sunsetEl.classList.add('sunset');
sunsetEl.innerHTML = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg class="weather-icon2"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.25 19C4.25 18.5858 4.58579 18.25 5 18.25H19C19.4142 18.25 19.75 18.5858 19.75 19C19.75 19.4142 19.4142 19.75 19 19.75H5C4.58579 19.75 4.25 19.4142 4.25 19ZM7.25 22C7.25 21.5858 7.58579 21.25 8 21.25H16C16.4142 21.25 16.75 21.5858 16.75 22C16.75 22.4142 16.4142 22.75 16 22.75H8C7.58579 22.75 7.25 22.4142 7.25 22Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3C12.75 3.41421 12.4142 3.75 12 3.75C11.5858 3.75 11.25 3.41421 11.25 3V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L5.85211 4.79145C6.145 5.08434 6.145 5.55921 5.85211 5.85211C5.55921 6.145 5.08434 6.145 4.79145 5.85211L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861ZM19.6011 4.39887C19.894 4.69176 19.894 5.16664 19.6011 5.45953L19.2083 5.85237C18.9154 6.14526 18.4405 6.14526 18.1476 5.85237C17.8547 5.55947 17.8547 5.0846 18.1476 4.79171L18.5405 4.39887C18.8334 4.10598 19.3082 4.10598 19.6011 4.39887ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3C3.41421 11.25 3.75 11.5858 3.75 12C3.75 12.4142 3.41421 12.75 3 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM20.25 12C20.25 11.5858 20.5858 11.25 21 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H21C20.5858 12.75 20.25 12.4142 20.25 12Z" fill="currentColor"/>
<path d="M5.25 12C5.25 13.1778 5.5521 14.2858 6.08267 15.25H2C1.58579 15.25 1.25 15.5858 1.25 16C1.25 16.4142 1.58579 16.75 2 16.75H22C22.4142 16.75 22.75 16.4142 22.75 16C22.75 15.5858 22.4142 15.25 22 15.25H17.9173C18.4479 14.2858 18.75 13.1778 18.75 12C18.75 8.52558 16.125 5.66428 12.75 5.2912V9.18923L13.4697 8.46956C13.7626 8.17666 14.2374 8.17666 14.5303 8.46956C14.8232 8.76245 14.8232 9.23732 14.5303 9.53022L12.5303 11.5302C12.2374 11.8231 11.7626 11.8231 11.4697 11.5302L9.46967 9.53022C9.17678 9.23732 9.17678 8.76245 9.46967 8.46956C9.76256 8.17666 10.2374 8.17666 10.5303 8.46956L11.25 9.18923V5.2912C7.87504 5.66428 5.25 8.52558 5.25 12Z" fill="currentColor"/>
</svg> <strong>Západ:</strong> ${sunsetTime}`;


const maxTempEl = document.createElement('p');
maxTempEl.classList.add('max-temp');
maxTempEl.innerHTML = `<i class="fa-solid fa-temperature-high"></i> <strong>Max:</strong> ${daily.temperature_2m_max[0]} °C`;

const minTempEl = document.createElement('p');
minTempEl.classList.add('min-temp');
minTempEl.innerHTML = `<i class="fa-solid fa-temperature-low"></i> <strong>Min:</strong> ${daily.temperature_2m_min[0]} °C`;

const uvIndexEl = document.createElement('p');
uvIndexEl.classList.add('uv-index');
uvIndexEl.innerHTML = `<i class="fa-solid fa-sun"></i> <strong>UV Index:</strong> ${daily.uv_index_max[0]}`;

detailsBox.append(windEl, sunriseEl, sunsetEl, maxTempEl, minTempEl, uvIndexEl);

// 🔧 Přidání do hlavního kontejneru
weatherContainer.append(currentBox, detailsBox);


    })
    .catch(err => {
      document.querySelector('.current-weather').textContent = 'Nepodařilo se načíst data.';
      console.error(err);
    });
});

//Ikony počasí
function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '❔';
}

/**5 dní */
function renderFiveDayForecast(daily) {
  const container = document.querySelector('.forecast-5-day');
  container.innerHTML = ''; 

  for (let i = 0; i < 5; i++) {
    const date = new Date(daily.time[i]);
    const dayName = date.toLocaleDateString('cs-CZ', { weekday: 'short' });
    const max = daily.temperature_2m_max[i];
    const min = daily.temperature_2m_min[i];
    const code = daily.weathercode[i];
    const icon = getWeatherIcon(code);

    const item = document.createElement('div');
    item.classList.add('forecast-item');

    const day = document.createElement('p');
    day.classList.add('forecast-day');
    day.innerHTML = `<strong>${dayName}</strong>`;

    const weatherIcon = document.createElement('p');
    weatherIcon.classList.add('forecast-icon');
    weatherIcon.textContent = icon;

    const temp = document.createElement('p');
    temp.classList.add('forecast-temp');
    temp.textContent = `${min}° / ${max}°`;

    item.append(day, weatherIcon, temp);
    container.appendChild(item);
  }
}


/***24 hodin */
function render24hForecast(hourly) {
  const container = document.querySelector('.forecast-24h');
  container.innerHTML = '';

  for (let i = 0; i < 24; i++) {
    const timeText = new Date(hourly.time[i]).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const temp = hourly.temperature_2m[i];
    const icon = getWeatherIcon(hourly.weathercode[i]);

    const item = document.createElement('div');
    item.classList.add('forecast-hour');

    const time = document.createElement('p');
    time.classList.add('hour-time');
    time.innerHTML = `<strong>${timeText}</strong>`;

    const weatherIcon = document.createElement('p');
    weatherIcon.classList.add('hour-icon');
    weatherIcon.textContent = icon;

    const temperature = document.createElement('p');
    temperature.classList.add('hour-temp');
    temperature.textContent = `${temp} °C`;

    item.append(time, weatherIcon, temperature);
    container.appendChild(item);
  }
}


/**Set color */
function setColor(input) {
  const lightness = getLightnessFromHex(input.value);

  document.body.setAttribute('style', `
    --base-color: ${input.value};
    --text-color: ${lightness > 60 ? 'black' : 'white'};
  `);
}

function getLightnessFromHex(hex) {
  hex = hex.replace(/^#/, '');

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return +(brightness * 100).toFixed(2); // správný výstup 0–100
}




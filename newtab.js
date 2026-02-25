// newtab.js

// --------------------
// See More toggle
// --------------------
function initSeeMore() {
  const btn = document.getElementById("seeMoreBtn");
  const extraItems = document.querySelectorAll(".extra");

  if (!btn) return;

  let expanded = false;

  btn.addEventListener("click", () => {
    expanded = !expanded;

    extraItems.forEach((item) => {
      item.classList.toggle("hidden");
    });

    btn.textContent = expanded ? "See Less" : "See More";
  });
}

// --------------------
// Daily Climate Fact
// --------------------
const CLIMATE_FACTS = [
  "Earth’s tilted axis causes the seasons, because sunlight hits different parts more directly at different times of year.",
  "Warm air can hold more water vapor than cold air, which affects humidity and precipitation.",
  "The ozone layer helps absorb much of the Sun’s harmful ultraviolet radiation.",
  "Ocean currents move heat around the planet and can shape regional climates.",
  "Mountains can create rain shadows, making one side wetter and the other side drier.",
  "Weather is short-term, climate is the long-term pattern of weather in a region."
];

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function renderDailyFact() {
  const el = document.getElementById("dailyFact");
  if (!el) return;

  const idx = dayOfYear(new Date()) % CLIMATE_FACTS.length;
  el.textContent = CLIMATE_FACTS[idx];
}

// --------------------
// Weather Dashboard (Open-Meteo, no key)
// --------------------
function $(id) {
  return document.getElementById(id);
}

function show(el) {
  if (el) el.classList.remove("hidden");
}

function hide(el) {
  if (el) el.classList.add("hidden");
}

function setActiveUnitButton(unit) {
  const btnC = $("unitC");
  const btnF = $("unitF");
  const btnK = $("unitK");
  if (!btnC || !btnF || !btnK) return;

  btnC.classList.toggle("active", unit === "C");
  btnF.classList.toggle("active", unit === "F");
  btnK.classList.toggle("active", unit === "K");
}

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function cToK(c) {
  return c + 273.15;
}

function formatTemp(valueC, unit) {
  if (valueC === null || valueC === undefined || Number.isNaN(Number(valueC))) return "-";

  if (unit === "F") return `${Math.round(cToF(Number(valueC)))}°F`;
  if (unit === "K") return `${Math.round(cToK(Number(valueC)))} K`;
  return `${Math.round(Number(valueC))}°C`;
}

function weatherCodeToText(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm"
  };
  return map[code] || `Weather code ${code}`;
}

async function fetchWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    "&current=temperature_2m,wind_speed_10m,weather_code" +
    "&daily=temperature_2m_max,temperature_2m_min" +
    "&timezone=auto";

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather request failed");
  return await res.json();
}

async function geocodeCity(name) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(name)}` +
    "&count=1&language=en&format=json";

  const res = await fetch(url);
  if (!res.ok) throw new Error("City search failed");

  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const r = data.results[0];
  return {
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    latitude: r.latitude,
    longitude: r.longitude
  };
}

// State used for unit conversion and re-rendering without refetching
let currentUnit = "C";
let lastWeatherPayload = null; // { locationLabel, data }

function renderWeather(locationLabel, data) {
  lastWeatherPayload = { locationLabel, data };

  const grid = $("weatherGrid");
  const status = $("weatherStatus");

  const tempC = data.current?.temperature_2m;
  const wind = data.current?.wind_speed_10m;
  const code = data.current?.weather_code;

  const hiC = data.daily?.temperature_2m_max?.[0];
  const loC = data.daily?.temperature_2m_min?.[0];

  if ($("wLocation")) $("wLocation").textContent = locationLabel || "Your area";
  if ($("wTemp")) $("wTemp").textContent = formatTemp(tempC, currentUnit);
  if ($("wWind")) $("wWind").textContent = (wind ?? "-") + " km/h";
  if ($("wCond")) $("wCond").textContent = weatherCodeToText(code);

  if ($("wHiLo")) {
    const hi = formatTemp(hiC, currentUnit);
    const lo = formatTemp(loC, currentUnit);
    $("wHiLo").textContent = `${hi}, ${lo}`;
  }

  if ($("wTime")) $("wTime").textContent = new Date().toLocaleString();

  if (status) status.textContent = "";
  show(grid);
}

function rerenderWeatherWithUnit() {
  if (!lastWeatherPayload) return;
  renderWeather(lastWeatherPayload.locationLabel, lastWeatherPayload.data);
}

async function loadWeatherByCoords(locationLabel, lat, lon) {
  const status = $("weatherStatus");
  const grid = $("weatherGrid");

  hide(grid);
  if (status) status.textContent = "Loading weather...";

  try {
    const data = await fetchWeather(lat, lon);
    renderWeather(locationLabel, data);

    if (chrome?.storage?.local?.set) {
      chrome.storage.local.set({
        lastWeatherLocation: { label: locationLabel, lat, lon, savedAt: Date.now() }
      });
    }
  } catch (e) {
    if (status) status.textContent = "Could not load weather. Try again.";
    console.error(e);
  }
}

function requestGeolocation() {
  const status = $("weatherStatus");
  if (status) status.textContent = "Requesting location...";

  if (!navigator.geolocation) {
    if (status) status.textContent = "Geolocation not supported. Please search a city.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      loadWeatherByCoords("My Location", pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      if (status) status.textContent = "Location permission denied. Please search a city.";
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
}

async function loadLastWeatherIfAny() {
  if (!chrome?.storage?.local?.get) return;

  try {
    const data = await chrome.storage.local.get(["lastWeatherLocation", "weatherCollapsed", "tempUnit"]);
    const savedLoc = data.lastWeatherLocation;
    const savedCollapsed = Boolean(data.weatherCollapsed);
    const savedUnit = data.tempUnit;

    if (savedUnit === "C" || savedUnit === "F" || savedUnit === "K") {
      currentUnit = savedUnit;
      setActiveUnitButton(currentUnit);
    }

    applyWeatherCollapsedState(savedCollapsed);

    if (savedLoc && typeof savedLoc.lat === "number" && typeof savedLoc.lon === "number") {
      await loadWeatherByCoords(savedLoc.label || "Last Location", savedLoc.lat, savedLoc.lon);
    }
  } catch (e) {
    console.error(e);
  }
}

// --------------------
// Collapsible Weather Dashboard
// --------------------
function applyWeatherCollapsedState(collapsed) {
  const content = $("weatherContent");
  const btn = $("weatherCollapseBtn");

  if (!content || !btn) return;

  if (collapsed) {
    content.style.display = "none";
    btn.textContent = "+";
    btn.setAttribute("aria-expanded", "false");
  } else {
    content.style.display = "block";
    btn.textContent = "−";
    btn.setAttribute("aria-expanded", "true");
  }
}

function initWeatherCollapse() {
  const btn = $("weatherCollapseBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const content = $("weatherContent");
    if (!content) return;

    const collapsedNow = content.style.display !== "none";
    applyWeatherCollapsedState(collapsedNow);

    if (chrome?.storage?.local?.set) {
      try {
        await chrome.storage.local.set({ weatherCollapsed: collapsedNow });
      } catch (e) {
        console.error(e);
      }
    }
  });
}

// --------------------
// Temperature unit controls
// --------------------
async function setTempUnit(unit) {
  if (unit !== "C" && unit !== "F" && unit !== "K") return;

  currentUnit = unit;
  setActiveUnitButton(currentUnit);
  rerenderWeatherWithUnit();

  if (chrome?.storage?.local?.set) {
    try {
      await chrome.storage.local.set({ tempUnit: currentUnit });
    } catch (e) {
      console.error(e);
    }
  }
}

function initTempUnitButtons() {
  const btnC = $("unitC");
  const btnF = $("unitF");
  const btnK = $("unitK");

  if (btnC) btnC.addEventListener("click", () => setTempUnit("C"));
  if (btnF) btnF.addEventListener("click", () => setTempUnit("F"));
  if (btnK) btnK.addEventListener("click", () => setTempUnit("K"));
}

// --------------------
// Weather init
// --------------------
function initWeather() {
  const useLocBtn = $("useLocationBtn");
  const cityBtn = $("citySearchBtn");
  const cityInput = $("cityInput");

  if (useLocBtn) useLocBtn.addEventListener("click", requestGeolocation);

  if (cityBtn) {
    cityBtn.addEventListener("click", async () => {
      const name = (cityInput?.value || "").trim();
      const status = $("weatherStatus");

      if (!name) {
        if (status) status.textContent = "Type a city name first.";
        return;
      }

      if (status) status.textContent = "Searching...";
      try {
        const geo = await geocodeCity(name);

        if (!geo) {
          if (status) status.textContent = "City not found. Try a different name.";
          return;
        }

        await loadWeatherByCoords(geo.label, geo.latitude, geo.longitude);
      } catch (e) {
        if (status) status.textContent = "City search failed. Try again.";
        console.error(e);
      }
    });
  }

  if (cityInput) {
    cityInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        cityBtn?.click();
      }
    });
  }
}

// --------------------
// Initialize
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  initSeeMore();
  renderDailyFact();

  initWeather();
  initWeatherCollapse();
  initTempUnitButtons();

  // Loads saved unit + collapsed state + last location if available
  loadLastWeatherIfAny();
});
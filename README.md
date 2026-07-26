# Weatherly

Weatherly is a responsive weather dashboard for checking current conditions,
air quality, and upcoming forecasts by city, ZIP code, or device location.

**Live site:** https://weatherly-dashboard-wyu6609.netlify.app

![Weatherly dashboard overview](assets/weatherly-dashboard.webp)

## Features

- Search by city or 5-digit U.S. ZIP code
- Use the device's current location
- View current conditions, temperature range, wind, humidity, visibility, and
  pressure
- Review air quality, sunrise, and sunset
- Browse hourly and five-day forecasts
- Revisit recent searches
- Enjoy weather-aware animated backgrounds and a mobile-friendly layout

## Run locally

```bash
npm install
copy .env.example .env
```

Set your OpenWeather key in `.env`:

```text
OPENWEATHER_API_KEY=your_key_here
```

Then start the app:

```bash
npm run dev
```

Open http://127.0.0.1:8888.

## How it works

| Layer | Responsibility |
| --- | --- |
| `src/` | React and Material UI dashboard |
| `netlify/functions/weather.mjs` | Validates requests and proxies OpenWeather |
| Netlify environment | Stores `OPENWEATHER_API_KEY` securely |
| `netlify.toml` | Defines the Vite build, function directory, and local server |

The API key is never bundled into the browser. The dashboard calls the Netlify
Function, which securely requests data from OpenWeather.

# Weatherly

Weatherly is a responsive weather dashboard for checking current conditions,
air quality, and upcoming forecasts by city, ZIP code, or device location.

![Weatherly dashboard overview](assets/weatherly-dashboard.webp)

## Deployed website

https://weatherly-wyu.netlify.app

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

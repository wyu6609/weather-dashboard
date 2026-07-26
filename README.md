# Weatherly

A responsive weather dashboard built with React, Material UI, OpenWeather, and
Netlify Functions.

## Live website

https://weatherly-dashboard-wyu6609.netlify.app

![Weatherly dashboard overview](assets/weatherly-dashboard.webp)

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   copy .env.example .env
   ```

3. Add your OpenWeather key to `.env`:

   ```text
   OPENWEATHER_API_KEY=your_key_here
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open http://127.0.0.1:8888.

## Architecture

```text
React + Material UI client
          |
          v
Netlify Function (netlify/functions/weather.mjs)
          |
          v
OpenWeather API
```

- `src/` contains the React interface and weather dashboard state.
- `netlify/functions/weather.mjs` validates requests and calls OpenWeather.
- `OPENWEATHER_API_KEY` stays in the local `.env` file and Netlify Function
  environment, never in the browser bundle.
- `netlify.toml` defines the Vite build, function directory, and local
  development server configuration.

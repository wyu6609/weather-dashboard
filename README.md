# Weather Dashboard

A React and Material UI dashboard for current weather conditions from OpenWeather.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `VITE_OPENWEATHER_API_KEY`.
3. Start the app with `npm run dev`.

## Deploy to Netlify

The included `netlify.toml` builds the Vite app with Node 22 and publishes
`dist`. In Netlify, set the `VITE_OPENWEATHER_API_KEY` environment variable to
the same API key used locally before deploying.

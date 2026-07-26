# Weather Dashboard

A React and Material UI dashboard for current weather conditions from OpenWeather.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `OPENWEATHER_API_KEY`.
3. Start the app with `npm run dev`.

## Deploy to Netlify

The included `netlify.toml` builds the Vite app with Node 22 and publishes
`dist`. In Netlify, set `OPENWEATHER_API_KEY` as a secret environment variable
with the **Functions** scope before deploying. The browser calls the included
Netlify Function, which keeps the API key out of the client bundle.

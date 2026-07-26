import React, { useEffect, useState } from 'react';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import ExploreIcon from '@mui/icons-material/Explore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import OpacityIcon from '@mui/icons-material/Opacity';
import SearchIcon from '@mui/icons-material/Search';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const weatherThemes = {
  Clear: ['#2873a6', '#123c65', '#071526'],
  Clouds: ['#526779', '#2b4053', '#101d2d'],
  Rain: ['#325b7c', '#1c354d', '#091522'],
  Drizzle: ['#3c647b', '#274556', '#101c28'],
  Thunderstorm: ['#3e416a', '#222849', '#0b1120'],
  Snow: ['#698898', '#3a5666', '#152a36'],
  Atmosphere: ['#566e73', '#334c53', '#15272d'],
};

function formatLocalTime(timestamp, timezone, options) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options })
    .format(new Date((timestamp + timezone) * 1000));
}

function WeatherMetric({ icon, label, value }) {
  return (
    <Stack alignItems="flex-start" direction="row" spacing={1.5}>
      <Box sx={{ color: 'primary.main', display: 'grid', placeItems: 'center', pt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography color="text.secondary" variant="body2">{label}</Typography>
        <Typography fontWeight={700} variant="body1">{value}</Typography>
      </Box>
    </Stack>
  );
}

export default function App() {
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const fetchWeather = async (query) => {
    if (!query) {
      setError('Enter a city to see its weather.');
      return;
    }

    if (!API_KEY) {
      setStatus('error');
      setError('The weather API key is not configured. Add it to .env.local.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?${query}&units=imperial&appid=${API_KEY}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to find weather for that city.');
      }

      setWeather(data);
      setStatus('success');
    } catch (requestError) {
      setStatus('error');
      setError(requestError.message || 'Weather data could not be loaded.');
    }
  };

  useEffect(() => {
    fetchWeather('q=New%20York');
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchWeather(`q=${encodeURIComponent(city.trim())}`);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location services are not supported by this browser.');
      return;
    }

    setStatus('loading');
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWeather(`lat=${coords.latitude}&lon=${coords.longitude}`),
      () => {
        setStatus(weather ? 'success' : 'error');
        setError('Location access was not granted. Search for a city instead.');
      },
      { timeout: 10000 },
    );
  };

  const condition = weather?.weather?.[0];
  const themeColors = weatherThemes[condition?.main] || weatherThemes.Atmosphere;
  const currentTime = weather && formatLocalTime(
    weather.dt,
    weather.timezone,
    { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  );

  return (
    <Box
      sx={{
        background: `radial-gradient(circle at 15% 0%, ${themeColors[0]} 0%, ${themeColors[1]} 43%, ${themeColors[2]} 100%)`,
        minHeight: '100vh',
        py: { xs: 3, sm: 7 },
        transition: 'background 500ms ease',
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3.5}>
          <Stack alignItems="center" direction="row" justifyContent="space-between">
            <Stack alignItems="center" direction="row" spacing={1}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.14)', borderRadius: 2, display: 'grid', p: 1 }}>
                <WbSunnyIcon color="primary" />
              </Box>
              <Typography component="h1" fontWeight={800} letterSpacing="-0.04em" variant="h5">Weatherly</Typography>
            </Stack>
            <IconButton aria-label="Use my location" color="primary" onClick={useCurrentLocation} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}>
              <MyLocationIcon />
            </IconButton>
          </Stack>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                aria-label="City"
                fullWidth
                onChange={(event) => setCity(event.target.value)}
                placeholder="Search by city"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment>,
                  },
                }}
                value={city}
              />
              <Button disabled={status === 'loading'} startIcon={<SearchIcon />} sx={{ minWidth: 112, py: 1.5 }} type="submit" variant="contained">
                Search
              </Button>
            </Stack>
          </Box>

          {status === 'loading' && (
            <Paper sx={{ bgcolor: 'rgba(14, 30, 47, 0.72)', display: 'grid', minHeight: 420, placeItems: 'center' }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress aria-label="Loading weather" />
                <Typography color="text.secondary">Checking the skies...</Typography>
              </Stack>
            </Paper>
          )}

          {status === 'error' && <Alert severity="error">{error}</Alert>}

          {status === 'success' && weather && (
            <Paper
              elevation={12}
              sx={{
                backdropFilter: 'blur(16px)',
                bgcolor: 'rgba(10, 25, 43, 0.72)',
                overflow: 'hidden',
                p: { xs: 3, sm: 5 },
              }}
            >
              <Stack spacing={4}>
                <Stack alignItems={{ xs: 'flex-start', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Stack alignItems="center" direction="row" spacing={0.5}>
                      <LocationOnIcon color="primary" fontSize="small" />
                      <Typography fontWeight={700} variant="h6">{weather.name}, {weather.sys.country}</Typography>
                    </Stack>
                    <Typography color="text.secondary" mt={0.5} variant="body2">{currentTime}</Typography>
                  </Box>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Box alt={condition.description} component="img" src={`https://openweathermap.org/img/wn/${condition.icon}@2x.png`} sx={{ height: 70, width: 70 }} />
                    <Box>
                      <Typography fontWeight={800} letterSpacing="-0.08em" lineHeight={0.85} variant="h2">{Math.round(weather.main.temp)}°</Typography>
                      <Typography color="text.secondary" variant="body2">Feels like {Math.round(weather.main.feels_like)}°</Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Box>
                  <Typography sx={{ textTransform: 'capitalize' }} variant="h5">{condition.description}</Typography>
                  <Typography color="text.secondary" mt={0.75}>
                    High {Math.round(weather.main.temp_max)}° · Low {Math.round(weather.main.temp_min)}°
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gap: { xs: 3, sm: 4 }, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' } }}>
                  <WeatherMetric icon={<ThermostatIcon />} label="Feels like" value={`${Math.round(weather.main.feels_like)}°F`} />
                  <WeatherMetric icon={<OpacityIcon />} label="Humidity" value={`${weather.main.humidity}%`} />
                  <WeatherMetric icon={<AirIcon />} label="Wind" value={`${Math.round(weather.wind.speed)} mph`} />
                  <WeatherMetric icon={<VisibilityIcon />} label="Visibility" value={`${(weather.visibility / 1609.344).toFixed(1)} mi`} />
                  <WeatherMetric icon={<CompressIcon />} label="Pressure" value={`${weather.main.pressure} hPa`} />
                  <WeatherMetric icon={<ExploreIcon />} label="Cloud cover" value={`${weather.clouds.all}%`} />
                </Box>

                <Box sx={{ bgcolor: 'rgba(125, 211, 252, 0.08)', borderRadius: 3, px: 2.5, py: 2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Sunrise</Typography>
                      <Typography fontWeight={700}>{formatLocalTime(weather.sys.sunrise, weather.timezone, { hour: 'numeric', minute: '2-digit' })}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography color="text.secondary" variant="body2">Sunset</Typography>
                      <Typography fontWeight={700}>{formatLocalTime(weather.sys.sunset, weather.timezone, { hour: 'numeric', minute: '2-digit' })}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

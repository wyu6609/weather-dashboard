import React, { useEffect, useState } from 'react';
import AirIcon from '@mui/icons-material/Air';
import BedtimeIcon from '@mui/icons-material/Bedtime';
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

function WeatherBackdrop({ condition, isDay }) {
  const conditionCode = condition?.id || 800;
  const isStorm = conditionCode >= 200 && conditionCode < 300;
  const isRainy = conditionCode >= 300 && conditionCode < 600;
  const isSnowy = conditionCode >= 600 && conditionCode < 700;
  const isCloudy = conditionCode > 800 || isRainy || isSnowy;

  return (
    <Box aria-hidden="true" sx={{ inset: 0, overflow: 'hidden', pointerEvents: 'none', position: 'absolute' }}>
      {(isDay || !condition) && (
        <Box
          sx={{
            animation: 'weatherGlow 7s ease-in-out infinite alternate',
            background: 'radial-gradient(circle, rgba(255, 232, 153, 0.92) 0%, rgba(255, 193, 7, 0.45) 27%, transparent 68%)',
            borderRadius: '50%',
            height: { xs: 180, sm: 300 },
            position: 'absolute',
            right: { xs: '-8%', sm: '8%' },
            top: { xs: '-4%', sm: '-8%' },
            width: { xs: 180, sm: 300 },
          }}
        />
      )}
      {!isDay && condition && (
        <Box
          sx={{
            background: 'radial-gradient(circle at 35% 30%, #f8fafc 0 20%, #b9c4d7 22% 26%, transparent 28%)',
            borderRadius: '50%',
            boxShadow: '0 0 65px rgba(226, 232, 240, 0.38)',
            height: { xs: 120, sm: 180 },
            position: 'absolute',
            right: { xs: '4%', sm: '12%' },
            top: { xs: '2%', sm: '6%' },
            width: { xs: 120, sm: 180 },
          }}
        />
      )}
      {isCloudy && [0, 1, 2].map((cloud) => (
        <Box
          key={cloud}
          sx={{
            animation: `cloudDrift ${18 + cloud * 7}s linear infinite`,
            animationDelay: `${-cloud * 6}s`,
            background: 'rgba(222, 235, 245, 0.16)',
            borderRadius: 12,
            boxShadow: '35px 4px 0 10px rgba(222, 235, 245, 0.13), 76px 0 0 2px rgba(222, 235, 245, 0.11)',
            height: 28 + cloud * 8,
            left: `${cloud * 32 - 22}%`,
            position: 'absolute',
            top: `${12 + cloud * 17}%`,
            width: 82 + cloud * 25,
          }}
        />
      ))}
      {isRainy && Array.from({ length: 20 }, (_, drop) => (
        <Box
          key={drop}
          sx={{
            animation: `rainFall ${0.65 + (drop % 4) * 0.14}s linear infinite`,
            animationDelay: `${-(drop % 7) * 0.18}s`,
            background: 'rgba(186, 230, 253, 0.54)',
            borderRadius: 2,
            height: 18,
            left: `${(drop * 19) % 105}%`,
            position: 'absolute',
            top: `${18 + (drop % 5) * 9}%`,
            transform: 'rotate(16deg)',
            width: 2,
          }}
        />
      ))}
      {isSnowy && Array.from({ length: 18 }, (_, flake) => (
        <Box
          key={flake}
          sx={{
            animation: `snowFall ${2.8 + (flake % 4) * 0.5}s linear infinite`,
            animationDelay: `${-(flake % 6) * 0.5}s`,
            background: 'rgba(255, 255, 255, 0.72)',
            borderRadius: '50%',
            height: 4 + (flake % 3),
            left: `${(flake * 23) % 104}%`,
            position: 'absolute',
            top: `${8 + (flake % 7) * 11}%`,
            width: 4 + (flake % 3),
          }}
        />
      ))}
      {isStorm && (
        <Box
          sx={{
            animation: 'lightningFlash 6s step-end infinite',
            background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.75) 41% 43%, transparent 44%)',
            inset: 0,
            position: 'absolute',
          }}
        />
      )}
    </Box>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState('New York');
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
    const location = searchTerm.trim();

    if (!location) {
      fetchWeather('');
      return;
    }

    if (/^\d{5}$/.test(location)) {
      fetchWeather(`zip=${encodeURIComponent(`${location},us`)}`);
      return;
    }

    fetchWeather(`q=${encodeURIComponent(location)}`);
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
  const isDay = weather && weather.dt >= weather.sys.sunrise && weather.dt < weather.sys.sunset;
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
        overflow: 'hidden',
        py: { xs: 3, sm: 7 },
        position: 'relative',
        transition: 'background 500ms ease',
        '@keyframes weatherGlow': {
          from: { opacity: 0.65, transform: 'scale(0.92)' },
          to: { opacity: 1, transform: 'scale(1.08)' },
        },
        '@keyframes cloudDrift': {
          from: { transform: 'translateX(-20vw)' },
          to: { transform: 'translateX(120vw)' },
        },
        '@keyframes rainFall': {
          from: { opacity: 0, transform: 'translate(0, -15px) rotate(16deg)' },
          to: { opacity: 0.7, transform: 'translate(-28px, 180px) rotate(16deg)' },
        },
        '@keyframes snowFall': {
          from: { opacity: 0, transform: 'translate(0, -15px)' },
          to: { opacity: 0.85, transform: 'translate(35px, 230px)' },
        },
        '@keyframes lightningFlash': {
          '0%, 93%, 96%, 100%': { opacity: 0 },
          '94%, 95%': { opacity: 0.8 },
        },
      }}
    >
      <WeatherBackdrop condition={condition} isDay={isDay} />
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
                aria-describedby="search-hint"
                aria-label="City or U.S. ZIP code"
                fullWidth
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search city or ZIP code"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment>,
                  },
                }}
                value={searchTerm}
              />
              <Button disabled={status === 'loading'} startIcon={<SearchIcon />} sx={{ minWidth: 112, py: 1.5 }} type="submit" variant="contained">
                Search
              </Button>
            </Stack>
            <Typography color="rgba(255, 255, 255, 0.68)" id="search-hint" mt={0.75} variant="caption">
              Search any city, or enter a 5-digit U.S. ZIP code (for example, 10001).
            </Typography>
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

                <Box
                  sx={{
                    background: 'linear-gradient(100deg, rgba(250, 204, 21, 0.16), rgba(249, 115, 22, 0.12), rgba(99, 102, 241, 0.16))',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 3,
                    px: { xs: 2, sm: 3 },
                    py: 2.5,
                  }}
                >
                  <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
                    <Stack alignItems="center" direction="row" spacing={1.25}>
                      <Box sx={{ bgcolor: 'rgba(250, 204, 21, 0.16)', borderRadius: '50%', color: '#facc15', display: 'grid', p: 1 }}>
                        <WbSunnyIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="body2">Sunrise</Typography>
                        <Typography fontWeight={800} variant="h6">{formatLocalTime(weather.sys.sunrise, weather.timezone, { hour: 'numeric', minute: '2-digit' })}</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ borderColor: 'rgba(255, 255, 255, 0.18)', borderTop: 1, flexGrow: 1, maxWidth: 100 }} />
                    <Stack alignItems="center" direction="row" spacing={1.25}>
                      <Box textAlign="right">
                        <Typography color="text.secondary" variant="body2">Sunset</Typography>
                        <Typography fontWeight={800} variant="h6">{formatLocalTime(weather.sys.sunset, weather.timezone, { hour: 'numeric', minute: '2-digit' })}</Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'rgba(129, 140, 248, 0.16)', borderRadius: '50%', color: '#a5b4fc', display: 'grid', p: 1 }}>
                        <BedtimeIcon fontSize="small" />
                      </Box>
                    </Stack>
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

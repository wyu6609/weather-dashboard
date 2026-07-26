import React, { useEffect, useState } from 'react';
import AirIcon from '@mui/icons-material/Air';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpacityIcon from '@mui/icons-material/Opacity';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function WeatherMetric({ icon, label, value }) {
  return (
    <Stack alignItems="center" spacing={0.75}>
      {icon}
      <Typography color="text.secondary" variant="body2">{label}</Typography>
      <Typography fontWeight={700} variant="h6">{value}</Typography>
    </Stack>
  );
}

export default function App() {
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const fetchWeather = async (requestedCity) => {
    const location = requestedCity.trim();

    if (!location) {
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
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=imperial&appid=${API_KEY}`,
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
    fetchWeather('New York');
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchWeather(city);
  };

  const condition = weather?.weather?.[0];

  return (
    <Box
      sx={{
        background: 'radial-gradient(circle at top, #1e4a72 0%, #0c1b30 44%, #08111f 100%)',
        minHeight: '100vh',
        py: { xs: 4, sm: 8 },
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Box textAlign="center">
            <Typography component="h1" fontWeight={800} variant="h3">Weather now</Typography>
            <Typography color="text.secondary" mt={1}>Current conditions around the world</Typography>
          </Box>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
              <Button disabled={status === 'loading'} startIcon={<SearchIcon />} sx={{ minWidth: 112 }} type="submit" variant="contained">
                Search
              </Button>
            </Stack>
          </Box>

          {status === 'loading' && (
            <Paper sx={{ display: 'grid', minHeight: 290, placeItems: 'center' }}>
              <CircularProgress aria-label="Loading weather" />
            </Paper>
          )}

          {status === 'error' && <Alert severity="error">{error}</Alert>}

          {status === 'success' && weather && (
            <Paper elevation={8} sx={{ overflow: 'hidden', p: { xs: 3, sm: 4 } }}>
              <Stack alignItems="center" spacing={1}>
                <Typography color="text.secondary" variant="h6">{weather.name}, {weather.sys.country}</Typography>
                <Box
                  alt={condition.description}
                  component="img"
                  src={`https://openweathermap.org/img/wn/${condition.icon}@4x.png`}
                  sx={{ height: 128, width: 128 }}
                />
                <Typography fontWeight={800} lineHeight={1} variant="h1">{Math.round(weather.main.temp)}°</Typography>
                <Typography sx={{ textTransform: 'capitalize' }} variant="h6">{condition.description}</Typography>
              </Stack>

              <Stack
                direction="row"
                divider={<Box sx={{ borderColor: 'divider', borderLeft: 1 }} />}
                justifyContent="space-around"
                mt={4}
              >
                <WeatherMetric icon={<OpacityIcon color="primary" />} label="Humidity" value={`${weather.main.humidity}%`} />
                <WeatherMetric icon={<AirIcon color="primary" />} label="Wind" value={`${Math.round(weather.wind.speed)} mph`} />
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

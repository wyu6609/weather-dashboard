const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

function validCoordinate(value) {
  return value !== null && value !== '' && Number.isFinite(Number(value));
}

export default async (request) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return jsonResponse({ message: 'Weather service is not configured.' }, 500);
  }

  const requestUrl = new URL(request.url);
  const type = requestUrl.searchParams.get('type');
  const parameters = new URLSearchParams({ appid: apiKey });
  let endpoint;

  if (type === 'current') {
    endpoint = 'weather';
    parameters.set('units', 'imperial');
    const query = requestUrl.searchParams.get('q');
    const zip = requestUrl.searchParams.get('zip');
    const lat = requestUrl.searchParams.get('lat');
    const lon = requestUrl.searchParams.get('lon');

    if (query && query.length <= 100) {
      parameters.set('q', query);
    } else if (zip && /^\d{5},us$/i.test(zip)) {
      parameters.set('zip', zip);
    } else if (validCoordinate(lat) && validCoordinate(lon)) {
      parameters.set('lat', lat);
      parameters.set('lon', lon);
    } else {
      return jsonResponse({ message: 'Provide a city, U.S. ZIP code, or coordinates.' }, 400);
    }
  } else if (type === 'forecast' || type === 'air') {
    const lat = requestUrl.searchParams.get('lat');
    const lon = requestUrl.searchParams.get('lon');

    if (!validCoordinate(lat) || !validCoordinate(lon)) {
      return jsonResponse({ message: 'Valid coordinates are required.' }, 400);
    }

    endpoint = type === 'forecast' ? 'forecast' : 'air_pollution';
    parameters.set('lat', lat);
    parameters.set('lon', lon);

    if (type === 'forecast') {
      parameters.set('units', 'imperial');
    }
  } else {
    return jsonResponse({ message: 'Unsupported weather request.' }, 400);
  }

  try {
    const response = await fetch(`${OPENWEATHER_BASE_URL}/${endpoint}?${parameters}`);
    const body = await response.json();
    return jsonResponse(body, response.status);
  } catch {
    return jsonResponse({ message: 'Weather service is temporarily unavailable.' }, 502);
  }
};

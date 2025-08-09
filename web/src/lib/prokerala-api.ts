// Prokerala API Integration for Astrology Calculations
import axios from 'axios';

const PROKERALA_BASE_URL = 'https://api.prokerala.com/v2';
const TOKEN_URL = 'https://api.prokerala.com/token';

// Cache for access token
let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Get OAuth2 access token
export async function getProkeralaAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Prokerala credentials not configured');
  }

  try {
    // Request new access token using OAuth2 client credentials flow
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken as string;
  } catch (error) {
    console.error('Failed to get Prokerala access token:', error);
    throw new Error('Failed to authenticate with Prokerala API');
  }
}

// Make authenticated API request to Prokerala
export async function prokeralaApiRequest(
  endpoint: string,
  params: Record<string, any>
): Promise<any> {
  const token = await getProkeralaAccessToken();

  try {
    const response = await axios.get(`${PROKERALA_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error('Prokerala API request failed:', error.response?.data || error.message);
    throw error;
  }
}

// Get accurate birth chart from Prokerala
export async function getProkeralaBirthChart(
  datetime: string, // ISO format: 2024-01-01T10:00:00+05:30
  latitude: number,
  longitude: number,
  ayanamsa: string = 'lahiri' // lahiri, raman, or kp
) {
  return prokeralaApiRequest('/astrology/birth-chart', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    ayanamsa,
    chart_type: 'rasi',
    chart_style: 'north-indian',
  });
}

// Get planetary positions
export async function getProkeralaPlanetPositions(
  datetime: string,
  latitude: number,
  longitude: number,
  ayanamsa: string = 'lahiri'
) {
  return prokeralaApiRequest('/astrology/planet-position', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    ayanamsa,
  });
}

// Get panchang (auspicious timings)
export async function getProkeralaPanchang(
  datetime: string,
  latitude: number,
  longitude: number,
  ayanamsa: string = 'lahiri'
) {
  return prokeralaApiRequest('/astrology/panchang', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    ayanamsa,
  });
}

// Get kundli matching for compatibility
export async function getProkeralaKundliMatching(
  bride: {
    datetime: string;
    latitude: number;
    longitude: number;
  },
  groom: {
    datetime: string;
    latitude: number;
    longitude: number;
  },
  ayanamsa: string = 'lahiri'
) {
  return prokeralaApiRequest('/astrology/kundli-matching', {
    bride_details: {
      datetime: bride.datetime,
      coordinates: `${bride.latitude},${bride.longitude}`,
    },
    groom_details: {
      datetime: groom.datetime,
      coordinates: `${groom.latitude},${groom.longitude}`,
    },
    ayanamsa,
  });
}

// Get mangal dosha
export async function getProkeralaMangalDosha(
  datetime: string,
  latitude: number,
  longitude: number,
  ayanamsa: string = 'lahiri'
) {
  return prokeralaApiRequest('/astrology/mangal-dosha', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    ayanamsa,
  });
}

// Get current planetary transits
export async function getProkeralaTransits(
  natal_datetime: string,
  natal_latitude: number,
  natal_longitude: number,
  transit_datetime: string,
  ayanamsa: string = 'lahiri'
) {
  return prokeralaApiRequest('/astrology/transit-chart', {
    natal_datetime,
    natal_coordinates: `${natal_latitude},${natal_longitude}`,
    transit_datetime,
    transit_coordinates: `${natal_latitude},${natal_longitude}`,
    ayanamsa,
  });
}

// Get Western astrology chart
export async function getProkeralaWesternChart(
  datetime: string,
  latitude: number,
  longitude: number,
  house_system: string = 'placidus'
) {
  return prokeralaApiRequest('/astrology/western/natal-chart', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    house_system,
  });
}

// Get numerology life path
export async function getProkeralaNumerology(
  date_of_birth: string, // YYYY-MM-DD
  full_name: string
) {
  return prokeralaApiRequest('/numerology/life-path', {
    date_of_birth,
    full_name,
  });
}

// Check if Prokerala is configured
export function isProkeralaConfigured(): boolean {
  const configured = !!(process.env.PROKERALA_CLIENT_ID && process.env.PROKERALA_CLIENT_SECRET);
  if (!configured) {
    console.log('Prokerala not configured. Set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET environment variables.');
  }
  return configured;
}
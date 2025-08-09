import axios from 'axios';

const PROKERALA_BASE_URL = 'https://api.prokerala.com/v2';
const PROKERALA_AUTH_URL = 'https://api.prokerala.com/token';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Check if Prokerala is configured
export function isProkeralaConfigured(): boolean {
  const configured = !!(process.env.PROKERALA_CLIENT_ID && process.env.PROKERALA_CLIENT_SECRET);
  if (!configured) {
    console.log('Prokerala not configured. Set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET environment variables.');
  }
  return configured;
}

// Get OAuth2 access token
async function getProkeralaAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken;
  }

  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Prokerala API credentials not configured');
  }

  try {
    const response = await axios.post(
      PROKERALA_AUTH_URL,
      `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken as string;
  } catch (error: any) {
    console.error('Failed to get Prokerala access token:', error.response?.data || error.message);
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

    console.log(`Prokerala ${endpoint} response:`, JSON.stringify(response.data, null, 2));
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
  const data = await prokeralaApiRequest('/astrology/birth-chart', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    ayanamsa,
    chart_type: 'rasi',
    chart_style: 'north-indian',
  });
  
  // Extract the signs from the response
  if (data?.data) {
    const chartData = data.data;
    
    // Try to find ascendant/rising sign
    const risingSign = chartData.ascendant?.sign || 
                      chartData.houses?.[0]?.sign || 
                      chartData.lagna?.sign ||
                      null;
    
    // Try to find sun sign
    const sunSign = chartData.planets?.find((p: any) => p.name === 'Sun')?.sign ||
                   chartData.sun?.sign ||
                   null;
    
    // Try to find moon sign
    const moonSign = chartData.planets?.find((p: any) => p.name === 'Moon')?.sign ||
                    chartData.moon?.sign ||
                    null;
    
    return {
      ...data,
      extracted: {
        sunSign,
        moonSign,
        risingSign
      }
    };
  }
  
  return data;
}

// Get planetary positions
export async function getProkeralaPlanetPositions(
  datetime: string,
  latitude: number,
  longitude: number,
  ayanamsa: string = 'lahiri'
) {
  const data = await prokeralaApiRequest('/astrology/planet-position', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    ayanamsa,
  });
  
  // Extract useful data
  if (data?.data?.planet_positions) {
    const positions = data.data.planet_positions;
    
    const sunData = positions.find((p: any) => p.name === 'Sun');
    const moonData = positions.find((p: any) => p.name === 'Moon');
    const ascData = positions.find((p: any) => p.name === 'Ascendant');
    
    return {
      ...data,
      extracted: {
        sunSign: sunData?.sign,
        moonSign: moonData?.sign,
        risingSign: ascData?.sign,
        allPlanets: positions
      }
    };
  }
  
  return data;
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
  maleDatetime: string,
  maleLatitude: number,
  maleLongitude: number,
  femaleDatetime: string,
  femaleLatitude: number,
  femaleLongitude: number,
  ayanamsa: string = 'lahiri'
) {
  return prokeralaApiRequest('/astrology/kundli-matching', {
    male_datetime: maleDatetime,
    male_coordinates: `${maleLatitude},${maleLongitude}`,
    female_datetime: femaleDatetime,
    female_coordinates: `${femaleLatitude},${femaleLongitude}`,
    ayanamsa,
  });
}

// Get mangal dosha analysis
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

// Get transit chart
export async function getProkeralaTransitChart(
  datetime: string,
  natalDatetime: string,
  latitude: number,
  longitude: number,
  ayanamsa: string = 'lahiri'
) {
  return prokeralaApiRequest('/astrology/transit-chart', {
    datetime,
    natal_datetime: natalDatetime,
    coordinates: `${latitude},${longitude}`,
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
  const data = await prokeralaApiRequest('/astrology/western/natal-chart', {
    datetime,
    coordinates: `${latitude},${longitude}`,
    house_system,
  });
  
  // Extract Western astrology data
  if (data?.data) {
    const chartData = data.data;
    
    const sunSign = chartData.planets?.find((p: any) => p.name === 'Sun')?.sign;
    const moonSign = chartData.planets?.find((p: any) => p.name === 'Moon')?.sign;
    const risingSign = chartData.ascendant?.sign || chartData.houses?.[0]?.sign;
    
    return {
      ...data,
      extracted: {
        sunSign,
        moonSign,
        risingSign
      }
    };
  }
  
  return data;
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
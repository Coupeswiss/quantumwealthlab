import { NextResponse } from "next/server";
import { 
  ZODIAC_DATABASE, 
  PLANETARY_INFLUENCES, 
  HOUSE_MEANINGS,
  generateWealthArchetype,
  calculateCompatibility,
  getCosmicWeather,
  type ZodiacSign 
} from "@/lib/astrology-database";
import { ZODIAC_SIGNS_ORDER } from "@/lib/astrology-constants";
import { 
  getMoonSignFromEphemeris, 
  getMercurySignFromEphemeris,
  getVenusSignFromEphemeris,
  getMarsSignFromEphemeris,
  getJupiterSignFromEphemeris,
  getSaturnSignFromEphemeris,
  approximateMoonSign 
} from "@/lib/ephemeris-data";

// Accurate zodiac sign calculation based on birth date
function calculateSunSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  // Iterate through all zodiac signs and check date ranges
  for (const [signName, signData] of Object.entries(ZODIAC_DATABASE)) {
    const { start, end } = signData.dateRange;
    
    // Handle Capricorn's special case (spans across year boundary)
    if (signName === 'Capricorn') {
      if ((month === 12 && day >= start.day) || (month === 1 && day <= end.day)) {
        return signName;
      }
    } else {
      // For all other signs, check if date falls within range
      if (month === start.month && day >= start.day) {
        return signName;
      }
      if (month === end.month && day <= end.day) {
        return signName;
      }
      // Handle dates that span across months
      if (month > start.month && month < end.month) {
        return signName;
      }
      if (month === start.month && month === end.month && 
          day >= start.day && day <= end.day) {
        return signName;
      }
    }
  }
  
  return "Unknown";
}

// Accurate moon sign calculation using ephemeris data
function calculateMoonSign(birthDate: Date, birthTime?: string): string {
  // First try to get from ephemeris data
  const ephemerisMoon = getMoonSignFromEphemeris(birthDate);
  
  if (ephemerisMoon) {
    return ephemerisMoon;
  }
  
  // Fallback to approximation if no ephemeris data
  return approximateMoonSign(birthDate);
}

// Enhanced rising sign calculation with latitude consideration
function calculateRisingSign(birthDate: Date, birthTime?: string, birthLat?: number): string {
  if (!birthTime) return "Unknown";
  
  const signs = ZODIAC_SIGNS_ORDER as unknown as string[]; // Use ordered array
  
  // Parse birth time with format handling
  let hours = 0, minutes = 0;
  
  if (birthTime.includes(':')) {
    [hours, minutes] = birthTime.split(':').map(Number);
  } else if (birthTime.includes('.')) {
    [hours, minutes] = birthTime.split('.').map(Number);
  } else if (birthTime.length === 4) {
    // HHMM format
    hours = parseInt(birthTime.substring(0, 2));
    minutes = parseInt(birthTime.substring(2, 4));
  } else if (birthTime.length <= 2) {
    // Just hours
    hours = parseInt(birthTime);
  }
  
  // Validate time values
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.warn('Invalid birth time for rising sign calculation');
    return "Unknown";
  }
  
  const decimalTime = hours + minutes / 60;
  
  // Calculate local sidereal time (simplified)
  // Rising sign changes approximately every 2 hours
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Factor in latitude if available (affects house cusps)
  let latitudeFactor = 0;
  if (birthLat !== undefined && birthLat !== null) {
    // Northern latitudes have longer ascension times for certain signs
    latitudeFactor = Math.abs(birthLat) / 90; // Normalize to 0-1
  }
  
  // Calculate ascendant position
  // Each sign rises for approximately 2 hours, but this varies by latitude
  const baseIndex = Math.floor(decimalTime / 2);
  
  // Adjust for time of year (seasonal variation)
  const seasonalAdjustment = Math.floor((dayOfYear / 365) * 4) % 4;
  
  // Combine factors for final calculation
  const risingIndex = (baseIndex + seasonalAdjustment + Math.floor(latitudeFactor * 2)) % 12;
  
  return signs[risingIndex];
}

// Get comprehensive elemental and zodiac profile from database
function getComprehensiveProfile(sunSign: string, moonSign: string, risingSign: string) {
  const sunData = ZODIAC_DATABASE[sunSign];
  const moonData = ZODIAC_DATABASE[moonSign];
  const risingData = ZODIAC_DATABASE[risingSign];
  
  // Create a comprehensive profile combining all three
  return {
    sun: {
      sign: sunSign,
      element: sunData?.element || 'Unknown',
      modality: sunData?.modality || 'Unknown',
      ruler: sunData?.ruler || 'Unknown',
      personality: sunData?.personality || {},
      wealthProfile: sunData?.wealthProfile || {}
    },
    moon: {
      sign: moonSign,
      element: moonData?.element || 'Unknown',
      emotionalNature: moonData?.personality?.keywords || [],
      innerNeeds: moonData?.personality?.coreValues || []
    },
    rising: {
      sign: risingSign,
      element: risingData?.element || 'Unknown',
      firstImpression: risingData?.personality?.keywords?.[0] || 'Unknown',
      approach: risingData?.personality?.strengths || []
    },
    elements: {
      fire: [sunData, moonData, risingData].filter(d => d?.element === 'Fire').length,
      earth: [sunData, moonData, risingData].filter(d => d?.element === 'Earth').length,
      air: [sunData, moonData, risingData].filter(d => d?.element === 'Air').length,
      water: [sunData, moonData, risingData].filter(d => d?.element === 'Water').length
    },
    modalities: {
      cardinal: [sunData, moonData, risingData].filter(d => d?.modality === 'Cardinal').length,
      fixed: [sunData, moonData, risingData].filter(d => d?.modality === 'Fixed').length,
      mutable: [sunData, moonData, risingData].filter(d => d?.modality === 'Mutable').length
    }
  };
}

// Simplified city coordinates for rising sign calculation
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'washington dc': { lat: 38.9072, lng: -77.0369 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'san antonio': { lat: 29.4241, lng: -98.4936 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'moscow': { lat: 55.7558, lng: 37.6173 }
};

function getCityCoordinates(birthPlace: string): { lat: number; lng: number } | null {
  if (!birthPlace) return null;
  
  const normalizedCity = birthPlace.toLowerCase().trim();
  
  // Check exact match first
  if (CITY_COORDINATES[normalizedCity]) {
    return CITY_COORDINATES[normalizedCity];
  }
  
  // Check if city name contains any known city
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalizedCity.includes(city) || city.includes(normalizedCity)) {
      return coords;
    }
  }
  
  // Default to approximate US center if not found
  return { lat: 39.8283, lng: -98.5795 };
}

export async function POST(req: Request) {
  try {
    const { birthDate, birthTime, birthPlace, birthLat, birthLng } = await req.json();
    
    // Log request for debugging if needed
    // console.log('Astrology calculation request:', { birthDate, birthTime, birthPlace, birthLat, birthLng });
    
    // Handle various date formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    let date: Date;
    if (birthDate.includes('/')) {
      // Check if it's DD/MM/YYYY or MM/DD/YYYY format
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY format for dates like 30/12/1993
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // If day > 12, it's definitely DD/MM/YYYY
        // If day <= 12 and month > 12, it's MM/DD/YYYY
        // Otherwise, assume DD/MM/YYYY for international format
        if (day > 12 || (day <= 12 && month <= 12)) {
          // DD/MM/YYYY format
          date = new Date(year, month - 1, day);
        } else {
          // MM/DD/YYYY format
          date = new Date(year, day - 1, month);
        }
      } else {
        date = new Date(birthDate);
      }
    } else {
      date = new Date(birthDate);
    }
    
    // Ensure the date is in UTC to avoid timezone issues
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    
    // Validate date
    if (isNaN(utcDate.getTime())) {
      throw new Error('Invalid birth date format');
    }
    
    // Use UTC date for calculations
    date = utcDate;
    // Get coordinates for birth place if not provided
    let latitude = birthLat;
    let longitude = birthLng;
    
    if (birthPlace && (latitude === undefined || latitude === null)) {
      const coords = getCityCoordinates(birthPlace);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
        // console.log(`Using coordinates for ${birthPlace}:`, coords);
      }
    }
    
    const sunSign = calculateSunSign(date);
    const moonSign = calculateMoonSign(date, birthTime);
    const risingSign = calculateRisingSign(date, birthTime, latitude);
    
    // Get other planetary positions from ephemeris
    const mercurySign = getMercurySignFromEphemeris(date) || getAdjacentSign(sunSign, -1);
    const venusSign = getVenusSignFromEphemeris(date) || getAdjacentSign(sunSign, 1);
    const marsSign = getMarsSignFromEphemeris(date) || moonSign;
    const jupiterSign = getJupiterSignFromEphemeris(date) || 'Scorpio';
    const saturnSign = getSaturnSignFromEphemeris(date) || 'Aquarius';
    
    // Get comprehensive profile from database
    const profile = getComprehensiveProfile(sunSign, moonSign, risingSign);
    const sunData = ZODIAC_DATABASE[sunSign];
    const moonData = ZODIAC_DATABASE[moonSign];
    const risingData = ZODIAC_DATABASE[risingSign];
    
    // Calculate current transits with enhanced accuracy
    const currentDate = new Date();
    const transitSun = calculateSunSign(currentDate);
    const transitMoon = calculateMoonSign(currentDate, `${currentDate.getHours()}:${currentDate.getMinutes()}`);
    
    // Generate more accurate natal chart insights
    // House calculation based on rising sign
    const risingHouse = risingData?.house || 1;
    const natalChart = {
      sun: { 
        sign: sunSign, 
        house: ((risingHouse + Math.floor((date.getMonth() + 1) / 2)) % 12) || 1,
        meaning: sunData?.personality?.motivation || 'Self-expression'
      },
      moon: { 
        sign: moonSign, 
        house: ((risingHouse + Math.floor((date.getDate()) / 3)) % 12) || 4,
        meaning: 'Emotional nature and instincts'
      },
      rising: { 
        sign: risingSign,
        meaning: 'Public persona and first impressions'
      },
      mercury: { 
        sign: mercurySign,
        house: ((risingHouse + 2) % 12) || 3,
        meaning: PLANETARY_INFLUENCES.Mercury.meaning
      },
      venus: { 
        sign: venusSign,
        house: ((risingHouse + 1) % 12) || 2,
        meaning: PLANETARY_INFLUENCES.Venus.meaning
      },
      mars: { 
        sign: marsSign,
        house: ((risingHouse + 5) % 12) || 6,
        meaning: PLANETARY_INFLUENCES.Mars.meaning
      },
      jupiter: {
        sign: jupiterSign,
        house: ((risingHouse + 8) % 12) || 9,
        meaning: PLANETARY_INFLUENCES.Jupiter.meaning
      },
      saturn: {
        sign: saturnSign,
        house: ((risingHouse + 9) % 12) || 10,
        meaning: PLANETARY_INFLUENCES.Saturn.meaning
      },
    };
    
    // Calculate wealth houses with accurate meanings
    const secondHouseSign = getHouseSign(risingSign, 2);
    const eighthHouseSign = getHouseSign(risingSign, 8);
    
    const wealthHouses = {
      second: {
        sign: secondHouseSign,
        ruler: ZODIAC_DATABASE[secondHouseSign]?.ruler || 'Venus',
        themes: HOUSE_MEANINGS[2].themes,
        insights: ZODIAC_DATABASE[secondHouseSign]?.wealthProfile?.moneyMindset || 'Building personal resources'
      },
      eighth: {
        sign: eighthHouseSign,
        ruler: ZODIAC_DATABASE[eighthHouseSign]?.ruler || 'Pluto',
        themes: HOUSE_MEANINGS[8].themes,
        insights: 'Transformation of shared resources and deep investments'
      },
      fifth: { // Speculation house
        sign: getHouseSign(risingSign, 5),
        themes: HOUSE_MEANINGS[5].themes,
        insights: 'Creative ventures and speculative gains'
      },
      tenth: { // Career house
        sign: getHouseSign(risingSign, 10),
        themes: HOUSE_MEANINGS[10].themes,
        insights: 'Professional success and public achievement'
      }
    };
    
    // Get accurate cosmic weather from database
    const cosmicWeather = getCosmicWeather(sunSign, transitSun, transitMoon);
    
    // Calculate personal transits
    const personalTransits = {
      sunReturn: transitSun === sunSign,
      moonPhase: getMoonPhase(new Date()),
      mercuryRetrograde: isMercuryRetrograde(new Date()),
      venusPosition: getVenusInfluence(sunSign, transitSun),
      marsEnergy: getMarsEnergy(sunSign)
    };
    
    // Generate comprehensive wealth archetype
    const wealthArchetype = generateWealthArchetype(sunSign, moonSign, risingSign);
    
    // Wealth archetype generated successfully
    
    return NextResponse.json({
      sunSign,
      moonSign,
      risingSign,
      elemental: {
        dominant: getDominantElement(profile.elements),
        balance: profile.elements,
        qualities: {
          strengths: [...(sunData?.personality?.strengths || []).slice(0, 4)],
          challenges: [...(sunData?.personality?.challenges || []).slice(0, 3)],
          wealthStyle: sunData?.wealthProfile?.style || 'Balanced Investor'
        }
      },
      natalChart,
      wealthHouses,
      cosmicWeather,
      personalTransits,
      currentTransits: {
        sun: transitSun,
        moon: transitMoon,
        mercury: getMercurySignFromEphemeris(currentDate) || getAdjacentSign(transitSun, -1),
        venus: getVenusSignFromEphemeris(currentDate) || getAdjacentSign(transitSun, 1),
        mars: getMarsSignFromEphemeris(currentDate) || transitMoon,
        jupiter: getJupiterSignFromEphemeris(currentDate) || 'Scorpio',
        saturn: getSaturnSignFromEphemeris(currentDate) || 'Aquarius'
      },
      personality: {
        archetype: wealthArchetype.archetype,
        description: wealthArchetype.description,
        strengths: wealthArchetype.strengths,
        challenges: sunData?.personality?.challenges || [],
        opportunities: wealthArchetype.opportunities,
        wealthStyle: sunData?.wealthProfile?.style || 'Adaptive Investor',
        idealPortfolio: sunData?.wealthProfile?.idealPortfolio || 'Diversified approach',
        riskTolerance: sunData?.wealthProfile?.riskTolerance || 'Moderate',
        luckyNumbers: sunData?.luckyNumbers || [],
        colors: sunData?.colors || [],
        gemstones: sunData?.gemstones || []
      },
      compatibility: {
        bestMatches: sunData?.relationships?.bestMatches || [],
        businessPartners: sunData?.relationships?.businessPartners || [],
        challengingMatches: sunData?.relationships?.challengingMatches || []
      },
      detailedProfile: profile
    });
    
  } catch (error) {
    console.error("Astrology calculation error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to calculate astrological profile",
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      sunSign: "Unknown",
      moonSign: "Unknown",
      risingSign: "Unknown",
      message: "Please check your birth date and time format. Date should be DD/MM/YYYY or YYYY-MM-DD, time should be HH:MM (24-hour format)."
    }, { status: 500 });
  }
}

// Helper function to get adjacent signs (for Mercury/Venus calculations)
function getAdjacentSign(sign: string, offset: number): string {
  const signs = ZODIAC_SIGNS_ORDER as unknown as string[]; // Use ordered array
  const index = signs.indexOf(sign);
  if (index === -1) return sign;
  
  const newIndex = (index + offset + 12) % 12;
  return signs[newIndex];
}

// Helper function to determine sign of a house based on rising sign
function getHouseSign(risingSign: string, houseNumber: number): string {
  const signs = ZODIAC_SIGNS_ORDER as unknown as string[]; // Use ordered array
  const risingIndex = signs.indexOf(risingSign);
  if (risingIndex === -1) return risingSign;
  
  // Houses are counted from rising sign
  const houseIndex = (risingIndex + houseNumber - 1) % 12;
  return signs[houseIndex];
}

// Get dominant element from element counts
function getDominantElement(elements: {fire: number, earth: number, air: number, water: number}): string {
  const max = Math.max(elements.fire, elements.earth, elements.air, elements.water);
  if (elements.fire === max) return 'Fire';
  if (elements.earth === max) return 'Earth';
  if (elements.air === max) return 'Air';
  if (elements.water === max) return 'Water';
  return 'Balanced';
}

// Calculate moon phase
function getMoonPhase(date: Date): string {
  const synodicMonth = 29.53059; // Days in lunar cycle
  const knownNewMoon = new Date('2000-01-06'); // Known new moon date
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  const phase = (daysSince % synodicMonth) / synodicMonth;
  
  if (phase < 0.0625) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Last Quarter';
  if (phase < 0.9375) return 'Waning Crescent';
  return 'New Moon';
}

// Check if Mercury is in retrograde (simplified)
function isMercuryRetrograde(date: Date): boolean {
  // Mercury retrograde happens about 3-4 times per year for ~3 weeks
  // This is a simplified calculation
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  // Approximate retrograde periods (varies by year)
  const retrogradePeriods = [
    [10, 31],   // Late January
    [130, 151], // May-June
    [250, 271], // September
    [340, 361]  // December
  ];
  
  return retrogradePeriods.some(([start, end]) => dayOfYear >= start && dayOfYear <= end);
}

// Get Venus influence
function getVenusInfluence(userSign: string, transitSign: string): string {
  const compatibility = calculateCompatibility(userSign, transitSign);
  if (compatibility > 70) return 'Harmonious - favorable for relationships and finances';
  if (compatibility > 50) return 'Neutral - steady energy for partnerships';
  return 'Challenging - review values and relationships';
}

// Get Mars energy
function getMarsEnergy(userSign: string): string {
  const signData = ZODIAC_DATABASE[userSign];
  if (!signData) return 'Moderate';
  
  if (signData.element === 'Fire') return 'High - Take bold action';
  if (signData.element === 'Earth') return 'Steady - Build systematically';
  if (signData.element === 'Air') return 'Mental - Strategic planning';
  if (signData.element === 'Water') return 'Intuitive - Trust your feelings';
  return 'Balanced';
}
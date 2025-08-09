// Astrological constants for consistent ordering and calculations

// The correct zodiac order starting from Aries (astrological new year)
export const ZODIAC_SIGNS_ORDER = [
  'Aries',
  'Taurus', 
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
] as const;

// Type for zodiac signs
export type ZodiacSign = typeof ZODIAC_SIGNS_ORDER[number];

// Elements mapping
export const ELEMENTS = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces']
} as const;

// Modalities mapping
export const MODALITIES = {
  Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
  Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
  Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
} as const;

// Planetary rulers (traditional)
export const RULERS = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars/Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn/Uranus',
  Pisces: 'Jupiter/Neptune'
} as const;

// Moon phases for calculations
export const MOON_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
] as const;

// Days of the week and their planetary rulers
export const PLANETARY_DAYS = {
  Sunday: 'Sun',
  Monday: 'Moon',
  Tuesday: 'Mars',
  Wednesday: 'Mercury',
  Thursday: 'Jupiter',
  Friday: 'Venus',
  Saturday: 'Saturn'
} as const;

// Aspects and their angles
export const ASPECTS = {
  Conjunction: 0,
  Sextile: 60,
  Square: 90,
  Trine: 120,
  Opposition: 180
} as const;

// Mercury Retrograde periods for 2024-2025 (approximate)
export const MERCURY_RETROGRADE_PERIODS = [
  { start: new Date('2024-04-01'), end: new Date('2024-04-25') },
  { start: new Date('2024-08-05'), end: new Date('2024-08-28') },
  { start: new Date('2024-11-26'), end: new Date('2024-12-15') },
  { start: new Date('2025-03-15'), end: new Date('2025-04-07') },
  { start: new Date('2025-07-18'), end: new Date('2025-08-11') },
  { start: new Date('2025-11-09'), end: new Date('2025-11-29') }
];
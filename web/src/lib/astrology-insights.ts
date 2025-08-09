// Astrological Insights Generator for Personalized Wealth Guidance
// This module generates accurate, personalized insights based on astrological profiles

import { ZODIAC_DATABASE } from './astrology-database';

export interface AstrologicalInsight {
  type: 'daily' | 'weekly' | 'monthly' | 'transit' | 'wealth' | 'relationship';
  title: string;
  message: string;
  advice: string[];
  timing: string;
  confidence: number; // 0-100
  areas: string[];
}

// Generate daily insights based on current planetary positions
export function generateDailyInsights(
  sunSign: string,
  moonSign: string,
  risingSign: string,
  currentTransits: any
): AstrologicalInsight[] {
  const insights: AstrologicalInsight[] = [];
  const sunData = ZODIAC_DATABASE[sunSign];
  const moonData = ZODIAC_DATABASE[moonSign];
  const risingData = ZODIAC_DATABASE[risingSign];

  if (!sunData || !moonData || !risingData) {
    return [{
      type: 'daily',
      title: 'Personal Energy Reading',
      message: 'Your unique astrological combination creates special opportunities today.',
      advice: ['Stay open to unexpected insights', 'Trust your intuition', 'Take measured risks'],
      timing: 'Throughout the day',
      confidence: 75,
      areas: ['General']
    }];
  }

  // Sun sign daily insight
  insights.push({
    type: 'daily',
    title: `${sunSign} Solar Energy`,
    message: generateSolarMessage(sunSign, currentTransits.sun),
    advice: getSolarAdvice(sunSign, currentTransits),
    timing: getBestTiming(sunSign),
    confidence: 85,
    areas: ['Identity', 'Leadership', 'Core Energy']
  });

  // Moon sign emotional insight
  insights.push({
    type: 'daily',
    title: `${moonSign} Lunar Guidance`,
    message: generateLunarMessage(moonSign, currentTransits.moon),
    advice: getLunarAdvice(moonSign, currentTransits),
    timing: 'Evening hours',
    confidence: 80,
    areas: ['Emotions', 'Intuition', 'Inner Life']
  });

  // Rising sign social insight
  insights.push({
    type: 'daily',
    title: `${risingSign} Rising Opportunities`,
    message: generateRisingMessage(risingSign, currentTransits),
    advice: getRisingAdvice(risingSign),
    timing: 'First impressions and new encounters',
    confidence: 78,
    areas: ['Social', 'Appearance', 'First Impressions']
  });

  return insights;
}

// Generate wealth-specific insights
export function generateWealthInsights(
  profile: any,
  marketConditions?: any
): AstrologicalInsight[] {
  const insights: AstrologicalInsight[] = [];
  const sunData = ZODIAC_DATABASE[profile.sunSign];
  const moonData = ZODIAC_DATABASE[profile.moonSign];

  if (!sunData) return [];

  // Investment timing insight
  insights.push({
    type: 'wealth',
    title: 'Optimal Investment Timing',
    message: getInvestmentTiming(profile, marketConditions),
    advice: getInvestmentAdvice(sunData, profile.currentTransits),
    timing: getWealthTiming(profile.sunSign, profile.moonSign),
    confidence: calculateTimingConfidence(profile.currentTransits),
    areas: ['Investments', 'Trading', 'Financial Decisions']
  });

  // Wealth building strategy
  insights.push({
    type: 'wealth',
    title: 'Wealth Building Focus',
    message: getWealthBuildingMessage(sunData, profile.riskTolerance),
    advice: sunData.wealthProfile.bestInvestments.slice(0, 3).map(
      investment => `Consider ${investment} aligned with your ${sunData.element} energy`
    ),
    timing: 'Long-term strategy',
    confidence: 90,
    areas: ['Portfolio', 'Strategy', 'Long-term Growth']
  });

  // Risk management insight
  insights.push({
    type: 'wealth',
    title: 'Risk Management Alert',
    message: getRiskMessage(profile, marketConditions),
    advice: getRiskAdvice(sunData, moonData, marketConditions),
    timing: 'Current market cycle',
    confidence: 82,
    areas: ['Risk', 'Protection', 'Balance']
  });

  return insights;
}

// Generate transit-based insights
export function generateTransitInsights(
  natalChart: any,
  currentTransits: any
): AstrologicalInsight[] {
  const insights: AstrologicalInsight[] = [];

  // Check for significant transits
  if (currentTransits.mercuryRetrograde) {
    insights.push({
      type: 'transit',
      title: 'Mercury Retrograde Alert',
      message: 'Communication planet is retrograde. Review and revise rather than initiate.',
      advice: [
        'Double-check all financial documents',
        'Avoid signing new contracts if possible',
        'Review and reorganize your portfolio',
        'Back up important financial data'
      ],
      timing: 'Next 3 weeks',
      confidence: 95,
      areas: ['Communication', 'Contracts', 'Technology', 'Travel']
    });
  }

  // Moon phase insights
  const moonPhaseInsight = getMoonPhaseInsight(currentTransits.moonPhase);
  if (moonPhaseInsight) {
    insights.push(moonPhaseInsight);
  }

  // Personal planet transits
  if (natalChart.sun.sign === currentTransits.sun) {
    insights.push({
      type: 'transit',
      title: 'Solar Return - Your Power Day!',
      message: 'The Sun returns to your natal position, amplifying your personal power and magnetism.',
      advice: [
        'Set intentions for the year ahead',
        'Make important financial decisions',
        'Launch new ventures',
        'Celebrate your unique gifts'
      ],
      timing: 'Today and the next few days',
      confidence: 100,
      areas: ['Personal Power', 'New Beginnings', 'Leadership']
    });
  }

  return insights;
}

// Helper functions for generating specific messages

function generateSolarMessage(sign: string, transitSun: string): string {
  const signData = ZODIAC_DATABASE[sign];
  const transitData = ZODIAC_DATABASE[transitSun];
  
  if (!signData || !transitData) {
    return 'Your solar energy is unique today. Stay aligned with your core values.';
  }

  const elementCompatibility = getElementCompatibility(signData.element, transitData.element);
  
  if (elementCompatibility === 'harmonious') {
    return `The ${transitSun} Sun harmonizes with your ${sign} nature, enhancing your ${signData.personality.strengths[0].toLowerCase()} qualities. ${signData.personality.motivation}`;
  } else if (elementCompatibility === 'challenging') {
    return `The ${transitSun} Sun challenges your ${sign} nature. Use this tension creatively to overcome ${signData.personality.challenges[0].toLowerCase()} tendencies.`;
  } else {
    return `The ${transitSun} Sun brings ${transitData.element} energy to your ${sign} ${signData.element} nature. Balance is key today.`;
  }
}

function generateLunarMessage(sign: string, transitMoon: string): string {
  const signData = ZODIAC_DATABASE[sign];
  const transitData = ZODIAC_DATABASE[transitMoon];
  
  if (!signData || !transitData) {
    return 'Your emotional landscape is rich today. Trust your inner wisdom.';
  }

  return `Your ${sign} Moon resonates with ${transitMoon} lunar energy. Your ${signData.personality.keywords[0]} nature feels ${transitData.personality.keywords[0].toLowerCase()} influences. Honor your emotional needs around ${signData.personality.coreValues[0].toLowerCase()}.`;
}

function generateRisingMessage(sign: string, transits: any): string {
  const signData = ZODIAC_DATABASE[sign];
  
  if (!signData) {
    return 'Your presence makes an impact today. Show up authentically.';
  }

  return `Your ${sign} Rising sign projects ${signData.personality.keywords[0]} energy. Others see you as ${signData.personality.strengths[0].toLowerCase()} and ${signData.personality.strengths[1].toLowerCase()}. Use this to your advantage in negotiations and first meetings.`;
}

function getSolarAdvice(sign: string, transits: any): string[] {
  const signData = ZODIAC_DATABASE[sign];
  if (!signData) return ['Trust your instincts', 'Stay centered', 'Be authentic'];

  const advice = [];
  
  // Element-specific advice
  switch(signData.element) {
    case 'Fire':
      advice.push('Channel enthusiasm into concrete actions');
      advice.push('Lead with confidence but stay humble');
      break;
    case 'Earth':
      advice.push('Focus on practical, tangible results');
      advice.push('Build slowly but steadily toward goals');
      break;
    case 'Air':
      advice.push('Communicate your ideas clearly');
      advice.push('Network and exchange information');
      break;
    case 'Water':
      advice.push('Trust your intuition in decisions');
      advice.push('Protect your emotional energy');
      break;
  }

  // Add sign-specific advice
  advice.push(`Leverage your ${signData.personality.strengths[0].toLowerCase()} nature`);
  
  return advice;
}

function getLunarAdvice(sign: string, transits: any): string[] {
  const signData = ZODIAC_DATABASE[sign];
  if (!signData) return ['Honor your feelings', 'Practice self-care', 'Trust intuition'];

  return [
    `Process emotions through ${signData.element.toLowerCase()} element activities`,
    `Your ${sign} Moon needs ${signData.personality.coreValues[0].toLowerCase()}`,
    'Create emotional security before taking risks',
    'Listen to your body\'s wisdom'
  ];
}

function getRisingAdvice(sign: string): string[] {
  const signData = ZODIAC_DATABASE[sign];
  if (!signData) return ['Be yourself', 'Make strong first impressions'];

  return [
    `Present your ${signData.personality.keywords[0].toLowerCase()} side in meetings`,
    `Dress in ${signData.colors[0].toLowerCase()} to enhance your presence`,
    `Use ${signData.personality.strengths[0].toLowerCase()} to open doors`,
    'First impressions align with your rising sign energy'
  ];
}

function getBestTiming(sign: string): string {
  const signData = ZODIAC_DATABASE[sign];
  if (!signData) return 'Trust your natural rhythm';

  // Fire signs: Morning and early afternoon
  // Earth signs: Steady throughout day, peak midday
  // Air signs: Variable, best when mentally fresh
  // Water signs: Evening and night

  switch(signData.element) {
    case 'Fire':
      return 'Morning to early afternoon - high energy period';
    case 'Earth':
      return 'Midday - steady productive hours';
    case 'Air':
      return 'When mentally fresh - varies by day';
    case 'Water':
      return 'Evening to night - intuitive hours';
    default:
      return 'Follow your natural rhythm';
  }
}

function getInvestmentTiming(profile: any, market: any): string {
  const sunData = ZODIAC_DATABASE[profile.sunSign];
  if (!sunData) return 'Proceed with careful analysis';

  const moonPhase = profile.currentTransits?.moonPhase || 'Unknown';
  const mercuryRetro = profile.currentTransits?.mercuryRetrograde || false;

  if (mercuryRetro) {
    return 'Mercury retrograde suggests reviewing existing investments rather than initiating new ones. Perfect time to rebalance your portfolio.';
  }

  if (moonPhase === 'New Moon') {
    return `New Moon in ${profile.currentTransits?.moon || 'the current sign'} - Excellent for planting seeds of new investments, especially in ${sunData.wealthProfile.bestInvestments[0]}.`;
  }

  if (moonPhase === 'Full Moon') {
    return 'Full Moon illuminates what needs to be released. Consider taking profits or cutting losses on underperforming assets.';
  }

  return `Current cosmic weather supports ${sunData.wealthProfile.style}. Your ${sunData.element} element thrives when you ${sunData.wealthProfile.moneyMindset.toLowerCase()}.`;
}

function getInvestmentAdvice(sunData: any, transits: any): string[] {
  const advice = [];
  
  // Element-based investment advice
  switch(sunData.element) {
    case 'Fire':
      advice.push('Quick decisions may pay off now');
      advice.push('Consider growth sectors and emerging markets');
      advice.push('Don\'t overthink - trust your instincts');
      break;
    case 'Earth':
      advice.push('Focus on value and fundamentals');
      advice.push('Real assets and tangibles are favored');
      advice.push('Slow and steady wins your race');
      break;
    case 'Air':
      advice.push('Information is your edge - research thoroughly');
      advice.push('Technology and communication sectors align');
      advice.push('Diversification is your friend');
      break;
    case 'Water':
      advice.push('Your intuition about market mood is heightened');
      advice.push('Look for emotional or cyclical patterns');
      advice.push('Hidden value may reveal itself to you');
      break;
  }

  return advice;
}

function getWealthTiming(sun: string, moon: string): string {
  const sunData = ZODIAC_DATABASE[sun];
  const moonData = ZODIAC_DATABASE[moon];
  
  if (!sunData || !moonData) return 'Standard market hours';

  // Combine sun and moon for optimal timing
  if (sunData.element === 'Fire' && moonData.element === 'Fire') {
    return 'Early market hours - high energy and quick decisions';
  }
  if (sunData.element === 'Earth' || moonData.element === 'Earth') {
    return 'Mid-market hours - steady and calculated moves';
  }
  if (sunData.element === 'Water' || moonData.element === 'Water') {
    return 'End of day - emotional clarity and intuitive insights';
  }
  
  return 'Vary your timing - different opportunities at different hours';
}

function calculateTimingConfidence(transits: any): number {
  let confidence = 70; // Base confidence
  
  if (transits?.mercuryRetrograde) confidence -= 15;
  if (transits?.moonPhase === 'New Moon') confidence += 10;
  if (transits?.moonPhase === 'Full Moon') confidence += 5;
  if (transits?.venusPosition?.includes('Harmonious')) confidence += 10;
  if (transits?.marsEnergy === 'High') confidence += 5;
  
  return Math.max(0, Math.min(100, confidence));
}

function getWealthBuildingMessage(sunData: any, riskTolerance: string): string {
  const riskAlignment = isRiskAligned(sunData.wealthProfile.riskTolerance, riskTolerance);
  
  if (riskAlignment) {
    return `Your ${sunData.name} nature aligns perfectly with your ${riskTolerance} risk tolerance. ${sunData.wealthProfile.moneyMindset} Focus on ${sunData.wealthProfile.style}.`;
  } else {
    return `Balance your natural ${sunData.name} ${sunData.wealthProfile.riskTolerance} tendencies with your stated ${riskTolerance} risk preference. Consider a blended approach.`;
  }
}

function isRiskAligned(naturalRisk: string, statedRisk: string): boolean {
  const riskLevels: { [key: string]: number } = {
    'Very High': 5,
    'High': 4,
    'Moderate to High': 3.5,
    'Moderate': 3,
    'Low to Moderate': 2,
    'Low': 1,
    'Variable': 3
  };
  
  const natural = riskLevels[naturalRisk] || 3;
  const stated = riskLevels[statedRisk] || 3;
  
  return Math.abs(natural - stated) <= 1;
}

function getRiskMessage(profile: any, market: any): string {
  const sunData = ZODIAC_DATABASE[profile.sunSign];
  if (!sunData) return 'Maintain balanced risk management.';

  const marketVolatility = market?.volatility || 'moderate';
  
  if (marketVolatility === 'high' && sunData.element === 'Fire') {
    return 'Your Fire nature may be excited by volatility, but remember to protect capital.';
  }
  if (marketVolatility === 'high' && sunData.element === 'Earth') {
    return 'Market volatility challenges your Earth stability. This too shall pass - stay grounded.';
  }
  if (marketVolatility === 'low' && sunData.element === 'Air') {
    return 'Low volatility may bore your Air nature. Look for intellectual challenges beyond trading.';
  }
  if (marketVolatility === 'low' && sunData.element === 'Water') {
    return 'Calm markets allow your Water intuition to flow clearly. Trust subtle signals.';
  }
  
  return `Current market conditions ${marketVolatility === 'high' ? 'require extra caution' : 'support steady strategies'}. Your ${sunData.name} nature guides you well.`;
}

function getRiskAdvice(sunData: any, moonData: any, market: any): string[] {
  const advice = [];
  
  // Sun sign risk management
  advice.push(`Your ${sunData.name} sun manages risk through ${sunData.wealthProfile.strengths[0].toLowerCase()}`);
  
  // Moon sign emotional risk
  if (moonData) {
    advice.push(`Your ${moonData.name} moon needs emotional security - protect core holdings`);
  }
  
  // Market conditions
  if (market?.volatility === 'high') {
    advice.push('Reduce position sizes in volatile conditions');
    advice.push('Use stop-losses to protect gains');
  } else {
    advice.push('Steady markets favor gradual position building');
    advice.push('Consider increasing allocation to growth assets');
  }
  
  return advice;
}

function getMoonPhaseInsight(moonPhase: string): AstrologicalInsight | null {
  const phaseInsights: Record<string, AstrologicalInsight> = {
    'New Moon': {
      type: 'transit',
      title: 'New Moon - Seeding Intentions',
      message: 'New Moon energy supports new beginnings. Plant seeds for future wealth.',
      advice: [
        'Start new investment strategies',
        'Set financial intentions for the lunar month',
        'Research new opportunities',
        'Begin accumulation phases'
      ],
      timing: 'Next 3 days',
      confidence: 88,
      areas: ['New Beginnings', 'Planning', 'Intentions']
    },
    'First Quarter': {
      type: 'transit',
      title: 'First Quarter Moon - Taking Action',
      message: 'First Quarter Moon brings decision points. Take action on your plans.',
      advice: [
        'Make decisive investment moves',
        'Overcome obstacles to your goals',
        'Adjust strategies as needed',
        'Push through resistance'
      ],
      timing: 'Next 2-3 days',
      confidence: 82,
      areas: ['Action', 'Decisions', 'Challenges']
    },
    'Full Moon': {
      type: 'transit',
      title: 'Full Moon - Illumination & Harvest',
      message: 'Full Moon illuminates results. Time to harvest gains or release losses.',
      advice: [
        'Review portfolio performance',
        'Take profits on successful trades',
        'Release underperforming assets',
        'Celebrate achievements'
      ],
      timing: 'Peak energy today',
      confidence: 90,
      areas: ['Culmination', 'Release', 'Awareness']
    },
    'Last Quarter': {
      type: 'transit',
      title: 'Last Quarter Moon - Release & Reflect',
      message: 'Last Quarter Moon supports letting go and preparing for renewal.',
      advice: [
        'Clean up your portfolio',
        'Close out losing positions',
        'Reflect on lessons learned',
        'Prepare for new cycle'
      ],
      timing: 'Next 2-3 days',
      confidence: 78,
      areas: ['Release', 'Reflection', 'Preparation']
    }
  };

  return phaseInsights[moonPhase] || null;
}

function getElementCompatibility(element1: string, element2: string): string {
  // Fire + Air = Harmonious
  // Earth + Water = Harmonious
  // Fire + Water = Challenging
  // Earth + Air = Challenging
  // Same elements = Harmonious
  
  if (element1 === element2) return 'harmonious';
  
  if ((element1 === 'Fire' && element2 === 'Air') || 
      (element1 === 'Air' && element2 === 'Fire')) {
    return 'harmonious';
  }
  
  if ((element1 === 'Earth' && element2 === 'Water') || 
      (element1 === 'Water' && element2 === 'Earth')) {
    return 'harmonious';
  }
  
  if ((element1 === 'Fire' && element2 === 'Water') || 
      (element1 === 'Water' && element2 === 'Fire')) {
    return 'challenging';
  }
  
  if ((element1 === 'Earth' && element2 === 'Air') || 
      (element1 === 'Air' && element2 === 'Earth')) {
    return 'challenging';
  }
  
  return 'neutral';
}

// Generate comprehensive weekly forecast
export function generateWeeklyForecast(
  profile: any,
  currentTransits: any
): {
  overview: string;
  dailyHighlights: Record<string, string>;
  opportunities: string[];
  challenges: string[];
  luckyDays: string[];
  focusAreas: string[];
} {
  const sunData = ZODIAC_DATABASE[profile.sunSign];
  const moonData = ZODIAC_DATABASE[profile.moonSign];
  
  if (!sunData) {
    return {
      overview: 'This week brings unique opportunities for growth and transformation.',
      dailyHighlights: {
        Monday: 'Set intentions',
        Tuesday: 'Gather information',
        Wednesday: 'Make connections',
        Thursday: 'Take action',
        Friday: 'Review progress',
        Saturday: 'Relax and recharge',
        Sunday: 'Plan ahead'
      },
      opportunities: ['Personal growth', 'New connections', 'Learning'],
      challenges: ['Staying focused', 'Managing energy'],
      luckyDays: ['Wednesday', 'Friday'],
      focusAreas: ['Self-care', 'Planning', 'Relationships']
    };
  }

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyHighlights: Record<string, string> = {};
  
  // Generate daily highlights based on sign
  weekDays.forEach((day, index) => {
    dailyHighlights[day] = generateDayHighlight(sunData, moonData, day, index);
  });

  // Determine lucky days based on element
  const luckyDays = determineLuckyDays(sunData.element, sunData.luckyNumbers[0]);

  return {
    overview: `This week, your ${sunData.name} sun channels ${sunData.element} energy toward ${sunData.personality.motivation.toLowerCase()}. ${currentTransits?.cosmicWeather?.advice || 'Trust your natural rhythms.'}`,
    dailyHighlights,
    opportunities: [
      ...sunData.wealthProfile.strengths.slice(0, 2),
      `${sunData.element} element activities`,
      'Wealth building through ' + sunData.wealthProfile.style.toLowerCase()
    ],
    challenges: [
      ...sunData.personality.challenges.slice(0, 2).map(c => `Managing ${c.toLowerCase()}`),
      'Balancing intuition with logic'
    ],
    luckyDays,
    focusAreas: [
      sunData.personality.coreValues[0],
      'Financial ' + sunData.wealthProfile.bestInvestments[0].toLowerCase(),
      moonData ? `Emotional ${moonData.personality.keywords[0].toLowerCase()}` : 'Inner balance',
      'Wealth consciousness'
    ]
  };
}

function generateDayHighlight(sunData: any, moonData: any, day: string, index: number): string {
  const highlights: Record<string, string[]> = {
    Monday: [
      'Set wealth intentions aligned with your values',
      'Review portfolio with fresh perspective',
      'Plan your financial week'
    ],
    Tuesday: [
      'Research new investment opportunities',
      'Connect with financial advisors or mentors',
      'Analyze market trends'
    ],
    Wednesday: [
      'Make important financial communications',
      'Network for business opportunities',
      'Execute mid-week trades'
    ],
    Thursday: [
      'Take decisive action on investments',
      'Review and adjust strategies',
      'Focus on wealth expansion'
    ],
    Friday: [
      'Complete financial transactions',
      'Celebrate weekly wins',
      'Prepare for weekend planning'
    ],
    Saturday: [
      'Reflect on financial goals',
      'Engage in wealth-building education',
      'Connect with abundance mindset'
    ],
    Sunday: [
      'Plan for the upcoming week',
      'Set new financial intentions',
      'Practice gratitude for current abundance'
    ]
  };

  const elementModifier: { [key: string]: string } = {
    Fire: 'with bold initiative',
    Earth: 'with practical steps',
    Air: 'through communication',
    Water: 'using intuition'
  };

  const dayHighlights = highlights[day] || ['Focus on your priorities'];
  const selectedHighlight = dayHighlights[index % dayHighlights.length];
  
  return `${selectedHighlight} ${elementModifier[sunData.element] || ''}`.trim();
}

function determineLuckyDays(element: string, luckyNumber: number): string[] {
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const luckyDays: string[] = [];
  
  // Element-based lucky days
  const elementDays: { [key: string]: string[] } = {
    Fire: ['Tuesday', 'Thursday', 'Sunday'],
    Earth: ['Wednesday', 'Friday', 'Saturday'],
    Air: ['Monday', 'Wednesday', 'Friday'],
    Water: ['Monday', 'Thursday', 'Saturday']
  };
  
  // Add element-specific days
  luckyDays.push(...(elementDays[element] || []).slice(0, 2));
  
  // Add day based on lucky number
  const numberDay = allDays[(luckyNumber - 1) % 7];
  if (!luckyDays.includes(numberDay)) {
    luckyDays.push(numberDay);
  }
  
  return luckyDays.slice(0, 3);
}

// Export main function for generating all insights
export function generateComprehensiveInsights(
  profile: any,
  marketData?: any
): {
  daily: AstrologicalInsight[];
  wealth: AstrologicalInsight[];
  transits: AstrologicalInsight[];
  weekly: any;
} {
  const daily = generateDailyInsights(
    profile.sunSign,
    profile.moonSign,
    profile.risingSign,
    profile.currentTransits
  );
  
  const wealth = generateWealthInsights(profile, marketData);
  
  const transits = generateTransitInsights(
    profile.natalChart,
    profile.currentTransits
  );
  
  const weekly = generateWeeklyForecast(profile, profile.currentTransits);
  
  return {
    daily,
    wealth,
    transits,
    weekly
  };
}
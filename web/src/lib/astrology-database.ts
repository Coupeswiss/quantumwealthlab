// Comprehensive Astrological Database for Accurate Insights
// This database contains accurate zodiac sign information, personality traits,
// wealth styles, and compatibility data for precise astrological calculations

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  dateRange: {
    start: { month: number; day: number };
    end: { month: number; day: number };
  };
  personality: {
    keywords: string[];
    strengths: string[];
    challenges: string[];
    coreValues: string[];
    motivation: string;
    fears: string[];
  };
  wealthProfile: {
    style: string;
    strengths: string[];
    challenges: string[];
    bestInvestments: string[];
    moneyMindset: string;
    idealPortfolio: string;
    riskTolerance: string;
  };
  relationships: {
    bestMatches: string[];
    challengingMatches: string[];
    businessPartners: string[];
  };
  house: number;
  bodyPart: string;
  colors: string[];
  gemstones: string[];
  luckyNumbers: number[];
}

export const ZODIAC_DATABASE: Record<string, ZodiacSign> = {
  Aries: {
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    ruler: 'Mars',
    dateRange: {
      start: { month: 3, day: 21 },
      end: { month: 4, day: 19 }
    },
    personality: {
      keywords: ['Pioneer', 'Warrior', 'Leader', 'Initiator', 'Competitor'],
      strengths: ['Courageous', 'Confident', 'Enthusiastic', 'Optimistic', 'Honest', 'Passionate'],
      challenges: ['Impatient', 'Moody', 'Short-tempered', 'Impulsive', 'Aggressive'],
      coreValues: ['Independence', 'Action', 'Leadership', 'Innovation', 'Adventure'],
      motivation: 'To be first, to lead, to pioneer new territories',
      fears: ['Being controlled', 'Losing', 'Boredom', 'Inactivity']
    },
    wealthProfile: {
      style: 'Aggressive Growth Investor',
      strengths: ['Quick decision-making', 'Risk-taking ability', 'Entrepreneurial spirit', 'Innovation'],
      challenges: ['Impatience with long-term investments', 'Over-trading', 'Ignoring risk management'],
      bestInvestments: ['Startups', 'Growth stocks', 'Cryptocurrency', 'Short-term trades', 'New technologies'],
      moneyMindset: 'Money is energy to fuel adventures and initiatives',
      idealPortfolio: '70% growth stocks, 20% crypto/alternatives, 10% cash for opportunities',
      riskTolerance: 'Very High - Thrives on volatility and quick gains'
    },
    relationships: {
      bestMatches: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
      challengingMatches: ['Cancer', 'Capricorn'],
      businessPartners: ['Leo', 'Sagittarius', 'Libra']
    },
    house: 1,
    bodyPart: 'Head',
    colors: ['Red', 'Scarlet', 'Carmine'],
    gemstones: ['Diamond', 'Bloodstone', 'Ruby'],
    luckyNumbers: [1, 9, 19, 27]
  },

  Taurus: {
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    modality: 'Fixed',
    ruler: 'Venus',
    dateRange: {
      start: { month: 4, day: 20 },
      end: { month: 5, day: 20 }
    },
    personality: {
      keywords: ['Builder', 'Provider', 'Sensualist', 'Stabilizer', 'Collector'],
      strengths: ['Reliable', 'Patient', 'Practical', 'Devoted', 'Responsible', 'Stable'],
      challenges: ['Stubborn', 'Possessive', 'Uncompromising', 'Materialistic', 'Resistant to change'],
      coreValues: ['Security', 'Comfort', 'Beauty', 'Loyalty', 'Quality'],
      motivation: 'To build lasting value and enjoy life\'s pleasures',
      fears: ['Financial insecurity', 'Change', 'Instability', 'Scarcity']
    },
    wealthProfile: {
      style: 'Value Investor & Wealth Preserver',
      strengths: ['Patience', 'Long-term thinking', 'Asset accumulation', 'Value recognition'],
      challenges: ['Missing opportunities due to caution', 'Over-attachment to holdings', 'Slow adaptation'],
      bestInvestments: ['Blue-chip stocks', 'Real estate', 'Bonds', 'Precious metals', 'Dividend stocks'],
      moneyMindset: 'Money is security and the means to comfort and beauty',
      idealPortfolio: '40% stocks, 30% real estate, 20% bonds, 10% commodities',
      riskTolerance: 'Low to Moderate - Prefers steady, predictable returns'
    },
    relationships: {
      bestMatches: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      challengingMatches: ['Leo', 'Aquarius'],
      businessPartners: ['Virgo', 'Capricorn', 'Cancer']
    },
    house: 2,
    bodyPart: 'Throat, Neck',
    colors: ['Green', 'Pink', 'Earth tones'],
    gemstones: ['Emerald', 'Rose Quartz', 'Sapphire'],
    luckyNumbers: [2, 6, 12, 24]
  },

  Gemini: {
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    modality: 'Mutable',
    ruler: 'Mercury',
    dateRange: {
      start: { month: 5, day: 21 },
      end: { month: 6, day: 20 }
    },
    personality: {
      keywords: ['Communicator', 'Teacher', 'Student', 'Networker', 'Trader'],
      strengths: ['Versatile', 'Communicative', 'Intellectual', 'Witty', 'Adaptable', 'Curious'],
      challenges: ['Inconsistent', 'Indecisive', 'Nervous', 'Superficial', 'Anxious'],
      coreValues: ['Knowledge', 'Communication', 'Variety', 'Freedom', 'Connection'],
      motivation: 'To learn, share ideas, and connect diverse concepts',
      fears: ['Boredom', 'Being misunderstood', 'Missing out', 'Isolation']
    },
    wealthProfile: {
      style: 'Diversified Trader & Information Arbitrageur',
      strengths: ['Information gathering', 'Quick adaptation', 'Multiple income streams', 'Networking'],
      challenges: ['Lack of focus', 'Over-diversification', 'Analysis paralysis', 'Short attention span'],
      bestInvestments: ['Tech stocks', 'Communications sector', 'Options trading', 'Diverse ETFs', 'Information businesses'],
      moneyMindset: 'Money is freedom and the tool for exploration',
      idealPortfolio: 'Highly diversified across 10+ asset classes, frequent rebalancing',
      riskTolerance: 'Moderate to High - Enjoys variety and quick moves'
    },
    relationships: {
      bestMatches: ['Libra', 'Aquarius', 'Aries', 'Leo'],
      challengingMatches: ['Virgo', 'Pisces'],
      businessPartners: ['Libra', 'Aquarius', 'Sagittarius']
    },
    house: 3,
    bodyPart: 'Arms, Hands, Lungs',
    colors: ['Yellow', 'Light Blue', 'Silver'],
    gemstones: ['Agate', 'Citrine', 'Tiger\'s Eye'],
    luckyNumbers: [3, 5, 14, 23]
  },

  Cancer: {
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    modality: 'Cardinal',
    ruler: 'Moon',
    dateRange: {
      start: { month: 6, day: 21 },
      end: { month: 7, day: 22 }
    },
    personality: {
      keywords: ['Nurturer', 'Protector', 'Intuitive', 'Mother', 'Caregiver'],
      strengths: ['Intuitive', 'Caring', 'Protective', 'Loyal', 'Empathetic', 'Tenacious'],
      challenges: ['Moody', 'Pessimistic', 'Clingy', 'Oversensitive', 'Insecure'],
      coreValues: ['Family', 'Security', 'Home', 'Tradition', 'Emotional connection'],
      motivation: 'To nurture, protect, and create emotional security',
      fears: ['Abandonment', 'Emotional vulnerability', 'Rejection', 'Instability']
    },
    wealthProfile: {
      style: 'Conservative Saver & Family Wealth Builder',
      strengths: ['Intuitive market timing', 'Protective instincts', 'Long-term planning', 'Saving discipline'],
      challenges: ['Emotional investing', 'Over-caution', 'Hoarding tendencies', 'Fear-based decisions'],
      bestInvestments: ['Home/real estate', 'Family businesses', 'Defensive stocks', 'Savings accounts', 'Education funds'],
      moneyMindset: 'Money is protection and legacy for loved ones',
      idealPortfolio: '35% real estate, 30% defensive stocks, 25% bonds, 10% cash reserves',
      riskTolerance: 'Low - Security and capital preservation are paramount'
    },
    relationships: {
      bestMatches: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
      challengingMatches: ['Aries', 'Libra'],
      businessPartners: ['Scorpio', 'Pisces', 'Taurus']
    },
    house: 4,
    bodyPart: 'Chest, Stomach',
    colors: ['Silver', 'White', 'Sea Green'],
    gemstones: ['Moonstone', 'Pearl', 'Ruby'],
    luckyNumbers: [2, 4, 16, 20]
  },

  Leo: {
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    modality: 'Fixed',
    ruler: 'Sun',
    dateRange: {
      start: { month: 7, day: 23 },
      end: { month: 8, day: 22 }
    },
    personality: {
      keywords: ['King', 'Performer', 'Creator', 'Leader', 'Star'],
      strengths: ['Creative', 'Generous', 'Warm-hearted', 'Cheerful', 'Confident', 'Charismatic'],
      challenges: ['Arrogant', 'Stubborn', 'Self-centered', 'Lazy', 'Inflexible'],
      coreValues: ['Recognition', 'Creativity', 'Leadership', 'Generosity', 'Excellence'],
      motivation: 'To shine, create, and be recognized for unique contributions',
      fears: ['Being ignored', 'Mediocrity', 'Failure', 'Humiliation']
    },
    wealthProfile: {
      style: 'Luxury Investor & Brand Builder',
      strengths: ['Leadership in ventures', 'Brand creation', 'Confidence in decisions', 'Generous investing'],
      challenges: ['Overspending on luxury', 'Ego-driven decisions', 'Ignoring details', 'Show-off investing'],
      bestInvestments: ['Luxury brands', 'Entertainment sector', 'Gold', 'Leadership positions', 'Creative ventures'],
      moneyMindset: 'Money is power, creativity, and the means to generous living',
      idealPortfolio: '50% growth stocks, 20% luxury assets, 20% creative ventures, 10% gold',
      riskTolerance: 'Moderate to High - Confident in quality investments'
    },
    relationships: {
      bestMatches: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
      challengingMatches: ['Taurus', 'Scorpio'],
      businessPartners: ['Aries', 'Sagittarius', 'Gemini']
    },
    house: 5,
    bodyPart: 'Heart, Spine',
    colors: ['Gold', 'Orange', 'Royal Purple'],
    gemstones: ['Ruby', 'Amber', 'Topaz'],
    luckyNumbers: [1, 5, 19, 23]
  },

  Virgo: {
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    modality: 'Mutable',
    ruler: 'Mercury',
    dateRange: {
      start: { month: 8, day: 23 },
      end: { month: 9, day: 22 }
    },
    personality: {
      keywords: ['Analyst', 'Healer', 'Perfectionist', 'Servant', 'Craftsman'],
      strengths: ['Analytical', 'Practical', 'Diligent', 'Organized', 'Helpful', 'Reliable'],
      challenges: ['Critical', 'Worrying', 'Perfectionist', 'Conservative', 'Overthinking'],
      coreValues: ['Perfection', 'Service', 'Health', 'Analysis', 'Efficiency'],
      motivation: 'To improve, perfect, and be of service',
      fears: ['Chaos', 'Criticism', 'Illness', 'Imperfection']
    },
    wealthProfile: {
      style: 'Analytical Value Investor & Risk Manager',
      strengths: ['Detailed analysis', 'Risk management', 'Budgeting', 'Finding undervalued assets'],
      challenges: ['Over-analysis', 'Missing opportunities', 'Too conservative', 'Perfectionism paralysis'],
      bestInvestments: ['Index funds', 'Healthcare sector', 'Quality bonds', 'Dividend aristocrats', 'ESG investments'],
      moneyMindset: 'Money requires careful analysis and prudent management',
      idealPortfolio: '45% diversified stocks, 30% bonds, 15% real estate, 10% cash',
      riskTolerance: 'Low to Moderate - Careful, calculated risks only'
    },
    relationships: {
      bestMatches: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
      challengingMatches: ['Gemini', 'Sagittarius'],
      businessPartners: ['Taurus', 'Capricorn', 'Scorpio']
    },
    house: 6,
    bodyPart: 'Digestive System',
    colors: ['Navy Blue', 'Grey', 'Forest Green'],
    gemstones: ['Sapphire', 'Peridot', 'Agate'],
    luckyNumbers: [3, 6, 15, 24]
  },

  Libra: {
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    modality: 'Cardinal',
    ruler: 'Venus',
    dateRange: {
      start: { month: 9, day: 23 },
      end: { month: 10, day: 22 }
    },
    personality: {
      keywords: ['Diplomat', 'Artist', 'Partner', 'Judge', 'Harmonizer'],
      strengths: ['Diplomatic', 'Fair', 'Social', 'Cooperative', 'Gracious', 'Idealistic'],
      challenges: ['Indecisive', 'People-pleasing', 'Avoids conflict', 'Dependent', 'Superficial'],
      coreValues: ['Balance', 'Harmony', 'Justice', 'Partnership', 'Beauty'],
      motivation: 'To create harmony, beauty, and balanced relationships',
      fears: ['Conflict', 'Ugliness', 'Injustice', 'Being alone']
    },
    wealthProfile: {
      style: 'Balanced Portfolio Manager & Partnership Investor',
      strengths: ['Portfolio balancing', 'Partnership deals', 'Aesthetic investments', 'Fair negotiations'],
      challenges: ['Indecision', 'Over-reliance on others', 'Avoiding tough choices', 'Style over substance'],
      bestInvestments: ['Balanced funds', 'Art/collectibles', 'Partnership ventures', 'Beauty industry', 'Socially responsible investing'],
      moneyMindset: 'Money should be balanced, beautiful, and ethically earned',
      idealPortfolio: 'Perfectly balanced 25% each: stocks, bonds, real estate, alternatives',
      riskTolerance: 'Moderate - Seeks balance between risk and reward'
    },
    relationships: {
      bestMatches: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
      challengingMatches: ['Cancer', 'Capricorn'],
      businessPartners: ['Gemini', 'Aquarius', 'Leo']
    },
    house: 7,
    bodyPart: 'Kidneys, Lower Back',
    colors: ['Light Blue', 'Pink', 'Lavender'],
    gemstones: ['Opal', 'Jade', 'Rose Quartz'],
    luckyNumbers: [6, 7, 15, 24]
  },

  Scorpio: {
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    modality: 'Fixed',
    ruler: 'Mars/Pluto',
    dateRange: {
      start: { month: 10, day: 23 },
      end: { month: 11, day: 21 }
    },
    personality: {
      keywords: ['Transformer', 'Detective', 'Mystic', 'Strategist', 'Phoenix'],
      strengths: ['Passionate', 'Strategic', 'Brave', 'Loyal', 'Resourceful', 'Intuitive'],
      challenges: ['Jealous', 'Secretive', 'Manipulative', 'Obsessive', 'Vindictive'],
      coreValues: ['Power', 'Transformation', 'Truth', 'Depth', 'Control'],
      motivation: 'To transform, uncover truth, and wield power wisely',
      fears: ['Betrayal', 'Vulnerability', 'Loss of control', 'Superficiality']
    },
    wealthProfile: {
      style: 'Strategic Power Investor & Transformation Specialist',
      strengths: ['Deep research', 'Strategic thinking', 'Crisis investing', 'Hidden value discovery'],
      challenges: ['Obsessive behavior', 'Secretive approach', 'All-or-nothing mentality', 'Manipulation'],
      bestInvestments: ['Turnaround situations', 'Private equity', 'Cryptocurrency', 'Research-driven picks', 'Crisis opportunities'],
      moneyMindset: 'Money is power and transformation tool',
      idealPortfolio: '40% concentrated bets, 30% private investments, 20% crypto, 10% cash',
      riskTolerance: 'High - All-in on deeply researched convictions'
    },
    relationships: {
      bestMatches: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
      challengingMatches: ['Leo', 'Aquarius'],
      businessPartners: ['Cancer', 'Pisces', 'Capricorn']
    },
    house: 8,
    bodyPart: 'Reproductive System',
    colors: ['Deep Red', 'Black', 'Maroon'],
    gemstones: ['Topaz', 'Malachite', 'Bloodstone'],
    luckyNumbers: [4, 8, 13, 18]
  },

  Sagittarius: {
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    modality: 'Mutable',
    ruler: 'Jupiter',
    dateRange: {
      start: { month: 11, day: 22 },
      end: { month: 12, day: 21 }
    },
    personality: {
      keywords: ['Explorer', 'Philosopher', 'Teacher', 'Adventurer', 'Optimist'],
      strengths: ['Optimistic', 'Freedom-loving', 'Philosophical', 'Adventurous', 'Honest', 'Intellectual'],
      challenges: ['Reckless', 'Tactless', 'Impatient', 'Over-promising', 'Inconsistent'],
      coreValues: ['Freedom', 'Truth', 'Adventure', 'Wisdom', 'Expansion'],
      motivation: 'To explore, expand horizons, and seek truth',
      fears: ['Confinement', 'Details', 'Commitment', 'Routine']
    },
    wealthProfile: {
      style: 'Global Growth Investor & Opportunity Explorer',
      strengths: ['Optimistic outlook', 'Global perspective', 'Risk-taking', 'Seeing big picture'],
      challenges: ['Over-optimism', 'Ignoring details', 'Reckless speculation', 'Lack of patience'],
      bestInvestments: ['International markets', 'Growth stocks', 'Travel/leisure sector', 'Education sector', 'Emerging markets'],
      moneyMindset: 'Money is freedom to explore and expand',
      idealPortfolio: '60% global equities, 20% emerging markets, 15% alternatives, 5% cash',
      riskTolerance: 'High - Optimistic about long-term growth'
    },
    relationships: {
      bestMatches: ['Aries', 'Leo', 'Libra', 'Aquarius'],
      challengingMatches: ['Virgo', 'Pisces'],
      businessPartners: ['Aries', 'Leo', 'Gemini']
    },
    house: 9,
    bodyPart: 'Hips, Thighs',
    colors: ['Purple', 'Turquoise', 'Violet'],
    gemstones: ['Turquoise', 'Amethyst', 'Tanzanite'],
    luckyNumbers: [3, 9, 12, 21]
  },

  Capricorn: {
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    ruler: 'Saturn',
    dateRange: {
      start: { month: 12, day: 22 },
      end: { month: 1, day: 19 }
    },
    personality: {
      keywords: ['CEO', 'Builder', 'Father', 'Authority', 'Mountain Goat'],
      strengths: ['Disciplined', 'Responsible', 'Ambitious', 'Patient', 'Practical', 'Strategic'],
      challenges: ['Pessimistic', 'Stubborn', 'Cynical', 'Fearful', 'Rigid'],
      coreValues: ['Success', 'Status', 'Structure', 'Legacy', 'Achievement'],
      motivation: 'To achieve, build lasting structures, and leave a legacy',
      fears: ['Failure', 'Public embarrassment', 'Poverty', 'Lack of control']
    },
    wealthProfile: {
      style: 'Long-term Empire Builder & Traditional Investor',
      strengths: ['Long-term planning', 'Discipline', 'Building wealth slowly', 'Strategic thinking'],
      challenges: ['Too conservative', 'Pessimistic outlook', 'Missing innovation', 'Work-life imbalance'],
      bestInvestments: ['Blue-chip stocks', 'Real estate', 'Traditional businesses', 'Government bonds', 'Index funds'],
      moneyMindset: 'Money is achievement, status, and legacy',
      idealPortfolio: '50% established equities, 25% real estate, 20% bonds, 5% cash',
      riskTolerance: 'Low to Moderate - Prefers proven, traditional investments'
    },
    relationships: {
      bestMatches: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
      challengingMatches: ['Aries', 'Libra'],
      businessPartners: ['Taurus', 'Virgo', 'Scorpio']
    },
    house: 10,
    bodyPart: 'Bones, Knees, Skin',
    colors: ['Brown', 'Black', 'Dark Green'],
    gemstones: ['Garnet', 'Black Onyx', 'Ruby'],
    luckyNumbers: [8, 10, 17, 26]
  },

  Aquarius: {
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    modality: 'Fixed',
    ruler: 'Saturn/Uranus',
    dateRange: {
      start: { month: 1, day: 20 },
      end: { month: 2, day: 18 }
    },
    personality: {
      keywords: ['Innovator', 'Humanitarian', 'Rebel', 'Visionary', 'Genius'],
      strengths: ['Progressive', 'Original', 'Independent', 'Humanitarian', 'Intellectual', 'Innovative'],
      challenges: ['Detached', 'Stubborn', 'Aloof', 'Unpredictable', 'Extremist'],
      coreValues: ['Freedom', 'Innovation', 'Humanity', 'Progress', 'Individuality'],
      motivation: 'To innovate, revolutionize, and improve humanity',
      fears: ['Conformity', 'Emotional intimacy', 'Tradition', 'Restriction']
    },
    wealthProfile: {
      style: 'Innovation Investor & Disruption Capitalist',
      strengths: ['Seeing future trends', 'Technology investing', 'Unconventional strategies', 'Network effects'],
      challenges: ['Too far ahead', 'Ignoring fundamentals', 'Detached from reality', 'Contrarian extremes'],
      bestInvestments: ['Technology stocks', 'Cryptocurrency', 'Green energy', 'Biotech', 'Disruptive innovations'],
      moneyMindset: 'Money should serve humanity and fund innovation',
      idealPortfolio: '40% tech/innovation, 30% crypto/alternatives, 20% ESG, 10% experimental',
      riskTolerance: 'High - Willing to bet on the future'
    },
    relationships: {
      bestMatches: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
      challengingMatches: ['Taurus', 'Scorpio'],
      businessPartners: ['Gemini', 'Libra', 'Sagittarius']
    },
    house: 11,
    bodyPart: 'Ankles, Circulatory System',
    colors: ['Electric Blue', 'Turquoise', 'Silver'],
    gemstones: ['Amethyst', 'Aquamarine', 'Garnet'],
    luckyNumbers: [4, 11, 22, 29]
  },

  Pisces: {
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    modality: 'Mutable',
    ruler: 'Jupiter/Neptune',
    dateRange: {
      start: { month: 2, day: 19 },
      end: { month: 3, day: 20 }
    },
    personality: {
      keywords: ['Mystic', 'Artist', 'Dreamer', 'Healer', 'Empath'],
      strengths: ['Compassionate', 'Intuitive', 'Creative', 'Gentle', 'Wise', 'Musical'],
      challenges: ['Escapist', 'Over-sensitive', 'Indecisive', 'Lazy', 'Victim mentality'],
      coreValues: ['Compassion', 'Spirituality', 'Creativity', 'Unity', 'Transcendence'],
      motivation: 'To transcend, create, heal, and unite',
      fears: ['Reality', 'Criticism', 'Material world', 'Boundaries']
    },
    wealthProfile: {
      style: 'Intuitive Investor & Creative Wealth Builder',
      strengths: ['Intuitive timing', 'Creative ventures', 'Seeing hidden patterns', 'Empathetic investing'],
      challenges: ['Lack of boundaries', 'Escapist tendencies', 'Poor money management', 'Too trusting'],
      bestInvestments: ['Creative industries', 'Water resources', 'Pharmaceuticals', 'Music/entertainment', 'Spiritual ventures'],
      moneyMindset: 'Money is energy that flows like water',
      idealPortfolio: '35% creative/intuitive picks, 30% stable income, 25% liquid assets, 10% charitable giving',
      riskTolerance: 'Variable - Depends on intuition and emotional state'
    },
    relationships: {
      bestMatches: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
      challengingMatches: ['Gemini', 'Sagittarius'],
      businessPartners: ['Cancer', 'Scorpio', 'Taurus']
    },
    house: 12,
    bodyPart: 'Feet, Immune System',
    colors: ['Sea Green', 'Lavender', 'Aquamarine'],
    gemstones: ['Aquamarine', 'Bloodstone', 'Jade'],
    luckyNumbers: [3, 7, 12, 16]
  }
};

// Planetary influences for more accurate calculations
export const PLANETARY_INFLUENCES = {
  Mercury: {
    meaning: 'Communication, intellect, trade',
    retrograde: 'Miscommunication, delays, review',
    wealth: 'Information advantage, trading skills, networking'
  },
  Venus: {
    meaning: 'Love, beauty, values, money',
    retrograde: 'Relationship reviews, value reassessment',
    wealth: 'Attraction of resources, aesthetic investments, partnerships'
  },
  Mars: {
    meaning: 'Action, aggression, energy',
    retrograde: 'Frustration, redirected energy',
    wealth: 'Initiative, competitive advantage, risk-taking'
  },
  Jupiter: {
    meaning: 'Expansion, luck, philosophy',
    retrograde: 'Internal growth, philosophical review',
    wealth: 'Abundance, opportunities, optimism, growth'
  },
  Saturn: {
    meaning: 'Discipline, restriction, karma',
    retrograde: 'Karmic review, restructuring',
    wealth: 'Long-term planning, discipline, structure, patience'
  },
  Uranus: {
    meaning: 'Innovation, rebellion, sudden change',
    retrograde: 'Internal revolution, unique insights',
    wealth: 'Disruption profits, technology, unconventional strategies'
  },
  Neptune: {
    meaning: 'Spirituality, illusion, creativity',
    retrograde: 'Spiritual awakening, clarity',
    wealth: 'Intuitive investments, creative ventures, avoid deception'
  },
  Pluto: {
    meaning: 'Transformation, power, regeneration',
    retrograde: 'Deep transformation, power dynamics',
    wealth: 'Wealth transformation, power plays, hidden resources'
  }
};

// House meanings for comprehensive analysis
export const HOUSE_MEANINGS = {
  1: { name: 'Self', themes: ['Identity', 'Appearance', 'First impressions', 'Initiative'] },
  2: { name: 'Resources', themes: ['Money', 'Values', 'Possessions', 'Self-worth'] },
  3: { name: 'Communication', themes: ['Learning', 'Siblings', 'Short trips', 'Mental activity'] },
  4: { name: 'Home', themes: ['Family', 'Roots', 'Security', 'Real estate'] },
  5: { name: 'Creativity', themes: ['Romance', 'Children', 'Speculation', 'Self-expression'] },
  6: { name: 'Service', themes: ['Work', 'Health', 'Routine', 'Analysis'] },
  7: { name: 'Partnership', themes: ['Marriage', 'Business partners', 'Open enemies', 'Contracts'] },
  8: { name: 'Transformation', themes: ['Shared resources', 'Death/rebirth', 'Occult', 'Investments'] },
  9: { name: 'Philosophy', themes: ['Higher learning', 'Travel', 'Philosophy', 'Publishing'] },
  10: { name: 'Career', themes: ['Public image', 'Authority', 'Achievement', 'Status'] },
  11: { name: 'Community', themes: ['Friends', 'Groups', 'Hopes', 'Social causes'] },
  12: { name: 'Spirituality', themes: ['Hidden things', 'Karma', 'Spirituality', 'Self-undoing'] }
};

// Aspect interpretations for relationship analysis
export const ASPECTS = {
  conjunction: { angle: 0, orb: 8, nature: 'Neutral', meaning: 'Blending of energies' },
  sextile: { angle: 60, orb: 6, nature: 'Harmonious', meaning: 'Opportunity and ease' },
  square: { angle: 90, orb: 8, nature: 'Challenging', meaning: 'Tension requiring action' },
  trine: { angle: 120, orb: 8, nature: 'Harmonious', meaning: 'Natural flow and talent' },
  opposition: { angle: 180, orb: 8, nature: 'Challenging', meaning: 'Awareness through polarity' }
};

// Generate wealth archetype based on sign combination
export function generateWealthArchetype(sun: string, moon: string, rising: string): {
  archetype: string;
  description: string;
  strengths: string[];
  opportunities: string[];
  strategy: string;
} {
  const sunData = ZODIAC_DATABASE[sun];
  const moonData = ZODIAC_DATABASE[moon];
  const risingData = ZODIAC_DATABASE[rising];

  if (!sunData || !moonData || !risingData) {
    return {
      archetype: 'Emerging Wealth Builder',
      description: 'Your unique combination creates unlimited potential',
      strengths: ['Adaptability', 'Unique perspective', 'Hidden talents'],
      opportunities: ['Self-discovery', 'Unconventional paths', 'Personal growth'],
      strategy: 'Explore various investment styles to find your unique approach'
    };
  }

  // Combine elements for archetype
  const elements = [sunData.element, moonData.element, risingData.element];
  const modalities = [sunData.modality, moonData.modality, risingData.modality];
  
  // Determine dominant patterns
  const fireCount = elements.filter(e => e === 'Fire').length;
  const earthCount = elements.filter(e => e === 'Earth').length;
  const airCount = elements.filter(e => e === 'Air').length;
  const waterCount = elements.filter(e => e === 'Water').length;
  
  const cardinalCount = modalities.filter(m => m === 'Cardinal').length;
  const fixedCount = modalities.filter(m => m === 'Fixed').length;
  // const mutableCount = modalities.filter(m => m === 'Mutable').length; // Reserved for future use

  // Generate archetype based on elemental and modal dominance
  let archetype = '';
  let description = '';
  let strengths: string[] = [];
  let opportunities: string[] = [];
  let strategy = '';

  // Determine primary archetype
  if (fireCount >= 2) {
    archetype = 'Pioneering Wealth Warrior';
    description = 'You forge new paths to prosperity with courage and innovation';
    strengths = ['Bold decision-making', 'Entrepreneurial spirit', 'Quick action', 'Leadership'];
    opportunities = ['Startups', 'Growth investments', 'Leadership roles', 'Innovation sectors'];
    strategy = 'Channel your fire energy into calculated risks with proper risk management';
  } else if (earthCount >= 2) {
    archetype = 'Sovereign Wealth Builder';
    description = 'You build lasting wealth through patience, strategy, and solid foundations';
    strengths = ['Long-term vision', 'Value recognition', 'Practical approach', 'Asset building'];
    opportunities = ['Real estate', 'Value investing', 'Traditional businesses', 'Commodities'];
    strategy = 'Focus on tangible assets and compound growth over time';
  } else if (airCount >= 2) {
    archetype = 'Quantum Wealth Strategist';
    description = 'You leverage information, connections, and innovation for wealth creation';
    strengths = ['Information processing', 'Networking', 'Adaptability', 'Strategic thinking'];
    opportunities = ['Technology', 'Communications', 'Intellectual property', 'Trading'];
    strategy = 'Diversify intelligently and stay ahead of trends through continuous learning';
  } else if (waterCount >= 2) {
    archetype = 'Intuitive Wealth Alchemist';
    description = 'You transform resources through intuition, timing, and emotional intelligence';
    strengths = ['Market intuition', 'Timing', 'Hidden value discovery', 'Transformation'];
    opportunities = ['Turnarounds', 'Creative ventures', 'Intuitive trades', 'Healing industries'];
    strategy = 'Trust your intuition while maintaining emotional boundaries in financial decisions';
  } else {
    // Balanced elements - look at modalities
    if (cardinalCount >= 2) {
      archetype = 'Wealth Initiative Leader';
      description = 'You initiate wealth-building ventures with leadership and vision';
    } else if (fixedCount >= 2) {
      archetype = 'Wealth Consolidation Master';
      description = 'You excel at building and maintaining stable wealth structures';
    } else {
      archetype = 'Adaptive Wealth Navigator';
      description = 'You flow with market changes and adapt strategies for optimal results';
    }
    
    strengths = [
      ...sunData.wealthProfile.strengths.slice(0, 2),
      ...moonData.personality.strengths.slice(0, 2)
    ];
    opportunities = [
      ...sunData.wealthProfile.bestInvestments.slice(0, 2),
      ...risingData.wealthProfile.bestInvestments.slice(0, 2)
    ];
    strategy = 'Blend multiple approaches for a uniquely balanced wealth strategy';
  }

  return {
    archetype,
    description,
    strengths,
    opportunities,
    strategy
  };
}

// Calculate compatibility score between signs
export function calculateCompatibility(sign1: string, sign2: string): number {
  const data1 = ZODIAC_DATABASE[sign1];
  const data2 = ZODIAC_DATABASE[sign2];
  
  if (!data1 || !data2) return 50;
  
  let score = 50; // Base score
  
  // Same element = high compatibility
  if (data1.element === data2.element) score += 30;
  
  // Compatible elements
  if ((data1.element === 'Fire' && data2.element === 'Air') ||
      (data1.element === 'Air' && data2.element === 'Fire')) score += 20;
  if ((data1.element === 'Earth' && data2.element === 'Water') ||
      (data1.element === 'Water' && data2.element === 'Earth')) score += 20;
  
  // Challenging elements
  if ((data1.element === 'Fire' && data2.element === 'Water') ||
      (data1.element === 'Water' && data2.element === 'Fire')) score -= 10;
  if ((data1.element === 'Earth' && data2.element === 'Air') ||
      (data1.element === 'Air' && data2.element === 'Earth')) score -= 10;
  
  // Check if they're in each other's best matches
  if (data1.relationships.bestMatches.includes(sign2)) score += 15;
  if (data2.relationships.bestMatches.includes(sign1)) score += 15;
  
  // Check if they're in challenging matches
  if (data1.relationships.challengingMatches.includes(sign2)) score -= 15;
  if (data2.relationships.challengingMatches.includes(sign1)) score -= 15;
  
  // Compatible modalities
  if (data1.modality === data2.modality) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// Get detailed cosmic weather based on current transits
export function getCosmicWeather(userSun: string, currentSun: string, currentMoon: string): {
  energy: string;
  advice: string;
  opportunities: string[];
  cautions: string[];
  luckyTiming: string;
} {
  const compatibility = calculateCompatibility(userSun, currentSun);
  const moonCompat = calculateCompatibility(userSun, currentMoon);
  
  let energy = 'Neutral';
  let advice = '';
  let opportunities: string[] = [];
  let cautions: string[] = [];
  let luckyTiming = '';
  
  if (compatibility >= 70) {
    energy = 'Highly Favorable';
    advice = 'Cosmic energies strongly support your initiatives. Take bold action.';
    opportunities = ['New ventures', 'Important decisions', 'Risk-taking', 'Expansion'];
    cautions = ['Overconfidence', 'Ignoring details'];
    luckyTiming = 'Morning and early afternoon';
  } else if (compatibility >= 50) {
    energy = 'Favorable';
    advice = 'Good energy for steady progress. Focus on building and consolidating.';
    opportunities = ['Networking', 'Planning', 'Research', 'Steady investments'];
    cautions = ['Impatience', 'Forcing outcomes'];
    luckyTiming = 'Midday and evening';
  } else {
    energy = 'Challenging';
    advice = 'Use this time for reflection and careful planning. Avoid major risks.';
    opportunities = ['Review', 'Correction', 'Learning', 'Patience'];
    cautions = ['Hasty decisions', 'Emotional reactions', 'Big investments'];
    luckyTiming = 'Late evening and early morning';
  }
  
  // Moon influence
  if (moonCompat >= 70) {
    opportunities.push('Intuitive insights');
    advice += ' Your emotional intelligence is heightened.';
  } else if (moonCompat <= 30) {
    cautions.push('Emotional volatility');
    advice += ' Stay grounded and avoid emotional decisions.';
  }
  
  return { energy, advice, opportunities, cautions, luckyTiming };
}
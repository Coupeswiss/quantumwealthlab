import { NextResponse } from "next/server";
import OpenAI from "openai";
import { generateComprehensiveInsights } from "@/lib/astrology-insights";
import { ZODIAC_DATABASE, generateWealthArchetype } from "@/lib/astrology-database";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { profile, portfolio, marketData } = await req.json();
    
    // Generate comprehensive astrological insights
    const astroInsights = profile?.sunSign ? generateComprehensiveInsights(profile, marketData) : null;
    
    // Get detailed zodiac information from database
    const sunData = profile?.sunSign ? ZODIAC_DATABASE[profile.sunSign] : null;
    const moonData = profile?.moonSign ? ZODIAC_DATABASE[profile.moonSign] : null;
    const risingData = profile?.risingSign ? ZODIAC_DATABASE[profile.risingSign] : null;
    
    // Generate wealth archetype if not present
    const wealthArchetype = profile?.quantumProfile?.archetype || 
      (profile?.sunSign && profile?.moonSign && profile?.risingSign ? 
        generateWealthArchetype(profile.sunSign, profile.moonSign, profile.risingSign) : null);
    
    // Create comprehensive context from user profile with accurate astrology
    const userContext = {
      name: profile?.name || "Quantum Explorer",
      intention: profile?.intention || "wealth consciousness expansion",
      sunSign: profile?.sunSign || "Unknown",
      moonSign: profile?.moonSign || "Unknown",
      risingSign: profile?.risingSign || "Unknown",
      archetype: wealthArchetype?.archetype || profile?.quantumProfile?.archetype || "The Seeker",
      strengths: wealthArchetype?.strengths || profile?.quantumProfile?.strengths || [],
      wealthStyle: sunData?.wealthProfile?.style || profile?.elemental?.qualities?.wealthStyle || "balanced approach",
      riskTolerance: profile?.riskTolerance || "moderate",
      naturalRisk: sunData?.wealthProfile?.riskTolerance || "moderate",
      currentTransits: profile?.currentTransits || {},
      recentInsights: profile?.insights?.slice(-3) || [],
      portfolioValue: portfolio?.totalValue || 0,
      topHoldings: portfolio?.holdings?.slice(0, 3) || [],
      marketTrend: marketData?.trend || "neutral",
      // New accurate astrological data
      sunElement: sunData?.element || "Unknown",
      sunModality: sunData?.modality || "Unknown",
      sunMotivation: sunData?.personality?.motivation || "growth",
      moonElement: moonData?.element || "Unknown",
      risingElement: risingData?.element || "Unknown",
      luckyNumbers: sunData?.luckyNumbers || [],
      powerColors: sunData?.colors || [],
      bestInvestments: sunData?.wealthProfile?.bestInvestments || [],
      wealthChallenges: sunData?.wealthProfile?.challenges || [],
      coreValues: sunData?.personality?.coreValues || [],
      astroInsights: astroInsights
    };
    
    // Fallback for no API key with accurate personalized content
    if (!process.env.OPENAI_API_KEY) {
      const dailyInsight = astroInsights?.daily?.[0];
      const wealthInsight = astroInsights?.wealth?.[0];
      
      return NextResponse.json({
        daily: dailyInsight?.message || `${userContext.name}, as ${userContext.archetype}, your ${userContext.sunSign} ${userContext.sunElement} energy is powerful today. ${sunData?.personality?.motivation || 'Channel your inner strength into manifestation.'}`,
        market: wealthInsight?.message || `Market energies align with your ${userContext.wealthStyle}. ${sunData?.wealthProfile?.moneyMindset || 'Your approach resonates with current cycles.'}`,
        personal: `Your intention of "${userContext.intention}" is supported by your ${userContext.moonSign} ${userContext.moonElement} moon. ${moonData?.personality?.motivation || 'Trust your intuition for timing.'}`,
        astroWeather: astroInsights?.transits?.[0]?.message || `${userContext.sunSign} sun (${userContext.sunElement} ${userContext.sunModality}) merges with ${userContext.currentTransits?.sun || 'cosmic'} energies. ${sunData?.wealthProfile?.riskTolerance || 'Favorable for your risk profile.'}`,
        quantumField: astroInsights?.weekly?.overview || "The field is receptive to your unique frequency. Abundance codes are activating through your elemental balance.",
        luckyDays: astroInsights?.weekly?.luckyDays || userContext.luckyNumbers?.map(n => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][n % 5]) || ['Wednesday'],
        focusArea: astroInsights?.weekly?.focusAreas?.[0] || userContext.coreValues?.[0] || 'Wealth consciousness',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate deeply personalized insights with OpenAI using accurate astrology
    const systemPrompt = `You are the Quantum Wealth Lab AI, with access to precise astrological databases and cosmic wisdom.
    
    ACCURATE User Astrological Profile:
    - Name: ${userContext.name}
    - Sun Sign: ${userContext.sunSign} (${userContext.sunElement} element, ${userContext.sunModality} modality)
    - Moon Sign: ${userContext.moonSign} (${userContext.moonElement} element)
    - Rising Sign: ${userContext.risingSign} (${userContext.risingElement} element)
    - Wealth Archetype: ${userContext.archetype}
    - Natural Wealth Style: ${userContext.wealthStyle}
    - Core Motivation: ${userContext.sunMotivation}
    - Risk Profile: ${userContext.riskTolerance} (Natural: ${userContext.naturalRisk})
    - Core Values: ${userContext.coreValues.join(", ")}
    - Wealth Strengths: ${userContext.strengths.join(", ")}
    - Wealth Challenges: ${userContext.wealthChallenges.join(", ")}
    - Best Investments: ${userContext.bestInvestments.join(", ")}
    - Lucky Numbers: ${userContext.luckyNumbers.join(", ")}
    - Power Colors: ${userContext.powerColors.join(", ")}
    - Core Intention: ${userContext.intention}
    
    Current Astrological Insights:
    Daily: ${JSON.stringify(userContext.astroInsights?.daily?.[0], null, 2)}
    Wealth: ${JSON.stringify(userContext.astroInsights?.wealth?.[0], null, 2)}
    Weekly Lucky Days: ${userContext.astroInsights?.weekly?.luckyDays?.join(", ")}
    
    Current Context:
    - Portfolio Value: $${userContext.portfolioValue}
    - Market Trend: ${userContext.marketTrend}
    - Moon Phase: ${userContext.currentTransits?.moonPhase || 'Unknown'}
    - Mercury Retrograde: ${userContext.currentTransits?.mercuryRetrograde ? 'Yes' : 'No'}
    
    Style: Use the ACCURATE astrological data provided above. Reference specific sign qualities, elements, and modalities.
    Connect their ${userContext.sunElement} sun, ${userContext.moonElement} moon, and ${userContext.risingElement} rising energies.
    Address their specific wealth challenges and leverage their strengths.
    Make precise connections between their astrological profile and market opportunities.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate personalized insights using the ACCURATE astrological data provided:
          1. Daily affirmation (must reference their ${userContext.sunSign} ${userContext.sunElement} sun, ${userContext.moonSign} ${userContext.moonElement} moon, and ${userContext.archetype} archetype)
          2. Market observation (connect their ${userContext.wealthStyle} style to current market, suggest specific investments from: ${userContext.bestInvestments.join(", ")})
          3. Personal guidance (address their intention: "${userContext.intention}" and wealth challenges: ${userContext.wealthChallenges.join(", ")})
          4. Astro weather report (explain how ${userContext.currentTransits?.sun || 'current'} sun transit affects their ${userContext.sunSign} ${userContext.sunElement} nature)
          5. Quantum field message (activation codes for ${userContext.sunMotivation})
          6. Lucky timing (reference their lucky days: ${userContext.astroInsights?.weekly?.luckyDays?.join(", ")} and numbers: ${userContext.luckyNumbers.join(", ")})
          7. Action step (specific to their ${userContext.sunSign} sign and ${userContext.wealthStyle})
          
          Return ONLY valid JSON without markdown formatting. Keys: daily, market, personal, astroWeather, quantumField, luckyTiming, actionStep`
        }
      ],
      temperature: 0.85,
      max_tokens: 600,
    });
    
    // Clean response to handle markdown code blocks
    let content = completion.choices[0].message.content || "{}";
    if (content.includes("```json")) {
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    } else if (content.includes("```")) {
      content = content.replace(/```\n?/g, "").trim();
    }
    
    const insights = JSON.parse(content);
    
    // Store this insight in the user's knowledge base
    if (insights.quantumField) {
      // In production, this would be saved to database
      console.log(`Storing quantum insight for ${userContext.name}:`, insights.quantumField);
    }
    
    return NextResponse.json({
      ...insights,
      userArchetype: userContext.archetype,
      cosmicAlignment: calculateCosmicAlignment(userContext),
      elementalBalance: {
        fire: [userContext.sunElement, userContext.moonElement, userContext.risingElement].filter(e => e === 'Fire').length,
        earth: [userContext.sunElement, userContext.moonElement, userContext.risingElement].filter(e => e === 'Earth').length,
        air: [userContext.sunElement, userContext.moonElement, userContext.risingElement].filter(e => e === 'Air').length,
        water: [userContext.sunElement, userContext.moonElement, userContext.risingElement].filter(e => e === 'Water').length
      },
      astrologicalAccuracy: sunData ? 100 : 0,
      weeklyForecast: userContext.astroInsights?.weekly,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("AI insights error:", error);
    
    // Enhanced fallback with user data
    const profile = (await req.json().catch(() => ({}))).profile || {};
    
    const fallbackSunData = profile?.sunSign ? ZODIAC_DATABASE[profile.sunSign] : null;
    const fallbackInsights = profile?.sunSign ? generateComprehensiveInsights(profile, marketData) : null;
    
    return NextResponse.json({
      daily: fallbackInsights?.daily?.[0]?.message || `${profile.name || 'Seeker'}, your ${profile.sunSign || 'cosmic'} ${fallbackSunData?.element || ''} energy attracts abundance. ${fallbackSunData?.personality?.motivation || 'You are exactly where you need to be.'}`,
      market: fallbackInsights?.wealth?.[0]?.message || `Market energies align with your ${fallbackSunData?.wealthProfile?.style || 'unique approach'}. ${fallbackSunData?.wealthProfile?.moneyMindset || 'Stay centered in your power.'}`,
      personal: `Trust your ${profile.moonSign || 'intuitive'} wisdom. ${fallbackSunData?.personality?.coreValues?.[0] || 'Your wealth codes'} are activating in divine timing.`,
      astroWeather: fallbackInsights?.transits?.[0]?.message || "Cosmic currents support patient accumulation and conscious investment.",
      quantumField: fallbackInsights?.weekly?.overview || "The unified field responds to your elevated frequency. Wealth flows to consciousness.",
      luckyDays: fallbackInsights?.weekly?.luckyDays || [],
      timestamp: new Date().toISOString()
    });
  }
}

function calculateCosmicAlignment(context: any): number {
  // Calculate a 0-100 cosmic alignment score based on accurate astrological factors
  let score = 50; // Base score
  
  // Add points for completed profile with accurate data
  if (context.sunSign !== "Unknown" && ZODIAC_DATABASE[context.sunSign]) score += 15;
  if (context.moonSign !== "Unknown" && ZODIAC_DATABASE[context.moonSign]) score += 15;
  if (context.risingSign !== "Unknown" && ZODIAC_DATABASE[context.risingSign]) score += 10;
  if (context.archetype !== "The Seeker") score += 10;
  
  // Element balance bonus
  const elements = [context.sunElement, context.moonElement, context.risingElement];
  const uniqueElements = new Set(elements.filter(e => e !== "Unknown")).size;
  if (uniqueElements === 1) score += 5; // All same element - focused energy
  if (uniqueElements === 3) score += 8; // Balanced elements
  
  // Adjust based on market alignment with natural risk tolerance
  if (context.marketTrend === "bullish" && context.naturalRisk?.includes("High")) score += 15;
  if (context.marketTrend === "bearish" && context.naturalRisk?.includes("Low")) score += 10;
  if (context.marketTrend === "neutral" && context.naturalRisk?.includes("Moderate")) score += 12;
  
  // Transit bonus
  if (context.currentTransits?.sunReturn) score += 20; // Solar return is powerful
  if (context.currentTransits?.moonPhase === "New Moon") score += 10;
  if (context.currentTransits?.moonPhase === "Full Moon") score += 8;
  if (context.currentTransits?.mercuryRetrograde) score -= 5; // Caution period
  
  // Lucky day bonus (if today is a lucky day)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  if (context.astroInsights?.weekly?.luckyDays?.includes(today)) score += 10;
  
  return Math.max(0, Math.min(100, score));
}
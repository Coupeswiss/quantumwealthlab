import { NextResponse } from "next/server";
import OpenAI from "openai";
import { generateComprehensiveInsights } from "@/lib/astrology-insights";
import { ZODIAC_DATABASE, generateWealthArchetype } from "@/lib/astrology-database";
import { getBaseUrl } from "@/lib/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { profile, portfolio, marketData, astroOnly, strict } = await req.json();

    // Resolve freshest market context (fallback to server fetch if not provided)
    let btcPrice = marketData?.BTC?.price || marketData?.btc || marketData?.prices?.BTC?.price;
    let ethPrice = marketData?.ETH?.price || marketData?.eth || marketData?.prices?.ETH?.price;
    let btcChange = marketData?.BTC?.change24h || marketData?.btcChange || marketData?.prices?.BTC?.change24h;
    let ethChange = marketData?.ETH?.change24h || marketData?.ethChange || marketData?.prices?.ETH?.change24h;

    if (btcPrice == null || ethPrice == null) {
      try {
        const pricesRes = await fetch(`${getBaseUrl()}/api/crypto/prices`, { next: { revalidate: 15 } });
        if (pricesRes.ok) {
          const fresh = await pricesRes.json();
          btcPrice = fresh?.BTC?.price ?? btcPrice;
          ethPrice = fresh?.ETH?.price ?? ethPrice;
          btcChange = fresh?.BTC?.change24h ?? btcChange;
          ethChange = fresh?.ETH?.change24h ?? ethChange;
        }
      } catch {
        // ignore – will use whatever we have
      }
    }
    const computedTrend = typeof btcChange === "number" ? (btcChange > 0 ? "bullish" : btcChange < 0 ? "bearish" : "neutral") : (marketData?.trend || "neutral");
    
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
    const cleanIntention = (profile?.intention || "").toString().replace(/["“”]+/g, '').trim();
    const intentionSummary = cleanIntention.length > 120
      ? (cleanIntention.split(/\.\s+/)[0] || cleanIntention).slice(0, 120) + '…'
      : (cleanIntention || 'build sustainable wealth');

    // Utility: sanitize any AI/string output to avoid leaking undefined/null and extra spaces
    const sanitizeText = (text: unknown): string => {
      if (text == null) return '';
      const asString = typeof text === 'string' ? text : JSON.stringify(text);
      return asString
        .replace(/\bundefined\b/gi, '')
        .replace(/\bnull\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([.,!?;:])/g, '$1')
        .trim();
    };
    const userContext = {
      name: profile?.name || "Quantum Explorer",
      intention: intentionSummary,
      biggestChallenge: profile?.biggestChallenge || "Timing and confidence",
      idealOutcome: profile?.idealOutcome || "Financial independence",
      experience: profile?.experience || "intermediate",
      portfolioSize: profile?.portfolioSize || "Building",
      timeHorizon: profile?.timeHorizon || "medium-term",
      insights: profile?.insights || [],
      journalEntries: profile?.journalEntries || [],
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
      marketTrend: computedTrend,
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
      elemental: profile?.elemental || {},
      quantumProfile: profile?.quantumProfile || {},
      astroInsights: astroInsights
    };
    
    // Astrology-only mode or no API key → generate insights without external market data
    if ((astroOnly && !strict) || !process.env.OPENAI_API_KEY) {
      const dailyInsight = astroInsights?.daily?.[0];
      const wealthInsight = astroInsights?.wealth?.[0];

      // Generate Personal Guidance via the Wisdom agent to ensure natural, AI-generated guidance
      let personalGuidance = '';
      try {
        const wisdomRes = await fetch(`${getBaseUrl()}/api/ai/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: { ...profile, intention: intentionSummary },
            portfolio: Array.isArray(portfolio) ? portfolio : [],
            marketData: { trend: userContext.marketTrend },
            agentType: 'wisdom',
            question: `Using their intention (${intentionSummary}), generate TWO short sentences of personal wealth guidance. Be specific and actionable (1 concrete step, e.g., set an alert at $X or reduce position by Y%). Avoid generic phrasing. Reference current BTC/ETH context when relevant. Do NOT quote the user's words; paraphrase naturally. Subtle nod to ${userContext.sunSign} sun / ${userContext.moonSign} moon is okay but keep market-first.`
          })
        });
        if (wisdomRes.ok) {
          const wisdom = await wisdomRes.json();
          personalGuidance = wisdom?.insights?.wisdom?.message || wisdom?.insights?.wisdom || wisdom?.message || '';
          personalGuidance = sanitizeText(personalGuidance);
        }
      } catch {}

      // Fallback personal guidance if agent unavailable
      if (!personalGuidance) {
        const safeSun = userContext.sunSign || 'your';
        const safeMoon = userContext.moonSign || 'your';
        const safeIntention = intentionSummary || 'your wealth goal';
        personalGuidance = sanitizeText(
          `Your path centers on ${safeIntention}. Lean into your ${safeSun} strengths and let your ${safeMoon} intuition guide the timing. Choose one simple, consistent action this week to move closer to your goal.`
        );
      }

      const safeName = userContext.name || 'Explorer';
      const safeArchetype = userContext.archetype || 'Wealth Builder';
      const safeSun = userContext.sunSign || 'your';
      const safeSunElement = userContext.sunElement || '';
      const dailyText = dailyInsight?.message || `${safeName}, as ${safeArchetype}, your ${safeSun} ${safeSunElement} energy is supportive today. ${sunData?.personality?.motivation || 'Channel your strengths into steady progress.'}`;
      const marketText = wealthInsight?.message || `Your natural ${userContext.wealthStyle || 'balanced'} style is supported by current conditions. Stay aligned with process and risk discipline.`;

      return NextResponse.json({
        daily: sanitizeText(dailyText),
        market: sanitizeText(marketText),
        personal: sanitizeText(personalGuidance),
        astroWeather: astroInsights?.transits?.[0]?.message || `${userContext.sunSign} sun (${userContext.sunElement} ${userContext.sunModality}) merges with ${userContext.currentTransits?.sun || 'cosmic'} energies. ${sunData?.wealthProfile?.riskTolerance || 'Favorable for your risk profile.'}`,
        quantumField: astroInsights?.weekly?.overview || 'The field is receptive to your unique frequency. Abundance codes are activating through your elemental balance.',
        luckyDays: astroInsights?.weekly?.luckyDays || userContext.luckyNumbers?.map(n => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][n % 5]) || ['Wednesday'],
        focusArea: astroInsights?.weekly?.focusAreas?.[0] || userContext.coreValues?.[0] || 'Wealth consciousness',
        timestamp: new Date().toISOString()
      });
    }
    
    // Use AI agents to generate different types of insights
    const agentsBaseUrl = getBaseUrl();
    
    // Generate daily energy insight using quantum agent
    let dailyInsight = "";
    let marketInsight = "";
    let personalInsight = "";
    
    try {
      // Daily Energy - Quantum/Astro Agent
      const dailyResponse = await fetch(`${agentsBaseUrl}/api/ai/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userContext,
          portfolio,
          marketData,
          agentType: 'quantum',
          question: `Generate a daily energy reading for ${userContext.name} based on their ${userContext.sunSign} sun, ${userContext.moonSign} moon, and ${userContext.risingSign} rising. Focus on their intention: "${userContext.intention}". Make it personal and actionable.`
        })
      });
      
      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        dailyInsight = dailyData.insights?.quantum || dailyData.message || "";
      }
      
      // Market Pulse - Technical Agent  
      const marketResponse = await fetch(`${agentsBaseUrl}/api/ai/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userContext,
          portfolio,
          marketData,
          agentType: 'technical',
          question: `Analyze current market conditions for ${userContext.name}'s portfolio. BTC at $${(btcPrice ?? 'N/A')}, ETH at $${(ethPrice ?? 'N/A')}. Trend: ${computedTrend}.
          STRICT: You MUST anchor ALL numeric levels to these values or simple derivations (e.g., +/- 3%, 5%, 10%). Do NOT invent historic levels like $25,000 or $1,600 unless they are within 15% of the provided price. Provide 2-3 sentences with exact, current numbers.`
        })
      });
      
      if (marketResponse.ok) {
        const marketResponseData = await marketResponse.json();
        marketInsight = marketResponseData.insights?.technical || marketResponseData.message || "";
      }
      
      // Personal Guidance - Wisdom Agent (strict, concise, anchored)
      const personalResponse = await fetch(`${agentsBaseUrl}/api/ai/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userContext,
          portfolio,
          marketData,
          agentType: 'wisdom',
          question: `Provide TWO short sentences of personal guidance for ${userContext.name} to overcome "${userContext.biggestChallenge}" and achieve "${userContext.idealOutcome}". Be SPECIFIC and ACTIONABLE with one concrete step, and ANCHOR any numeric level within 10% of BTC ($${btcPrice}) or ETH ($${ethPrice}) or the user's holdings. BAN phrases: generic market platitudes, 'historically found', 'capitulation'. Keep it under 45 words total.`
        })
      });
      
      if (personalResponse.ok) {
        const personalData = await personalResponse.json();
        personalInsight = personalData.insights?.wisdom || personalData.message || "";
      }
      // Deterministic price-anchored fallback if AI response is empty or too short
      if (!personalInsight || personalInsight.length < 16) {
        const symbol = (Array.isArray(portfolio) && portfolio[0]?.symbol ? String(portfolio[0].symbol).toUpperCase() : 'BTC');
        const refPrice = marketData?.prices?.[symbol]?.price || (symbol === 'ETH' ? ethPrice : btcPrice);
        if (typeof refPrice === 'number' && refPrice > 0) {
          const support = Math.floor(refPrice * 0.95);
          const resistance = Math.ceil(refPrice * 1.05);
          personalInsight = `Focus entries near $${support.toLocaleString()} with tight risk below support; size per your ${userContext.riskTolerance || 'moderate'} profile. Set an alert at $${resistance.toLocaleString()} to reassess momentum.`;
        } else {
          personalInsight = `Keep positions sized to your ${userContext.riskTolerance || 'moderate'} risk profile and use alerts at key levels once live data loads.`;
        }
      }
      // Light web research to ground the analysis (best effort)
      try {
        const researchRes = await fetch(`${getBaseUrl()}/api/ai/research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: `In one sentence, summarize the latest BTC/ETH headlines and any widely cited key levels (today).`,
            profile,
            portfolio,
            context: []
          })
        });
        if (researchRes.ok) {
          const research = await researchRes.json();
          if (research?.answer) {
            marketInsight = `${marketInsight} ${research.answer}`.trim();
          }
        }
      } catch {}
    } catch (agentError) {
      console.error('Error calling agents:', agentError);
      // Continue with OpenAI fallback
    }
    
    // If agent calls succeeded and we have insights, return them
    if (dailyInsight || marketInsight || personalInsight) {
      return NextResponse.json({
        daily: sanitizeText(dailyInsight || astroInsights?.daily?.[0]?.message || `${userContext.name || 'Explorer'}, as ${userContext.archetype || 'Wealth Builder'}, embrace your ${userContext.sunSign || 'core'} energy today.`),
        market: sanitizeText(marketInsight || astroInsights?.wealth?.[0]?.message || `Market conditions align with your ${userContext.wealthStyle || 'current'} approach.`),
        personal: sanitizeText(personalInsight || `Trust your ${userContext.moonSign || 'intuitive'} guidance as you work toward ${userContext.idealOutcome || 'your goal'}.`),
        astroWeather: astroInsights?.transits?.[0]?.message || `${userContext.sunSign} energies are active in the current market cycle.`,
        quantumField: astroInsights?.weekly?.overview || "Your unique frequency resonates with abundance opportunities.",
        luckyDays: astroInsights?.weekly?.luckyDays || userContext.luckyNumbers?.map(n => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][n % 5]) || ['Wednesday'],
        focusArea: astroInsights?.weekly?.focusAreas?.[0] || userContext.coreValues?.[0] || 'Wealth consciousness',
        timestamp: new Date().toISOString()
      });
    }
    
    // Otherwise continue with OpenAI direct generation
    const systemPrompt = `You are the Quantum Wealth Lab AI, a sophisticated market analyst who combines deep market intelligence with personalized cosmic timing.
    
    USER PROFILE & PERSONAL INSIGHTS:
    - Name: ${userContext.name}
    - Primary Intention: ${userContext.intention || 'Build sustainable wealth'}
    - Biggest Challenge: "${userContext.biggestChallenge || profile?.biggestChallenge || 'Timing and confidence'}"
    - Ideal Outcome: "${userContext.idealOutcome || profile?.idealOutcome || 'Financial independence'}"
    - Knowledge Base: ${userContext.insights?.length || profile?.insights?.length || 0} stored insights
    - Journal Reflections: ${userContext.journalEntries?.length || profile?.journalEntries?.length || 0} entries
    
    ASTROLOGICAL PROFILE:
    - Sun Sign: ${userContext.sunSign} (${userContext.sunElement} element, ${userContext.sunModality} modality)
    - Moon Sign: ${userContext.moonSign} (${userContext.moonElement} element)
    - Rising Sign: ${userContext.risingSign} (${userContext.risingElement} element)
    - Wealth Archetype: ${userContext.archetype}
    - Natural Investment Style: ${userContext.wealthStyle}
    - Core Motivation: ${userContext.sunMotivation}
    
    INVESTMENT PROFILE:
    - Portfolio Size: ${userContext.portfolioSize || profile?.portfolioSize || 'Building'}
    - Risk Tolerance: ${userContext.riskTolerance} (Natural: ${userContext.naturalRisk})
    - Experience Level: ${userContext.experience || profile?.experience || 'Intermediate'}
    - Time Horizon: ${userContext.timeHorizon || profile?.timeHorizon || 'Medium-term'}
    
    MARKET CONTEXT:
    - BTC: $${marketData?.BTC?.price?.toLocaleString() || 'N/A'} (${marketData?.BTC?.change24h > 0 ? '+' : ''}${marketData?.BTC?.change24h?.toFixed(2) || 0}%)
    - ETH: $${marketData?.ETH?.price?.toLocaleString() || 'N/A'} (${marketData?.ETH?.change24h > 0 ? '+' : ''}${marketData?.ETH?.change24h?.toFixed(2) || 0}%)
    - Portfolio Value: $${userContext.portfolioValue}
    - Market Trend: ${marketData?.BTC?.change24h > 2 ? 'Strong Uptrend' : marketData?.BTC?.change24h > 0 ? 'Mild Uptrend' : marketData?.BTC?.change24h > -2 ? 'Mild Downtrend' : 'Strong Downtrend'}
    - Volume: ${marketData?.BTC?.volume24h > 30000000000 ? 'High Activity' : 'Normal Activity'}
    
    TIMING ELEMENTS:
    - Lucky Days: ${userContext.astroInsights?.weekly?.luckyDays?.join(", ") || "Tuesday, Thursday"}
    - Power Numbers: ${userContext.luckyNumbers.join(", ")}
    - Moon Phase: ${userContext.currentTransits?.moonPhase || new Date().getDate() <= 7 ? 'New Moon' : new Date().getDate() <= 14 ? 'Waxing' : new Date().getDate() <= 21 ? 'Full Moon' : 'Waning'}
    - Mercury Retrograde: ${userContext.currentTransits?.mercuryRetrograde ? 'Yes - Exercise caution' : 'No - Clear for action'}
    
    GENERATION GUIDELINES:
    1. START with concrete market analysis - price levels, support/resistance, volume patterns
    2. CONNECT market opportunities directly to their stated intention and challenges
    3. PROVIDE specific entry points, position sizes, and risk management levels
    4. ADDRESS their personal challenge ("${userContext.biggestChallenge || profile?.biggestChallenge}") with practical solutions
    5. GUIDE toward their ideal outcome ("${userContext.idealOutcome || profile?.idealOutcome}") with actionable steps
    6. USE market terminology: "liquidity zones", "order flow", "market structure", not spiritual platitudes
    7. INTEGRATE astrology subtly - as timing insight, not primary driver
    8. REFERENCE their ${userContext.wealthStyle} investment style with specific strategies
    9. SUGGEST concrete actions based on their ${userContext.portfolioSize || 'current'} portfolio size
    10. END with one specific action they can take immediately
    
    CRITICAL: Be a thoughtful market strategist, not a fortune teller. Every insight must have practical trading value.
    Connect their ${userContext.sunElement} nature to market dynamics, not abstract concepts.
    Their ${userContext.archetype} archetype needs ${userContext.wealthStyle === 'aggressive' ? 'high-conviction trades' : userContext.wealthStyle === 'conservative' ? 'risk-managed entries' : 'balanced positioning'}.
    
    Remember: ${userContext.name} wants real market intelligence that honors their personal journey.
    Build on their knowledge base: ${userContext.insights?.length > 0 ? 'Previous insights stored' : 'Building their knowledge'}.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt + "\nCRITICAL STYLE: Never quote the user's words verbatim. Paraphrase naturally. Do not include quotation marks around user inputs." },
        {
          role: "user",
          content: `Generate sophisticated market-focused insights for ${userContext.name}:
          
          1. Market Analysis ("market"): Current market conditions with specific levels. BTC at $${marketData?.BTC?.price}, ETH at $${marketData?.ETH?.price}. Include support/resistance, volume analysis, and actual trading setups. This should be Bloomberg-quality analysis.
          
          2. Personal Strategy ("personal"): Connect market conditions to their intention: ${userContext.intention}. Address their challenge: ${userContext.biggestChallenge || 'timing and confidence'}. Guide toward: ${userContext.idealOutcome || 'financial independence'}. Make this deeply relevant. Never quote; paraphrase.
          
          3. Portfolio Guidance ("daily"): ${portfolio && portfolio.length > 0 ? `Specific guidance for holdings: ${portfolio.map((h: any) => h.symbol).join(', ')}` : 'Entry strategy for first positions'}. Consider their ${userContext.portfolioSize || 'current'} portfolio size and ${userContext.riskTolerance} risk profile.
          
          4. Timing Intelligence ("astroWeather"): Market timing combining technicals with their ${userContext.sunSign} energy. Current: ${new Date().getDate() <= 14 ? 'Accumulation phase' : 'Distribution phase'}. Provide specific entry/exit windows.
          
          5. Strategic Wisdom ("quantumField"): Deep market insight connecting their ${userContext.archetype} archetype with opportunities. This should be profound market understanding, NOT affirmations.
          
          6. Opportunity Windows ("luckyTiming"): Specific times and price levels. Power days: ${userContext.astroInsights?.weekly?.luckyDays?.join(", ") || 'Tuesday, Thursday'}. Key levels using their numbers: ${userContext.luckyNumbers?.join(", ") || '3, 7, 9'}.
          
          7. Immediate Action ("actionStep"): ONE specific thing to do NOW - set an alert at $X, research protocol Y, adjust position Z. Make it concrete and valuable.
          
          Style: Professional market analysis with personalized depth. Think institutional research with personal advisor insight.
          Every point must provide real trading value. No generic affirmations.
          
          Return ONLY valid JSON. Keys: daily, market, personal, astroWeather, quantumField, luckyTiming, actionStep. Absolutely no quotes of user text.`
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
    
    // Try to parse JSON, but handle errors gracefully
    let insights: any = {};
    try {
      insights = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error, attempting to extract insights:', parseError);
      // Try to extract key-value pairs from the response
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('daily:') || line.includes('"daily":')) {
          const match = line.match(/["']?daily["']?\s*:\s*["']([^"']+)["']/i);
          if (match) insights.daily = match[1];
        }
        if (line.includes('market:') || line.includes('"market":')) {
          const match = line.match(/["']?market["']?\s*:\s*["']([^"']+)["']/i);
          if (match) insights.market = match[1];
        }
        if (line.includes('personal:') || line.includes('"personal":')) {
          const match = line.match(/["']?personal["']?\s*:\s*["']([^"']+)["']/i);
          if (match) insights.personal = match[1];
        }
      }
      
      // If still no insights, use the content as a whole
      if (Object.keys(insights).length === 0) {
        const sections = content.split(/\n\n+/);
        insights = {
          daily: sections[0] || "Embrace your unique energy today.",
          market: sections[1] || "Market conditions are favorable for your approach.",
          personal: sections[2] || "Trust your intuition and stay aligned with your goals."
        };
      }
    }
    
    // Ensure all values are strings (not nested objects) and not verbatim quotes
    const sanitizedInsights: any = {};
    for (const [key, value] of Object.entries(insights)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // If it's an object, extract the meaningful content
        const obj = value as any;
        
        // Common patterns in OpenAI responses
        if (obj.observation) {
          // Extract observation and combine with other fields
          let content = obj.observation;
          if (obj.specificInvestments && Array.isArray(obj.specificInvestments)) {
            content += ` Consider: ${obj.specificInvestments.join(', ')}`;
          }
          if (obj.action) {
            content += ` Action: ${obj.action}`;
          }
          sanitizedInsights[key] = content;
        } else if (obj.guidance) {
          // Extract guidance and challenges
          let content = obj.guidance;
          if (obj.challenges) {
            content += ` ${obj.challenges}`;
          }
          sanitizedInsights[key] = content;
        } else if (obj.message) {
          // Simple message field
          sanitizedInsights[key] = obj.message;
        } else if (obj.content) {
          // Content field
          sanitizedInsights[key] = obj.content;
        } else if (obj.text) {
          // Text field
          sanitizedInsights[key] = obj.text;
        } else {
          // Try to extract first string value or create a readable format
          const firstStringValue = Object.values(obj).find(v => typeof v === 'string');
          if (firstStringValue) {
            sanitizedInsights[key] = firstStringValue as string;
          } else {
            // Create a readable format from the object
            const parts = [];
            for (const [k, v] of Object.entries(obj)) {
              if (typeof v === 'string') {
                parts.push(v);
              } else if (Array.isArray(v)) {
                parts.push(v.join(', '));
              }
            }
            sanitizedInsights[key] = parts.join(' ') || 'Insight processing...';
          }
        }
      } else if (typeof value === 'string') {
        sanitizedInsights[key] = value.replace(/\"/g, '"');
      } else if (Array.isArray(value)) {
        sanitizedInsights[key] = value.join(', ');
      } else {
        sanitizedInsights[key] = String(value || '');
      }
    }
    
    // Store this insight in the user's knowledge base
    if (sanitizedInsights.quantumField) {
      // In production, this would be saved to database
      console.log(`Storing quantum insight for ${userContext.name}:`, sanitizedInsights.quantumField);
    }
    
    return NextResponse.json({
      ...sanitizedInsights,
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
    const fallbackInsights = profile?.sunSign ? generateComprehensiveInsights(profile, {}) : null;
    
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
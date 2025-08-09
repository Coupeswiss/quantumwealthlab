import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Strategic AI agents with grounded, actionable insights
const AGENTS = {
  quantum: {
    name: "Market Psychologist",
    role: "Behavioral Finance & Market Psychology Expert",
    style: "Analyzes market sentiment, crowd psychology, and timing based on collective consciousness patterns. Practical and data-driven.",
    emoji: "🧠"
  },
  astro: {
    name: "Cycle Analyst", 
    role: "Market Cycles & Timing Specialist",
    style: "Uses historical cycles, seasonal patterns, and astrological timing for entry/exit points. Focuses on probabilities and risk/reward.",
    emoji: "📈"
  },
  technical: {
    name: "Technical Strategist",
    role: "Chart Analysis & Trade Execution Expert",
    style: "Provides specific price levels, support/resistance, and technical setups. Clear entry, exit, and stop-loss recommendations.",
    emoji: "📊"
  },
  risk: {
    name: "Risk Manager",
    role: "Portfolio Protection & Position Sizing Expert",
    style: "Calculates position sizes, manages drawdowns, and implements hedging strategies. Conservative and methodical.",
    emoji: "⚖️"
  },
  growth: {
    name: "Opportunity Scout",
    role: "Emerging Trends & Alpha Generation Specialist",
    style: "Identifies high-conviction plays, emerging narratives, and asymmetric opportunities. Bold but calculated.",
    emoji: "🎯"
  },
  wisdom: {
    name: "Portfolio Architect",
    role: "Strategic Asset Allocation & Wealth Building Expert",
    style: "Designs portfolio structure, rebalancing strategies, and long-term wealth accumulation plans. Holistic and systematic.",
    emoji: "🏛️"
  }
};

export async function POST(req: Request) {
  try {
    const { profile, portfolio, marketData, agentType = "all", question } = await req.json();

    if (!openai.apiKey) {
      return NextResponse.json({ 
        error: "AI service not configured",
        insights: generateFallbackInsights(profile, portfolio, marketData, agentType)
      });
    }

    // Build comprehensive context with ALL user data
    const userContext = `
COMPLETE USER PROFILE:

Personal Information:
- Name: ${profile.name || "User"}
- Birth Date: ${profile.birthDate || "Unknown"}
- Birth Time: ${profile.birthTime || "Unknown"}  
- Birth Place: ${profile.birthPlace || "Unknown"}

Astrological Profile (CRITICAL FOR TIMING):
- Sun Sign: ${profile.sunSign || "Unknown"} (Core personality & ego)
- Moon Sign: ${profile.moonSign || "Unknown"} (Emotional nature & instincts)
- Rising Sign: ${profile.risingSign || "Unknown"} (Public persona & approach)
- Dominant Element: ${profile.elemental?.element || "Unknown"} (${profile.elemental?.balance ? `Fire: ${profile.elemental.balance.fire}, Earth: ${profile.elemental.balance.earth}, Air: ${profile.elemental.balance.air}, Water: ${profile.elemental.balance.water}` : ""})
- Wealth Archetype: ${profile.quantumProfile?.archetype || "Unknown"}
- Natural Wealth Style: ${profile.quantumProfile?.wealthStyle || "Unknown"}
- Astrological Strengths: ${profile.quantumProfile?.strengths?.join(", ") || "Unknown"}

Investment Profile:
- Portfolio Size: ${profile.portfolioSize || "Unknown"}
- Experience Level: ${profile.experience || "Unknown"} 
- Risk Tolerance: ${profile.riskTolerance || "Unknown"}
- Time Horizon: ${profile.timeHorizon || "Unknown"}

Personal Goals & Psychology:
- Primary Intention: "${profile.intention || "Not specified"}"
- Biggest Challenge: "${profile.biggestChallenge || "Not specified"}"
- Ideal Outcome: "${profile.idealOutcome || "Not specified"}"

Current Portfolio Holdings:
${portfolio && portfolio.length > 0 ? 
  portfolio.map((h: any) => `- ${h.symbol}: ${h.amount} units (Value: $${h.value || 'Unknown'})`).join('\n') : 
  "- No current holdings (Starting fresh)"}

Market Context:
- BTC Price: $${marketData?.btc?.toLocaleString() || "Unknown"} (${marketData?.btcChange > 0 ? '+' : ''}${marketData?.btcChange?.toFixed(2) || 0}% 24h)
- ETH Price: $${marketData?.eth?.toLocaleString() || "Unknown"} (${marketData?.ethChange > 0 ? '+' : ''}${marketData?.ethChange?.toFixed(2) || 0}% 24h)
- Market Trend: ${marketData?.trend || "Unknown"}
- Date: ${new Date().toLocaleDateString()}
- Current Market Phase: ${marketData?.btcChange > 5 ? "Euphoria" : marketData?.btcChange > 0 ? "Accumulation" : marketData?.btcChange > -5 ? "Distribution" : "Capitulation"}
`;

    // Select which agents to use
    const agentsToUse = agentType === "all" ? Object.keys(AGENTS) : [agentType];
    const insights: any = {};

    // Generate insights from each agent
    for (const agent of agentsToUse) {
      const agentInfo = AGENTS[agent as keyof typeof AGENTS];
      if (!agentInfo) continue;

      const prompt = `You are ${agentInfo.name}, a ${agentInfo.role}. Your style: ${agentInfo.style}.

${userContext}

${question ? `User's specific question: "${question}"` : `Provide strategic insights for this user's current situation.`}

CRITICAL REQUIREMENTS FOR YOUR RESPONSE:
1. Be SPECIFIC and ACTIONABLE - provide exact numbers, percentages, price levels
2. Reference their ACTUAL holdings and portfolio size
3. Consider their ${profile.experience} experience and ${profile.riskTolerance} risk tolerance
4. Align with their stated challenge: "${profile.biggestChallenge}"
5. Support their goal: "${profile.intention}"
6. Use their astrological profile for timing insights:
   - ${profile.sunSign} sun suggests ${getSunSignTraits(profile.sunSign)}
   - ${profile.moonSign} moon indicates ${getMoonSignTraits(profile.moonSign)}
   - ${profile.elemental?.element} element means ${getElementalTraits(profile.elemental?.element)}
7. Give PRACTICAL advice they can implement TODAY
8. Include specific price targets, allocation percentages, or time frames
9. Be grounded and strategic, not ethereal or vague

Your response should be 3-4 sentences of HIGH-VALUE, PERSONALIZED insight that ${profile.name || "this person"} can act on immediately. Reference their specific situation and provide concrete next steps.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 250,
        });

        insights[agent] = {
          agent: agentInfo.name,
          role: agentInfo.role,
          emoji: agentInfo.emoji,
          message: completion.choices[0]?.message?.content || "Unable to generate insight"
        };
      } catch (error) {
        console.error(`Agent ${agent} failed:`, error);
        insights[agent] = {
          agent: agentInfo.name,
          role: agentInfo.role,
          emoji: agentInfo.emoji,
          message: generateAgentFallback(agent, profile, portfolio, marketData)
        };
      }
    }

    // Add metadata
    const response = {
      insights,
      timestamp: new Date().toISOString(),
      profile: {
        name: profile.name,
        signs: `${profile.sunSign}/${profile.moonSign}/${profile.risingSign}`,
        element: profile.elemental?.element,
        portfolio: profile.portfolioSize,
        risk: profile.riskTolerance
      },
      marketContext: marketData,
      actionableToday: generateActionableSteps(profile, portfolio, marketData)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("AI agents error:", error);
    return NextResponse.json({ 
      error: "Failed to generate insights",
      insights: generateFallbackInsights({}, [], {}, "all")
    }, { status: 500 });
  }
}

function getSunSignTraits(sign: string): string {
  const traits: Record<string, string> = {
    Aries: "bold initiative and quick action",
    Taurus: "steady accumulation and value investing",
    Gemini: "diversification and information gathering",
    Cancer: "protective instincts and security focus",
    Leo: "confident leadership and growth seeking",
    Virgo: "analytical precision and risk management",
    Libra: "balanced portfolios and partnership opportunities",
    Scorpio: "deep research and transformation plays",
    Sagittarius: "optimistic expansion and international exposure",
    Capricorn: "long-term building and blue-chip focus",
    Aquarius: "innovative tech and future trends",
    Pisces: "intuitive timing and creative sectors"
  };
  return traits[sign] || "unique market perspective";
}

function getMoonSignTraits(sign: string): string {
  const traits: Record<string, string> = {
    Aries: "impulsive reactions require stop-losses",
    Taurus: "emotional attachment to positions",
    Gemini: "nervousness during volatility",
    Cancer: "mood-based trading patterns",
    Leo: "pride affecting exit decisions",
    Virgo: "anxiety over small losses",
    Libra: "indecision at key levels",
    Scorpio: "holding through extremes",
    Sagittarius: "overconfidence in rallies",
    Capricorn: "pessimism in downturns",
    Aquarius: "detached decision making",
    Pisces: "susceptibility to market sentiment"
  };
  return traits[sign] || "emotional trading patterns";
}

function getElementalTraits(element: string): string {
  const traits: Record<string, string> = {
    Fire: "act quickly on high-conviction plays but set tight stops",
    Earth: "focus on fundamental value and steady accumulation",
    Air: "leverage information edge and social sentiment",
    Water: "trust intuition but verify with technical levels"
  };
  return traits[element] || "follow your natural investment style";
}

function generateActionableSteps(profile: any, portfolio: any, marketData: any): string[] {
  const steps = [];
  
  // Based on portfolio size
  if (profile.portfolioSize === "< $10k") {
    steps.push("Start with 60% BTC, 30% ETH, 10% cash reserve for opportunities");
  } else if (profile.portfolioSize?.includes("$10k-50k")) {
    steps.push("Consider 50% BTC, 25% ETH, 15% top alts, 10% cash");
  } else {
    steps.push("Diversify: 40% BTC, 20% ETH, 30% selected alts, 10% stables");
  }
  
  // Based on risk tolerance
  if (profile.riskTolerance === "conservative") {
    steps.push("Set stop-losses at -10% and take profits at +25%");
  } else if (profile.riskTolerance === "aggressive") {
    steps.push("Use 2-3% position sizes for high-risk plays");
  }
  
  // Based on market conditions
  if (marketData?.btcChange < -5) {
    steps.push("Deploy 25% of cash reserves into quality assets today");
  } else if (marketData?.btcChange > 5) {
    steps.push("Take 20% profits on winners and increase cash position");
  }
  
  return steps;
}

function generateAgentFallback(agentType: string, profile: any, portfolio: any, marketData: any): string {
  const portfolioValue = portfolio?.reduce((sum: number, h: any) => sum + (h.value || 0), 0) || 0;
  const btcPrice = marketData?.btc || 50000;
  
  const messages: Record<string, string> = {
    quantum: `With ${profile.portfolioSize || "your"} portfolio and ${profile.riskTolerance || "moderate"} risk tolerance, market psychology suggests accumulating during fear (RSI < 30) and distributing during greed (RSI > 70). Current BTC at $${btcPrice.toLocaleString()} presents a ${marketData?.btcChange < 0 ? "buying" : "profit-taking"} opportunity.`,
    
    astro: `Your ${profile.sunSign || "current"} sun cycle favors ${marketData?.trend === "bullish" ? "expansion" : "consolidation"}. With ${profile.timeHorizon || "medium-term"} horizon, enter positions during new moons and take profits during full moons. Next optimal entry: ${getNextNewMoon()}.`,
    
    technical: `BTC at $${btcPrice.toLocaleString()}: Support at $${Math.floor(btcPrice * 0.92).toLocaleString()}, resistance at $${Math.floor(btcPrice * 1.08).toLocaleString()}. For your ${profile.experience || "level"}, use 2% position sizes with stops at -8%. Current setup suggests ${marketData?.btcChange > 0 ? "momentum continuation" : "oversold bounce"} trade.`,
    
    risk: `With ${profile.portfolioSize || "current capital"}, limit any single position to ${profile.riskTolerance === "conservative" ? "5%" : profile.riskTolerance === "aggressive" ? "15%" : "10%"} of portfolio. Your ${profile.biggestChallenge || "risk management"} requires strict stop-losses. Maximum portfolio drawdown should not exceed ${profile.riskTolerance === "conservative" ? "15%" : "25%"}.`,
    
    growth: `Focus on ${marketData?.trend === "bullish" ? "momentum leaders" : "oversold quality"}. Your ${profile.intention || "wealth goals"} align with ${profile.timeHorizon === "short" ? "quick 20-30% gains" : "3-5x opportunities over 6-12 months"}. Allocate 10% to high-conviction emerging projects with clear catalysts.`,
    
    wisdom: `Build wealth systematically: ${profile.portfolioSize === "< $10k" ? "70% core positions (BTC/ETH), 30% growth" : "60% core, 30% satellites, 10% cash"}. Your ${profile.experience || "current"} experience suits dollar-cost averaging. Rebalance quarterly when positions deviate >20% from targets.`
  };

  return messages[agentType] || `Focus on your core strategy and maintain discipline.`;
}

function getNextNewMoon(): string {
  const today = new Date();
  const nextNew = new Date(today);
  nextNew.setDate(today.getDate() + ((29.5 - (today.getDate() % 29.5)) % 29.5));
  return nextNew.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateFallbackInsights(profile: any, portfolio: any, marketData: any, agentType: string): any {
  const fallback: any = {};
  const agents = agentType === "all" ? Object.keys(AGENTS) : [agentType];
  
  agents.forEach(agent => {
    const agentInfo = AGENTS[agent as keyof typeof AGENTS];
    if (agentInfo) {
      fallback[agent] = {
        agent: agentInfo.name,
        role: agentInfo.role,
        emoji: agentInfo.emoji,
        message: generateAgentFallback(agent, profile, portfolio, marketData)
      };
    }
  });
  
  return fallback;
}
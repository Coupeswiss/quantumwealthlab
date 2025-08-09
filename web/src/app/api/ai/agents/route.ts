import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Different AI agent personalities for diverse perspectives
const AGENTS = {
  quantum: {
    name: "Quantum Oracle",
    role: "Consciousness & Energy Analyst",
    style: "Mystical, intuitive, focuses on energy patterns and consciousness alignment",
    emoji: "🔮"
  },
  astro: {
    name: "Cosmic Navigator", 
    role: "Astrological Wealth Strategist",
    style: "Uses planetary alignments, zodiac insights, and cosmic timing for financial guidance",
    emoji: "🌟"
  },
  technical: {
    name: "Alpha Seeker",
    role: "Technical & Market Analyst",
    style: "Data-driven, analytical, focuses on charts, patterns, and market dynamics",
    emoji: "📊"
  },
  risk: {
    name: "Guardian",
    role: "Risk & Protection Specialist",
    style: "Conservative, protective, focuses on preserving wealth and managing downside",
    emoji: "🛡️"
  },
  growth: {
    name: "Abundance Amplifier",
    role: "Growth & Opportunity Hunter",
    style: "Optimistic, aggressive, seeks high-growth opportunities and exponential returns",
    emoji: "🚀"
  },
  wisdom: {
    name: "Sage Advisor",
    role: "Holistic Wealth Philosopher",
    style: "Wise, balanced, integrates spiritual and material wealth perspectives",
    emoji: "🦉"
  }
};

export async function POST(req: Request) {
  try {
    const { profile, portfolio, marketData, agentType = "all", question } = await req.json();

    if (!openai.apiKey) {
      return NextResponse.json({ 
        error: "AI service not configured",
        insights: generateFallbackInsights(profile, agentType)
      });
    }

    // Build comprehensive context about the user
    const userContext = `
User Profile:
- Name: ${profile.name || "User"}
- Birth Date: ${profile.birthDate || "Unknown"}
- Birth Time: ${profile.birthTime || "Unknown"}
- Birth Place: ${profile.birthPlace || "Unknown"}

Astrological Profile:
- Sun Sign: ${profile.sunSign || "Unknown"}
- Moon Sign: ${profile.moonSign || "Unknown"}
- Rising Sign: ${profile.risingSign || "Unknown"}
- Element: ${profile.elemental?.element || "Unknown"}
- Archetype: ${profile.quantumProfile?.archetype || "Unknown"}
- Wealth Style: ${profile.quantumProfile?.wealthStyle || "Unknown"}

Investment Profile:
- Portfolio Size: ${profile.portfolioSize || "Unknown"}
- Experience: ${profile.experience || "Unknown"}
- Risk Tolerance: ${profile.riskTolerance || "Unknown"}
- Time Horizon: ${profile.timeHorizon || "Unknown"}

Personal Insights:
- Primary Intention: ${profile.intention || "Not specified"}
- Biggest Challenge: ${profile.biggestChallenge || "Not specified"}
- Ideal Outcome: ${profile.idealOutcome || "Not specified"}

Current Portfolio:
${portfolio && portfolio.length > 0 ? 
  portfolio.map((h: any) => `- ${h.symbol}: ${h.amount} (${h.value})`).join('\n') : 
  "No holdings yet"}

Market Context:
- BTC: $${marketData?.btc || "Unknown"} (${marketData?.btcChange || 0}%)
- ETH: $${marketData?.eth || "Unknown"} (${marketData?.ethChange || 0}%)
- Market Trend: ${marketData?.trend || "Unknown"}
`;

    // Select which agents to use
    const agentsToUse = agentType === "all" ? Object.keys(AGENTS) : [agentType];
    const insights: any = {};

    // Generate insights from each agent
    for (const agent of agentsToUse) {
      const agentInfo = AGENTS[agent as keyof typeof AGENTS];
      if (!agentInfo) continue;

      const prompt = `You are ${agentInfo.name}, a ${agentInfo.role}. Your communication style is: ${agentInfo.style}.

${userContext}

${question ? `The user asks: "${question}"` : `Provide personalized insights for this user.`}

Based on ALL the user's information above, provide HIGHLY PERSONALIZED insights that:
1. Reference their specific astrological signs and what it means for them
2. Address their stated challenges and intentions directly
3. Consider their risk tolerance and experience level
4. Align with their wealth style and archetype
5. Take into account their time horizon and portfolio size
6. Reference current market conditions

Your response should be:
- Specific to THIS person (use their name if provided)
- Reference their unique combination of traits
- Actionable and practical
- Written in your unique style as ${agentInfo.name}
- About 3-4 sentences
- Feel personal, not generic

Remember: You're speaking directly to ${profile.name || "this specific person"} who is a ${profile.sunSign} sun, ${profile.moonSign} moon, ${profile.risingSign} rising, with ${profile.experience} experience and ${profile.riskTolerance} risk tolerance.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 200,
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
          message: generateAgentFallback(agent, profile)
        };
      }
    }

    // Add timestamp and metadata
    const response = {
      insights,
      timestamp: new Date().toISOString(),
      profile: {
        name: profile.name,
        signs: `${profile.sunSign}/${profile.moonSign}/${profile.risingSign}`,
        element: profile.elemental?.element
      },
      marketContext: marketData
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("AI agents error:", error);
    return NextResponse.json({ 
      error: "Failed to generate insights",
      insights: generateFallbackInsights({}, "all")
    }, { status: 500 });
  }
}

function generateAgentFallback(agentType: string, profile: any): string {
  const messages: Record<string, string> = {
    quantum: `Your ${profile.elemental?.element || "unique"} energy is particularly strong right now. Focus on aligning your investment decisions with your inner knowing - your ${profile.sunSign || "natural"} intuition is heightened.`,
    
    astro: `As a ${profile.sunSign || "cosmic"} sun with ${profile.moonSign || "intuitive"} moon, this period favors ${profile.riskTolerance === "conservative" ? "steady accumulation" : "calculated risks"}. Your ${profile.risingSign || "ascending"} rising suggests timing is crucial.`,
    
    technical: `Based on your ${profile.experience || "current"} experience level and ${profile.portfolioSize || "portfolio"}, consider dollar-cost averaging into quality assets. The market structure supports your ${profile.timeHorizon || "investment"} timeline.`,
    
    risk: `With your ${profile.riskTolerance || "stated"} risk tolerance, maintain protective stops at key levels. Your ${profile.biggestChallenge || "challenges"} can be mitigated through proper position sizing.`,
    
    growth: `Your ${profile.intention || "wealth goals"} align perfectly with emerging opportunities in the quantum field. As a ${profile.quantumProfile?.archetype || "natural"} archetype, you're positioned for exponential growth.`,
    
    wisdom: `Remember, ${profile.name || "dear soul"}, true wealth encompasses both material and spiritual abundance. Your journey as a ${profile.sunSign || "unique"} soul is about balancing both realms.`
  };

  return messages[agentType] || "Trust your inner guidance and stay aligned with your highest vision.";
}

function generateFallbackInsights(profile: any, agentType: string): any {
  const fallback: any = {};
  const agents = agentType === "all" ? Object.keys(AGENTS) : [agentType];
  
  agents.forEach(agent => {
    const agentInfo = AGENTS[agent as keyof typeof AGENTS];
    if (agentInfo) {
      fallback[agent] = {
        agent: agentInfo.name,
        role: agentInfo.role,
        emoji: agentInfo.emoji,
        message: generateAgentFallback(agent, profile)
      };
    }
  });
  
  return fallback;
}
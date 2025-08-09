import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getBaseUrl } from "@/lib/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Agent personalities providing grounded, actionable insights
function getAgentPersonality(profile: any, agentType: string, marketData?: any) {
  const basePersonality = `You are a Quantum Wealth Lab financial advisor specializing in ${agentType}.
    
    User Profile:
    - Name: ${profile.name || 'User'}
    - Portfolio Size: ${profile.portfolioSize || 'Not specified'}
    - Risk Tolerance: ${profile.riskTolerance || 'moderate'}
    - Experience: ${profile.experience || 'beginner'}
    - Investment Goals: ${profile.investmentGoals?.join(', ') || 'wealth growth'}
    - Time Horizon: ${profile.timeHorizon || 'medium-term'}
    - Trading Style: ${profile.tradingStyle || 'balanced'}
    - Current Holdings: ${profile.currentHoldings?.map((h: any) => `${h.symbol}: ${h.amount}`).join(', ') || 'None specified'}
    - Biggest Challenge: ${profile.biggestChallenge || 'Not specified'}
    - Ideal Outcome: ${profile.idealOutcome || 'Financial freedom'}
    
    Current Market:
    - BTC: $${marketData?.btc || 'N/A'} (${marketData?.btcChange || 'N/A'}%)
    - ETH: $${marketData?.eth || 'N/A'} (${marketData?.ethChange || 'N/A'}%)
    - Market Trend: ${marketData?.trend || 'Unknown'}
    
    Instructions:
    - Provide specific, actionable advice based on their actual portfolio and goals
    - Reference real market conditions and specific price levels
    - Give concrete recommendations with reasoning
    - Include risk warnings where appropriate
    - Be direct and practical, avoid vague mystical language`;

  const agentPersonalities: { [key: string]: string } = {
    overview: `${basePersonality}
      Focus: Daily market analysis and portfolio performance.
      Provide:
      1. Specific price levels to watch for their holdings
      2. Market trend analysis with support/resistance levels
      3. 3 actionable steps for today based on current conditions
      4. Risk alerts for their specific positions`,
    
    portfolio: `${basePersonality}
      Focus: Portfolio optimization and rebalancing recommendations.
      Analyze:
      1. Current allocation vs recommended based on risk profile
      2. Specific coins to add/reduce with target percentages
      3. Entry/exit points for positions
      4. Correlation analysis between holdings
      5. Performance metrics and improvement suggestions`,
    
    research: `${basePersonality}
      Focus: Deep market research and opportunity identification.
      Research:
      1. Emerging trends relevant to their investment style
      2. Detailed analysis of their current holdings
      3. New opportunities matching their criteria
      4. Red flags or risks in current positions
      5. Macro factors affecting their portfolio`,
    
    trading: `${basePersonality}
      Focus: Technical analysis and trade execution guidance.
      Provide:
      1. Specific trade setups for their watchlist
      2. Entry, stop-loss, and take-profit levels
      3. Position sizing based on their portfolio size
      4. Risk/reward analysis for each trade
      5. Market timing based on technical indicators`,
    
    risk: `${basePersonality}
      Focus: Risk management and portfolio protection.
      Assess:
      1. Current portfolio risk metrics (VaR, Sharpe ratio)
      2. Concentration risk in specific sectors/coins
      3. Hedging strategies appropriate for their level
      4. Stop-loss recommendations for each position
      5. Scenario analysis for market corrections`,
    
    tax: `${basePersonality}
      Focus: Tax optimization and reporting guidance.
      Consider:
      1. Tax-loss harvesting opportunities
      2. Long vs short-term capital gains planning
      3. Record-keeping recommendations
      4. Jurisdiction-specific considerations
      5. Year-end tax strategies`
  };

  return agentPersonalities[agentType] || basePersonality;
}

export async function POST(req: Request) {
  try {
    const { profile, agentType, prompt, context } = await req.json();
    
    // Fetch current market data
    let marketData = {};
    try {
      const pricesRes = await fetch(`${getBaseUrl()}/api/crypto/prices`);
      if (pricesRes.ok) {
        const prices = await pricesRes.json();
        marketData = {
          btc: prices.BTC?.price,
          btcChange: prices.BTC?.change24h,
          eth: prices.ETH?.price,
          ethChange: prices.ETH?.change24h,
          trend: prices.BTC?.change24h > 0 && prices.ETH?.change24h > 0 ? "bullish" : "mixed"
        };
      }
    } catch (e) {
      console.error("Market data fetch error:", e);
    }
    
    // Create comprehensive user context
    const userContext = {
      ...profile,
      currentDate: new Date().toISOString(),
      marketContext: { ...marketData, ...context?.market },
      portfolioContext: context?.portfolio || {},
      recentActivity: profile.insights?.slice(-3) || []
    };
    
    // Fallback for no API key with specific recommendations
    if (!process.env.OPENAI_API_KEY) {
      const fallbackResponses: { [key: string]: any } = {
        overview: {
          marketSummary: `BTC at $${marketData.btc || '100,000'}, ${marketData.btcChange > 0 ? 'up' : 'down'} ${Math.abs(marketData.btcChange || 1)}% today`,
          actionItems: [
            "Review your stop-losses given current volatility",
            "Consider rebalancing if any position exceeds 30% of portfolio",
            "Set price alerts at key support/resistance levels"
          ],
          watchList: ["Monitor BTC support at $95,000", "ETH resistance at $4,000", "Watch DXY for risk-off signals"],
          riskAlert: "Elevated volatility expected around upcoming Fed meeting"
        },
        portfolio: {
          allocation: "Your current allocation may be overweight in large caps",
          recommendations: [
            "Consider adding 10% to stablecoins for dry powder",
            "Reduce BTC exposure if over 40% of portfolio",
            "Add small cap exposure (5-10%) for higher beta"
          ],
          rebalanceTargets: { BTC: "35%", ETH: "25%", Stables: "20%", Alts: "20%" }
        },
        research: {
          trending: ["AI tokens showing strength", "L2s gaining adoption", "RWA narrative building"],
          analysis: "Macro conditions suggest defensive positioning",
          opportunities: ["DeFi blue chips at support", "Gaming tokens oversold", "Privacy coins accumulating"]
        }
      };
      
      return NextResponse.json({
        response: fallbackResponses[agentType] || fallbackResponses.overview,
        agentType,
        marketData,
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate response with OpenAI
    const systemPrompt = getAgentPersonality(profile, agentType, marketData);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Current Context:
          - User Holdings: ${JSON.stringify(userContext.portfolioContext)}
          - Market Data: ${JSON.stringify(marketData)}
          - User Query: ${prompt || `Generate specific ${agentType} analysis with actionable recommendations`}
          
          Provide a detailed response with:
          1. Specific price levels and percentages
          2. Clear action items with reasoning
          3. Risk warnings where appropriate
          4. Timeline for recommendations
          5. Metrics to track success
          
          Return ONLY valid JSON without markdown formatting.`
        }
      ],
      temperature: 0.7, // Lower temperature for more consistent financial advice
      max_tokens: 1000,
    });
    
    // Clean response
    let content = completion.choices[0].message.content || "{}";
    if (content.includes("```")) {
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }
    
    const response = JSON.parse(content);
    
    // Store insights
    if (response.keyRecommendation) {
      console.log(`Storing recommendation for ${profile.name}:`, response.keyRecommendation);
    }
    
    return NextResponse.json({
      response,
      agentType,
      marketData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("AI agent error:", error);
    
    return NextResponse.json({
      response: {
        message: "Analysis system temporarily unavailable",
        fallback: true,
        suggestion: "Check back in a few minutes for updated insights"
      },
      agentType: "error",
      timestamp: new Date().toISOString()
    });
  }
}
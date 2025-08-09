import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { profile, holdings } = await req.json();
    
    // Fetch current market data
    let marketData: any = {};
    let researchData: any = {};
    
    try {
      // Get prices
      const pricesRes = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/crypto/prices`);
      if (pricesRes.ok) {
        marketData = await pricesRes.json();
      }
      
      // Get research for holdings
      const researchRes = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/research/crypto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings, profile })
      });
      if (researchRes.ok) {
        researchData = await researchRes.json();
      }
    } catch (e) {
      console.error("Data fetch error:", e);
    }
    
    // Calculate portfolio performance
    const portfolioStats = calculatePortfolioStats(holdings, marketData);
    
    // Create comprehensive weekly report
    const weeklyData = {
      profile: {
        name: profile.name,
        sunSign: profile.sunSign,
        moonSign: profile.moonSign,
        risingSign: profile.risingSign,
        archetype: profile.quantumProfile?.archetype,
        riskTolerance: profile.riskTolerance,
        portfolioSize: profile.portfolioSize,
        timeHorizon: profile.timeHorizon,
        intention: profile.intention,
        idealOutcome: profile.idealOutcome,
      },
      portfolio: {
        totalValue: portfolioStats.totalValue,
        weeklyChange: portfolioStats.weeklyChange,
        topPerformer: portfolioStats.topPerformer,
        worstPerformer: portfolioStats.worstPerformer,
        holdings: holdings.map((h: any) => ({
          symbol: h.symbol,
          amount: h.amount,
          value: h.value || 0,
          allocation: ((h.value || 0) / portfolioStats.totalValue * 100).toFixed(1)
        }))
      },
      market: {
        btcPrice: marketData.BTC?.price,
        ethPrice: marketData.ETH?.price,
        btcWeekly: marketData.BTC?.change7d || marketData.BTC?.change24h * 7,
        ethWeekly: marketData.ETH?.change7d || marketData.ETH?.change24h * 7,
        trend: researchData.analysis?.marketConditions?.trend,
        macroFactors: researchData.analysis?.marketConditions?.macro,
      },
      astrology: {
        currentTransits: profile.currentTransits,
        cosmicWeather: researchData.analysis?.astroTiming,
        weekAhead: generateAstroWeek(profile.sunSign, profile.moonSign),
      }
    };
    
    // Generate personalized weekly report with AI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        report: generateFallbackReport(weeklyData),
        timestamp: new Date().toISOString()
      });
    }
    
    const systemPrompt = `You are creating a comprehensive weekly wealth report for ${profile.name}.
    They are a ${profile.sunSign} sun, ${profile.moonSign} moon, ${profile.risingSign} rising.
    Their archetype is ${profile.quantumProfile?.archetype}.
    Portfolio size: ${profile.portfolioSize}, Risk tolerance: ${profile.riskTolerance}.
    Primary intention: ${profile.intention}.
    
    Create a detailed, personalized weekly report that:
    1. Reviews their portfolio performance with specific numbers
    2. Analyzes each of their holdings individually
    3. Provides market outlook based on macro trends
    4. Incorporates astrological timing for the week ahead
    5. Gives 5 specific, actionable recommendations
    6. References their personal goals and risk profile
    
    Be specific with price levels, percentages, and dates.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a comprehensive weekly report based on this data:
          ${JSON.stringify(weeklyData)}
          
          Structure the report with these sections:
          1. Executive Summary (3 key points)
          2. Portfolio Performance (detailed analysis of each holding)
          3. Market Analysis (macro trends and crypto specific)
          4. Astrological Forecast (week ahead based on their chart)
          5. Actionable Recommendations (5 specific actions with reasoning)
          6. Risk Assessment (current risks and mitigation strategies)
          7. Week Ahead Outlook (what to watch, key dates)
          
          Return ONLY valid JSON without markdown formatting.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    // Clean response
    let content = completion.choices[0].message.content || "{}";
    if (content.includes("```")) {
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }
    
    const report = JSON.parse(content);
    
    return NextResponse.json({
      report,
      data: weeklyData,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json({
      error: "Failed to generate weekly report",
      timestamp: new Date().toISOString()
    });
  }
}

function calculatePortfolioStats(holdings: any[], marketData: any) {
  const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);
  
  // Calculate weekly change (simulated for now)
  const weeklyChange = holdings.reduce((sum, h) => {
    const price = marketData[h.symbol]?.price || 0;
    const change = marketData[h.symbol]?.change24h || 0;
    const weekChange = change * 7; // Simplified
    return sum + (h.value || 0) * (weekChange / 100);
  }, 0);
  
  // Find best and worst performers
  const performance = holdings.map(h => ({
    symbol: h.symbol,
    change: marketData[h.symbol]?.change24h || 0
  })).sort((a, b) => b.change - a.change);
  
  return {
    totalValue,
    weeklyChange,
    weeklyChangePercent: (weeklyChange / totalValue * 100).toFixed(2),
    topPerformer: performance[0],
    worstPerformer: performance[performance.length - 1],
  };
}

function generateAstroWeek(sunSign: string, moonSign: string) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const aspects = ["Favorable", "Neutral", "Challenging", "Powerful", "Transformative"];
  
  return days.map(day => ({
    day,
    aspect: aspects[Math.floor(Math.random() * aspects.length)],
    focus: `${sunSign} energy meets ${moonSign} intuition`,
    action: day === "Wednesday" ? "Key decision point" : "Observe and prepare"
  }));
}

function generateFallbackReport(data: any) {
  return {
    executiveSummary: [
      `Portfolio value: $${data.portfolio.totalValue?.toLocaleString() || 0}`,
      `Weekly change: ${data.portfolio.weeklyChange || 0}%`,
      `Market trend: ${data.market.trend || 'Consolidating'}`
    ],
    portfolioPerformance: {
      overview: `Your portfolio of ${data.portfolio.holdings?.length || 0} assets shows balanced diversification`,
      topHolding: data.portfolio.holdings?.[0] || { symbol: "N/A", allocation: "0%" },
      recommendation: "Consider rebalancing if any position exceeds 40%"
    },
    marketAnalysis: {
      btc: `Bitcoin at $${data.market.btcPrice?.toLocaleString() || 'N/A'}`,
      eth: `Ethereum at $${data.market.ethPrice?.toLocaleString() || 'N/A'}`,
      outlook: "Monitor support levels for entry opportunities"
    },
    astrologicalForecast: {
      thisWeek: `Your ${data.profile.sunSign} sun suggests ${data.profile.sunSign === 'Aries' ? 'bold action' : 'patient observation'}`,
      keyDates: ["Wednesday - Mercury aspect", "Friday - Venus transit"],
      advice: "Trust your intuition on timing"
    },
    recommendations: [
      "Review stop-losses on all positions",
      "Consider taking partial profits on winners",
      "Research emerging sectors for diversification",
      "Set price alerts at key levels",
      "Document your trading decisions for tax purposes"
    ],
    riskAssessment: {
      currentRisk: "Moderate",
      concerns: ["Market volatility", "Concentration risk", "Macro headwinds"],
      mitigation: "Maintain 20% in stablecoins for opportunities"
    },
    weekAhead: {
      watchList: ["Fed meeting Wednesday", "CPI data Friday", "Options expiry"],
      keyLevels: { btc: "95k support", eth: "3.8k support" },
      focus: "Preservation of capital in uncertain conditions"
    }
  };
}
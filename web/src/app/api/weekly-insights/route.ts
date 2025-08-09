import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if report was already generated this week
function shouldGenerateNewReport(lastGenerated: string | null): boolean {
  if (!lastGenerated) return true;
  
  const last = new Date(lastGenerated);
  const now = new Date();
  const daysSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSince >= 7;
}

// Fetch detailed market data for each holding
async function getDetailedMarketData(holdings: any[]) {
  const symbols = holdings.map(h => h.symbol.toLowerCase());
  
  try {
    // Fetch from CoinGecko for comprehensive data
    const ids = symbols.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d`,
      { headers: process.env.COINGECKO_API_KEY ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY } : {} }
    );
    
    if (!response.ok) throw new Error('Market data fetch failed');
    
    const data = await response.json();
    const marketData: any = {};
    
    data.forEach((coin: any) => {
      marketData[coin.symbol.toUpperCase()] = {
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        change7d: coin.price_change_percentage_7d,
        change30d: coin.price_change_percentage_30d,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        ath: coin.ath,
        athDate: coin.ath_date,
        sparkline: coin.sparkline_in_7d?.price || []
      };
    });
    
    return marketData;
  } catch (error) {
    console.error('Market data error:', error);
    return {};
  }
}

// Fetch latest crypto news
async function getCryptoNews() {
  try {
    // You could integrate with a news API here
    // For now, return structured news categories
    return {
      macro: "Fed maintains hawkish stance, Bitcoin correlation with equities weakening",
      regulatory: "EU finalizes MiCA framework, US congressional hearing on stablecoins",
      institutional: "BlackRock BTC ETF sees record inflows, MicroStrategy adds to holdings",
      technical: "BTC tests 100k resistance, major support at 90k holding strong",
      defi: "Ethereum L2s seeing massive growth, TVL reaches new highs"
    };
  } catch (error) {
    return {
      macro: "Markets await Fed decision",
      technical: "Key resistance levels being tested"
    };
  }
}

// Generate personalized weekly report
export async function POST(req: Request) {
  try {
    const { profile, portfolio, lastReportDate } = await req.json();
    
    // Check if new report is needed
    if (!shouldGenerateNewReport(lastReportDate)) {
      return NextResponse.json({
        error: "Weekly report already generated",
        nextReportDate: new Date(new Date(lastReportDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        message: "Your weekly report is generated every 7 days. Check back soon!"
      }, { status: 429 });
    }
    
    // Get comprehensive market data
    const marketData = await getDetailedMarketData(portfolio || []);
    const news = await getCryptoNews();
    
    // Calculate portfolio performance
    const portfolioAnalysis = analyzePortfolio(portfolio, marketData);
    
    // Generate the weekly report
    const report = await generatePersonalizedReport(profile, portfolio, marketData, news, portfolioAnalysis);
    
    return NextResponse.json({
      report,
      generatedAt: new Date().toISOString(),
      nextReportDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json({ 
      error: "Failed to generate weekly report",
      report: generateFallbackReport()
    }, { status: 500 });
  }
}

function analyzePortfolio(holdings: any[], marketData: any) {
  if (!holdings || holdings.length === 0) {
    return {
      totalValue: 0,
      change7d: 0,
      bestPerformer: null,
      worstPerformer: null,
      concentration: {},
      risk: "Not assessed"
    };
  }
  
  let totalValue = 0;
  let totalChange7d = 0;
  let best = { symbol: "", change: -Infinity };
  let worst = { symbol: "", change: Infinity };
  const concentration: any = {};
  
  holdings.forEach(holding => {
    const data = marketData[holding.symbol];
    if (!data) return;
    
    const value = holding.amount * data.price;
    totalValue += value;
    
    const change = data.change7d || 0;
    totalChange7d += value * (change / 100);
    
    if (change > best.change) {
      best = { symbol: holding.symbol, change };
    }
    if (change < worst.change) {
      worst = { symbol: holding.symbol, change };
    }
    
    concentration[holding.symbol] = value;
  });
  
  // Calculate concentration percentages
  Object.keys(concentration).forEach(symbol => {
    concentration[symbol] = ((concentration[symbol] / totalValue) * 100).toFixed(1) + '%';
  });
  
  return {
    totalValue,
    change7d: (totalChange7d / totalValue) * 100,
    bestPerformer: best.symbol ? best : null,
    worstPerformer: worst.symbol ? worst : null,
    concentration,
    risk: assessRisk(concentration)
  };
}

function assessRisk(concentration: any): string {
  const values = Object.values(concentration).map(v => parseFloat(v as string));
  const max = Math.max(...values);
  
  if (max > 50) return "High Concentration Risk";
  if (max > 30) return "Moderate Concentration";
  return "Well Diversified";
}

async function generatePersonalizedReport(profile: any, portfolio: any, marketData: any, news: any, analysis: any) {
  if (!openai.apiKey) {
    return generateFallbackReport();
  }
  
  const prompt = `You are writing a personalized weekly crypto portfolio report for ${profile.name || "an investor"}.

THEIR PROFILE:
- Astrology: ${profile.sunSign} Sun, ${profile.moonSign} Moon, ${profile.risingSign} Rising
- Element: ${profile.elemental?.element} (influences their energy and approach)
- Investment Style: ${profile.experience} experience, ${profile.riskTolerance} risk
- Goals: "${profile.intention}"
- Challenge: "${profile.biggestChallenge}"

PORTFOLIO HOLDINGS:
${portfolio.map((h: any) => {
  const data = marketData[h.symbol];
  return `${h.symbol}: ${h.amount} units ($${(h.amount * (data?.price || 0)).toFixed(2)}) - ${data?.change7d > 0 ? '📈' : '📉'} ${data?.change7d?.toFixed(1)}% this week`;
}).join('\n')}

PORTFOLIO METRICS:
- Total Value: $${analysis.totalValue.toFixed(2)}
- Week Performance: ${analysis.change7d > 0 ? '+' : ''}${analysis.change7d.toFixed(2)}%
- Best Performer: ${analysis.bestPerformer?.symbol} (${analysis.bestPerformer?.change?.toFixed(1)}%)
- Worst Performer: ${analysis.worstPerformer?.symbol} (${analysis.worstPerformer?.change?.toFixed(1)}%)
- Risk Assessment: ${analysis.risk}

MARKET CONTEXT:
${Object.entries(news).map(([key, value]) => `${key}: ${value}`).join('\n')}

Write a conversational, personalized weekly report with these sections:

1. 🌟 PERSONAL GREETING (2-3 sentences)
   - Address them by name, reference their astrological configuration
   - Acknowledge how their ${profile.sunSign} nature might be feeling about the market

2. 📊 YOUR PORTFOLIO THIS WEEK (3-4 sentences)
   - Specific performance of THEIR holdings
   - What moved and why (relate to market events)
   - How this aligns with their ${profile.intention}

3. 🔮 ASTROLOGICAL MARKET TIMING (2-3 sentences)
   - How current planetary positions affect their ${profile.sunSign}/${profile.moonSign} combination
   - Specific dates/periods that are favorable or challenging

4. 💎 HOLDINGS DEEP DIVE
   - For each holding, provide 1-2 sentences of unique insight
   - Connect the asset's behavior to their personal goals
   - Note if any holding needs attention based on their risk tolerance

5. 🌍 MACRO PERSPECTIVE (2-3 sentences)
   - How global events affect their specific holdings
   - What this means for someone with ${profile.experience} experience

6. 🎯 WEEK AHEAD OUTLOOK (2-3 sentences)
   - What to watch for based on their portfolio
   - How their ${profile.elemental?.element} element suggests approaching the week

Keep the tone conversational, insightful, and specifically tailored to THEIR situation. Use emojis sparingly but effectively. Make it feel like a letter from a knowledgeable friend who deeply understands both their portfolio and their personal journey.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1500,
    });
    
    return completion.choices[0]?.message?.content || generateFallbackReport();
  } catch (error) {
    console.error('OpenAI error:', error);
    return generateFallbackReport();
  }
}

function generateFallbackReport() {
  return `
🌟 **Your Weekly Quantum Wealth Report**

Welcome back! This week has been a journey of market dynamics and portfolio evolution.

📊 **Portfolio Performance**
Your holdings have navigated the market's waves this week. The crypto market has shown its characteristic volatility, creating both challenges and opportunities.

🔮 **Cosmic Timing**
The current astrological climate suggests a period of reflection and strategic planning. Trust your intuition while staying grounded in analysis.

💎 **Your Holdings**
Each of your positions tells a story this week. Monitor them closely and remember that patience often rewards the prepared investor.

🌍 **Market Perspective**
Global macro factors continue to influence crypto markets. Institutional adoption grows while regulatory clarity slowly emerges.

🎯 **Week Ahead**
Stay alert to market signals and trust your investment thesis. Your unique perspective is your edge.

*Generated with available data. Connect your portfolio for personalized insights.*
`;
}
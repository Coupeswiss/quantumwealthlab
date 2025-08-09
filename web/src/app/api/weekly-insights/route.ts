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

// Fetch detailed market data for each holding with real-time prices
async function getDetailedMarketData(holdings: any[]) {
  if (!holdings || holdings.length === 0) return {};
  
  try {
    // Map common symbols to CoinGecko IDs
    const symbolToId: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'ADA': 'cardano',
      'AVAX': 'avalanche-2',
      'DOT': 'polkadot',
      'MATIC': 'polygon',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'ARB': 'arbitrum',
      'OP': 'optimism',
      'USDT': 'tether',
      'USDC': 'usd-coin'
    };
    
    const ids = holdings.map(h => {
      const symbol = h.symbol.toUpperCase();
      return symbolToId[symbol] || symbol.toLowerCase();
    }).filter(Boolean).join(',');
    
    if (!ids) return {};
    
    // Fetch comprehensive data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d`,
      { headers: process.env.COINGECKO_API_KEY ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY } : {} }
    );
    
    if (!response.ok) throw new Error('Market data fetch failed');
    
    const data = await response.json();
    const marketData: any = {};
    
    data.forEach((coin: any) => {
      marketData[coin.symbol.toUpperCase()] = {
        name: coin.name,
        price: coin.current_price,
        change1h: coin.price_change_percentage_1h_in_currency || 0,
        change24h: coin.price_change_percentage_24h || 0,
        change7d: coin.price_change_percentage_7d_in_currency || 0,
        change30d: coin.price_change_percentage_30d_in_currency || 0,
        marketCap: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
        volume: coin.total_volume,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        ath: coin.ath,
        athDate: coin.ath_date,
        athChangePercent: coin.ath_change_percentage,
        circulatingSupply: coin.circulating_supply,
        totalSupply: coin.total_supply,
        sparkline: coin.sparkline_in_7d?.price || []
      };
    });
    
    return marketData;
  } catch {
    console.error('Market data error:', error);
    // Fallback to basic prices
    try {
      const response = await fetch('/api/crypto/prices');
      const prices = await response.json();
      const marketData: any = {};
      
      holdings.forEach(h => {
        const symbol = h.symbol.toUpperCase();
        if (prices[symbol]) {
          marketData[symbol] = {
            price: prices[symbol],
            change24h: prices[`${symbol}_change`] || 0
          };
        }
      });
      
      return marketData;
    } catch {
      return {};
    }
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
  } catch {
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
    
  } catch {
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
      totalCost: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      change24h: 0,
      change7d: 0,
      change30d: 0,
      bestPerformer: null,
      worstPerformer: null,
      holdings: [],
      concentration: {},
      risk: "Not assessed",
      dominantAsset: null,
      correlationRisk: "Unknown"
    };
  }
  
  let totalValue = 0;
  let totalCost = 0;
  let totalChange24h = 0;
  let totalChange7d = 0;
  let totalChange30d = 0;
  let best = { symbol: "", change: -Infinity, value: 0 };
  let worst = { symbol: "", change: Infinity, value: 0 };
  const concentration: any = {};
  const detailedHoldings: any[] = [];
  
  holdings.forEach(holding => {
    const data = marketData[holding.symbol?.toUpperCase()];
    if (!data) {
      detailedHoldings.push({
        symbol: holding.symbol,
        amount: holding.amount,
        value: 0,
        price: 0,
        status: "No data available"
      });
      return;
    }
    
    const value = holding.amount * data.price;
    const cost = holding.purchasePrice ? holding.amount * holding.purchasePrice : value;
    const pnl = value - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
    
    totalValue += value;
    totalCost += cost;
    
    // Calculate weighted changes
    totalChange24h += value * (data.change24h / 100);
    totalChange7d += value * (data.change7d / 100);
    totalChange30d += value * (data.change30d / 100);
    
    // Track best/worst performers
    if (data.change7d > best.change) {
      best = { symbol: holding.symbol, change: data.change7d, value };
    }
    if (data.change7d < worst.change) {
      worst = { symbol: holding.symbol, change: data.change7d, value };
    }
    
    concentration[holding.symbol] = value;
    
    // Detailed holding info
    detailedHoldings.push({
      symbol: holding.symbol,
      name: data.name,
      amount: holding.amount,
      value: value,
      price: data.price,
      purchasePrice: holding.purchasePrice,
      pnl: pnl,
      pnlPercent: pnlPercent,
      change1h: data.change1h,
      change24h: data.change24h,
      change7d: data.change7d,
      change30d: data.change30d,
      marketCapRank: data.marketCapRank,
      volume24h: data.volume,
      high24h: data.high24h,
      low24h: data.low24h,
      ath: data.ath,
      athChangePercent: data.athChangePercent,
      weight: 0 // Will calculate after total
    });
  });
  
  // Calculate weights and find dominant asset
  let dominantAsset = null;
  let maxWeight = 0;
  
  detailedHoldings.forEach(h => {
    h.weight = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
    if (h.weight > maxWeight) {
      maxWeight = h.weight;
      dominantAsset = { symbol: h.symbol, weight: h.weight, value: h.value };
    }
  });
  
  // Calculate concentration percentages
  Object.keys(concentration).forEach(symbol => {
    concentration[symbol] = ((concentration[symbol] / totalValue) * 100).toFixed(1) + '%';
  });
  
  // Assess correlation risk
  const btcWeight = detailedHoldings.find(h => h.symbol === 'BTC')?.weight || 0;
  const ethWeight = detailedHoldings.find(h => h.symbol === 'ETH')?.weight || 0;
  const stableWeight = detailedHoldings.filter(h => 
    ['USDT', 'USDC', 'DAI', 'BUSD'].includes(h.symbol)
  ).reduce((sum, h) => sum + h.weight, 0);
  
  let correlationRisk = "Balanced";
  if (btcWeight + ethWeight > 70) correlationRisk = "High BTC/ETH Correlation";
  else if (stableWeight > 30) correlationRisk = "Conservative (High Stables)";
  else if (maxWeight > 50) correlationRisk = "Concentrated Position Risk";
  
  return {
    totalValue,
    totalCost,
    totalPnL: totalValue - totalCost,
    totalPnLPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    change24h: totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0,
    change7d: totalValue > 0 ? (totalChange7d / totalValue) * 100 : 0,
    change30d: totalValue > 0 ? (totalChange30d / totalValue) * 100 : 0,
    bestPerformer: best.symbol ? best : null,
    worstPerformer: worst.symbol ? worst : null,
    holdings: detailedHoldings.sort((a, b) => b.value - a.value),
    concentration,
    risk: assessRisk(concentration),
    dominantAsset,
    correlationRisk
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
  
  // Build detailed holdings description
  const holdingsDetail = analysis.holdings.map((h: any) => {
    const emoji = h.change7d > 5 ? '🚀' : h.change7d > 0 ? '📈' : h.change7d < -5 ? '💔' : '📉';
    const pnlEmoji = h.pnlPercent > 10 ? '💎' : h.pnlPercent > 0 ? '✅' : '⚠️';
    return `${h.symbol} (${h.weight.toFixed(1)}% of portfolio):
  - Amount: ${h.amount} @ $${h.price.toFixed(h.price > 100 ? 0 : 2)} = $${h.value.toFixed(0)}
  - P&L: ${pnlEmoji} ${h.pnlPercent > 0 ? '+' : ''}${h.pnlPercent.toFixed(1)}% ($${h.pnl > 0 ? '+' : ''}${h.pnl.toFixed(0)})
  - This Week: ${emoji} ${h.change7d > 0 ? '+' : ''}${h.change7d.toFixed(1)}%
  - 24h Range: $${h.low24h?.toFixed(2)} - $${h.high24h?.toFixed(2)}
  - ATH Distance: ${h.athChangePercent?.toFixed(0)}% from $${h.ath?.toFixed(2)}`;
  }).join('\n\n');
  
  const prompt = `You are writing a personalized weekly crypto portfolio report for ${profile.name || "an investor"}.

COMPLETE USER PROFILE:
- Name: ${profile.name}
- Astrology: ${profile.sunSign} Sun (${profile.elemental?.qualities?.wealthStyle}), ${profile.moonSign} Moon (emotional trading patterns), ${profile.risingSign} Rising
- Dominant Element: ${profile.elemental?.element} - ${profile.elemental?.balance ? `Fire:${profile.elemental.balance.fire} Earth:${profile.elemental.balance.earth} Air:${profile.elemental.balance.air} Water:${profile.elemental.balance.water}` : ""}
- Investment Profile: ${profile.experience} experience, ${profile.riskTolerance} risk tolerance, ${profile.timeHorizon} horizon
- Personal Mission: "${profile.intention}"
- Current Challenge: "${profile.biggestChallenge}"
- Vision: "${profile.idealOutcome}"

DETAILED PORTFOLIO ANALYSIS:
Total Portfolio Value: $${analysis.totalValue.toFixed(2)}
Total Cost Basis: $${analysis.totalCost.toFixed(2)}
Overall P&L: ${analysis.totalPnLPercent > 0 ? '🟢' : '🔴'} ${analysis.totalPnLPercent > 0 ? '+' : ''}${analysis.totalPnLPercent.toFixed(1)}% ($${analysis.totalPnL > 0 ? '+' : ''}${analysis.totalPnL.toFixed(2)})

Performance Metrics:
- 24 Hour: ${analysis.change24h > 0 ? '+' : ''}${analysis.change24h.toFixed(2)}%
- 7 Day: ${analysis.change7d > 0 ? '+' : ''}${analysis.change7d.toFixed(2)}%
- 30 Day: ${analysis.change30d > 0 ? '+' : ''}${analysis.change30d.toFixed(2)}%

Risk Analysis:
- Concentration Risk: ${analysis.risk}
- Correlation Risk: ${analysis.correlationRisk}
- Dominant Position: ${analysis.dominantAsset ? `${analysis.dominantAsset.symbol} at ${analysis.dominantAsset.weight.toFixed(1)}%` : 'Well balanced'}

INDIVIDUAL HOLDINGS DEEP DIVE:
${holdingsDetail}

Best Performer: ${analysis.bestPerformer?.symbol} (+${analysis.bestPerformer?.change?.toFixed(1)}% this week, $${analysis.bestPerformer?.value?.toFixed(0)} position)
Worst Performer: ${analysis.worstPerformer?.symbol} (${analysis.worstPerformer?.change?.toFixed(1)}% this week, $${analysis.worstPerformer?.value?.toFixed(0)} position)

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
  } catch {
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
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fetch detailed coin data from CoinGecko
async function getCoinData(symbol: string) {
  try {
    const coinMap: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      BNB: 'binancecoin',
      XRP: 'ripple',
      ADA: 'cardano',
      AVAX: 'avalanche-2',
      DOT: 'polkadot',
      MATIC: 'polygon',
      LINK: 'chainlink',
      UNI: 'uniswap',
      ATOM: 'cosmos',
      ARB: 'arbitrum',
      OP: 'optimism',
      INJ: 'injective-protocol'
    };

    const coinId = coinMap[symbol.toUpperCase()] || symbol.toLowerCase();
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=true&developer_data=true`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      name: data.name,
      symbol: symbol.toUpperCase(),
      currentPrice: data.market_data?.current_price?.usd || 0,
      priceChange24h: data.market_data?.price_change_percentage_24h || 0,
      priceChange7d: data.market_data?.price_change_percentage_7d || 0,
      priceChange30d: data.market_data?.price_change_percentage_30d || 0,
      marketCap: data.market_data?.market_cap?.usd || 0,
      marketCapRank: data.market_cap_rank || 0,
      volume24h: data.market_data?.total_volume?.usd || 0,
      circulatingSupply: data.market_data?.circulating_supply || 0,
      totalSupply: data.market_data?.total_supply || 0,
      ath: data.market_data?.ath?.usd || 0,
      athDate: data.market_data?.ath_date?.usd || '',
      atl: data.market_data?.atl?.usd || 0,
      atlDate: data.market_data?.atl_date?.usd || '',
      description: data.description?.en?.substring(0, 500) || '',
      sentiment: {
        upVotes: data.sentiment_votes_up_percentage || 50,
        downVotes: data.sentiment_votes_down_percentage || 50
      },
      developerScore: data.developer_score || 0,
      communityScore: data.community_score || 0,
      liquidityScore: data.liquidity_score || 0,
      publicInterestScore: data.public_interest_score || 0
    };
  } catch (error) {
    console.error(`Failed to fetch data for ${symbol}:`, error);
    return null;
  }
}

// Fetch macro economic data
async function getMacroData() {
  try {
    // In production, you'd use APIs like Alpha Vantage, Fred, or Trading Economics
    // For now, we'll simulate with key indicators
    return {
      sp500: { value: 4750, change: 0.8, trend: "bullish" },
      dxy: { value: 104.5, change: -0.3, trend: "weakening" },
      gold: { value: 2050, change: 0.5, trend: "stable" },
      oil: { value: 78, change: -1.2, trend: "declining" },
      vix: { value: 14.5, change: -5.0, trend: "low volatility" },
      yield10y: { value: 4.25, change: 0.02, trend: "rising" },
      inflation: { value: 3.2, change: -0.1, trend: "cooling" },
      fedRate: { value: 5.5, nextMeeting: "Jan 31", expectation: "hold" }
    };
  } catch (error) {
    console.error("Failed to fetch macro data:", error);
    return null;
  }
}

// Fetch crypto market news
async function getMarketNews() {
  try {
    // In production, integrate with news APIs like CryptoPanic, NewsAPI, etc.
    // Simulated news for demonstration
    return [
      {
        title: "Bitcoin ETF Sees Record Inflows",
        source: "Bloomberg",
        sentiment: "bullish",
        impact: "high",
        coins: ["BTC"]
      },
      {
        title: "Ethereum Dencun Upgrade Successfully Deployed",
        source: "CoinDesk",
        sentiment: "bullish",
        impact: "medium",
        coins: ["ETH", "ARB", "OP"]
      },
      {
        title: "Fed Signals Potential Rate Cuts in Q2",
        source: "Reuters",
        sentiment: "bullish",
        impact: "high",
        coins: ["BTC", "ETH"]
      }
    ];
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { profile, portfolio } = await req.json();

    if (!portfolio || portfolio.length === 0) {
      return NextResponse.json({
        error: "No portfolio holdings to analyze",
        analysis: null
      });
    }

    // Fetch detailed data for each holding
    const holdingsWithData = await Promise.all(
      portfolio.map(async (holding: any) => {
        const coinData = await getCoinData(holding.symbol);
        return {
          ...holding,
          data: coinData,
          performance: coinData ? {
            daily: (coinData.priceChange24h || 0).toFixed(2),
            weekly: (coinData.priceChange7d || 0).toFixed(2),
            monthly: (coinData.priceChange30d || 0).toFixed(2),
            fromAth: coinData.ath ? (((coinData.currentPrice - coinData.ath) / coinData.ath) * 100).toFixed(2) : 0
          } : null
        };
      })
    );

    // Get macro data and news
    const [macroData, newsData] = await Promise.all([
      getMacroData(),
      getMarketNews()
    ]);

    // Calculate portfolio metrics
    const totalValue = holdingsWithData.reduce((sum, h) => sum + (h.value || 0), 0);
    const weights = holdingsWithData.map(h => ({
      symbol: h.symbol,
      weight: ((h.value / totalValue) * 100).toFixed(2)
    }));

    // Generate AI analysis if API key is available
    let aiAnalysis = null;
    if (openai.apiKey) {
      const analysisPrompt = `
You are a senior portfolio analyst providing a WEEKLY PORTFOLIO REVIEW. Be analytical, data-driven, and perspective-focused (not advice).

USER PROFILE:
- Name: ${profile.name}
- Astrological: ${profile.sunSign} Sun, ${profile.moonSign} Moon, ${profile.risingSign} Rising
- Element: ${profile.elemental?.element} (influences ${getElementalPerspective(profile.elemental?.element)})
- Risk Profile: ${profile.riskTolerance}
- Experience: ${profile.experience}
- Intention: "${profile.intention}"
- Challenge: "${profile.biggestChallenge}"

CURRENT PORTFOLIO (Total Value: $${totalValue.toLocaleString()}):
${holdingsWithData.map(h => `
- ${h.symbol}: ${h.amount} units ($${h.value?.toLocaleString()}) - ${weights.find(w => w.symbol === h.symbol)?.weight}% of portfolio
  Performance: 24h ${h.performance?.daily}% | 7d ${h.performance?.weekly}% | 30d ${h.performance?.monthly}%
  Market Cap Rank: #${h.data?.marketCapRank || 'N/A'}
  Sentiment: ${h.data?.sentiment?.upVotes || 50}% positive
  ${h.data?.description?.substring(0, 150) || ''}
`).join('\n')}

MACRO ENVIRONMENT:
- S&P 500: ${macroData?.sp500?.value} (${macroData?.sp500?.change > 0 ? '+' : ''}${macroData?.sp500?.change}%)
- Dollar Index: ${macroData?.dxy?.value} (${macroData?.dxy?.trend})
- VIX: ${macroData?.vix?.value} (${macroData?.vix?.trend})
- 10Y Yield: ${macroData?.yield10y?.value}%
- Fed Rate: ${macroData?.fedRate?.value}% (Next: ${macroData?.fedRate?.nextMeeting})

RECENT NEWS IMPACTING PORTFOLIO:
${newsData?.map((n: any) => `- ${n.title} (${n.sentiment}, affects: ${n.coins.join(', ')})`).join('\n')}

ASTROLOGICAL TIMING:
- Current lunar phase: ${getCurrentLunarPhase()}
- Mercury: ${getMercuryStatus()}
- Major aspects this week: ${getWeeklyAspects()}

Provide a WEEKLY PORTFOLIO PERSPECTIVE that includes:
1. PORTFOLIO PERFORMANCE ANALYSIS - How holdings performed relative to market conditions
2. CORRELATION INSIGHTS - How holdings move together, concentration risks
3. MACRO CONTEXT - How global factors affected the portfolio this week
4. ASTROLOGICAL PERSPECTIVE - Timing insights based on their chart and current transits
5. NOTABLE DEVELOPMENTS - Key events affecting specific holdings
6. PORTFOLIO HEALTH CHECK - Alignment with stated goals and risk tolerance

Be specific about THEIR holdings, reference actual performance numbers, and provide perspective (not advice) on what happened and why. Connect everything to their personal profile and intentions.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: analysisPrompt }],
          temperature: 0.7,
          max_tokens: 1000,
        });

        aiAnalysis = completion.choices[0]?.message?.content;
      } catch (error) {
        console.error("AI analysis failed:", error);
      }
    }

    const response = {
      timestamp: new Date().toISOString(),
      weekNumber: getWeekNumber(),
      portfolio: {
        totalValue,
        holdings: holdingsWithData,
        weights,
        performance: {
          day: calculatePortfolioChange(holdingsWithData, 'daily'),
          week: calculatePortfolioChange(holdingsWithData, 'weekly'),
          month: calculatePortfolioChange(holdingsWithData, 'monthly')
        }
      },
      macro: macroData,
      news: newsData,
      astrologicalContext: {
        lunarPhase: getCurrentLunarPhase(),
        mercuryStatus: getMercuryStatus(),
        weeklyAspects: getWeeklyAspects(),
        personalTransits: getPersonalTransits(profile)
      },
      analysis: aiAnalysis || generateFallbackAnalysis(holdingsWithData, profile, macroData)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Portfolio analysis error:", error);
    return NextResponse.json({ 
      error: "Failed to analyze portfolio",
      analysis: null
    }, { status: 500 });
  }
}

function getElementalPerspective(element: string): string {
  const perspectives: Record<string, string> = {
    Fire: "quick action and momentum plays",
    Earth: "stability and fundamental value",
    Air: "information flow and social trends",
    Water: "emotional cycles and intuition"
  };
  return perspectives[element] || "balanced approach";
}

function getCurrentLunarPhase(): string {
  const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const day = new Date().getDate();
  return phases[Math.floor((day % 29.5) / 3.69)];
}

function getMercuryStatus(): string {
  // Simplified - in production, use ephemeris data
  const month = new Date().getMonth();
  return [2, 6, 10].includes(month) ? "Retrograde - review positions" : "Direct - normal operations";
}

function getWeeklyAspects(): string {
  // Simplified - would integrate real ephemeris
  const aspects = [
    "Mars trine Jupiter - expansion energy",
    "Venus square Saturn - value reassessment",
    "Sun conjunct Mercury - clarity in communication"
  ];
  return aspects[Math.floor(Math.random() * aspects.length)];
}

function getPersonalTransits(profile: any): string {
  if (!profile.sunSign) return "No birth data for personal transits";
  return `Transit Jupiter in ${profile.sunSign === 'Taurus' ? 'your sign - growth period' : 'aspect to your sun'}`;
}

function getWeekNumber(): number {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function calculatePortfolioChange(holdings: any[], period: string): number {
  const weighted = holdings.reduce((sum, h) => {
    const change = h.performance?.[period] || 0;
    const weight = h.value / holdings.reduce((s, holding) => s + holding.value, 0);
    return sum + (change * weight);
  }, 0);
  return Number(weighted.toFixed(2));
}

function generateFallbackAnalysis(holdings: any[], profile: any, macro: any): string {
  const topPerformer = holdings.reduce((best, h) => 
    (h.performance?.weekly || 0) > (best.performance?.weekly || 0) ? h : best
  );
  
  const worstPerformer = holdings.reduce((worst, h) => 
    (h.performance?.weekly || 0) < (worst.performance?.weekly || 0) ? h : worst
  );

  return `Weekly Portfolio Review:

Performance Summary:
- Best Performer: ${topPerformer.symbol} (+${topPerformer.performance?.weekly}% this week)
- Worst Performer: ${worstPerformer.symbol} (${worstPerformer.performance?.weekly}% this week)
- Portfolio concentration: ${holdings[0]?.symbol} represents ${((holdings[0]?.value / holdings.reduce((s, h) => s + h.value, 0)) * 100).toFixed(1)}% of holdings

Market Context:
- ${macro?.vix?.value < 20 ? 'Low volatility environment' : 'Elevated volatility'} with VIX at ${macro?.vix?.value}
- Dollar ${macro?.dxy?.trend} affecting crypto valuations
- Risk assets ${macro?.sp500?.change > 0 ? 'positive' : 'negative'} with S&P ${macro?.sp500?.change > 0 ? '+' : ''}${macro?.sp500?.change}%

Your ${profile.sunSign} sun suggests ${profile.sunSign === 'Aries' ? 'bold moves may be rewarded' : profile.sunSign === 'Virgo' ? 'careful analysis before action' : 'staying aligned with your nature'} during this ${getCurrentLunarPhase()} phase.`;
}
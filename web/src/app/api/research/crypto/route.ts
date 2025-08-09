import { NextResponse } from "next/server";

// Research multiple crypto and macro data sources
async function fetchCryptoNews(query?: string) {
  const sources = [];
  
  try {
    // CoinGecko trending & search
    const geckoRes = await fetch(
      `https://api.coingecko.com/api/v3/search/trending`,
      { next: { revalidate: 300 } }
    );
    if (geckoRes.ok) {
      const data = await geckoRes.json();
      sources.push({
        source: "CoinGecko",
        trending: data.coins?.slice(0, 5).map((c: any) => ({
          name: c.item.name,
          symbol: c.item.symbol,
          rank: c.item.market_cap_rank,
          thumb: c.item.thumb,
          price_btc: c.item.price_btc
        }))
      });
    }
        } catch {
    console.error("CoinGecko error:", e);
  }
  
  try {
    // CryptoCompare news
    const ccRes = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest`,
      { next: { revalidate: 300 } }
    );
    if (ccRes.ok) {
      const data = await ccRes.json();
      sources.push({
        source: "CryptoCompare",
        news: data.Data?.slice(0, 10).map((n: any) => ({
          title: n.title,
          body: n.body?.substring(0, 200),
          url: n.url,
          source: n.source,
          tags: n.tags,
          published: new Date(n.published_on * 1000).toISOString()
        }))
      });
    }
        } catch {
    console.error("CryptoCompare error:", e);
  }
  
  // Add specific coin research if query provided
  if (query) {
    try {
      const coinRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${query.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false`,
        { next: { revalidate: 300 } }
      );
      if (coinRes.ok) {
        const coin = await coinRes.json();
        sources.push({
          source: "CoinGecko Detailed",
          coin: {
            name: coin.name,
            symbol: coin.symbol,
            price: coin.market_data?.current_price?.usd,
            change24h: coin.market_data?.price_change_percentage_24h,
            change7d: coin.market_data?.price_change_percentage_7d,
            marketCap: coin.market_data?.market_cap?.usd,
            volume: coin.market_data?.total_volume?.usd,
            ath: coin.market_data?.ath?.usd,
            athDate: coin.market_data?.ath_date?.usd,
            sentiment: coin.sentiment_votes_up_percentage,
            description: coin.description?.en?.substring(0, 500)
          }
        });
      }
          } catch {
      console.error("Coin detail error:", e);
    }
  }
  
  return sources;
}

// Fetch macro economic data
async function fetchMacroData() {
  const indicators = [];
  
  try {
    // DXY (Dollar Index) - use alternative source
    const dxyRes = await fetch(
      `https://api.investing.com/api/financialdata/8827/historical/chart?period=P1D&interval=PT1H&pointscount=60`,
      { 
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 3600 } 
      }
    );
    if (dxyRes.ok) {
      const data = await dxyRes.json();
      indicators.push({
        name: "US Dollar Index",
        value: data.data?.[data.data.length - 1]?.[1],
        change: ((data.data?.[data.data.length - 1]?.[1] - data.data?.[0]?.[1]) / data.data?.[0]?.[1] * 100).toFixed(2)
      });
    }
        } catch {
    // Fallback DXY value
    indicators.push({
      name: "US Dollar Index",
      value: 104.5 + (Math.random() * 2 - 1),
      change: (Math.random() * 2 - 1).toFixed(2)
    });
  }
  
  // Add more macro indicators (simulated for now, replace with real APIs)
  indicators.push(
    {
      name: "S&P 500",
      value: 5800 + Math.random() * 100,
      change: (Math.random() * 3 - 1.5).toFixed(2)
    },
    {
      name: "Gold",
      value: 2650 + Math.random() * 50,
      change: (Math.random() * 2 - 1).toFixed(2)
    },
    {
      name: "10Y Treasury",
      value: 4.25 + Math.random() * 0.2,
      change: (Math.random() * 0.1).toFixed(3)
    }
  );
  
  return indicators;
}

export async function POST(req: Request) {
  try {
    const { holdings, profile, searchQuery } = await req.json();
    
    // Fetch general crypto news and trends
    const cryptoData = await fetchCryptoNews(searchQuery);
    
    // Fetch macro data
    const macroData = await fetchMacroData();
    
    // Research specific holdings
    const holdingsResearch = [];
    if (holdings && holdings.length > 0) {
      for (const holding of holdings.slice(0, 5)) { // Limit to top 5
        const coinData = await fetchCryptoNews(holding.symbol);
        if (coinData.length > 0) {
          holdingsResearch.push({
            symbol: holding.symbol,
            research: coinData
          });
        }
      }
    }
    
    // Generate personalized analysis
    const analysis = generatePersonalizedAnalysis(profile, cryptoData, macroData, holdingsResearch);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      crypto: cryptoData,
      macro: macroData,
      holdings: holdingsResearch,
      analysis
    });
    
  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch research data",
      timestamp: new Date().toISOString()
    });
  }
}

function generatePersonalizedAnalysis(profile: any, crypto: any[], macro: any[], holdings: any[]) {
  const riskProfile = profile?.riskTolerance || "moderate";
  const sunSign = profile?.sunSign || "Unknown";
  
  // Generate market conditions assessment
  const marketConditions = {
    trend: crypto[0]?.trending ? "Bullish momentum in trending coins" : "Market consolidating",
    macro: macro[0]?.change > 0 ? "Dollar strengthening" : "Dollar weakening",
    recommendation: getRiskBasedRecommendation(riskProfile, macro)
  };
  
  // Sign-specific timing
  const astroTiming = {
    favorable: ["Aries", "Leo", "Sagittarius"].includes(sunSign) ? "Action favored" : "Patience recommended",
    focus: getElementFocus(sunSign)
  };
  
  return {
    marketConditions,
    astroTiming,
    keyInsights: [
      `Based on your ${riskProfile} risk profile, ${marketConditions.recommendation}`,
      `Your ${sunSign} energy aligns with ${astroTiming.focus}`,
      holdings.length > 0 ? `Your top holding shows ${holdings[0]?.research?.[0]?.coin?.change24h || 0}% movement` : "Consider diversifying your portfolio"
    ]
  };
}

function getRiskBasedRecommendation(risk: string, macro: any[]): string {
  const dollarStrong = macro[0]?.change > 0;
  
  if (risk === "conservative") {
    return dollarStrong ? "Consider stable coins and blue-chip cryptos" : "Hold current positions";
  } else if (risk === "aggressive") {
    return dollarStrong ? "Look for oversold opportunities" : "Consider taking profits on winners";
  }
  return "Maintain balanced allocation across sectors";
}

function getElementFocus(sign: string): string {
  const elements: { [key: string]: string } = {
    Aries: "momentum plays", Leo: "leadership tokens", Sagittarius: "growth opportunities",
    Taurus: "value investments", Virgo: "utility tokens", Capricorn: "established projects",
    Gemini: "information tokens", Libra: "DeFi protocols", Aquarius: "innovation sectors",
    Cancer: "community coins", Scorpio: "privacy tokens", Pisces: "creative projects"
  };
  return elements[sign] || "balanced approach";
}
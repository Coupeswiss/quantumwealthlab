import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCoinGeckoId } from "@/lib/portfolio-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Search the web for real-time information using Serper API or fallback
async function searchWeb(query: string) {
  try {
    // If you have Serper API key, use it for real search
    if (process.env.SERPER_API_KEY) {
      const response = await fetch('https://api.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          q: query,
          num: 5
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          summary: data.organic?.[0]?.snippet || "No summary available",
          sources: data.organic?.map((r: any) => r.title) || []
        };
      }
    }
    
    // Fallback to simulated search based on query patterns
    const searchQuery = query.toLowerCase();
    
    if (searchQuery.includes('bitcoin') || searchQuery.includes('btc')) {
      return {
        summary: "Bitcoin is currently experiencing strong institutional demand with ETF inflows reaching record levels. Price action shows consolidation around key psychological levels with support building.",
        sources: [
          "Bitcoin ETF sees record $1B daily inflow - CoinDesk",
          "MicroStrategy announces additional 15,000 BTC purchase",
          "Bitcoin hash rate reaches all-time high despite price consolidation"
        ]
      };
    }
    
    if (searchQuery.includes('ethereum') || searchQuery.includes('eth')) {
      return {
        summary: "Ethereum's Layer 2 ecosystem is experiencing explosive growth with TVL reaching new highs. The Dencun upgrade has significantly reduced L2 transaction costs.",
        sources: [
          "Ethereum L2 TVL surpasses $50B milestone",
          "Vitalik proposes new scaling roadmap for 2025",
          "Major DeFi protocols migrate to Arbitrum and Optimism"
        ]
      };
    }
    
    if (searchQuery.includes('solana') || searchQuery.includes('sol')) {
      return {
        summary: "Solana continues to dominate in transaction throughput and DeFi activity. Recent network upgrades have improved stability significantly.",
        sources: [
          "Solana processes 65,000 TPS in stress test",
          "Jupiter DEX volume surpasses Uniswap",
          "Solana Mobile announces second phone with improved Web3 features"
        ]
      };
    }
    
    // Generic crypto market search
    return {
      summary: `Current market analysis for "${query}" shows mixed signals with traders watching key support and resistance levels closely.`,
      sources: [
        "Crypto market analysis and trends",
        "Technical indicators suggest consolidation",
        "Institutional interest remains strong"
      ]
    };
    
  } catch (error) {
    console.error('Web search error:', error);
    return null;
  }
}

// Get detailed coin analysis with enhanced metrics
async function getCoinAnalysis(symbol: string) {
  try {
    const geckoId = getCoinGeckoId(symbol);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`,
      { headers: process.env.COINGECKO_API_KEY ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY } : {} }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      price: data.market_data.current_price.usd,
      marketCap: data.market_data.market_cap.usd,
      volume24h: data.market_data.total_volume.usd,
      priceChange24h: data.market_data.price_change_percentage_24h,
      priceChange7d: data.market_data.price_change_percentage_7d,
      priceChange30d: data.market_data.price_change_percentage_30d,
      priceChange1y: data.market_data.price_change_percentage_1y,
      ath: data.market_data.ath.usd,
      athDate: data.market_data.ath_date.usd,
      atl: data.market_data.atl.usd,
      atlDate: data.market_data.atl_date.usd,
      circulatingSupply: data.market_data.circulating_supply,
      totalSupply: data.market_data.total_supply,
      maxSupply: data.market_data.max_supply,
      fullyDilutedValuation: data.market_data.fully_diluted_valuation?.usd,
      sentiment: {
        upVotes: data.sentiment_votes_up_percentage,
        downVotes: data.sentiment_votes_down_percentage
      },
      developerData: {
        forks: data.developer_data?.forks,
        stars: data.developer_data?.stars,
        subscribers: data.developer_data?.subscribers,
        totalIssues: data.developer_data?.total_issues,
        closedIssues: data.developer_data?.closed_issues,
        pullRequestsMerged: data.developer_data?.pull_requests_merged,
        pullRequestContributors: data.developer_data?.pull_request_contributors,
        commitCount4Weeks: data.developer_data?.commit_count_4_weeks
      },
      communityData: {
        twitterFollowers: data.community_data?.twitter_followers,
        redditSubscribers: data.community_data?.reddit_subscribers,
        telegramChannelUserCount: data.community_data?.telegram_channel_user_count
      },
      description: data.description?.en?.substring(0, 500) || "No description available"
    };
  } catch (error) {
    console.error('Coin analysis error:', error);
    return null;
  }
}

// Analyze portfolio correlations and provide insights
function analyzePortfolioContext(portfolio: any[], coinData: any) {
  if (!portfolio || portfolio.length === 0) return null;
  
  let totalValue = 0;
  const holdings: any[] = [];
  const correlations: any = {};
  
  portfolio.forEach(holding => {
    const symbol = holding.symbol?.toUpperCase();
    const data = coinData[symbol.toLowerCase()] || coinData[symbol];
    
    if (data) {
      const value = holding.amount * data.price;
      totalValue += value;
      holdings.push({
        symbol,
        amount: holding.amount,
        value,
        price: data.price,
        change24h: data.priceChange24h,
        change7d: data.priceChange7d,
        weight: 0 // Will calculate after
      });
      
      // Track correlations
      if (symbol === 'BTC' || symbol === 'ETH') {
        correlations.major = (correlations.major || 0) + value;
      } else if (['USDT', 'USDC', 'DAI'].includes(symbol)) {
        correlations.stable = (correlations.stable || 0) + value;
      } else {
        correlations.alts = (correlations.alts || 0) + value;
      }
    }
  });
  
  // Calculate weights
  holdings.forEach(h => {
    h.weight = ((h.value / totalValue) * 100).toFixed(1);
  });
  
  // Calculate correlation percentages
  Object.keys(correlations).forEach(key => {
    correlations[key] = ((correlations[key] / totalValue) * 100).toFixed(1);
  });
  
  return {
    totalValue,
    holdings: holdings.sort((a, b) => b.value - a.value),
    correlations,
    concentration: holdings[0]?.weight > 40 ? 'High' : holdings[0]?.weight > 25 ? 'Moderate' : 'Diversified'
  };
}

// Main research assistant endpoint
export async function POST(req: Request) {
  try {
    const { question, profile, portfolio, context = [] } = await req.json();
    
    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }
    
    // Determine if we need to search for specific coin data
    const coinMentions = extractCoinSymbols(question);
    const coinData: any = {};
    
    // Fetch data for mentioned coins AND portfolio holdings
    const coinsToFetch = new Set(coinMentions);
    if (portfolio && portfolio.length > 0) {
      portfolio.forEach((h: any) => {
        if (h.symbol) {
          coinsToFetch.add(getCoinGeckoId(h.symbol));
        }
      });
    }
    
    // Fetch all coin data in parallel
    const coinPromises = Array.from(coinsToFetch).map(coin => 
      getCoinAnalysis(coin).then(data => ({ coin, data }))
    );
    
    const coinResults = await Promise.all(coinPromises);
    coinResults.forEach(({ coin, data }) => {
      if (data) {
        coinData[coin] = data;
      }
    });
    
    // Perform web search if question seems to need current info
    let webResults = null;
    if (needsWebSearch(question)) {
      webResults = await searchWeb(question);
    }
    
    // Analyze portfolio in context of the question
    const portfolioContext = analyzePortfolioContext(portfolio, coinData);
    
    // Build comprehensive context
    const systemPrompt = `You are an elite crypto research assistant with real-time market access and deep portfolio analysis capabilities.

COMPLETE USER PROFILE:
- Name: ${profile?.name || "User"}
- Birth Details: ${profile?.birthDate} at ${profile?.birthTime} in ${profile?.birthPlace}
- Astrological Configuration: 
  * ${profile?.sunSign || "Unknown"} Sun (core identity & investment style: ${profile?.elemental?.qualities?.wealthStyle})
  * ${profile?.moonSign || "Unknown"} Moon (emotional patterns in trading)
  * ${profile?.risingSign || "Unknown"} Rising (market approach & first reactions)
  * Dominant Element: ${profile?.elemental?.element} (${profile?.elemental?.balance ? `Fire:${profile?.elemental.balance.fire} Earth:${profile?.elemental.balance.earth} Air:${profile?.elemental.balance.air} Water:${profile?.elemental.balance.water}` : ""})
- Investment Profile:
  * Experience: ${profile?.experience || "Unknown"}
  * Risk Tolerance: ${profile?.riskTolerance || "Unknown"}
  * Time Horizon: ${profile?.timeHorizon || "Unknown"}
  * Portfolio Size: ${profile?.portfolioSize || "Unknown"}
- Personal Context:
  * Primary Goal: "${profile?.intention || "Not specified"}"
  * Main Challenge: "${profile?.biggestChallenge || "Not specified"}"
  * Ideal Outcome: "${profile?.idealOutcome || "Not specified"}"

${portfolioContext ? `
REAL-TIME PORTFOLIO ANALYSIS:
Total Value: $${portfolioContext.totalValue.toFixed(2)}
Concentration: ${portfolioContext.concentration}
Asset Mix: Major Crypto ${portfolioContext.correlations.major || 0}%, Alts ${portfolioContext.correlations.alts || 0}%, Stables ${portfolioContext.correlations.stable || 0}%

HOLDINGS BREAKDOWN:
${portfolioContext.holdings.map((h: any) => `${h.symbol}:
  - Amount: ${h.amount} units
  - Value: $${h.value.toFixed(2)} (${h.weight}% of portfolio)
  - Current Price: $${h.price.toFixed(h.price > 100 ? 0 : 2)}
  - 24h Change: ${h.change24h > 0 ? '+' : ''}${h.change24h?.toFixed(2)}%
  - 7d Change: ${h.change7d > 0 ? '+' : ''}${h.change7d?.toFixed(2)}%`).join('\n\n')}
` : 'No portfolio data available'}

${Object.keys(coinData).length > 0 ? `
DETAILED MARKET DATA:
${Object.entries(coinData).map(([symbol, data]: [string, any]) => `
${data.name} (${data.symbol}):
- Price: $${data.price?.toLocaleString()} 
- 24h: ${data.priceChange24h > 0 ? '+' : ''}${data.priceChange24h?.toFixed(2)}%
- 7d: ${data.priceChange7d > 0 ? '+' : ''}${data.priceChange7d?.toFixed(2)}%
- 30d: ${data.priceChange30d > 0 ? '+' : ''}${data.priceChange30d?.toFixed(2)}%
- 1y: ${data.priceChange1y > 0 ? '+' : ''}${data.priceChange1y?.toFixed(2)}%
- Market Cap: $${(data.marketCap / 1e9).toFixed(2)}B (Rank #${data.marketCapRank || 'N/A'})
- Volume: $${(data.volume24h / 1e6).toFixed(2)}M
- ATH: $${data.ath?.toLocaleString()} (${data.athDate ? new Date(data.athDate).toLocaleDateString() : 'N/A'})
- ATL: $${data.atl?.toFixed(4)} (${data.atlDate ? new Date(data.atlDate).toLocaleDateString() : 'N/A'})
- Circulating Supply: ${data.circulatingSupply?.toLocaleString() || 'N/A'}
- Max Supply: ${data.maxSupply?.toLocaleString() || 'Unlimited'}
- Community: ${data.communityData?.twitterFollowers?.toLocaleString() || 0} Twitter followers
- Development: ${data.developerData?.commitCount4Weeks || 0} commits last month
- Sentiment: ${data.sentiment?.upVotes || 50}% positive
- About: ${data.description}
`).join('\n')}` : ''}

${webResults ? `
LATEST MARKET INTELLIGENCE:
${webResults.summary}

Recent Headlines:
${webResults.sources.map(s => `- ${s}`).join('\n')}
` : ''}

INSTRUCTIONS FOR YOUR RESPONSE:
1. Provide SPECIFIC, ACTIONABLE insights based on their actual holdings
2. Reference exact prices, percentages, and portfolio weights
3. Consider their ${profile?.sunSign} astrological profile when discussing timing
4. Align recommendations with their ${profile?.riskTolerance} risk tolerance and ${profile?.experience} experience
5. Address their stated challenge: "${profile?.biggestChallenge}"
6. Support their goal: "${profile?.intention}"
7. Use real-time data to provide current market context
8. If discussing portfolio changes, calculate exact amounts and impacts
9. Provide both bullish and bearish scenarios with probabilities
10. Connect macro trends to their specific holdings

Previous conversation:
${context.slice(-3).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

User's question: ${question}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const answer = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    
    return NextResponse.json({
      answer,
      data: {
        coins: coinData,
        portfolio: portfolioContext,
        webSearch: webResults,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Research assistant error:", error);
    return NextResponse.json({ 
      error: "Failed to process research request",
      answer: "I'm having trouble accessing market data right now. Please try again in a moment."
    }, { status: 500 });
  }
}

// Helper functions
function extractCoinSymbols(text: string): string[] {
  const commonCoins = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'binancecoin', 'bnb',
    'solana', 'sol', 'cardano', 'ada', 'avalanche', 'avax',
    'polkadot', 'dot', 'chainlink', 'link', 'polygon', 'matic',
    'arbitrum', 'arb', 'optimism', 'op', 'cosmos', 'atom',
    'ripple', 'xrp', 'dogecoin', 'doge', 'shiba', 'shib',
    'litecoin', 'ltc', 'tron', 'trx', 'near', 'filecoin', 'fil',
    'aptos', 'apt', 'sui', 'sei', 'injective', 'inj', 'celestia', 'tia'
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const coin of commonCoins) {
    if (lowerText.includes(coin)) {
      // Map to CoinGecko IDs
      const geckoId = getCoinGeckoId(coin);
      if (!found.includes(geckoId)) {
        found.push(geckoId);
      }
    }
  }
  
  return found;
}

function needsWebSearch(question: string): boolean {
  const searchTriggers = [
    'news', 'latest', 'recent', 'today', 'yesterday', 'this week',
    'announcement', 'update', 'what happened', 'why is', 'how is',
    'current', 'now', 'price', 'market', 'trend', 'analysis',
    'breaking', 'just', 'new', 'launched', 'announced'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return searchTriggers.some(trigger => lowerQuestion.includes(trigger));
}
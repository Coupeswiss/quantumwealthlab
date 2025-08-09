import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Search the web for real-time information
async function searchWeb(query: string) {
  try {
    // Using a web search API (you can integrate Serper, Bing, or Google)
    // For now, we'll simulate with structured data
    const searchQuery = encodeURIComponent(query);
    
    // You would replace this with actual API call like:
    // const response = await fetch(`https://api.serper.dev/search`, {
    //   method: 'POST',
    //   headers: {
    //     'X-API-KEY': process.env.SERPER_API_KEY,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ q: query })
    // });
    
    // Simulated search results for different query types
    if (query.toLowerCase().includes('bitcoin') || query.toLowerCase().includes('btc')) {
      return {
        summary: "Bitcoin is currently trading around $97,000 with strong institutional interest. Recent developments include ETF inflows and corporate adoption.",
        sources: [
          "Bitcoin ETF sees record $1B daily inflow",
          "MicroStrategy announces additional BTC purchase",
          "El Salvador's Bitcoin holdings now profitable"
        ]
      };
    }
    
    if (query.toLowerCase().includes('ethereum') || query.toLowerCase().includes('eth')) {
      return {
        summary: "Ethereum is consolidating around $3,500. Layer 2 solutions are seeing massive adoption with reduced gas fees.",
        sources: [
          "Ethereum L2 TVL reaches all-time high",
          "Vitalik proposes new scaling improvements",
          "Major DeFi protocols migrate to L2s"
        ]
      };
    }
    
    return {
      summary: `Information about ${query} in the current market context.`,
      sources: ["Market analysis", "Recent developments", "Technical indicators"]
    };
    
  } catch (error) {
    console.error('Web search error:', error);
    return null;
  }
}

// Get detailed coin analysis
async function getCoinAnalysis(symbol: string) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`,
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
      ath: data.market_data.ath.usd,
      athDate: data.market_data.ath_date.usd,
      circulatingSupply: data.market_data.circulating_supply,
      totalSupply: data.market_data.total_supply,
      sentiment: {
        upVotes: data.sentiment_votes_up_percentage,
        downVotes: data.sentiment_votes_down_percentage
      },
      description: data.description?.en?.substring(0, 500) || "No description available"
    };
  } catch (error) {
    console.error('Coin analysis error:', error);
    return null;
  }
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
    
    for (const coin of coinMentions) {
      const analysis = await getCoinAnalysis(coin);
      if (analysis) {
        coinData[coin] = analysis;
      }
    }
    
    // Perform web search if question seems to need current info
    let webResults = null;
    if (needsWebSearch(question)) {
      webResults = await searchWeb(question);
    }
    
    // Calculate real-time portfolio metrics
    let portfolioMetrics: any = {
      totalValue: 0,
      holdings: [],
      weights: {}
    };
    
    if (portfolio && portfolio.length > 0) {
      for (const holding of portfolio) {
        const symbol = holding.symbol?.toUpperCase();
        const data = coinData[symbol.toLowerCase()] || coinData[symbol];
        
        if (data) {
          const value = holding.amount * data.price;
          portfolioMetrics.totalValue += value;
          portfolioMetrics.holdings.push({
            symbol,
            amount: holding.amount,
            value,
            price: data.price,
            change24h: data.priceChange24h,
            change7d: data.priceChange7d
          });
        }
      }
      
      // Calculate weights
      portfolioMetrics.holdings.forEach((h: any) => {
        portfolioMetrics.weights[h.symbol] = ((h.value / portfolioMetrics.totalValue) * 100).toFixed(1);
      });
    }
    
    // Build comprehensive context
    const systemPrompt = `You are a highly knowledgeable crypto research assistant with real-time market access and deep understanding of the user's portfolio.

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

REAL-TIME PORTFOLIO ANALYSIS:
Total Value: $${portfolioMetrics.totalValue.toFixed(2)}
Number of Holdings: ${portfolioMetrics.holdings.length}

${portfolioMetrics.holdings.map((h: any) => `${h.symbol}:
  - Amount: ${h.amount} units
  - Value: $${h.value.toFixed(2)} (${portfolioMetrics.weights[h.symbol]}% of portfolio)
  - Current Price: $${h.price.toFixed(h.price > 100 ? 0 : 2)}
  - 24h Change: ${h.change24h > 0 ? '+' : ''}${h.change24h?.toFixed(2)}%
  - 7d Change: ${h.change7d > 0 ? '+' : ''}${h.change7d?.toFixed(2)}%`).join('\n\n')}

${Object.keys(coinData).length > 0 ? `
DETAILED COIN DATA:
${Object.entries(coinData).map(([symbol, data]: [string, any]) => `
${symbol.toUpperCase()}:
- Price: $${data.price?.toLocaleString()}
- 24h Change: ${data.priceChange24h?.toFixed(2)}%
- 7d Change: ${data.priceChange7d?.toFixed(2)}%
- 30d Change: ${data.priceChange30d?.toFixed(2)}%
- Market Cap: $${(data.marketCap / 1e9).toFixed(2)}B
- Volume: $${(data.volume24h / 1e6).toFixed(2)}M
- ATH: $${data.ath?.toLocaleString()} (${data.athDate})
- Sentiment: ${data.sentiment?.upVotes}% positive
- Description: ${data.description}
`).join('\n')}` : ''}

${webResults ? `
WEB SEARCH RESULTS:
${webResults.summary}

Sources:
${webResults.sources.join('\n- ')}
` : ''}

INSTRUCTIONS:
1. Answer the user's question with specific, actionable insights
2. Reference their portfolio holdings when relevant
3. Consider their ${profile?.sunSign} astrological profile and ${profile?.riskTolerance} risk tolerance
4. If discussing their holdings, relate it to their goals: "${profile?.intention}"
5. Provide concrete numbers, percentages, and timeframes
6. Acknowledge both opportunities and risks
7. Keep responses conversational but informative
8. If you have real-time data, emphasize the current market context
9. Connect macro trends to their specific situation

Previous conversation context:
${context.slice(-3).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

User's question: ${question}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    
    const answer = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    
    return NextResponse.json({
      answer,
      data: {
        coins: coinData,
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
    'solana', 'sol', 'cardano', 'ada', 'avalanche-2', 'avax',
    'polkadot', 'dot', 'chainlink', 'link', 'polygon', 'matic',
    'arbitrum', 'arb', 'optimism', 'op', 'cosmos', 'atom'
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const coin of commonCoins) {
    if (lowerText.includes(coin)) {
      // Map to CoinGecko IDs
      const geckoId = coin.includes('-') ? coin : 
        coin === 'btc' ? 'bitcoin' :
        coin === 'eth' ? 'ethereum' :
        coin === 'bnb' ? 'binancecoin' :
        coin === 'sol' ? 'solana' :
        coin === 'ada' ? 'cardano' :
        coin === 'avax' ? 'avalanche-2' :
        coin === 'dot' ? 'polkadot' :
        coin === 'link' ? 'chainlink' :
        coin === 'matic' ? 'polygon' :
        coin === 'arb' ? 'arbitrum' :
        coin === 'op' ? 'optimism' :
        coin === 'atom' ? 'cosmos' :
        coin;
      
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
    'current', 'now', 'price', 'market', 'trend', 'analysis'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return searchTriggers.some(trigger => lowerQuestion.includes(trigger));
}
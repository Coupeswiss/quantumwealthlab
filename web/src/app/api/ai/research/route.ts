import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Search the web for real-time information
async function searchWeb(query: string) {
  try {
    // You can integrate with APIs like:
    // - Serper API (recommended for production)
    // - SerpAPI
    // - Brave Search API
    // - Google Custom Search API
    
    // For now, using a mock search - in production, use actual API
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    
    // Simulated search results for demonstration
    return {
      query,
      results: [
        {
          title: `Latest updates on ${query}`,
          snippet: `Recent developments and analysis about ${query} in the crypto market...`,
          url: "https://example.com",
          date: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Web search failed:", error);
    return null;
  }
}

// Get real-time crypto data
async function getCryptoResearch(symbol: string) {
  try {
    const endpoints = [
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbol.toLowerCase()}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d,30d`,
      `https://api.alternative.me/fng/`, // Fear & Greed Index
    ];

    const [marketData, fngData] = await Promise.all(
      endpoints.map(url => fetch(url).then(r => r.json()).catch(() => null))
    );

    return {
      market: marketData?.[0] || null,
      fearGreedIndex: fngData?.data?.[0] || null,
      technicalIndicators: calculateTechnicalIndicators(marketData?.[0])
    };
  } catch (error) {
    console.error("Crypto research failed:", error);
    return null;
  }
}

// Calculate basic technical indicators
function calculateTechnicalIndicators(data: any) {
  if (!data?.sparkline_in_7d?.price) return null;
  
  const prices = data.sparkline_in_7d.price;
  const current = prices[prices.length - 1];
  const sma20 = prices.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
  const sma50 = prices.slice(-50).reduce((a: number, b: number) => a + b, 0) / Math.min(50, prices.length);
  
  // Simple RSI calculation
  const changes = prices.slice(-14).map((p: number, i: number, arr: number[]) => 
    i === 0 ? 0 : p - arr[i - 1]
  );
  const gains = changes.filter((c: number) => c > 0);
  const losses = changes.filter((c: number) => c < 0).map((c: number) => Math.abs(c));
  const avgGain = gains.reduce((a: number, b: number) => a + b, 0) / 14;
  const avgLoss = losses.reduce((a: number, b: number) => a + b, 0) / 14;
  const rs = avgGain / (avgLoss || 0.001);
  const rsi = 100 - (100 / (1 + rs));

  return {
    trend: current > sma20 ? "Bullish" : "Bearish",
    sma20,
    sma50,
    rsi: rsi.toFixed(2),
    momentum: ((current - prices[prices.length - 24]) / prices[prices.length - 24] * 100).toFixed(2)
  };
}

// Get on-chain data (for supported chains)
async function getOnChainData(address: string, chain: string = 'ethereum') {
  try {
    // In production, integrate with:
    // - Etherscan API
    // - Glassnode
    // - Nansen
    // - Dune Analytics
    
    return {
      chain,
      address,
      metrics: {
        holders: "Loading...",
        transactions24h: "Loading...",
        volume24h: "Loading...",
        whaleActivity: "Normal"
      }
    };
  } catch (error) {
    console.error("On-chain data failed:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { 
      message, 
      profile, 
      portfolio, 
      conversationHistory = [],
      researchMode = false 
    } = await req.json();

    if (!openai.apiKey) {
      return NextResponse.json({ 
        error: "AI service not configured",
        response: "AI research service is not available. Please configure OpenAI API key."
      });
    }

    // Build comprehensive context
    const userContext = `
USER PROFILE:
- Name: ${profile?.name || "User"}
- Astrological: ${profile?.sunSign || "?"} Sun, ${profile?.moonSign || "?"} Moon, ${profile?.risingSign || "?"} Rising
- Element: ${profile?.elemental?.element || "Unknown"}
- Risk Tolerance: ${profile?.riskTolerance || "Unknown"}
- Experience: ${profile?.experience || "Unknown"}
- Goals: "${profile?.intention || "Not specified"}"
- Challenges: "${profile?.biggestChallenge || "Not specified"}"

CURRENT PORTFOLIO:
${portfolio?.map((h: any) => `- ${h.symbol}: ${h.amount} units ($${h.value?.toLocaleString() || 0})`).join('\n') || "No holdings"}
Total Value: $${portfolio?.reduce((sum: number, h: any) => sum + (h.value || 0), 0).toLocaleString() || 0}
`;

    // Determine if we need to search for information
    const needsResearch = researchMode || 
      message.toLowerCase().includes('research') ||
      message.toLowerCase().includes('latest') ||
      message.toLowerCase().includes('news') ||
      message.toLowerCase().includes('what is') ||
      message.toLowerCase().includes('how does') ||
      message.toLowerCase().includes('price') ||
      message.toLowerCase().includes('market');

    let researchData = null;
    
    if (needsResearch) {
      // Extract topics to research
      const topics = extractTopics(message, portfolio);
      
      // Perform research
      const researchPromises = topics.map(async (topic) => {
        if (topic.type === 'crypto') {
          return getCryptoResearch(topic.value);
        } else if (topic.type === 'web') {
          return searchWeb(topic.value);
        } else if (topic.type === 'onchain') {
          return getOnChainData(topic.value, topic.chain);
        }
        return null;
      });

      const researchResults = await Promise.all(researchPromises);
      researchData = {
        topics,
        results: researchResults.filter(r => r !== null),
        timestamp: new Date().toISOString()
      };
    }

    // Build the AI prompt
    const systemPrompt = `You are an advanced crypto research assistant with real-time data access. You provide deep, analytical insights based on:
1. User's complete profile (astrology, risk tolerance, goals)
2. Their actual portfolio holdings and performance
3. Real-time market data and research
4. Technical and fundamental analysis
5. On-chain metrics when relevant

You are NOT giving financial advice, but providing research, analysis, and perspective.
Connect everything to their personal profile - their ${profile?.sunSign} sun sign, ${profile?.riskTolerance} risk tolerance, and stated goals.
Be specific about their holdings when relevant.`;

    const userPrompt = `${userContext}

${researchData ? `
RESEARCH DATA:
${JSON.stringify(researchData, null, 2)}
` : ''}

CONVERSATION HISTORY:
${conversationHistory.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

USER QUESTION: ${message}

Provide a comprehensive response that:
1. Directly answers their question with specific details
2. References their portfolio holdings when relevant
3. Considers their astrological profile for timing/personality insights
4. Uses the research data to provide current information
5. Connects to their stated goals and challenges
6. Provides multiple perspectives (technical, fundamental, astrological)

Be analytical, thorough, and personalized. Reference specific numbers, prices, and data points.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0]?.message?.content || "Unable to generate response";

      // Format the response
      const response = {
        message: aiResponse,
        research: researchData,
        metadata: {
          timestamp: new Date().toISOString(),
          model: "gpt-4o-mini",
          researchPerformed: needsResearch,
          topicsAnalyzed: researchData?.topics || [],
          portfolioContext: portfolio?.length > 0,
          astrologicalContext: !!profile?.sunSign
        },
        suggestions: generateFollowUpQuestions(message, profile, portfolio)
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error("AI completion failed:", error);
      return NextResponse.json({ 
        error: "Failed to generate response",
        response: generateFallbackResponse(message, profile, portfolio, researchData)
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json({ 
      error: "Research service error",
      response: "Unable to process your request. Please try again."
    }, { status: 500 });
  }
}

function extractTopics(message: string, portfolio: any[]): any[] {
  const topics = [];
  
  // Check for crypto symbols in message
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LINK'];
  cryptoSymbols.forEach(symbol => {
    if (message.toUpperCase().includes(symbol)) {
      topics.push({ type: 'crypto', value: symbol });
    }
  });

  // Check portfolio holdings
  portfolio?.forEach(holding => {
    if (message.toLowerCase().includes(holding.symbol.toLowerCase())) {
      topics.push({ type: 'crypto', value: holding.symbol });
    }
  });

  // Check for general topics
  if (message.toLowerCase().includes('market')) {
    topics.push({ type: 'web', value: 'crypto market analysis today' });
  }
  if (message.toLowerCase().includes('news')) {
    topics.push({ type: 'web', value: 'latest crypto news' });
  }
  if (message.toLowerCase().includes('defi')) {
    topics.push({ type: 'web', value: 'DeFi trends and opportunities' });
  }

  // If no specific topics, search the general message
  if (topics.length === 0) {
    topics.push({ type: 'web', value: message.substring(0, 100) });
  }

  return topics;
}

function generateFollowUpQuestions(message: string, profile: any, portfolio: any[]): string[] {
  const questions = [];

  // Portfolio-specific questions
  if (portfolio?.length > 0) {
    questions.push(`How is my ${portfolio[0].symbol} position performing relative to the market?`);
    questions.push(`Should I be concerned about concentration risk in my portfolio?`);
  }

  // Profile-specific questions
  if (profile?.sunSign) {
    questions.push(`What does my ${profile.sunSign} sun sign suggest about my investment style?`);
    questions.push(`Are there any important astrological transits affecting my portfolio this week?`);
  }

  // General research questions
  questions.push("What are the key macro factors affecting crypto this week?");
  questions.push("Research the top performing sectors in crypto right now");
  questions.push("What are whales doing with BTC and ETH?");

  return questions.slice(0, 3);
}

function generateFallbackResponse(message: string, profile: any, portfolio: any[], research: any): string {
  const totalValue = portfolio?.reduce((sum, h) => sum + (h.value || 0), 0) || 0;
  
  return `Based on your question about "${message.substring(0, 50)}...":

Your portfolio (valued at $${totalValue.toLocaleString()}) ${portfolio?.length > 0 ? `consists of ${portfolio.map(h => h.symbol).join(', ')}` : 'has no current holdings'}.

As a ${profile?.sunSign || 'crypto'} investor with ${profile?.riskTolerance || 'moderate'} risk tolerance, consider:
1. Your stated goal: "${profile?.intention || 'Building wealth'}"
2. Your challenge: "${profile?.biggestChallenge || 'Market volatility'}"
3. Current market conditions: ${research?.results?.[0]?.fearGreedIndex?.value || 'Neutral'} on Fear & Greed Index

For more specific insights, try asking about:
- Individual coins in your portfolio
- Market trends and analysis
- Technical indicators
- Astrological timing for trades`;
}
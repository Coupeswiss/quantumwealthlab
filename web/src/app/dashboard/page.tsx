"use client";
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Sparkles, TrendingUp, Newspaper, Activity, DollarSign, Zap } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getPortfolio, Holding } from "@/lib/portfolio-utils";

type CryptoPrice = {
  price: number;
  change24h: number;
  volume: number;
  timestamp: string;
};

type Insights = {
  daily: string;
  market: string;
  personal: string;
  timestamp: string;
};

type MarketSignal = {
  title: string;
  description: string;
  sentiment: string;
  importance: string;
  action: string;
  timestamp: string;
};

export default function DashboardHome() {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [insights, setInsights] = useState<Insights | null>(null);
  const [marketSignals, setMarketSignals] = useState<MarketSignal[]>([]);
  const [marketSummary, setMarketSummary] = useState<string>("");
  const [profile, setProfile] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  // Portfolio state
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalChange: 0,
    positionsCount: 0,
    profitableCount: 0,
  });

  // Update time every second for live feel - only on client to avoid hydration issues
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load profile from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("qwl-profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          // Handle nested structure: { state: { profile: {...} } }
          const profileData = parsed.state?.profile || parsed;
          setProfile(profileData);
        } catch (e) {
          console.error("Failed to parse profile:", e);
        }
      }
    }
  }, []);

  // Load portfolio from localStorage and listen for changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadPortfolio = () => {
        const portfolio = getPortfolio();
        setHoldings(portfolio);
      };
      
      loadPortfolio();
      
      // Listen for storage changes (when portfolio page updates)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'qwl-wallets' || e.key === 'portfolio') {
          loadPortfolio();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Also poll periodically in case storage events don't fire (same tab)
      const interval = setInterval(loadPortfolio, 5000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, []);

  // Update portfolio stats when holdings or prices change
  useEffect(() => {
    if (holdings.length === 0) {
      setPortfolioStats({
        totalValue: 0,
        totalChange: 0,
        positionsCount: 0,
        profitableCount: 0,
      });
      return;
    }

    // Calculate stats with current prices
    let totalValue = 0;
    let weightedChange = 0;
    let profitableCount = 0;

    const updatedHoldings = holdings.map(h => {
      const priceData = prices[h.symbol.toUpperCase()];
      const currentPrice = priceData?.price || h.currentPrice || 0;
      const change24h = priceData?.change24h || h.change24h || 0;
      const value = h.amount * currentPrice;
      
      totalValue += value;
      
      // Track profitable positions (positive 24h change)
      if (change24h > 0) profitableCount++;
      
      return { ...h, currentPrice, value, change24h };
    });

    // Calculate weighted average change
    if (totalValue > 0) {
      weightedChange = updatedHoldings.reduce((sum, h) => {
        const weight = (h.value || 0) / totalValue;
        return sum + ((h.change24h || 0) * weight);
      }, 0);
    }

    setPortfolioStats({
      totalValue,
      totalChange: weightedChange,
      positionsCount: holdings.length,
      profitableCount,
    });
  }, [holdings, prices]);

  // Fetch crypto prices
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/crypto/prices");
        const data = await res.json();
        setPrices(data);
        
        // Update chart data
        setChartData(prev => {
          const newPoint = {
            time: new Date().toLocaleTimeString(),
            BTC: data.BTC?.price || 0,
            ETH: data.ETH?.price || 0,
            SOL: data.SOL?.price || 0,
          };
          const updated = [...prev, newPoint].slice(-20); // Keep last 20 points
          return updated;
        });
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    }
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch AI insights with caching and smooth transitions
  useEffect(() => {
    let isMounted = true;
    
    async function fetchInsights() {
      try {
        // Check for cached insights first
        const cachedInsights = localStorage.getItem('qwl-cached-insights');
        if (cachedInsights) {
          const cached = JSON.parse(cachedInsights);
          const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
          
          // Use cache if less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            if (isMounted) setInsights(cached.data);
            setLoading(false);
            return;
          }
        }
        
        // Get full profile from localStorage
        const storedProfile = localStorage.getItem('qwl-profile');
        const fullProfile = storedProfile ? JSON.parse(storedProfile).state?.profile : profile;
        
        const storedWallets = localStorage.getItem('qwl-wallets');
        const wallets = storedWallets ? JSON.parse(storedWallets).state?.wallets : [];
        
        // Calculate portfolio value
        const portfolioValue = wallets.reduce((sum: number, w: any) => sum + (w.balance || 0), 0);
        
        // Determine market trend from prices
        const marketTrend = Object.values(prices).length > 0 && 
          Object.values(prices).filter((p: any) => p.change24h > 0).length > 
          Object.values(prices).filter((p: any) => p.change24h < 0).length 
          ? "bullish" : "bearish";
        
        const res = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            profile: fullProfile || { name: "Quantum Explorer" },
            portfolio: wallets || [],
            marketData: {
              trend: marketTrend,
              prices: prices,
              BTC: prices.BTC,
              ETH: prices.ETH,
              btc: prices.BTC?.price,
              eth: prices.ETH?.price,
              btcChange: prices.BTC?.change24h,
              ethChange: prices.ETH?.change24h
            },
            astroOnly: false
          }),
        });
        
        const data = await res.json();
        
        // Cache the insights
        localStorage.setItem('qwl-cached-insights', JSON.stringify({
          data,
          timestamp: new Date().toISOString()
        }));
        
        if (isMounted) {
          // Smooth transition with fade effect
          setInsights(data);
        }
        
        // Store insight in knowledge base
        if (data.quantumField && fullProfile) {
          const insights = fullProfile.insights || [];
          insights.push({
            content: data.quantumField,
            timestamp: new Date().toISOString(),
            type: 'quantum'
          });
          
          // Update stored profile with new insight
          const updatedProfile = { ...fullProfile, insights: insights.slice(-100) };
          localStorage.setItem('qwl-profile', JSON.stringify({ 
            state: { profile: updatedProfile },
            version: 0 
          }));
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchInsights();
    // Update less frequently - every 5 minutes instead of every minute
    const interval = setInterval(fetchInsights, 5 * 60 * 1000); 
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [profile]); // Only depend on profile, not prices to reduce re-fetches

  // Fetch market signals
  useEffect(() => {
    async function fetchMarketSignals() {
      try {
        const res = await fetch("/api/market/signals");
        const data = await res.json();
        setMarketSignals(data.signals || []);
        setMarketSummary(data.summary || "");
      } catch (error) {
        console.error("Failed to fetch market signals:", error);
        // Fallback to news if signals fail
        try {
          const newsRes = await fetch("/api/market/news");
          const newsData = await newsRes.json();
          if (newsData.news) {
            setMarketSignals(newsData.news.map((item: any) => ({
              title: item.title,
              description: item.summary,
              sentiment: item.sentiment,
              importance: item.impact || "medium",
              action: "watch",
              timestamp: item.timestamp
            })));
          }
        } catch (err) {
          console.error("Fallback news fetch also failed:", err);
        }
      }
    }
    
    fetchMarketSignals();
    const interval = setInterval(fetchMarketSignals, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price > 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (price > 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume > 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume > 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    return `$${(volume / 1e3).toFixed(1)}K`;
  };

  const formatInsightText = (insight: any): string => {
    const sanitize = (text: string) => text
      .replace(/\bundefined\b/gi, '')
      .replace(/\bnull\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .trim();

    if (typeof insight === 'string') {
      return sanitize(insight);
    }
    
    if (typeof insight === 'object' && insight !== null) {
      // Handle common patterns in insight objects
      if (insight.observation) {
        let text = insight.observation;
        if (insight.specificInvestments) {
          text += ` Consider: ${Array.isArray(insight.specificInvestments) ? insight.specificInvestments.join(', ') : insight.specificInvestments}`;
        }
        if (insight.action) {
          text += ` ${insight.action}`;
        }
        return sanitize(text);
      }
      
      if (insight.guidance) {
        let text = insight.guidance;
        if (insight.challenges) {
          text += ` ${insight.challenges}`;
        }
        return sanitize(text);
      }
      
      if (insight.message) {
        return sanitize(insight.message);
      }
      
      if (insight.content) {
        return sanitize(insight.content);
      }
      
      if (insight.text) {
        return sanitize(insight.text);
      }
      
      // Try to extract any string values from the object
      const values = Object.values(insight);
      const stringValue = values.find(v => typeof v === 'string');
      if (stringValue) {
        return sanitize(stringValue as string);
      }
      
      // Last resort: join all string values
      const strings = values.filter(v => typeof v === 'string');
      if (strings.length > 0) {
        return sanitize(strings.join(' '));
      }
      
      return 'Loading insight...';
    }
    
    return sanitize(String(insight || 'Generating insight...'));
  };

  return (
    <div className="space-y-6">
      {/* Header with live time */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="qwl-text-gradient">Quantum Dashboard</span>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {profile?.name ? `Welcome back, ${profile.name}` : "Your Personal Field"}
            {currentTime && (
              <> • {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/40 bg-green-500/10">
          <Zap className="text-green-400 animate-pulse" size={20} />
          <span className="text-sm text-green-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Price Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.keys(prices).length > 0 ? (
          Object.entries(prices).map(([symbol, data]) => (
            <div key={symbol} className="qwl-card rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer qwl-pulse">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyan-400">{symbol}</span>
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  data.change24h > 0 ? 'text-green-400' : data.change24h < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {data.change24h !== 0 && (data.change24h > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  {Math.abs(data.change24h || 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-xl font-bold text-white">{formatPrice(data.price)}</div>
              <div className="text-xs text-[var(--muted)] mt-1">
                {data.volume > 0 ? `Vol: ${formatVolume(data.volume)}` : 'Loading volume...'}
              </div>
            </div>
          ))
        ) : (
          // Loading skeleton
          ['BTC', 'ETH', 'SOL', 'QBIT'].map((symbol) => (
            <div key={symbol} className="qwl-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyan-400">{symbol}</span>
                <div className="h-4 w-12 bg-cyan-500/20 rounded animate-pulse" />
              </div>
              <div className="h-6 w-24 bg-cyan-500/20 rounded animate-pulse mb-2" />
              <div className="h-3 w-16 bg-cyan-500/10 rounded animate-pulse" />
            </div>
          ))
        )}
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="qwl-card rounded-xl p-6 animate-float">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold qwl-text-gradient">Quantum Insights</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-cyan-500/20 rounded animate-pulse" />
              <div className="h-4 bg-cyan-500/20 rounded animate-pulse w-3/4" />
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                <div className="text-xs font-bold text-cyan-400 mb-2">DAILY ENERGY</div>
                <p className="text-sm leading-relaxed text-white">
                  {formatInsightText(insights.daily)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                <div className="text-xs font-bold text-blue-400 mb-2">MARKET PULSE</div>
                <p className="text-sm leading-relaxed text-white">
                  {formatInsightText(insights.market)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="text-xs font-bold text-purple-400 mb-2">PERSONAL GUIDANCE</div>
                <p className="text-sm leading-relaxed text-white">
                  {formatInsightText(insights.personal)}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Price Chart */}
        <div className="qwl-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold qwl-text-gradient">Price Movement</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(10, 22, 40, 0.9)', 
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#00d4ff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="BTC" 
                  stroke="#00d4ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorBTC)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-cyan-400">
              <div className="animate-pulse">Loading quantum field data...</div>
            </div>
          )}
        </div>
      </div>

      {/* Market Signals Feed */}
      <div className="qwl-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold qwl-text-gradient">Live Market Signals</h2>
          </div>
          <div className="text-xs text-cyan-400 animate-pulse">Real-time Analysis</div>
        </div>
        
        {/* Market Summary */}
        {marketSummary && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-cyan-500/30">
            <p className="text-sm text-cyan-300 leading-relaxed">{marketSummary}</p>
          </div>
        )}
        
        {/* Signals Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {marketSignals.map((signal, index) => (
            <div key={index} className={`p-4 rounded-lg bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border transition-all cursor-pointer hover:scale-[1.02] ${
              signal.importance === 'high' ? 'border-yellow-500/40 hover:border-yellow-500/60' : 'border-cyan-500/20 hover:border-cyan-500/40'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                    {signal.title}
                    {signal.importance === 'high' && <span className="text-yellow-400 text-xs">⚡</span>}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                    signal.action === 'buy' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 
                    signal.action === 'sell' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 
                    signal.action === 'hold' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                  }`}>
                    {signal.action.toUpperCase()}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                    signal.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 
                    signal.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 
                    'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  }`}>
                    {signal.sentiment}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{signal.description}</p>
              <div className="flex items-center justify-between mt-3">
                <div className={`text-xs font-medium ${
                  signal.importance === 'high' ? 'text-yellow-400' : 
                  signal.importance === 'medium' ? 'text-cyan-400' : 'text-gray-400'
                }`}>
                  {signal.importance === 'high' ? '🔥 High Priority' : 
                   signal.importance === 'medium' ? '📊 Medium Priority' : '📌 Low Priority'}
                </div>
                <div className="text-xs text-cyan-400 font-medium">
                  {new Date(signal.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="qwl-card rounded-xl p-5 border border-cyan-500/40 qwl-pulse">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="text-cyan-400" size={20} />
            <span className="text-sm font-bold text-cyan-400">TOTAL VALUE</span>
          </div>
          <div className="text-3xl font-bold qwl-text-gradient">
            {portfolioStats.totalValue > 0 
              ? `$${portfolioStats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : holdings.length > 0 ? 'Calculating...' : '$0.00'
            }
          </div>
          <div className={`text-sm mt-2 font-bold ${portfolioStats.totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolioStats.totalValue > 0 
              ? `${portfolioStats.totalChange >= 0 ? '+' : ''}${portfolioStats.totalChange.toFixed(2)}% TODAY`
              : holdings.length > 0 ? 'Loading...' : 'Add holdings'
            }
          </div>
        </div>
        <div className="qwl-card rounded-xl p-5">
          <div className="text-sm font-bold text-[var(--muted)] mb-3">MARKET VOLUME</div>
          <div className="text-3xl font-bold text-white">
            {prices.BTC?.volume 
              ? `$${(prices.BTC.volume / 1e9).toFixed(1)}B`
              : 'Loading...'
            }
          </div>
          <div className="text-sm text-[var(--muted)] mt-2">BTC 24h volume</div>
        </div>
        <div className="qwl-card rounded-xl p-5">
          <div className="text-sm font-bold text-[var(--muted)] mb-3">ACTIVE POSITIONS</div>
          <div className="text-3xl font-bold text-white">{portfolioStats.positionsCount}</div>
          <div className={`text-sm mt-2 font-medium ${portfolioStats.profitableCount > 0 ? 'text-green-400' : 'text-[var(--muted)]'}`}>
            {portfolioStats.positionsCount > 0 
              ? `${portfolioStats.profitableCount} profitable`
              : 'No positions yet'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
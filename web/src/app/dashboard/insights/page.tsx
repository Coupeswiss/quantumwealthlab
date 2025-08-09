"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, ChartBarIcon, SparklesIcon, SearchIcon, SendIcon } from "lucide-react";

export default function InsightsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load profile from localStorage
      const savedProfile = localStorage.getItem('userProfile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : {};
      setProfile(profileData);

      // Load portfolio
      const savedPortfolio = localStorage.getItem('portfolio');
      const portfolioData = savedPortfolio ? JSON.parse(savedPortfolio) : [];
      setPortfolio(portfolioData);

      // Check if we have cached weekly analysis from this week
      const cachedAnalysis = localStorage.getItem('weeklyAnalysis');
      const cached = cachedAnalysis ? JSON.parse(cachedAnalysis) : null;
      
      const now = new Date();
      const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
      
      if (cached && cached.weekNumber === weekNumber) {
        setWeeklyAnalysis(cached);
      } else {
        // Generate new weekly analysis
        await generateWeeklyAnalysis(profileData, portfolioData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyAnalysis = async (profileData: any, portfolioData: any[]) => {
    try {
      const response = await fetch('/api/portfolio/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile: profileData, 
          portfolio: portfolioData 
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setWeeklyAnalysis(analysis);
        
        // Cache the analysis
        localStorage.setItem('weeklyAnalysis', JSON.stringify(analysis));
      }
    } catch (error) {
      console.error("Failed to generate analysis:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          profile,
          portfolio,
          conversationHistory: chatMessages,
          researchMode: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          role: 'assistant',
          content: data.message || data.response,
          research: data.research,
          suggestions: data.suggestions,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Weekly Portfolio Analysis */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Weekly Portfolio Intelligence Report
          </h1>
          <span className="text-sm text-gray-400">
            Week {weeklyAnalysis?.weekNumber || new Date().getWeek()} • {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* Portfolio Overview */}
        {weeklyAnalysis?.portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/40 rounded-xl p-4 border border-purple-500/20">
              <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-white">
                {formatValue(weeklyAnalysis.portfolio.totalValue)}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <span className={`flex items-center ${weeklyAnalysis.portfolio.performance.week >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {weeklyAnalysis.portfolio.performance.week >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                  {Math.abs(weeklyAnalysis.portfolio.performance.week)}% This Week
                </span>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-purple-500/20">
              <p className="text-sm text-gray-400 mb-1">Best Performer</p>
              {weeklyAnalysis.portfolio.holdings[0] && (
                <>
                  <p className="text-2xl font-bold text-white">
                    {weeklyAnalysis.portfolio.holdings.reduce((best: any, h: any) => 
                      (h.performance?.weekly || 0) > (best.performance?.weekly || 0) ? h : best
                    ).symbol}
                  </p>
                  <p className="text-sm text-green-400 mt-2">
                    +{weeklyAnalysis.portfolio.holdings.reduce((best: any, h: any) => 
                      (h.performance?.weekly || 0) > (best.performance?.weekly || 0) ? h : best
                    ).performance?.weekly}% This Week
                  </p>
                </>
              )}
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-purple-500/20">
              <p className="text-sm text-gray-400 mb-1">Market Environment</p>
              <p className="text-2xl font-bold text-white">
                {weeklyAnalysis.macro?.vix?.value < 20 ? 'Stable' : 'Volatile'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                VIX: {weeklyAnalysis.macro?.vix?.value} • DXY: {weeklyAnalysis.macro?.dxy?.value}
              </p>
            </div>
          </div>
        )}

        {/* Holdings Performance */}
        {weeklyAnalysis?.portfolio?.holdings && (
          <div className="bg-black/40 rounded-xl p-6 border border-purple-500/20 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-purple-400" />
              Holdings Performance
            </h3>
            <div className="space-y-3">
              {weeklyAnalysis.portfolio.holdings.map((holding: any) => (
                <div key={holding.symbol} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold text-white">{holding.symbol}</p>
                      <p className="text-sm text-gray-400">
                        {holding.amount} units • {weeklyAnalysis.portfolio.weights.find((w: any) => w.symbol === holding.symbol)?.weight}% of portfolio
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatValue(holding.value)}</p>
                    <div className="flex space-x-2 text-sm">
                      <span className={holding.performance?.daily >= 0 ? 'text-green-400' : 'text-red-400'}>
                        24h: {holding.performance?.daily}%
                      </span>
                      <span className={holding.performance?.weekly >= 0 ? 'text-green-400' : 'text-red-400'}>
                        7d: {holding.performance?.weekly}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {weeklyAnalysis?.analysis && (
          <div className="bg-black/40 rounded-xl p-6 border border-purple-500/20 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-purple-400" />
              Weekly Analysis & Perspective
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{weeklyAnalysis.analysis}</p>
            </div>
          </div>
        )}

        {/* Astrological Context */}
        {weeklyAnalysis?.astrologicalContext && (
          <div className="bg-black/40 rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Cosmic Timing</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Lunar Phase</p>
                <p className="text-white font-medium">{weeklyAnalysis.astrologicalContext.lunarPhase}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Mercury</p>
                <p className="text-white font-medium">{weeklyAnalysis.astrologicalContext.mercuryStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Weekly Aspect</p>
                <p className="text-white font-medium">{weeklyAnalysis.astrologicalContext.weeklyAspects}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Personal Transit</p>
                <p className="text-white font-medium">{weeklyAnalysis.astrologicalContext.personalTransits}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Research Chatbot */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-500/20">
        <div className="flex items-center mb-4">
          <SearchIcon className="w-6 h-6 mr-2 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">AI Research Assistant</h2>
        </div>
        
        <div className="bg-black/40 rounded-xl p-4 border border-blue-500/20 h-96 overflow-y-auto mb-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <p className="mb-4">Ask me anything about your portfolio, market analysis, or crypto research.</p>
              <div className="space-y-2">
                <p className="text-sm">Try asking:</p>
                <button 
                  onClick={() => setChatInput("Research my BTC holding and tell me the current market sentiment")}
                  className="block mx-auto text-blue-400 hover:text-blue-300 text-sm"
                >
                  "Research my BTC holding and market sentiment"
                </button>
                <button 
                  onClick={() => setChatInput("What are the latest developments in DeFi?")}
                  className="block mx-auto text-blue-400 hover:text-blue-300 text-sm"
                >
                  "Latest developments in DeFi"
                </button>
                <button 
                  onClick={() => setChatInput("How does my astrological profile affect my investment style?")}
                  className="block mx-auto text-blue-400 hover:text-blue-300 text-sm"
                >
                  "How my astrology affects investing"
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-3xl p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/20 text-white border border-blue-500/30' 
                      : 'bg-purple-600/20 text-gray-200 border border-purple-500/30'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.suggestions && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
                        {msg.suggestions.map((q: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setChatInput(q)}
                            className="block text-left text-xs text-blue-400 hover:text-blue-300 mb-1"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {chatLoading && (
                <div className="text-left">
                  <div className="inline-block p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !chatLoading && sendChatMessage()}
            placeholder="Ask about markets, research coins, or get portfolio insights..."
            className="flex-1 px-4 py-3 bg-black/40 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            disabled={chatLoading}
          />
          <button
            onClick={sendChatMessage}
            disabled={chatLoading || !chatInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add week number helper
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};
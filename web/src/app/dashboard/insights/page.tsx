"use client";
import { useState, useEffect } from "react";
import { Sparkles, Brain, Shield, TrendingUp, Eye, Compass, MessageCircle, RefreshCw, User, Calendar, DollarSign, Target, Zap, Moon, Sun, Star, ChevronRight } from "lucide-react";

interface AgentInsight {
  agent: string;
  role: string;
  emoji: string;
  message: string;
}

interface PersonalizedInsights {
  insights: Record<string, AgentInsight>;
  timestamp: string;
  profile: {
    name: string;
    signs: string;
    element: string;
  };
  marketContext: any;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<PersonalizedInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any>({});
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [question, setQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchMarketData();
    generateInitialInsights();
  }, []);

  function loadUserData() {
    // Load profile
    const profileData = localStorage.getItem('qwl-profile');
    if (profileData) {
      const parsed = JSON.parse(profileData);
      setProfile(parsed.state?.profile || {});
    }

    // Load portfolio
    const portfolioData = localStorage.getItem('qwl-wallets');
    if (portfolioData) {
      const parsed = JSON.parse(portfolioData);
      setPortfolio(parsed.state?.wallets || []);
    }
  }

  async function fetchMarketData() {
    try {
      const res = await fetch('/api/crypto/prices');
      if (res.ok) {
        const data = await res.json();
        setMarketData({
          btc: data.BTC?.price,
          btcChange: data.BTC?.change24h,
          eth: data.ETH?.price,
          ethChange: data.ETH?.change24h,
          trend: data.BTC?.change24h > 0 && data.ETH?.change24h > 0 ? "bullish" : 
                 data.BTC?.change24h < 0 && data.ETH?.change24h < 0 ? "bearish" : "mixed"
        });
      }
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    }
  }

  async function generateInitialInsights() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          portfolio,
          marketData,
          agentType: 'all'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setLoading(false);
    }
  }

  async function askQuestion() {
    if (!question.trim()) return;
    
    setAskingQuestion(true);
    try {
      const res = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          portfolio,
          marketData,
          agentType: selectedAgent,
          question
        })
      });

      if (res.ok) {
        const data = await res.json();
        setInsights(data);
        setQuestion("");
      }
    } catch (error) {
      console.error("Failed to ask question:", error);
    } finally {
      setAskingQuestion(false);
    }
  }

  const agentIcons: Record<string, any> = {
    quantum: Eye,
    astro: Star,
    technical: TrendingUp,
    risk: Shield,
    growth: Zap,
    wisdom: Brain
  };

  const agentColors: Record<string, string> = {
    quantum: "from-purple-500 to-pink-500",
    astro: "from-indigo-500 to-purple-500",
    technical: "from-blue-500 to-cyan-500",
    risk: "from-orange-500 to-red-500",
    growth: "from-green-500 to-emerald-500",
    wisdom: "from-amber-500 to-yellow-500"
  };

  return (
    <div className="space-y-6">
      {/* Header with User Context */}
      <div className="qwl-card rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold qwl-text-gradient">Quantum Insights</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Personalized guidance from your quantum wealth consciousness team
            </p>
          </div>
          <button
            onClick={generateInitialInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* User Profile Summary */}
        {profile.name && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
                <User size={12} />
                Identity
              </div>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="text-xs text-cyan-400">{profile.quantumProfile?.archetype}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
                <Star size={12} />
                Cosmic Profile
              </div>
              <p className="text-sm font-semibold">{profile.sunSign || "?"}/{profile.moonSign || "?"}/{profile.risingSign || "?"}</p>
              <p className="text-xs text-cyan-400">{profile.elemental?.element} Element</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
                <Target size={12} />
                Investment Style
              </div>
              <p className="text-sm font-semibold">{profile.riskTolerance || "Balanced"}</p>
              <p className="text-xs text-cyan-400">{profile.experience || "Growing"}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
                <DollarSign size={12} />
                Portfolio
              </div>
              <p className="text-sm font-semibold">{profile.portfolioSize || "Building"}</p>
              <p className="text-xs text-cyan-400">{profile.timeHorizon || "Long-term"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Question Section */}
      <div className="qwl-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="text-cyan-400" size={20} />
          Ask Your Quantum Advisors
        </h2>
        
        <div className="flex gap-3">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400"
          >
            <option value="all">All Advisors</option>
            <option value="quantum">Quantum Oracle</option>
            <option value="astro">Cosmic Navigator</option>
            <option value="technical">Alpha Seeker</option>
            <option value="risk">Guardian</option>
            <option value="growth">Abundance Amplifier</option>
            <option value="wisdom">Sage Advisor</option>
          </select>
          
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            placeholder="Ask about your wealth journey, investments, or cosmic timing..."
            className="flex-1 bg-transparent border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-cyan-400"
          />
          
          <button
            onClick={askQuestion}
            disabled={askingQuestion || !question.trim()}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {askingQuestion ? "Asking..." : "Ask"}
          </button>
        </div>
      </div>

      {/* AI Agent Insights */}
      {loading ? (
        <div className="qwl-card rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-[var(--muted)]">Connecting to the quantum field...</p>
        </div>
      ) : insights ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(insights.insights).map(([key, insight]) => {
            const Icon = agentIcons[key] || Brain;
            const gradient = agentColors[key] || "from-gray-500 to-gray-600";
            
            return (
              <div key={key} className="qwl-card rounded-xl p-6 hover:scale-[1.02] transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{insight.emoji}</span>
                      <h3 className="font-semibold">{insight.agent}</h3>
                    </div>
                    <p className="text-xs text-[var(--muted)] mb-3">{insight.role}</p>
                    <p className="text-sm leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="qwl-card rounded-xl p-12 text-center">
          <Sparkles className="mx-auto text-cyan-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Ready for Your Insights</h2>
          <p className="text-sm text-[var(--muted)]">Click refresh to receive personalized guidance from your quantum advisors</p>
        </div>
      )}

      {/* Personal Intentions & Goals */}
      {profile.intention && (
        <div className="qwl-card rounded-xl p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Compass className="text-purple-400" size={20} />
            Your Quantum Wealth Journey
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Primary Intention</p>
              <p className="text-sm">{profile.intention}</p>
            </div>
            {profile.biggestChallenge && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Current Challenge</p>
                <p className="text-sm">{profile.biggestChallenge}</p>
              </div>
            )}
            {profile.idealOutcome && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Vision</p>
                <p className="text-sm">{profile.idealOutcome}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Context */}
      <div className="qwl-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-400" size={20} />
          Current Quantum Field Status
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-[var(--muted)] mb-1">BTC Energy</p>
            <p className="text-lg font-bold">${marketData.btc?.toLocaleString() || "---"}</p>
            <p className={`text-sm ${marketData.btcChange > 0 ? "text-green-400" : "text-red-400"}`}>
              {marketData.btcChange > 0 ? "+" : ""}{marketData.btcChange?.toFixed(2) || "0"}%
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-[var(--muted)] mb-1">ETH Flow</p>
            <p className="text-lg font-bold">${marketData.eth?.toLocaleString() || "---"}</p>
            <p className={`text-sm ${marketData.ethChange > 0 ? "text-green-400" : "text-red-400"}`}>
              {marketData.ethChange > 0 ? "+" : ""}{marketData.ethChange?.toFixed(2) || "0"}%
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-[var(--muted)] mb-1">Field Trend</p>
            <p className="text-lg font-bold capitalize">{marketData.trend || "Neutral"}</p>
            <div className="flex justify-center mt-1">
              {marketData.trend === "bullish" ? (
                <TrendingUp className="text-green-400" size={16} />
              ) : marketData.trend === "bearish" ? (
                <TrendingUp className="text-red-400 rotate-180" size={16} />
              ) : (
                <ChevronRight className="text-yellow-400" size={16} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
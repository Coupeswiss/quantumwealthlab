"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Sparkles, TrendingUp, Globe, Brain, Calendar, MessageCircle } from "lucide-react";

export default function InsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [lastReportDate, setLastReportDate] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
    checkWeeklyReport();
  }, []);

  const loadUserData = () => {
    // Load profile
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    // Load portfolio from the correct storage key
    const walletData = localStorage.getItem('qwl-wallets');
    if (walletData) {
      try {
        const parsed = JSON.parse(walletData);
        const wallets = parsed.state?.wallets || [];
        const formattedPortfolio = wallets.map((w: any) => ({
          id: w.id || Date.now().toString(),
          blockchain: w.chain || "Ethereum",
          asset: w.name || w.symbol || "Unknown",
          symbol: w.symbol || "UNK",
          amount: w.amount || w.balance || 0,
          purchasePrice: w.purchasePrice,
          value: w.value || 0
        }));
        setPortfolio(formattedPortfolio);
      } catch (error) {
        console.error('Error parsing portfolio:', error);
      }
    }
  };

  const checkWeeklyReport = async () => {
    try {
      // Check if we have a saved report from this week
      const savedReport = localStorage.getItem('weeklyReport');
      const savedDate = localStorage.getItem('weeklyReportDate');
      
      if (savedReport && savedDate) {
        const reportData = JSON.parse(savedReport);
        const reportDate = new Date(savedDate);
        const now = new Date();
        const daysSince = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSince < 7) {
          setWeeklyReport(reportData);
          setLastReportDate(savedDate);
          setLoading(false);
          return;
        }
      }
      
      // Generate new report if needed
      await generateWeeklyReport();
    } catch (error) {
      console.error('Error checking weekly report:', error);
      setLoading(false);
    }
  };

  const generateWeeklyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/weekly-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          portfolio,
          lastReportDate
        })
      });

      const data = await response.json();
      
      if (data.report) {
        setWeeklyReport(data.report);
        setLastReportDate(data.generatedAt);
        
        // Save to localStorage
        localStorage.setItem('weeklyReport', JSON.stringify(data.report));
        localStorage.setItem('weeklyReportDate', data.generatedAt);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: chatInput,
          profile,
          portfolio,
          context: chatMessages.slice(-6) // Last 3 exchanges
        })
      });
      
      const data = await response.json();
      
      if (data.answer) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          data: data.data
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatReportSection = (content: string) => {
    // Split content into paragraphs and format
    const sections = content.split('\n\n');
    return sections.map((section, idx) => {
      // Check for emoji headers
      if (section.includes('🌟') || section.includes('📊') || section.includes('🔮') || 
          section.includes('💎') || section.includes('🌍') || section.includes('🎯')) {
        const [title, ...rest] = section.split('\n');
        return (
          <div key={idx} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">
              {title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {rest.join(' ').replace(/\*\*/g, '')}
            </p>
          </div>
        );
      }
      return (
        <p key={idx} className="text-gray-300 mb-4 leading-relaxed">
          {section.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Quantum Insights</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Report Section */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-semibold">Weekly Report</h2>
              </div>
              {lastReportDate && (
                <span className="text-xs text-gray-500">
                  Generated: {new Date(lastReportDate).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Generating your personalized report...</p>
              </div>
            ) : weeklyReport ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {typeof weeklyReport === 'string' ? 
                  formatReportSection(weeklyReport) : 
                  <div className="text-gray-300">{JSON.stringify(weeklyReport, null, 2)}</div>
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No report available</p>
                <button
                  onClick={generateWeeklyReport}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Generate Report
                </button>
              </div>
            )}
            
            {/* Report Stats */}
            {portfolio.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-400">Holdings</span>
                  </div>
                  <p className="text-lg font-semibold">{portfolio.length}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-400">Next Report</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {lastReportDate ? 
                      new Date(new Date(lastReportDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() :
                      'Available Now'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Research Chat */}
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Research Assistant</h2>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 min-h-[400px] max-h-[500px] overflow-y-auto mb-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Ask me anything about crypto markets!</p>
                  <p className="text-xs text-gray-500">
                    I can research coins, analyze trends, and provide personalized insights
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.data?.coins && Object.keys(msg.data.coins).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Live Data:</p>
                          {Object.entries(msg.data.coins).map(([symbol, data]: [string, any]) => (
                            <div key={symbol} className="text-xs">
                              {symbol.toUpperCase()}: ${data.price?.toFixed(2)} 
                              <span className={data.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'}>
                                {' '}({data.priceChange24h > 0 ? '+' : ''}{data.priceChange24h?.toFixed(1)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask about market trends, specific coins, or investment strategies..."
                className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Example Questions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "What's happening with Bitcoin?",
                "Should I buy more ETH?",
                "Analyze my portfolio risk",
                "Best entry for SOL?"
              ].map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(question);
                    sendChatMessage();
                  }}
                  className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
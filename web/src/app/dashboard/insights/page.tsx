"use client";
import { useState, useEffect } from "react";
import { Sparkles, Calendar, TrendingUp, Star, ChevronRight, Clock, Target, Brain, Zap, Moon, Sun, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

interface WeeklyReport {
  id: string;
  weekOf: string;
  generatedAt: string;
  report: {
    executiveSummary: string[];
    portfolioPerformance: any;
    marketAnalysis: any;
    astrologicalForecast: any;
    recommendations: string[];
    riskAssessment: any;
    weekAhead: any;
  };
  cosmicAlignment: number;
}

export default function InsightsPage() {
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  function loadReports() {
    // Load cached reports from localStorage
    const cached = localStorage.getItem('qwl-weekly-reports');
    if (cached) {
      const reports = JSON.parse(cached);
      setWeeklyReports(reports);
      if (reports.length > 0) {
        setSelectedReport(reports[0]);
      }
    }
  }

  async function generateNewReport() {
    setGenerating(true);
    try {
      // Get user profile and holdings
      const profileData = localStorage.getItem('qwl-profile');
      const profile = profileData ? JSON.parse(profileData).state?.profile : {};
      
      const holdingsData = localStorage.getItem('qwl-wallets');
      const holdings = holdingsData ? JSON.parse(holdingsData).state?.wallets : [];

      const res = await fetch('/api/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, holdings })
      });

      if (res.ok) {
        const data = await res.json();
        
        const newReport: WeeklyReport = {
          id: Date.now().toString(),
          weekOf: getWeekOf(),
          generatedAt: new Date().toISOString(),
          report: data.report,
          cosmicAlignment: Math.floor(Math.random() * 30) + 70
        };

        const updated = [newReport, ...weeklyReports];
        setWeeklyReports(updated);
        setSelectedReport(newReport);
        
        // Save to localStorage
        localStorage.setItem('qwl-weekly-reports', JSON.stringify(updated.slice(0, 10))); // Keep last 10
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  }

  function getWeekOf() {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getEmoji(type: string) {
    const emojis: { [key: string]: string } = {
      bullish: '🚀',
      bearish: '🐻',
      neutral: '⚖️',
      profit: '💰',
      loss: '📉',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️',
      star: '⭐',
      fire: '🔥',
      moon: '🌙',
      sun: '☀️',
      crystal: '💎',
      rocket: '🚀',
      chart: '📊',
      target: '🎯',
      lightning: '⚡',
      sparkle: '✨'
    };
    return emojis[type] || '📌';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold qwl-text-gradient">Quantum Insights</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Your personalized weekly wealth consciousness reports</p>
        </div>
        <button
          onClick={generateNewReport}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
        >
          <Sparkles size={16} />
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Reports List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Your Reports</h2>
          
          {weeklyReports.length === 0 ? (
            <div className="qwl-card rounded-xl p-4 text-center">
              <p className="text-sm text-[var(--muted)]">No reports yet</p>
              <p className="text-xs text-[var(--muted)] mt-2">Generate your first weekly insight</p>
            </div>
          ) : (
            <div className="space-y-2">
              {weeklyReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left qwl-card rounded-xl p-4 transition-all hover:scale-[1.02] ${
                    selectedReport?.id === report.id ? 'border-cyan-500/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <Calendar size={14} className="text-cyan-400" />
                        Week of {report.weekOf}
                      </div>
                      <div className="text-xs text-[var(--muted)] mt-1">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[var(--muted)]">Alignment</div>
                      <div className="text-sm font-bold text-cyan-400">{report.cosmicAlignment}%</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {selectedReport ? (
            <>
              {/* Executive Summary */}
              <div className="qwl-card rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-yellow-400" size={20} />
                  <h2 className="text-lg font-semibold">Executive Summary</h2>
                </div>
                <div className="space-y-3">
                  {selectedReport.report.executiveSummary?.map((point: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">{getEmoji('star')}</span>
                      <p className="text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Performance */}
              <div className="qwl-card rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-green-400" size={20} />
                  <h2 className="text-lg font-semibold">Portfolio Performance</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--muted)] mb-1">Overview</p>
                    <p className="text-sm">{selectedReport.report.portfolioPerformance?.overview}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] mb-1">Top Holding</p>
                    <div className="flex items-center gap-2">
                      <span>{getEmoji('rocket')}</span>
                      <span className="text-sm font-semibold">{selectedReport.report.portfolioPerformance?.topHolding?.symbol}</span>
                      <span className="text-sm text-cyan-400">{selectedReport.report.portfolioPerformance?.topHolding?.allocation}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <p className="text-sm">{getEmoji('target')} {selectedReport.report.portfolioPerformance?.recommendation}</p>
                </div>
              </div>

              {/* Market Analysis */}
              <div className="qwl-card rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="text-purple-400" size={20} />
                  <h2 className="text-lg font-semibold">Market Analysis</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-yellow-400" size={16} />
                    <p className="text-sm">{selectedReport.report.marketAnalysis?.btc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="text-blue-400" size={16} />
                    <p className="text-sm">{selectedReport.report.marketAnalysis?.eth}</p>
                  </div>
                  <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm">{getEmoji('chart')} {selectedReport.report.marketAnalysis?.outlook}</p>
                  </div>
                </div>
              </div>

              {/* Astrological Forecast */}
              <div className="qwl-card rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Moon className="text-indigo-400" size={20} />
                  <h2 className="text-lg font-semibold">Cosmic Forecast</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Sun className="text-yellow-400 mt-1" size={16} />
                    <div>
                      <p className="text-sm">{selectedReport.report.astrologicalForecast?.thisWeek}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {selectedReport.report.astrologicalForecast?.keyDates?.map((date: string, i: number) => (
                      <div key={i} className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <p className="text-xs">{getEmoji('moon')} {date}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-cyan-400 mt-3">{getEmoji('sparkle')} {selectedReport.report.astrologicalForecast?.advice}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="qwl-card rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="text-green-400" size={20} />
                  <h2 className="text-lg font-semibold">Action Items</h2>
                </div>
                <div className="space-y-2">
                  {selectedReport.report.recommendations?.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle className="text-green-400 mt-0.5" size={16} />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="qwl-card rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-orange-400" size={20} />
                  <h2 className="text-lg font-semibold">Risk Assessment</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[var(--muted)] mb-1">Current Risk Level</p>
                    <p className="text-lg font-semibold text-orange-400">{selectedReport.report.riskAssessment?.currentRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] mb-2">Key Concerns</p>
                    <div className="space-y-1">
                      {selectedReport.report.riskAssessment?.concerns?.map((concern: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-orange-400">•</span>
                          <p className="text-sm">{concern}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-sm">{getEmoji('warning')} {selectedReport.report.riskAssessment?.mitigation}</p>
                  </div>
                </div>
              </div>

              {/* Week Ahead */}
              <div className="qwl-card rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-blue-400" size={20} />
                  <h2 className="text-lg font-semibold">Week Ahead</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[var(--muted)] mb-2">Watch List</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {selectedReport.report.weekAhead?.watchList?.map((item: string, i: number) => (
                        <div key={i} className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-xs">{getEmoji('info')} {item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-[var(--muted)] mb-2">Key Levels</p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <span>{getEmoji('chart')}</span>
                        <span className="text-sm">BTC: {selectedReport.report.weekAhead?.keyLevels?.btc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{getEmoji('chart')}</span>
                        <span className="text-sm">ETH: {selectedReport.report.weekAhead?.keyLevels?.eth}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-sm font-semibold">{getEmoji('target')} Focus: {selectedReport.report.weekAhead?.focus}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="qwl-card rounded-xl p-12 text-center">
              <Sparkles className="mx-auto text-cyan-400 mb-4" size={48} />
              <h2 className="text-xl font-semibold mb-2">No Report Selected</h2>
              <p className="text-sm text-[var(--muted)]">Generate your first weekly insight to get started</p>
              <button
                onClick={generateNewReport}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                {getEmoji('sparkle')} Generate Your First Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { ArrowRight, Sparkles, User, Calendar, MapPin } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    email: "",
    
    // Birth data
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    
    // Investment profile
    experience: "",
    portfolioSize: "",
    riskTolerance: "",
    investmentGoals: [] as string[],
    timeHorizon: "",
    
    // Trading preferences
    tradingStyle: "",
    favoriteAssets: [] as string[],
    avoidAssets: [] as string[],
    
    // Personal insights
    intention: "",
    wealthMindset: "",
    biggestChallenge: "",
    idealOutcome: "",
    
    // Existing holdings
    currentHoldings: [] as { symbol: string; amount: number; }[],
  });

  function updateData(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function complete() {
    setSaving(true);
    
    try {
      // Calculate astrological profile
      const astroRes = await fetch("/api/astrology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
        }),
      });
      
      const astroData = await astroRes.json();
      
      // Create comprehensive profile with astrology
      const fullProfile = {
        ...formData,
        sunSign: astroData.sunSign,
        moonSign: astroData.moonSign,
        risingSign: astroData.risingSign,
        elemental: astroData.elemental,
        natalChart: astroData.natalChart,
        currentTransits: astroData.currentTransits,
        quantumProfile: {
          archetype: astroData.personality?.archetype,
          strengths: astroData.personality?.strengths,
          challenges: astroData.personality?.challenges,
          wealthStyle: astroData.personality?.wealthStyle,
        },
        insights: [],
        journalEntries: [],
        createdAt: new Date().toISOString(),
      };
      
      // Save to localStorage with Zustand format
      localStorage.setItem("qwl-profile", JSON.stringify({
        state: { profile: fullProfile },
        version: 0
      }));
      
      // Also save simplified version for backward compatibility
      localStorage.setItem("qwl_profile", JSON.stringify(formData));
      localStorage.setItem("qwl_onboarded", "true");
      
      // Generate initial AI insights for the user
      await fetch("/api/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: fullProfile,
          agentType: "overview",
          prompt: "Welcome the user and provide their initial quantum wealth activation message"
        }),
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Still save basic profile even if astrology fails
      localStorage.setItem("qwl_profile", JSON.stringify(formData));
      localStorage.setItem("qwl_onboarded", "true");
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto pt-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-2 w-24 rounded-full ${step >= 1 ? 'bg-[var(--accent)]' : 'bg-white/10'}`} />
          <div className={`h-2 w-24 rounded-full ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-white/10'}`} />
          <div className={`h-2 w-24 rounded-full ${step >= 3 ? 'bg-[var(--accent)]' : 'bg-white/10'}`} />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-[var(--accent)]" size={20} />
              <h2 className="text-xl font-semibold">Welcome to the field</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-6">Let's begin with the essentials</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--muted)] block mb-1">Your name</label>
                <input 
                  value={formData.name}
                  onChange={(e) => updateData("name", e.target.value)}
                  placeholder="Enter your name" 
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" 
                />
              </div>
              
              <div>
                <label className="text-sm text-[var(--muted)] block mb-1">Your intention</label>
                <textarea 
                  value={formData.intention}
                  onChange={(e) => updateData("intention", e.target.value)}
                  placeholder="What brings you to Quantum Wealth Lab?" 
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] min-h-24" 
                />
              </div>

              <div>
                <label className="text-sm text-[var(--muted)] block mb-1">Experience level</label>
                <select 
                  value={formData.experience}
                  onChange={(e) => updateData("experience", e.target.value)}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Select your experience</option>
                  <option value="beginner">New to crypto</option>
                  <option value="intermediate">Some experience</option>
                  <option value="advanced">Experienced trader</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="mt-6 qwl-glow qwl-ring rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Birth Data */}
        {step === 2 && (
          <div className="rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-[var(--accent)]" size={20} />
              <h2 className="text-xl font-semibold">Your cosmic coordinates</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-6">This helps attune your personal engine</p>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted)] block mb-1">Birth date</label>
                  <input 
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateData("birthDate", e.target.value)}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" 
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[var(--muted)] block mb-1">Birth time (optional)</label>
                  <input 
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => updateData("birthTime", e.target.value)}
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted)] block mb-1">Birth place</label>
                <input 
                  value={formData.birthPlace}
                  onChange={(e) => updateData("birthPlace", e.target.value)}
                  placeholder="City, Country" 
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-[var(--muted)] hover:text-white"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={!formData.birthDate}
                className="qwl-glow qwl-ring rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-[var(--accent)]" size={20} />
              <h2 className="text-xl font-semibold">Your node is ready</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-6">Review your quantum field parameters</p>
            
            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-[var(--muted)]">Name</div>
                <div className="text-sm">{formData.name}</div>
              </div>
              
              {formData.birthDate && (
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-xs text-[var(--muted)]">Birth coordinates</div>
                  <div className="text-sm">
                    {formData.birthDate} {formData.birthTime && `at ${formData.birthTime}`}
                    {formData.birthPlace && ` • ${formData.birthPlace}`}
                  </div>
                </div>
              )}
              
              {formData.intention && (
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-xs text-[var(--muted)]">Intention</div>
                  <div className="text-sm">{formData.intention}</div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(2)}
                disabled={saving}
                className="px-4 py-2 text-sm text-[var(--muted)] hover:text-white"
              >
                Back
              </button>
              <button 
                onClick={complete}
                disabled={saving}
                className="qwl-glow qwl-ring rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
              >
                {saving ? "Activating..." : "Activate node"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
"use client";
import { useEffect, useState } from "react";
import { User, Calendar, Target, Shield, Brain, Star } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import TimePicker from "@/components/TimePicker";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [astroData, setAstroData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load full profile from Zustand format
    const stored = localStorage.getItem("qwl-profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile(parsed.state?.profile || {});
      setAstroData({
        sunSign: parsed.state?.profile?.sunSign,
        moonSign: parsed.state?.profile?.moonSign,
        risingSign: parsed.state?.profile?.risingSign,
        archetype: parsed.state?.profile?.quantumProfile?.archetype,
        element: parsed.state?.profile?.elemental?.element,
      });
    }
  }, []);

  async function updateProfile(updates: any) {
    setSaving(true);
    
    // If birth data changed, recalculate astrology
    if (updates.birthDate || updates.birthTime || updates.birthPlace) {
      try {
        const res = await fetch("/api/astrology/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthDate: updates.birthDate || profile.birthDate,
            birthTime: updates.birthTime || profile.birthTime,
            birthPlace: updates.birthPlace || profile.birthPlace,
          }),
        });
        
        if (res.ok) {
          const astro = await res.json();
          updates = {
            ...updates,
            sunSign: astro.sunSign,
            moonSign: astro.moonSign,
            risingSign: astro.risingSign,
            elemental: astro.elemental,
            quantumProfile: {
              ...profile.quantumProfile,
              archetype: astro.personality?.archetype,
              strengths: astro.personality?.strengths,
              wealthStyle: astro.personality?.wealthStyle,
            },
          };
          setAstroData(astro);
        }
      } catch (e) {
        console.error("Astrology calculation error:", e);
      }
    }
    
    // Update profile
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    
    // Save to localStorage
    localStorage.setItem("qwl-profile", JSON.stringify({
      state: { profile: updatedProfile },
      version: 0
    }));
    
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold qwl-text-gradient">Complete Profile</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Your personalized wealth consciousness profile</p>
      </div>

      {/* Basic Information */}
      <div className="qwl-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold">Basic Information</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--muted)]">Name</label>
            <input 
              value={profile.name || ""} 
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Email</label>
            <input 
              value={profile.email || ""} 
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
              placeholder="your@email.com"
            />
          </div>
        </div>
      </div>

      {/* Birth Data & Astrology */}
      <div className="qwl-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold">Astrological Profile</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <DatePicker
              label="Birth Date"
              value={profile.birthDate || ""}
              onChange={(date) => updateProfile({ birthDate: date })}
              placeholder="Select birth date"
            />
          </div>
          <div>
            <TimePicker
              label="Birth Time"
              value={profile.birthTime || ""}
              onChange={(time) => updateProfile({ birthTime: time })}
              placeholder="Select birth time"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Birth Place</label>
            <input 
              value={profile.birthPlace || ""} 
              onChange={(e) => updateProfile({ birthPlace: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
              placeholder="City, Country"
            />
          </div>
        </div>
        
        {astroData.sunSign && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-xs text-[var(--muted)]">Sun Sign</div>
              <div className="text-sm font-semibold text-cyan-400">{astroData.sunSign}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--muted)]">Moon Sign</div>
              <div className="text-sm font-semibold text-cyan-400">{astroData.moonSign}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--muted)]">Rising</div>
              <div className="text-sm font-semibold text-cyan-400">{astroData.risingSign}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--muted)]">Element</div>
              <div className="text-sm font-semibold text-cyan-400">{astroData.element}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--muted)]">Archetype</div>
              <div className="text-sm font-semibold text-cyan-400">{astroData.archetype}</div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Profile */}
      <div className="qwl-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold">Investment Profile</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--muted)]">Portfolio Size</label>
            <select 
              value={profile.portfolioSize || ""} 
              onChange={(e) => updateProfile({ portfolioSize: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select size</option>
              <option value="&lt; $10k">Less than $10,000</option>
              <option value="$10k-50k">$10,000 - $50,000</option>
              <option value="$50k-100k">$50,000 - $100,000</option>
              <option value="$100k-500k">$100,000 - $500,000</option>
              <option value="&gt; $500k">More than $500,000</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Experience Level</label>
            <select 
              value={profile.experience || ""} 
              onChange={(e) => updateProfile({ experience: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner (&lt; 1 year)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Risk Tolerance</label>
            <select 
              value={profile.riskTolerance || ""} 
              onChange={(e) => updateProfile({ riskTolerance: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select tolerance</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
              <option value="very aggressive">Very Aggressive</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Time Horizon</label>
            <select 
              value={profile.timeHorizon || ""} 
              onChange={(e) => updateProfile({ timeHorizon: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select horizon</option>
              <option value="short">Short-term (&lt; 1 year)</option>
              <option value="medium">Medium-term (1-3 years)</option>
              <option value="long">Long-term (3-10 years)</option>
              <option value="very long">Very Long-term (10+ years)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personal Insights */}
      <div className="qwl-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold">Personal Insights</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--muted)]">Primary Intention</label>
            <input 
              value={profile.intention || ""} 
              onChange={(e) => updateProfile({ intention: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
              placeholder="What's your main goal with wealth creation?"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Biggest Challenge</label>
            <input 
              value={profile.biggestChallenge || ""} 
              onChange={(e) => updateProfile({ biggestChallenge: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
              placeholder="What's holding you back?"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Ideal Outcome</label>
            <textarea 
              value={profile.idealOutcome || ""} 
              onChange={(e) => updateProfile({ idealOutcome: e.target.value })}
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[80px]"
              placeholder="Describe your ideal financial future..."
            />
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-cyan-500/20 border border-cyan-500/40 rounded-lg px-4 py-2 text-sm">
          Saving profile...
        </div>
      )}
    </div>
  );
}


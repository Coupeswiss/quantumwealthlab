"use client";
import { useEffect, useState } from "react";
import { User, Target, Brain, Star, Save, Check } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import TimePicker from "@/components/TimePicker";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [astroData, setAstroData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load full profile from localStorage
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
    setSaved(false);
    
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
          setAstroData({
            sunSign: astro.sunSign,
            moonSign: astro.moonSign,
            risingSign: astro.risingSign,
            element: astro.elemental?.element,
            archetype: astro.personality?.archetype,
          });
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
    
    // Trigger AI insights regeneration if we have enough data
    if (updatedProfile.birthDate && updatedProfile.name) {
      try {
        await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            profile: updatedProfile,
            portfolio: {},
            marketData: {}
          }),
        });
      } catch (e) {
        console.error("AI insights generation error:", e);
      }
    }
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            <label className="text-xs text-[var(--muted)] block mb-1">Name</label>
            <input 
              value={profile.name || ""} 
              onChange={(e) => updateProfile({ name: e.target.value })}
              onBlur={() => profile.name && updateProfile({})} // Save on blur
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Email</label>
            <input 
              type="email"
              value={profile.email || ""} 
              onChange={(e) => updateProfile({ email: e.target.value })}
              onBlur={() => profile.email && updateProfile({})} // Save on blur
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all"
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
            <label className="text-xs text-[var(--muted)] block mb-1">Birth Place</label>
            <input 
              value={profile.birthPlace || ""} 
              onChange={(e) => updateProfile({ birthPlace: e.target.value })}
              onBlur={() => profile.birthPlace && updateProfile({})} // Save on blur
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all"
              placeholder="City, Country"
            />
          </div>
        </div>
        
        {astroData.sunSign && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-white/10">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-xs text-[var(--muted)]">Sun Sign</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{astroData.sunSign}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-xs text-[var(--muted)]">Moon Sign</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{astroData.moonSign}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-xs text-[var(--muted)]">Rising</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{astroData.risingSign}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-xs text-[var(--muted)]">Element</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{astroData.element}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-xs text-[var(--muted)]">Archetype</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{astroData.archetype}</div>
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
            <label className="text-xs text-[var(--muted)] block mb-1">Portfolio Size</label>
            <select 
              value={profile.portfolioSize || ""} 
              onChange={(e) => updateProfile({ portfolioSize: e.target.value })}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a1628]">Select size</option>
              <option value="< $10k" className="bg-[#0a1628]">Less than $10,000</option>
              <option value="$10k-50k" className="bg-[#0a1628]">$10,000 - $50,000</option>
              <option value="$50k-100k" className="bg-[#0a1628]">$50,000 - $100,000</option>
              <option value="$100k-500k" className="bg-[#0a1628]">$100,000 - $500,000</option>
              <option value="> $500k" className="bg-[#0a1628]">More than $500,000</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Experience Level</label>
            <select 
              value={profile.experience || ""} 
              onChange={(e) => updateProfile({ experience: e.target.value })}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a1628]">Select level</option>
              <option value="beginner" className="bg-[#0a1628]">Beginner (Less than 1 year)</option>
              <option value="intermediate" className="bg-[#0a1628]">Intermediate (1-3 years)</option>
              <option value="advanced" className="bg-[#0a1628]">Advanced (3-5 years)</option>
              <option value="expert" className="bg-[#0a1628]">Expert (5+ years)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Risk Tolerance</label>
            <select 
              value={profile.riskTolerance || ""} 
              onChange={(e) => updateProfile({ riskTolerance: e.target.value })}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a1628]">Select tolerance</option>
              <option value="conservative" className="bg-[#0a1628]">Conservative</option>
              <option value="moderate" className="bg-[#0a1628]">Moderate</option>
              <option value="aggressive" className="bg-[#0a1628]">Aggressive</option>
              <option value="very aggressive" className="bg-[#0a1628]">Very Aggressive</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Time Horizon</label>
            <select 
              value={profile.timeHorizon || ""} 
              onChange={(e) => updateProfile({ timeHorizon: e.target.value })}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a1628]">Select horizon</option>
              <option value="short" className="bg-[#0a1628]">Short-term (Less than 1 year)</option>
              <option value="medium" className="bg-[#0a1628]">Medium-term (1-3 years)</option>
              <option value="long" className="bg-[#0a1628]">Long-term (3-10 years)</option>
              <option value="very long" className="bg-[#0a1628]">Very Long-term (10+ years)</option>
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
            <label className="text-xs text-[var(--muted)] block mb-1">Primary Intention</label>
            <input 
              value={profile.intention || ""} 
              onChange={(e) => updateProfile({ intention: e.target.value })}
              onBlur={() => profile.intention && updateProfile({})} // Save on blur
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all"
              placeholder="What's your main goal with wealth creation?"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Biggest Challenge</label>
            <input 
              value={profile.biggestChallenge || ""} 
              onChange={(e) => updateProfile({ biggestChallenge: e.target.value })}
              onBlur={() => profile.biggestChallenge && updateProfile({})} // Save on blur
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-all"
              placeholder="What's holding you back?"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Ideal Outcome</label>
            <textarea 
              value={profile.idealOutcome || ""} 
              onChange={(e) => updateProfile({ idealOutcome: e.target.value })}
              onBlur={() => profile.idealOutcome && updateProfile({})} // Save on blur
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:border-cyan-400 transition-all resize-none"
              placeholder="Describe your ideal financial future..."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => updateProfile({})}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check size={18} />
              Saved
            </>
          ) : saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Profile
            </>
          )}
        </button>
      </div>

      {/* Status Toast */}
      {(saving || saved) && (
        <div className={`fixed bottom-4 right-4 ${saved ? 'bg-green-500/20 border-green-500/40' : 'bg-cyan-500/20 border-cyan-500/40'} border rounded-lg px-4 py-2 text-sm flex items-center gap-2`}>
          {saved ? (
            <>
              <Check size={16} className="text-green-400" />
              Profile saved successfully!
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400/30 border-t-cyan-400"></div>
              Updating profile...
            </>
          )}
        </div>
      )}
    </div>
  );
}
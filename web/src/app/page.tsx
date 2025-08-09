"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import TimePicker from "@/components/TimePicker";

export default function Home() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const data = new FormData(e.currentTarget);
    const payload = Object.fromEntries(data.entries());
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setMessage(res.ok ? "Profile saved." : json?.error || "Something went wrong");
            } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="grid-background"></div>
      
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden qwl-logo-glow">
            <Image 
              src="/qfn_logo.png" 
              alt="Quantum Wealth Lab Logo" 
              width={50} 
              height={50}
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-lg font-bold qwl-text-gradient">QUANTUM</div>
            <div className="text-xs text-[var(--muted)]">WEALTH LAB</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a className="text-[var(--muted)] hover:text-cyan-400 transition" href="#vision">Vision</a>
          <a className="text-[var(--muted)] hover:text-cyan-400 transition" href="#tech">Tech</a>
          <a className="text-[var(--muted)] hover:text-cyan-400 transition" href="#network">Network</a>
          <a className="qwl-glow px-4 py-2 rounded-lg text-white font-bold hover:scale-105 transition-transform" href="/login">
            Enter App
          </a>
        </div>
      </nav>

      <header className="relative z-10 px-8 pt-20 pb-32 text-center">
        {/* Central glowing orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="mb-8 animate-float">
            <div className="relative w-[120px] h-[120px] mx-auto rounded-full overflow-hidden qwl-logo-glow">
              <Image 
                src="/qfn_logo.png" 
                alt="Quantum Wealth Lab Logo" 
                width={120} 
                height={120}
                className="object-cover"
              />
            </div>
          </div>
          
          <p className="text-lg tracking-widest text-[var(--muted)] mb-6">
            CONSCIOUSNESS SHAPES <span className="qwl-text-yellow">REALITY</span>
          </p>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="block mb-4">Energy Directs</span>
            <span className="qwl-text-green text-7xl md:text-8xl">VALUE</span>
          </h1>
          
          <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto mb-12 leading-relaxed">
            The Quantum Field Token (<span className="text-cyan-400 font-bold">$QBIT</span>) represents a new paradigm where conscious 
            participation shapes financial reality through quantum field dynamics.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <a href="/app" className="qwl-glow px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-3 hover:scale-105 transition-transform">
              <Sparkles size={20} />
              Activate Your Node
              <ArrowRight size={20} />
            </a>
            <a href="#vision" className="px-8 py-4 rounded-xl text-lg border border-cyan-500/30 hover:bg-cyan-500/10 transition">
              Learn More
            </a>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold qwl-text-gradient">∞</div>
              <div className="text-sm text-[var(--muted)] mt-2">Infinite Potential</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold qwl-text-gradient">⚛</div>
              <div className="text-sm text-[var(--muted)] mt-2">Quantum Field</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold qwl-text-gradient">◈</div>
              <div className="text-sm text-[var(--muted)] mt-2">Collective Power</div>
            </div>
          </div>
        </div>
      </header>

      <section id="vision" className="relative z-10 px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="qwl-card rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-6">
              <span className="qwl-text-gradient">Quantum Vision</span>
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
              Your energy becomes frequency. Your awareness becomes shared capital. 
              Your intention becomes a catalyst for collaborative creation.
            </p>
            <p className="text-lg text-white leading-relaxed">
              When consciousness-aligned holders unite with shared abundance vision, 
              transformation accelerates <span className="text-cyan-400 font-bold">exponentially</span>.
            </p>
          </div>
        </div>
      </section>

      <section id="onboarding" className="relative z-10 px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="qwl-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <Sparkles size={24} className="text-cyan-400"/>
              <span className="qwl-text-gradient">Quick Start</span>
            </h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              Begin your quantum wealth journey with these essential coordinates.
            </p>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
              <input 
                name="name" 
                placeholder="Name" 
                className="bg-[#0a1628]/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all placeholder-[var(--muted)]" 
              />
              <input 
                name="email" 
                placeholder="Email" 
                className="bg-[#0a1628]/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all placeholder-[var(--muted)]" 
              />
              <input 
                name="birthPlace" 
                placeholder="Birth place" 
                className="bg-[#0a1628]/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all placeholder-[var(--muted)]" 
              />
              <div>
                <DatePicker
                  value=""
                  onChange={(date) => {
                    const input = document.querySelector('input[name="birthDate"]') as HTMLInputElement;
                    if (!input) {
                      const hiddenInput = document.createElement('input');
                      hiddenInput.type = 'hidden';
                      hiddenInput.name = 'birthDate';
                      hiddenInput.value = date;
                      const form = document.querySelector('form');
                      form?.appendChild(hiddenInput);
                    } else {
                      input.value = date;
                    }
                  }}
                  placeholder="Select birth date"
                  className="bg-[#0a1628]/50 border-cyan-500/30 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                />
                <input type="hidden" name="birthDate" />
              </div>
              <div>
                <TimePicker
                  value=""
                  onChange={(time) => {
                    const input = document.querySelector('input[name="birthTime"]') as HTMLInputElement;
                    if (!input) {
                      const hiddenInput = document.createElement('input');
                      hiddenInput.type = 'hidden';
                      hiddenInput.name = 'birthTime';
                      hiddenInput.value = time;
                      const form = document.querySelector('form');
                      form?.appendChild(hiddenInput);
                    } else {
                      input.value = time;
                    }
                  }}
                  placeholder="Select birth time"
                  className="bg-[#0a1628]/50 border-cyan-500/30 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                />
                <input type="hidden" name="birthTime" />
              </div>
              <button type="submit" disabled={saving} className="qwl-glow rounded-lg px-6 py-3 text-sm font-bold hover:scale-105 transition-transform">
                {saving ? "Saving..." : "Initialize"}
              </button>
            </form>
            {message && <p className="mt-4 text-sm text-cyan-400">{message}</p>}
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-8 py-12 text-center text-xs text-[var(--muted)] border-t border-cyan-500/20">
        <p>© 2025 Quantum Wealth Lab. Educational and experimental; not financial advice.</p>
        <p className="mt-2">Consciousness creates reality.</p>
      </footer>
    </div>
  );
}
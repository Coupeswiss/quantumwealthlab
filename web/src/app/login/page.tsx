"use client";
import { useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const payload = Object.fromEntries(data.entries());
    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (res.ok) {
      const json = await res.json();
      // Redirect to onboarding if new user, otherwise dashboard
      window.location.href = json.needsProfile ? "/onboarding" : "/dashboard";
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json?.error || "Login failed");
    }
    setLoading(false);
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="grid-background"></div>
      
      <div className="w-full max-w-sm relative z-10">
        {/* Glowing orb behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="qwl-card rounded-2xl p-8 relative">
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden qwl-logo-glow">
              <Image 
                src="/qfn_logo.png" 
                alt="Quantum Wealth Lab Logo" 
                width={80} 
                height={80}
                className="object-cover"
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">
            <span className="qwl-text-gradient">Enter the Quantum Field</span>
          </h1>
          <p className="text-sm text-[var(--muted)] text-center mb-6">Sign in to Quantum Wealth Lab</p>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <Sparkles className="text-cyan-400" size={16} />
            <p className="text-xs text-cyan-400">Dev mode: Use any email & password</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <input 
                name="email" 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-[#0a1628]/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all placeholder-[var(--muted)]" 
                required 
              />
            </div>
            <div>
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                className="w-full bg-[#0a1628]/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all placeholder-[var(--muted)]" 
                required 
              />
            </div>
            <button 
              disabled={loading} 
              className="w-full qwl-glow rounded-lg px-4 py-3 text-sm font-bold text-white hover:scale-105 transition-transform"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entering Field...
                </span>
              ) : (
                "ACTIVATE NODE"
              )}
            </button>
            {error && (
              <div className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
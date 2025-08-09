"use client";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      className={`block px-3 py-2 rounded-lg transition-all ${
        active 
          ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.3)]" 
          : "hover:bg-cyan-500/10 hover:border-cyan-500/20 hover:text-cyan-400 border border-transparent"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="grid-background"></div>
      <div className="relative z-10 min-h-screen grid grid-cols-[260px_1fr]">
        <aside className="border-r border-cyan-500/20 bg-gradient-to-b from-[#0a1628]/80 to-[#060f1e]/80 backdrop-blur-lg p-4 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden qwl-logo-glow">
              <Image 
                src="/qfn_logo.png" 
                alt="Quantum Wealth Lab Logo" 
                width={60} 
                height={60}
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-bold qwl-text-gradient">QUANTUM</div>
              <div className="text-xs text-[var(--muted)]">WEALTH LAB</div>
            </div>
          </div>
          <nav className="space-y-2 text-sm">
            <NavLink href="/dashboard">Overview</NavLink>
            <NavLink href="/dashboard/profile">Profile</NavLink>
            <NavLink href="/dashboard/portfolio">Portfolio</NavLink>
            <NavLink href="/dashboard/insights">Insights</NavLink>
            <NavLink href="/dashboard/feed">Feed</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
          </nav>
          
          {/* Live indicator */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30">
              <Activity className="text-green-400 animate-pulse" size={16} />
              <span className="text-xs text-green-400">Network Active</span>
            </div>
          </div>
        </aside>
        
        <div className="flex flex-col">
          <header className="h-16 border-b border-cyan-500/20 bg-gradient-to-r from-[#0a1628]/80 to-[#060f1e]/80 backdrop-blur-lg flex items-center justify-between px-6">
            <div className="text-sm">
              <span className="text-[var(--muted)]">Consciousness Shapes</span>
              <span className="qwl-text-yellow ml-2">REALITY</span>
              <span className="mx-3 text-[var(--muted)]">•</span>
              <span className="text-[var(--muted)]">Energy Directs</span>
              <span className="qwl-text-green ml-2">VALUE</span>
            </div>
            <div className="text-sm text-cyan-400 qwl-pulse px-3 py-1 rounded-full border border-cyan-500/40">
              Quantum Field Active
            </div>
          </header>
          <main className="p-6 flex-1 overflow-x-hidden relative">{children}</main>
        </div>
      </div>
    </div>
  );
}
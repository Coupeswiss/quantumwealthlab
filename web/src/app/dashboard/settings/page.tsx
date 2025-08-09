"use client";
import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function logout() {
    document.cookie = "qwl_session=; Max-Age=0; path=/";
    window.location.href = "/login";
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-[var(--muted)] mt-1">Preferences and account.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border border-white/10 bg-white/5">
          <h3 className="font-medium">Appearance</h3>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm">Dark mode</span>
            <Switch.Root checked={dark} onCheckedChange={setDark as any} className="w-12 h-6 bg-white/10 data-[state=checked]:bg-white/20 rounded-full relative">
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-6" />
            </Switch.Root>
          </div>
        </div>
        <div className="rounded-xl p-4 border border-white/10 bg-white/5">
          <h3 className="font-medium">Account</h3>
          <button onClick={logout} className="mt-3 qwl-glow qwl-ring rounded-lg px-4 py-2 text-sm font-medium">Log out</button>
        </div>
      </div>
    </div>
  );
}


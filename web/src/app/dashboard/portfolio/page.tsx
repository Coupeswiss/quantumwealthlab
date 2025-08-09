"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Wallet, TrendingUp, PieChart } from "lucide-react";

interface Holding {
  id: string;
  blockchain: string;
  asset: string;
  symbol: string;
  amount: number;
  purchasePrice?: number;
  currentPrice?: number;
  value?: number;
  change24h?: number;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [prices, setPrices] = useState<any>({});
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  
  const [newHolding, setNewHolding] = useState<Holding>({
    id: "",
    blockchain: "Ethereum",
    asset: "",
    symbol: "",
    amount: 0,
  });

  // Load holdings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("qwl-wallets");
    if (stored) {
      const parsed = JSON.parse(stored);
      const wallets = parsed.state?.wallets || [];
      setHoldings(wallets.map((w: any) => ({
        id: w.id || Date.now().toString(),
        blockchain: w.chain || "Ethereum",
        asset: w.name || w.symbol || "Unknown",
        symbol: w.symbol || "UNK",
        amount: w.amount || w.balance || 0,
        purchasePrice: w.purchasePrice,
      })));
    }
  }, []);

  // Fetch current prices
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/crypto/prices");
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
          
          // Update holdings with current prices
          setHoldings(prev => prev.map(h => {
            const priceData = data[h.symbol.toUpperCase()];
            if (priceData) {
              return {
                ...h,
                currentPrice: priceData.price,
                value: h.amount * priceData.price,
                change24h: priceData.change24h,
              };
            }
            return h;
          }));
        }
      } catch (e) {
        console.error("Failed to fetch prices:", e);
      }
    }
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Calculate totals
  useEffect(() => {
    const total = holdings.reduce((sum, h) => sum + (h.value || 0), 0);
    setTotalValue(total);
    
    const weightedChange = holdings.reduce((sum, h) => {
      if (h.value && h.change24h) {
        const weight = h.value / total;
        return sum + (h.change24h * weight);
      }
      return sum;
    }, 0);
    setTotalChange(weightedChange);
  }, [holdings]);

  // Save holdings
  function saveHoldings(updated: Holding[]) {
    setHoldings(updated);
    localStorage.setItem("qwl-wallets", JSON.stringify({
      state: { 
        wallets: updated.map(h => ({
          id: h.id,
          chain: h.blockchain,
          address: `${h.blockchain}-wallet`,
          symbol: h.symbol,
          name: h.asset,
          amount: h.amount,
          balance: h.value || 0,
          purchasePrice: h.purchasePrice,
        }))
      },
      version: 0
    }));
    
    // Also update profile with holdings
    const profileStored = localStorage.getItem("qwl-profile");
    if (profileStored) {
      const profile = JSON.parse(profileStored);
      profile.state.profile.currentHoldings = updated.map(h => ({
        symbol: h.symbol,
        amount: h.amount,
      }));
      localStorage.setItem("qwl-profile", JSON.stringify(profile));
    }
  }

  function addHolding() {
    if (!newHolding.symbol || !newHolding.amount) return;
    
    const holding: Holding = {
      ...newHolding,
      id: Date.now().toString(),
      symbol: newHolding.symbol.toUpperCase(),
    };
    
    const priceData = prices[holding.symbol];
    if (priceData) {
      holding.currentPrice = priceData.price;
      holding.value = holding.amount * priceData.price;
      holding.change24h = priceData.change24h;
    }
    
    const updated = [...holdings, holding];
    saveHoldings(updated);
    
    setNewHolding({
      id: "",
      blockchain: "Ethereum",
      asset: "",
      symbol: "",
      amount: 0,
    });
    setAddingNew(false);
  }

  function updateHolding(id: string, updates: Partial<Holding>) {
    const updated = holdings.map(h => 
      h.id === id ? { ...h, ...updates } : h
    );
    saveHoldings(updated);
    setEditingId(null);
  }

  function deleteHolding(id: string) {
    const updated = holdings.filter(h => h.id !== id);
    saveHoldings(updated);
  }

  const blockchains = [
    "Ethereum", "Bitcoin", "Solana", "Polygon", "Arbitrum", 
    "Optimism", "Avalanche", "BNB Chain", "Base", "zkSync"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold qwl-text-gradient">Portfolio Management</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Track and manage your crypto holdings across all chains</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="qwl-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="text-cyan-400" size={16} />
            <h3 className="text-sm font-medium text-[var(--muted)]">Total Value</h3>
          </div>
          <p className="text-2xl font-semibold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="qwl-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-cyan-400" size={16} />
            <h3 className="text-sm font-medium text-[var(--muted)]">24h Change</h3>
          </div>
          <p className={`text-2xl font-semibold ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
          </p>
        </div>
        <div className="qwl-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="text-cyan-400" size={16} />
            <h3 className="text-sm font-medium text-[var(--muted)]">Holdings</h3>
          </div>
          <p className="text-2xl font-semibold">{holdings.length}</p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="qwl-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Holdings</h2>
          {!addingNew && (
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
              Add Holding
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-[var(--muted)] pb-3">Blockchain</th>
                <th className="text-left text-xs text-[var(--muted)] pb-3">Asset</th>
                <th className="text-left text-xs text-[var(--muted)] pb-3">Symbol</th>
                <th className="text-right text-xs text-[var(--muted)] pb-3">Amount</th>
                <th className="text-right text-xs text-[var(--muted)] pb-3">Price</th>
                <th className="text-right text-xs text-[var(--muted)] pb-3">Value</th>
                <th className="text-right text-xs text-[var(--muted)] pb-3">24h</th>
                <th className="text-right text-xs text-[var(--muted)] pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addingNew && (
                <tr className="border-b border-white/5">
                  <td className="py-3">
                    <select
                      value={newHolding.blockchain}
                      onChange={(e) => setNewHolding({ ...newHolding, blockchain: e.target.value })}
                      className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                    >
                      {blockchains.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <input
                      value={newHolding.asset}
                      onChange={(e) => setNewHolding({ ...newHolding, asset: e.target.value })}
                      placeholder="Bitcoin"
                      className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      value={newHolding.symbol}
                      onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })}
                      placeholder="BTC"
                      className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm w-20"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <input
                      type="number"
                      value={newHolding.amount}
                      onChange={(e) => setNewHolding({ ...newHolding, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm w-24 text-right"
                    />
                  </td>
                  <td className="py-3 text-right text-sm text-[var(--muted)]">-</td>
                  <td className="py-3 text-right text-sm text-[var(--muted)]">-</td>
                  <td className="py-3 text-right text-sm text-[var(--muted)]">-</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={addHolding}
                        className="p-1 hover:bg-green-500/20 rounded transition-colors"
                      >
                        <Save size={16} className="text-green-400" />
                      </button>
                      <button
                        onClick={() => setAddingNew(false)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              
              {holdings.map(holding => (
                <tr key={holding.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 text-sm">
                    {editingId === holding.id ? (
                      <select
                        value={holding.blockchain}
                        onChange={(e) => updateHolding(holding.id, { blockchain: e.target.value })}
                        className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                      >
                        {blockchains.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : (
                      holding.blockchain
                    )}
                  </td>
                  <td className="py-3 text-sm">{holding.asset}</td>
                  <td className="py-3 text-sm font-medium">{holding.symbol}</td>
                  <td className="py-3 text-right text-sm">
                    {editingId === holding.id ? (
                      <input
                        type="number"
                        value={holding.amount}
                        onChange={(e) => updateHolding(holding.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm w-24 text-right"
                      />
                    ) : (
                      holding.amount.toLocaleString()
                    )}
                  </td>
                  <td className="py-3 text-right text-sm">
                    ${holding.currentPrice?.toLocaleString() || '-'}
                  </td>
                  <td className="py-3 text-right text-sm font-medium">
                    ${holding.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
                  </td>
                  <td className={`py-3 text-right text-sm ${holding.change24h && holding.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.change24h ? `${holding.change24h >= 0 ? '+' : ''}${holding.change24h.toFixed(2)}%` : '-'}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === holding.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:bg-green-500/20 rounded transition-colors"
                        >
                          <Save size={16} className="text-green-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(holding.id)}
                          className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                        >
                          <Edit2 size={16} className="text-cyan-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteHolding(holding.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {holdings.length === 0 && !addingNew && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-[var(--muted)]">
                    No holdings yet. Click "Add Holding" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Chart */}
      {holdings.length > 0 && (
        <div className="qwl-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Portfolio Allocation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {holdings.sort((a, b) => (b.value || 0) - (a.value || 0)).map(holding => {
              const percentage = ((holding.value || 0) / totalValue * 100).toFixed(1);
              return (
                <div key={holding.id} className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{percentage}%</div>
                  <div className="text-sm text-[var(--muted)]">{holding.symbol}</div>
                  <div className="text-xs text-[var(--muted)]">${holding.value?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
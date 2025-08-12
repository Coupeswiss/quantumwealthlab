// Unified portfolio utilities for consistent data across the app

export interface Holding {
  id: string;
  blockchain: string;
  asset: string;
  symbol: string;
  amount: number;
  purchasePrice?: number;
  value?: number;
  currentPrice?: number;
  change24h?: number;
  change7d?: number;
}

// Get portfolio from localStorage with consistent format
export function getPortfolio(): Holding[] {
  try {
    // Try new format first
    const portfolioData = localStorage.getItem('portfolio');
    if (portfolioData) {
      return JSON.parse(portfolioData);
    }
    
    // Fallback to wallet format
    const walletData = localStorage.getItem('qwl-wallets');
    if (walletData) {
      const parsed = JSON.parse(walletData);
      const wallets = parsed.state?.wallets || [];
      return wallets.map((w: any) => ({
        id: w.id || Date.now().toString(),
        blockchain: w.chain || w.blockchain || "Ethereum",
        asset: w.name || w.asset || w.symbol || "Unknown",
        symbol: w.symbol?.toUpperCase() || "UNK",
        amount: parseFloat(w.amount || w.balance || 0),
        purchasePrice: parseFloat(w.purchasePrice || 0),
        value: parseFloat(w.value || 0),
        currentPrice: parseFloat(w.currentPrice || 0),
        change24h: parseFloat(w.change24h || 0),
        change7d: parseFloat(w.change7d || 0)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error loading portfolio:', error);
    return [];
  }
}

// Save portfolio in both formats for compatibility
export function savePortfolio(holdings: Holding[]) {
  try {
    // Save in new format
    localStorage.setItem('portfolio', JSON.stringify(holdings));
    
    // Also save in wallet format for compatibility
    const walletFormat = {
      state: {
        wallets: holdings.map(h => ({
          id: h.id,
          chain: h.blockchain,
          blockchain: h.blockchain,
          name: h.asset,
          asset: h.asset,
          symbol: h.symbol,
          amount: h.amount,
          balance: h.amount,
          purchasePrice: h.purchasePrice,
          value: h.value,
          currentPrice: h.currentPrice,
          change24h: h.change24h,
          change7d: h.change7d
        }))
      }
    };
    localStorage.setItem('qwl-wallets', JSON.stringify(walletFormat));
  } catch (error) {
    console.error('Error saving portfolio:', error);
  }
}

// Get user profile with all details
export function getUserProfile() {
  try {
    // First try the correct key used by the profile page
    const qwlProfileData = localStorage.getItem('qwl-profile');
    if (qwlProfileData) {
      const parsed = JSON.parse(qwlProfileData);
      return parsed.state?.profile || parsed;
    }
    
    // Fallback to legacy key
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      return JSON.parse(profileData);
    }
    return null;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}

// Map common symbols to CoinGecko IDs
export const SYMBOL_TO_COINGECKO: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'DOT': 'polkadot',
  'MATIC': 'polygon',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'DAI': 'dai',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'SHIB': 'shiba-inu',
  'LTC': 'litecoin',
  'TRX': 'tron',
  'NEAR': 'near',
  'FIL': 'filecoin',
  'APT': 'aptos',
  'SUI': 'sui',
  'SEI': 'sei-network',
  'INJ': 'injective-protocol',
  'TIA': 'celestia',
  'AAVE': 'aave',
  'CRV': 'curve-dao-token',
  'MKR': 'maker',
  'COMP': 'compound-governance-token',
  'SNX': 'synthetix-network-token',
  'RUNE': 'thorchain',
  'OSMO': 'osmosis',
  'JUNO': 'juno-network',
  'ALGO': 'algorand',
  'HBAR': 'hedera',
  'VET': 'vechain',
  'FTM': 'fantom',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'AXS': 'axie-infinity',
  'GALA': 'gala',
  'IMX': 'immutable-x',
  'FLOW': 'flow',
  'CHZ': 'chiliz',
  'ENJ': 'enjincoin',
  'THETA': 'theta-token',
  'XTZ': 'tezos',
  'EOS': 'eos',
  'XLM': 'stellar',
  'ICP': 'internet-computer',
  'EGLD': 'elrond-erd-2',
  'XMR': 'monero',
  'ETC': 'ethereum-classic',
  'BCH': 'bitcoin-cash',
  'QNT': 'quant-network',
  'GRT': 'the-graph',
  'LDO': 'lido-dao',
  'RPL': 'rocket-pool',
  'FXS': 'frax-share',
  'PENDLE': 'pendle',
  'GMX': 'gmx',
  'DYDX': 'dydx-chain',
  'BLUR': 'blur',
  'CFX': 'conflux-token',
  'RDNT': 'radiant-capital',
  'STX': 'blockstack',
  'KAVA': 'kava',
  'ROSE': 'oasis-network',
  'CELO': 'celo',
  'KSM': 'kusama',
  'ZIL': 'zilliqa',
  'ENS': 'ethereum-name-service',
  'BAT': 'basic-attention-token',
  'LRC': 'loopring',
  'OCEAN': 'ocean-protocol',
  'BAND': 'band-protocol',
  'KNC': 'kyber-network-crystal',
  'REN': 'republic-protocol',
  'BAL': 'balancer',
  'YFI': 'yearn-finance',
  'SUSHI': 'sushi',
  'ZRX': '0x',
  '1INCH': '1inch',
  'ANKR': 'ankr',
  'FET': 'fetch-ai',
  'RNDR': 'render-token',
  'WLD': 'worldcoin-wld',
  'PEPE': 'pepe',
  'FLOKI': 'floki',
  'BONK': 'bonk'
};

// Get CoinGecko ID from symbol
export function getCoinGeckoId(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  return SYMBOL_TO_COINGECKO[upperSymbol] || symbol.toLowerCase();
}
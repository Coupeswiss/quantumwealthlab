import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Comprehensive user profile with astrology data
interface UserProfile {
  // Basic info
  name?: string;
  email?: string;
  intention?: string;
  experience?: string;
  
  // Birth data for astrology
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  birthLat?: number;
  birthLng?: number;
  
  // Calculated astrology data
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  natalChart?: any;
  currentTransits?: any;
  
  // Personality insights from questionnaire
  riskTolerance?: string;
  investmentGoals?: string[];
  spiritualBeliefs?: string[];
  wealthMindset?: string;
  
  // AI-generated profile
  quantumProfile?: {
    archetype?: string;
    strengths?: string[];
    challenges?: string[];
    opportunities?: string[];
    personalMantra?: string;
  };
  
  // Knowledge base entries
  insights?: string[];
  journalEntries?: any[];
}

interface ProfileState {
  profile: UserProfile | null;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addInsight: (insight: string) => void;
  addJournalEntry: (entry: any) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      updateProfile: (newProfile) => 
        set((state) => ({ 
          profile: { ...state.profile, ...newProfile } as UserProfile 
        })),
      addInsight: (insight) =>
        set((state) => ({
          profile: state.profile ? {
            ...state.profile,
            insights: [...(state.profile.insights || []), insight]
          } : null
        })),
      addJournalEntry: (entry) =>
        set((state) => ({
          profile: state.profile ? {
            ...state.profile,
            journalEntries: [...(state.profile.journalEntries || []), entry]
          } : null
        })),
    }),
    {
      name: 'qwl-profile',
    }
  )
);

// Wallet store for crypto portfolios
interface WalletState {
  wallets: Array<{
    id: string;
    address: string;
    chain: string;
    balance?: number;
    tokens?: any[];
  }>;
  addWallet: (wallet: any) => void;
  removeWallet: (id: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      wallets: [],
      addWallet: (wallet) => 
        set((state) => ({ 
          wallets: [...state.wallets, { ...wallet, id: Date.now().toString() }] 
        })),
      removeWallet: (id) => 
        set((state) => ({ 
          wallets: state.wallets.filter(w => w.id !== id) 
        })),
    }),
    {
      name: 'qwl-wallets',
    }
  )
);

// Posts store for social feed
interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: any[];
}

interface PostState {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  likePost: (id: string) => void;
  addComment: (postId: string, comment: any) => void;
}

export const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      posts: [],
      addPost: (post) => 
        set((state) => ({
          posts: [{
            ...post,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: []
          }, ...state.posts]
        })),
      likePost: (id) =>
        set((state) => ({
          posts: state.posts.map(p =>
            p.id === id ? { ...p, likes: p.likes + 1 } : p
          )
        })),
      addComment: (postId, comment) =>
        set((state) => ({
          posts: state.posts.map(p =>
            p.id === postId 
              ? { ...p, comments: [...p.comments, comment] }
              : p
          )
        })),
    }),
    {
      name: 'qwl-posts',
    }
  )
);
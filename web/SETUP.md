# Setup Instructions

## Add OpenAI API Key

Create a file called `.env.local` in the web directory with your OpenAI API key:

```bash
# .env.local
OPENAI_API_KEY=your-openai-api-key-here
```

## Restart the dev server

After adding the API key, restart the development server:

```bash
# Kill the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Features

The dashboard now includes:
- Live crypto price tickers (BTC, ETH, SOL, QBIT)
- AI-powered personalized insights (daily energy, market pulse, personal guidance)
- Real-time price charts
- Market news feed with sentiment analysis
- Portfolio value tracking
- Live updates every 10-30 seconds

The AI insights will use GPT-3.5 to generate personalized content based on your profile data.
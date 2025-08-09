# Environment Variables Setup

## Required Variables

### OpenAI API Key (REQUIRED)
```
OPENAI_API_KEY=your-openai-api-key-here
```
Get from: https://platform.openai.com/api-keys

## Optional Variables

### Serper API (For Web Search)
```
SERPER_API_KEY=your-serper-api-key-here
```
- Get from: https://serper.dev
- Enables real-time web search in AI Research bot
- Free tier: 2,500 searches/month

### Prokerala API (For Accurate Astrology)
```
PROKERALA_CLIENT_ID=your-prokerala-client-id
PROKERALA_CLIENT_SECRET=your-prokerala-client-secret
```
- Get from: https://api.prokerala.com
- Provides accurate rising signs and planetary positions

### CoinGecko API (For Higher Rate Limits)
```
# Optional - works without it but with rate limits
# COINGECKO_API_KEY=your-coingecko-api-key-here
```
- Get from: https://www.coingecko.com/en/api
- Not required - app works with public API
- Public API: 10-30 calls/minute
- Pro API: Higher limits

## Setting Up in Render

1. Go to your Render dashboard
2. Select your web service
3. Go to Environment tab
4. Add each variable as a key-value pair
5. Save and redeploy

## Local Development

Create a `.env.local` file in the `web` directory:
```
OPENAI_API_KEY=your-key-here
SERPER_API_KEY=your-serper-key-here
```

The app will work without CoinGecko API key using the public endpoints!
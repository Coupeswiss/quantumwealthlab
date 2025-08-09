// Environment configuration for production deployment
export const getBaseUrl = () => {
  // In production on Render
  if (process.env.RENDER_EXTERNAL_URL) {
    // Normalize: strip protocol and trailing slash to avoid malformed URLs
    let url = process.env.RENDER_EXTERNAL_URL.trim();
    url = url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    return `https://${url}`;
  }
  
  // Custom domain if set
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  
  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development
  return 'http://localhost:3000';
};

export const config = {
  // Base URL for API calls
  baseUrl: getBaseUrl(),
  
  // API Keys (set in Render dashboard)
  openaiKey: process.env.OPENAI_API_KEY,
  prokeralaKey: process.env.PROKERALA_API_KEY,
  prokeralaClientId: process.env.PROKERALA_CLIENT_ID,
  prokeralaClientSecret: process.env.PROKERALA_CLIENT_SECRET,
  
  // Environment flags
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
  isRender: !!process.env.RENDER,
  isVercel: !!process.env.VERCEL,
};

// For client-side usage
export const publicConfig = {
  baseUrl: getBaseUrl(),
  isProd: process.env.NODE_ENV === 'production',
};
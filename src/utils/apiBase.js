const PRODUCTION_API_ORIGIN = 'https://tasks-nenduqaji-ctutasks-8094.vercel.app';

// Helper to get API URL across web browser, local dev, and Capacitor mobile environments
export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin || '';
    // If running in web browser on Vercel deployment
    if (origin.includes('vercel.app')) {
      return cleanPath;
    }
    // If running inside Capacitor APK / WebView, file://, or localhost
    if (origin.includes('capacitor://') || origin.includes('http://localhost') || origin.includes('file://')) {
      return `${PRODUCTION_API_ORIGIN}${cleanPath}`;
    }
  }
  
  return cleanPath;
}


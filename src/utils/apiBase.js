// Helper to get API URL across both web browser and Capacitor mobile environments
export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If running on custom production domain or local dev
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    if (!window.location.origin.includes('localhost') && !window.location.origin.includes('capacitor://')) {
      return cleanPath;
    }
  }
  
  // Capacitor Android / iOS fallback or localhost
  return cleanPath;
}

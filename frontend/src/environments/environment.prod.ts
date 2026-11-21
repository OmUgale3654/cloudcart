// Production environment configuration for CloudCart
export const environment = {
  production: true,
  // Primary: Runtime injected URL via window.__env
  // Secondary: Custom override in localStorage ('cloudcart_api_url')
  // Default: Render deployed backend URL
  apiUrl: (typeof window !== 'undefined' && (window as any).__env && (window as any).__env.apiUrl)
    ? (window as any).__env.apiUrl
    : (typeof localStorage !== 'undefined' && localStorage.getItem('cloudcart_api_url'))
    ? localStorage.getItem('cloudcart_api_url')!
    : 'https://cloudcart-backend.onrender.com/api/v1'
};

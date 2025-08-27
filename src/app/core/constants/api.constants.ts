export const API_CONFIG = {

  BASE_URL: 'https://crudcrud.com/api',
  
  
  ENDPOINT_ID: '658ea4ff860649558924643d16044973', 
  
  RESOURCES: {
    WEATHER_DATA: 'weatherData',
    CITIES: 'cities'
  },
  
  // Request limits
  MAX_REQUESTS: 100,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Cache configuration
  CACHE_TTL: 300000, // 5 minutes in milliseconds
} as const;

// Build full API URLs
export const API_ENDPOINTS = {
  WEATHER_DATA: `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINT_ID}/${API_CONFIG.RESOURCES.WEATHER_DATA}`,
  CITIES: `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINT_ID}/${API_CONFIG.RESOURCES.CITIES}`,
} as const;

// HTTP Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;
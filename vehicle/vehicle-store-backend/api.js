import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Vehicle API calls
export const vehicleAPI = {
  // Get all vehicles with filters
  getVehicles: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.brandId) params.append('brand_id', filters.brandId);
    if (filters.fuelType) params.append('fuel_type', filters.fuelType);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    return api.get(`/vehicles?${params.toString()}`);
  },

  // Get vehicle by ID
  getVehicle: (id) => api.get(`/vehicles/${id}`),

  // Admin: Create vehicle
  createVehicle: (vehicleData) => api.post('/admin/vehicles', vehicleData),

  // Admin: Update vehicle
  updateVehicle: (id, vehicleData) => api.put(`/admin/vehicles/${id}`, vehicleData),

  // Admin: Delete vehicle
  deleteVehicle: (id) => api.delete(`/admin/vehicles/${id}`),
};

// Brand API calls
export const brandAPI = {
  // Get all brands
  getBrands: () => api.get('/brands'),

  // Get brand by ID
  getBrand: (id) => api.get(`/brands/${id}`),

  // Admin: Create brand
  createBrand: (brandData) => api.post('/admin/brands', brandData),

  // Admin: Update brand
  updateBrand: (id, brandData) => api.put(`/admin/brands/${id}`, brandData),

  // Admin: Delete brand
  deleteBrand: (id) => api.delete(`/admin/brands/${id}`),
};

// Booking API calls
export const bookingAPI = {
  // Create booking
  createBooking: (bookingData) => api.post('/bookings', bookingData),

  // Admin: Get all bookings
  getBookings: (status = '') => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/admin/bookings${params}`);
  },

  // Admin: Get booking by ID
  getBooking: (id) => api.get(`/admin/bookings/${id}`),

  // Admin: Update booking status
  updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}`, { status }),

  // Admin: Delete booking
  deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),
};

// Analytics API calls
export const analyticsAPI = {
  // Get basic analytics summary
  getSummary: () => api.get('/analytics/summary'),

  // Admin: Get popular vehicles
  getPopularVehicles: () => api.get('/admin/analytics/popular-vehicles'),

  // Admin: Get booking trends
  getBookingTrends: () => api.get('/admin/analytics/booking-trends'),

  // Admin: Get inventory status
  getInventoryStatus: () => api.get('/admin/analytics/inventory-status'),
};

// Health check
export const healthCheck = () => api.get('/health', { baseURL: 'http://localhost:8080' });

export default api;
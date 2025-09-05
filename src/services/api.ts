// Use relative path for API calls in production, localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, nginx will proxy /api to the backend
  : 'http://localhost:5000/api';  // For local development

export interface AccessCodeResponse {
  success: boolean;
  role: string;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('🔍 Token check:', token ? 'Token found' : 'No token found');
  if (token) {
    try {
      // Properly decode base64url (JWT uses base64url encoding, not standard base64)
      const base64UrlDecode = (str: string) => {
        // Convert base64url to base64
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
        try {
          // Use TextDecoder for proper Unicode handling
          const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          return new TextDecoder().decode(bytes);
        } catch (e) {
          console.error('Base64 decode error:', e);
          // Fallback to atob if TextDecoder fails
          return atob(base64);
        }
      };
      
      const payload = JSON.parse(base64UrlDecode(token.split('.')[1]));
      console.log('🔍 Token payload:', { 
        userId: payload.userId, 
        email: payload.email, 
        role: payload.role,
        exp: new Date(payload.exp * 1000)
      });
    } catch (e) {
      console.error('🔍 Token parsing error:', e);
    }
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const verifyAccessCode = async (accessCode: string): Promise<AccessCodeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/access/verify-access`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accessCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify access code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying access code:', error);
    throw error;
  }
};

// Function to make authenticated API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Clear all bookings (admin only)
export const clearAllBookings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/admin/clear-all`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to clear bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing bookings:', error);
    throw error;
  }
};

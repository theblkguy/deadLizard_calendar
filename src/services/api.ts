const API_BASE_URL = 'http://localhost:5000/api';

export interface AccessCodeResponse {
  success: boolean;
  role: string;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
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

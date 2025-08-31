const API_BASE_URL = 'http://localhost:5000/api';

export interface AccessCodeResponse {
  success: boolean;
  role: string;
  message?: string;
}

export const verifyAccessCode = async (accessCode: string): Promise<AccessCodeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/access/verify-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

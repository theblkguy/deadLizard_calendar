import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '../styles/GlobalStyle';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/', { replace: true, state: { error: 'Authentication failed. Please try again.' } });
        return;
      }

      if (!token) {
        console.error('No token received');
        navigate('/', { replace: true, state: { error: 'Authentication failed. No token received.' } });
        return;
      }

      try {
        // Debug: Log the raw token received
        console.log('🔍 Raw token received:', token);
        console.log('🔍 Token length:', token.length);
        console.log('🔍 Token parts count:', token.split('.').length);
        
        // Decode URL-encoded token and parse JWT payload
        const decodedToken = decodeURIComponent(token);
        console.log('🔍 Decoded token:', decodedToken);
        console.log('🔍 Decoded token parts count:', decodedToken.split('.').length);
        
        const tokenParts = decodedToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error(`Invalid JWT format - expected 3 parts, got ${tokenParts.length}`);
        }
        
        console.log('🔍 JWT Header:', tokenParts[0]);
        console.log('🔍 JWT Payload (base64):', tokenParts[1]);
        console.log('🔍 JWT Signature:', tokenParts[2]);
        
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
        
        const payload = JSON.parse(base64UrlDecode(tokenParts[1]));
        
        // Create user object from token payload
        const user = {
          id: payload.userId,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          picture: payload.picture || 'https://via.placeholder.com/40',
          role: payload.role as UserRole
        };

        // Store decoded token in localStorage for API calls
        localStorage.setItem('token', decodedToken);

        // Login the user
        login(user);

        // Redirect to calendar
        navigate('/calendar', { replace: true });
      } catch (error) {
        console.error('Token parsing error:', error);
        navigate('/', { replace: true, state: { error: 'Authentication failed. Invalid token.' } });
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, login]);

  return (
    <CallbackContainer>
      <Container>
        <LoadingCard>
          <Spinner />
          <LoadingText>Completing authentication...</LoadingText>
        </LoadingCard>
      </Container>
    </CallbackContainer>
  );
};

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2E8B57 0%, #228B22 100%);
`;

const LoadingCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto ${({ theme }) => theme.spacing.md};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export default AuthCallbackPage;

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, Button } from '../styles/GlobalStyle';
import { UserRole, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { login, state } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate page
    if (state.isAuthenticated) {
      // All users go to the same calendar page regardless of role
      navigate('/calendar');
    }
  }, [state.isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    // This would integrate with Google OAuth
    // For now, we'll simulate a login
    const roleMap = {
      'guest': UserRole.GUEST,
      'user': UserRole.USER, 
      'admin': UserRole.ADMIN
    };
    
    const mockUser: User = {
      id: '1',
      email: 'user@deadlizardstudio.com',
      name: 'Studio User',
      picture: 'https://via.placeholder.com/40',
      role: roleMap[role as keyof typeof roleMap] || UserRole.GUEST
    };
    
    login(mockUser);
    
    // All users go to the same calendar page
    navigate('/calendar');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getRoleDisplayName = () => {
    switch(role) {
      case 'guest': return 'Guest';
      case 'user': return 'User'; 
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  return (
    <LoginContainer>
      <Container>
        <LoginCard>
          <StudioLogo>🦎</StudioLogo>
          <Title>
            {getRoleDisplayName()} Login
          </Title>
          <Subtitle>
            {role === 'admin' 
              ? 'Sign in to manage the studio calendar'
              : role === 'user'
              ? 'Sign in to book studio time'
              : 'Sign in to view the studio calendar'
            }
          </Subtitle>
          
          <ButtonGroup>
            <GoogleButton onClick={handleGoogleLogin}>
              <GoogleIcon>G</GoogleIcon>
              Continue with Google
            </GoogleButton>
            
            <BackButton variant="secondary" onClick={handleBackToHome}>
              Back to Home
            </BackButton>
          </ButtonGroup>
          
          <Note>
            {role === 'admin' 
              ? 'Admin accounts have full calendar management privileges.'
              : role === 'user'
              ? 'User accounts can book and manage their own studio sessions.'
              : 'Guest accounts have view-only access to the calendar.'
            }
          </Note>
        </LoginCard>
      </Container>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2E8B57 0%, #228B22 100%);
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LoginCard = styled(Card)`
  max-width: 400px;
  text-align: center;
  width: 100%;
`;

const StudioLogo = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: 1.8rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const GoogleButton = styled(Button)`
  background-color: #4285f4;
  color: white;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 1rem;
  
  &:hover {
    background-color: #357ae8;
  }
`;

const GoogleIcon = styled.span`
  background-color: white;
  color: #4285f4;
  width: 20px;
  height: 20px;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
`;

const BackButton = styled(Button)`
  width: 100%;
`;

const Note = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`;

export default LoginPage;

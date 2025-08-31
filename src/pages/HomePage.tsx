import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, Button, Input, FormGroup, Label, ErrorMessage } from '../styles/GlobalStyle';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { verifyAccessCode } from '../services/api';

const HomePage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await verifyAccessCode(password);
      
      if (response.success) {
        const role = response.role as UserRole;
        setRole(role);
        
        // All users go to Google OAuth login regardless of role
        navigate(`/login/${role}`);
      } else {
        setError(response.message || 'Invalid access code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify access code. Please try again.');
      console.error('Access code verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HomeContainer>
      <Container>
        <WelcomeCard>
          <StudioLogo>🦎</StudioLogo>
          <Title>Dead Lizard Studio</Title>
          <Subtitle>Studio Booking Calendar</Subtitle>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="password">Enter Access Code</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your access code"
                required
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>
            
            <Button type="submit" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Access Studio Calendar'}
            </Button>
          </form>
          
          <AccessInfo>
            <h4>Access Levels:</h4>
            <AccessLevel>
              <strong>Guest Access:</strong> View-only calendar
            </AccessLevel>
            <AccessLevel>
              <strong>User Access:</strong> Book and manage your sessions
            </AccessLevel>
            <AccessLevel>
              <strong>Admin Access:</strong> Full calendar management
            </AccessLevel>
          </AccessInfo>
        </WelcomeCard>
      </Container>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2E8B57 0%, #228B22 100%);
  padding: ${({ theme }) => theme.spacing.lg};
`;

const WelcomeCard = styled(Card)`
  max-width: 400px;
  text-align: center;
  width: 100%;
`;

const StudioLogo = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: 2rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: 1.1rem;
`;

const AccessInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  text-align: left;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 6px;
  
  h4 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AccessLevel = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 0.9rem;
  
  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default HomePage;

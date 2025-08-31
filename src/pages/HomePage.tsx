import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, Button, Input, FormGroup, Label, ErrorMessage } from '../styles/GlobalStyle';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setRole } = useAuth();

  // These would typically come from environment variables or a secure config
  const PASSWORDS = {
    guest: 'studio_guest_2024',
    user: 'deadlizard_user_2024', 
    admin: 'deadlizard_admin_2024'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === PASSWORDS.guest) {
      setRole(UserRole.GUEST);
      navigate('/guest');
    } else if (password === PASSWORDS.user) {
      navigate('/login/user');
    } else if (password === PASSWORDS.admin) {
      navigate('/login/admin');
    } else {
      setError('Invalid password. Please try again.');
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
            
            <Button type="submit" style={{ width: '100%' }}>
              Access Studio Calendar
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

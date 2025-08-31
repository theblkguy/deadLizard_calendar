import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, Button } from '../styles/GlobalStyle';
import { BookingSlot, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!state.isAuthenticated || state.role !== UserRole.ADMIN) {
      navigate('/');
      return;
    }
    
    loadData();
  }, [state.isAuthenticated, state.role, navigate]);

  const loadData = async () => {
    // This would fetch from your API
    // Mock data for now
    const mockBookings: BookingSlot[] = [
      {
        id: '1',
        date: '2025-08-30',
        startTime: '10:00',
        endTime: '12:00',
        userId: '1',
        userName: 'John Doe',
        title: 'Band Practice',
        description: 'Weekly rehearsal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        date: '2025-08-31',
        startTime: '14:00',
        endTime: '16:00',
        userId: '2',
        userName: 'Jane Smith',
        title: 'Recording Session',
        description: 'Vocal recording',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setBookings(mockBookings);

    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', totalBookings: 5 },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', totalBookings: 3 }
    ];
    setUsers(mockUsers);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
  };

  return (
    <AdminContainer>
      <Header>
        <Container>
          <HeaderContent>
            <Title>🦎 Studio Admin Dashboard</Title>
            <UserInfo>
              <WelcomeText>Admin: {state.user?.name}</WelcomeText>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </UserInfo>
          </HeaderContent>
        </Container>
      </Header>

      <MainContent>
        <Container>
          <DashboardGrid>
            <StatsCard>
              <StatTitle>Quick Stats</StatTitle>
              <StatsList>
                <StatItem>
                  <StatLabel>Total Bookings:</StatLabel>
                  <StatValue>{bookings.length}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Active Users:</StatLabel>
                  <StatValue>{users.length}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>This Week:</StatLabel>
                  <StatValue>8 sessions</StatValue>
                </StatItem>
              </StatsList>
            </StatsCard>

            <ActionsCard>
              <CardTitle>Quick Actions</CardTitle>
              <ActionsList>
                <Button style={{ width: '100%', marginBottom: '1rem' }}>
                  Add Manual Booking
                </Button>
                <Button style={{ width: '100%', marginBottom: '1rem' }}>
                  Export Calendar
                </Button>
                <Button style={{ width: '100%' }}>
                  Studio Settings
                </Button>
              </ActionsList>
            </ActionsCard>

            <BookingsCard>
              <CardTitle>All Bookings</CardTitle>
              <BookingsList>
                {bookings.length === 0 ? (
                  <EmptyState>No bookings found.</EmptyState>
                ) : (
                  bookings.map(booking => (
                    <BookingItem key={booking.id}>
                      <BookingDetails>
                        <BookingTitle>{booking.title}</BookingTitle>
                        <BookingInfo>
                          {booking.date} | {booking.startTime} - {booking.endTime}
                        </BookingInfo>
                        <BookingUser>Booked by: {booking.userName}</BookingUser>
                        {booking.description && (
                          <BookingDescription>{booking.description}</BookingDescription>
                        )}
                      </BookingDetails>
                      <BookingActions>
                        <Button variant="secondary" size="sm">Edit</Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => deleteBooking(booking.id)}
                        >
                          Delete
                        </Button>
                      </BookingActions>
                    </BookingItem>
                  ))
                )}
              </BookingsList>
            </BookingsCard>

            <UsersCard>
              <CardTitle>Studio Users</CardTitle>
              <UsersList>
                {users.map(user => (
                  <UserItem key={user.id}>
                    <UserDetails>
                      <UserName>{user.name}</UserName>
                      <UserEmail>{user.email}</UserEmail>
                    </UserDetails>
                    <UserStats>
                      <span>{user.totalBookings} bookings</span>
                    </UserStats>
                  </UserItem>
                ))}
              </UsersList>
            </UsersCard>
          </DashboardGrid>
        </Container>
      </MainContent>
    </AdminContainer>
  );
};

const AdminContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const WelcomeText = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const MainContent = styled.main`
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const StatsCard = styled(Card)``;
const ActionsCard = styled(Card)``;
const BookingsCard = styled(Card)`
  grid-column: 1 / -1;
`;
const UsersCard = styled(Card)`
  grid-column: 1 / -1;
`;

const CardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const StatTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatValue = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const BookingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BookingDetails = styled.div`
  flex: 1;
`;

const BookingTitle = styled.div`
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BookingInfo = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BookingUser = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const BookingDescription = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const BookingActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const UserEmail = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const UserStats = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

export default AdminPage;

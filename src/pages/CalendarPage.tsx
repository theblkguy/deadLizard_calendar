import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import { Container, Card, Button } from '../styles/GlobalStyle';
import { BookingSlot, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import 'react-calendar/dist/Calendar.css';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!state.isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Load bookings for the selected date
    loadBookings();
  }, [state.isAuthenticated, selectedDate, navigate]);

  const loadBookings = async () => {
    // This would fetch from your API
    // For now, we'll use mock data
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
      }
    ];
    setBookings(mockBookings);
  };

    const handleDateChange = (value: any) => {
    if (value && !Array.isArray(value) && value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredBookings = bookings.filter(booking => 
    booking.date === selectedDate.toISOString().split('T')[0]
  );

  return (
    <CalendarContainer>
      <Header>
        <Container>
          <HeaderContent>
            <Title>🦎 Studio Calendar</Title>
            <UserInfo>
              <WelcomeText>Welcome, {state.user?.name}</WelcomeText>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </UserInfo>
          </HeaderContent>
        </Container>
      </Header>

      <MainContent>
        <Container>
          <CalendarGrid>
            <CalendarCard>
              <CalendarTitle>Select a Date</CalendarTitle>
              <StyledCalendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
              />
            </CalendarCard>

            <BookingsCard>
              <BookingsHeader>
                <h3>{formatDate(selectedDate)}</h3>
                <Button onClick={() => setShowBookingForm(true)}>
                  Book Time
                </Button>
              </BookingsHeader>

              <BookingsList>
                {filteredBookings.length === 0 ? (
                  <EmptyState>
                    No bookings for this date. Click "Book Time" to reserve studio time.
                  </EmptyState>
                ) : (
                  filteredBookings.map(booking => (
                    <BookingItem key={booking.id}>
                      <BookingTime>
                        {booking.startTime} - {booking.endTime}
                      </BookingTime>
                      <BookingDetails>
                        <BookingTitle>{booking.title}</BookingTitle>
                        <BookingUser>by {booking.userName}</BookingUser>
                        {booking.description && (
                          <BookingDescription>{booking.description}</BookingDescription>
                        )}
                      </BookingDetails>
                      {(state.user?.id === booking.userId || state.role === UserRole.ADMIN) && (
                        <BookingActions>
                          <Button variant="secondary" size="sm">Edit</Button>
                          <Button variant="danger" size="sm">Cancel</Button>
                        </BookingActions>
                      )}
                    </BookingItem>
                  ))
                )}
              </BookingsList>
            </BookingsCard>
          </CalendarGrid>
        </Container>
      </MainContent>

      {showBookingForm && (
        <BookingModal>
          <ModalContent>
            <ModalHeader>
              <h3>Book Studio Time</h3>
              <CloseButton onClick={() => setShowBookingForm(false)}>×</CloseButton>
            </ModalHeader>
            <p>Booking form will be implemented here...</p>
            <Button onClick={() => setShowBookingForm(false)}>Close</Button>
          </ModalContent>
        </BookingModal>
      )}
    </CalendarContainer>
  );
};

const CalendarContainer = styled.div`
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

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const CalendarCard = styled(Card)``;

const CalendarTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const BookingsCard = styled(Card)``;

const BookingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  h3 {
    color: ${({ theme }) => theme.colors.text};
  }
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
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const BookingItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BookingTime = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  min-width: 120px;
`;

const BookingDetails = styled.div`
  flex: 1;
`;

const BookingTitle = styled.div`
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

const BookingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default CalendarPage;

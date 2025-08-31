import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import { Container, Card, Button } from '../styles/GlobalStyle';
import { BookingSlot } from '../types';
import 'react-calendar/dist/Calendar.css';

const GuestCalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

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
      },
      {
        id: '2',
        date: '2025-08-30',
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
  };

  const handleDateChange = (value: any) => {
    if (value && !Array.isArray(value) && value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleBackToHome = () => {
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
    <GuestContainer>
      <Header>
        <Container>
          <HeaderContent>
            <Title>🦎 Studio Calendar - Guest View</Title>
            <GuestInfo>
              <GuestBadge>Guest Access (Read Only)</GuestBadge>
              <Button variant="secondary" onClick={handleBackToHome}>
                Back to Home
              </Button>
            </GuestInfo>
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
              />
              <GuestNote>
                📅 Browse the calendar to see studio availability.
                Contact us to book your session!
              </GuestNote>
            </CalendarCard>

            <BookingsCard>
              <BookingsHeader>
                <h3>{formatDate(selectedDate)}</h3>
                <AvailabilityIndicator>
                  {filteredBookings.length === 0 ? (
                    <Available>✅ Available</Available>
                  ) : (
                    <Booked>📅 {filteredBookings.length} session(s) booked</Booked>
                  )}
                </AvailabilityIndicator>
              </BookingsHeader>

              <BookingsList>
                {filteredBookings.length === 0 ? (
                  <AvailableState>
                    <AvailableIcon>🎵</AvailableIcon>
                    <AvailableTitle>Studio Available</AvailableTitle>
                    <AvailableText>
                      No sessions booked for this date. 
                      The studio is available for booking!
                    </AvailableText>
                  </AvailableState>
                ) : (
                  filteredBookings.map(booking => (
                    <BookingItem key={booking.id}>
                      <BookingTime>
                        {booking.startTime} - {booking.endTime}
                      </BookingTime>
                      <BookingDetails>
                        <BookingTitle>{booking.title}</BookingTitle>
                        <BookingUser>Reserved</BookingUser>
                        <BookingStatus>Studio in use during this time</BookingStatus>
                      </BookingDetails>
                    </BookingItem>
                  ))
                )}
              </BookingsList>

              <ContactCard>
                <ContactTitle>Want to Book the Studio?</ContactTitle>
                <ContactText>
                  Contact us to reserve your studio time:
                </ContactText>
                <ContactInfo>
                  📧 booking@deadlizardstudio.com<br />
                  📱 (555) 123-ROCK<br />
                  🕒 Mon-Sun: 9 AM - 11 PM
                </ContactInfo>
              </ContactCard>
            </BookingsCard>
          </CalendarGrid>
        </Container>
      </MainContent>
    </GuestContainer>
  );
};

const GuestContainer = styled.div`
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

const GuestInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const GuestBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.warning};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
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
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const GuestNote = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  text-align: center;
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

const AvailabilityIndicator = styled.div``;

const Available = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 500;
`;

const Booked = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-weight: 500;
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AvailableState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 2px dashed ${({ theme }) => theme.colors.success};
  border-radius: 8px;
  background-color: rgba(40, 167, 69, 0.05);
`;

const AvailableIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AvailableTitle = styled.h4`
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AvailableText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BookingItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: rgba(255, 107, 53, 0.05);
  border-left: 4px solid ${({ theme }) => theme.colors.secondary};
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
  color: ${({ theme }) => theme.colors.text};
`;

const BookingUser = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const BookingStatus = styled.div`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 0.9rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-style: italic;
`;

const ContactCard = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  text-align: center;
`;

const ContactTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 1.1rem;
`;

const ContactText = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  opacity: 0.9;
`;

const ContactInfo = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 6px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.9rem;
  line-height: 1.6;
`;

export default GuestCalendarPage;

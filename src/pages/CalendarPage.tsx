import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import { Container, Card, Button } from '../styles/GlobalStyle';
import { BookingSlot, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import DayDetailView from '../components/DayDetailView';
import 'react-calendar/dist/Calendar.css';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allBookings, setAllBookings] = useState<BookingSlot[]>([]);
  const [selectedDateBookings, setSelectedDateBookings] = useState<BookingSlot[]>([]);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!state.isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Load all bookings for the calendar month
    loadAllBookings();
  }, [state.isAuthenticated, navigate]);

  useEffect(() => {
    // Filter bookings for selected date
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayBookings = allBookings.filter(booking => booking.date === dateStr);
    setSelectedDateBookings(dayBookings);
  }, [selectedDate, allBookings]);

  const loadAllBookings = async () => {
    try {
      // Get current month's bookings
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed
      
      const response = await fetch(`/api/bookings/month/${year}/${month}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map the backend data to match our frontend interface
        const mappedBookings = data.map((booking: any) => ({
          ...booking,
          _id: booking._id,
          id: booking._id,
          artistName: booking.userName, // Use userName as artistName for display
          priority: booking.priority || 'normal'
        }));
        setAllBookings(mappedBookings);
      } else {
        console.error('Failed to fetch bookings:', response.status);
        setAllBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Use mock data for development
      const mockBookings: BookingSlot[] = [
        {
          _id: '1',
          id: '1',
          date: '2025-08-31',
          startTime: '10:00',
          endTime: '12:00',
          userId: '1',
          userName: 'John Doe',
          artistName: 'John Doe',
          title: 'Band Practice',
          description: 'Weekly rehearsal',
          status: 'confirmed',
          priority: 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          id: '2',
          date: '2025-08-31',
          startTime: '14:00',
          endTime: '16:30',
          userId: '2',
          userName: 'Jane Smith',
          artistName: 'Jane Smith',
          title: 'Recording Session',
          description: 'Album recording',
          status: 'confirmed',
          priority: 'high',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setAllBookings(mockBookings);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate that end time is after start time
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        date: selectedDate.toISOString().split('T')[0],
        startTime: formData.startTime,
        endTime: formData.endTime,
        title: formData.title,
        description: formData.description
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const newBooking = await response.json();
        // Add the new booking to our state
        const mappedBooking = {
          ...newBooking,
          _id: newBooking._id,
          id: newBooking._id,
          artistName: newBooking.userName,
          priority: newBooking.priority || 'normal'
        };
        setAllBookings(prev => [...prev, mappedBooking]);
        
        // Reset form and close modal
        setFormData({ title: '', description: '', startTime: '', endTime: '' });
        setShowBookingForm(false);
        
        alert('Studio time booked successfully!');
      } else {
        const error = await response.text();
        alert(`Failed to book studio time: ${error}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to book studio time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const canEditBooking = (booking: BookingSlot) => {
    // Admin can edit any booking, Users can edit their own, Guests can't edit
    return state.role === UserRole.ADMIN || 
           (state.role === UserRole.USER && booking.userId === state.user?.id);
  };

  const canCreateBooking = () => {
    // Only Users and Admins can create bookings, not Guests
    return state.role === UserRole.USER || state.role === UserRole.ADMIN;
  };

  const handleCreateBooking = () => {
    if (canCreateBooking()) {
      setShowBookingForm(true);
    }
  };

  const handleEditBooking = (booking: BookingSlot) => {
    if (canEditBooking(booking)) {
      // TODO: Implement inline editing
      console.log('Edit booking:', booking);
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    const booking = allBookings.find((b: BookingSlot) => b.id === bookingId);
    if (booking && canEditBooking(booking)) {
      setAllBookings(prev => prev.filter((b: BookingSlot) => b.id !== bookingId));
    }
  };

  const handleDateChange = (value: any) => {
    if (value && !Array.isArray(value) && value instanceof Date) {
      setSelectedDate(value);
      setShowDayDetail(true); // Show detailed day view when a date is clicked
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

  // Get bookings that have events to show dots on calendar
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allBookings.filter((booking: BookingSlot) => booking.date === dateStr);
  };

  return (
    <CalendarContainer>
      <Header>
        <Container>
          <HeaderContent>
            <Title>🦎 Studio Calendar</Title>
            <UserInfo>
              <RoleDisplay>
                {state.role === UserRole.ADMIN && '👑 Admin'}
                {state.role === UserRole.USER && '🎵 User'}
                {state.role === UserRole.GUEST && '👁️ Guest'}
              </RoleDisplay>
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
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const dayBookings = getBookingsForDate(date);
                    if (dayBookings.length > 0) {
                      return (
                        <CalendarDot>
                          <div className="dot" />
                          {dayBookings.length > 1 && (
                            <div className="count">{dayBookings.length}</div>
                          )}
                        </CalendarDot>
                      );
                    }
                  }
                  return null;
                }}
              />
            </CalendarCard>

            <BookingsCard>
              <BookingsHeader>
                <h3>{formatDate(selectedDate)}</h3>
                {canCreateBooking() && (
                  <Button onClick={handleCreateBooking}>
                    {state.role === UserRole.ADMIN ? 'Add Event' : 'Book Time'}
                  </Button>
                )}
              </BookingsHeader>

              <BookingsList>
                {selectedDateBookings.length === 0 ? (
                  <EmptyState>
                    {state.role === UserRole.GUEST 
                      ? 'No events scheduled for this date.'
                      : 'No bookings for this date. Click "Book Time" to reserve studio time.'
                    }
                  </EmptyState>
                ) : (
                  selectedDateBookings.map((booking: BookingSlot) => (
                    <BookingItem key={booking.id}>
                      <BookingTime>
                        <TimeRange>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </TimeRange>
                        <Duration>
                          ({calculateDuration(booking.startTime, booking.endTime)})
                        </Duration>
                      </BookingTime>
                      <BookingDetails>
                        <BookingTitle>{booking.title}</BookingTitle>
                        <BookingUser>by {booking.userName}</BookingUser>
                        {booking.description && (
                          <BookingDescription>{booking.description}</BookingDescription>
                        )}
                      </BookingDetails>
                      {canEditBooking(booking) && (
                        <BookingActions>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            {state.role === UserRole.ADMIN ? 'Delete' : 'Cancel'}
                          </Button>
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

      {/* Day Detail View Modal */}
      {showDayDetail && (
        <DayDetailView
          date={selectedDate}
          bookings={selectedDateBookings}
          onClose={() => setShowDayDetail(false)}
          onBookTimeSlot={() => {
            setShowDayDetail(false);
            setShowBookingForm(true);
          }}
          userRole={state.role}
        />
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingModal>
          <ModalContent>
            <ModalHeader>
              <h3>{state.role === UserRole.ADMIN ? 'Add Studio Event' : 'Book Studio Time'}</h3>
              <CloseButton onClick={() => setShowBookingForm(false)}>×</CloseButton>
            </ModalHeader>
            <BookingForm onSubmit={handleFormSubmit}>
              <FormGroup>
                <label htmlFor="title">Event Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Band Practice, Recording Session"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about your session..."
                  rows={3}
                />
              </FormGroup>
              
              <TimeContainer>
                <FormGroup>
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="endTime">End Time</label>
                  <input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </FormGroup>
              </TimeContainer>
              
              <SelectedDateDisplay>
                📅 {formatDate(selectedDate)}
              </SelectedDateDisplay>
              
              <FormActions>
                <Button type="button" variant="secondary" onClick={() => setShowBookingForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : 'Book Studio Time'}
                </Button>
              </FormActions>
            </BookingForm>
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

const RoleDisplay = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  font-size: 0.9rem;
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

  .react-calendar__tile {
    position: relative;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: ${({ theme }) => theme.colors.primary}10;
    }
  }

  .react-calendar__tile--active {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  .react-calendar__tile--now {
    background: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
  }
`;

const CalendarDot = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 2px;

  .dot {
    width: 6px;
    height: 6px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
  }

  .count {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: bold;
  }
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
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  min-width: 140px;
`;

const TimeRange = styled.div`
  font-size: 0.95rem;
`;

const Duration = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: normal;
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

const BookingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  label {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
  }

  input, textarea {
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }
`;

const TimeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SelectedDateDisplay = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export default CalendarPage;

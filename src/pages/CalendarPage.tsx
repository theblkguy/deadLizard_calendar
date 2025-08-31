import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { BookingSlot, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import DayDetailView from '../components/DayDetailView';
import '../styles/main.scss';
import 'react-calendar/dist/Calendar.css';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allBookings, setAllBookings] = useState<BookingSlot[]>([]);
  const [selectedDateBookings, setSelectedDateBookings] = useState<BookingSlot[]>([]);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingSlot | null>(null);
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

      if (editingBooking) {
        // Update existing booking
        const response = await fetch(`/api/bookings/${editingBooking._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });

        if (response.ok) {
          const updatedBooking = await response.json();
          // Update the booking in our state
          const mappedBooking = {
            ...updatedBooking,
            _id: updatedBooking._id,
            id: updatedBooking._id,
            artistName: updatedBooking.userName,
            priority: updatedBooking.priority || 'normal'
          };
          setAllBookings(prev => 
            prev.map(booking => 
              booking._id === editingBooking._id ? mappedBooking : booking
            )
          );
          
          // Reset form and close modal
          setFormData({ title: '', description: '', startTime: '', endTime: '' });
          setEditingBooking(null);
          setShowBookingForm(false);
          
          alert('Event updated successfully!');
        } else {
          const error = await response.text();
          alert(`Failed to update event: ${error}`);
        }
      } else {
        // Create new booking
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
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Failed to save booking. Please try again.');
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
      setEditingBooking(null);
      setFormData({ title: '', description: '', startTime: '', endTime: '' });
      setShowBookingForm(true);
    }
  };

  const handleEditBooking = (booking: BookingSlot) => {
    console.log('Edit button clicked for booking:', booking);
    console.log('Can edit booking:', canEditBooking(booking));
    if (canEditBooking(booking)) {
      console.log('Setting editing booking and opening form');
      setEditingBooking(booking);
      setFormData({
        title: booking.title,
        description: booking.description || '',
        startTime: booking.startTime,
        endTime: booking.endTime
      });
      setSelectedDate(new Date(booking.date));
      setShowBookingForm(true);
    } else {
      console.log('Cannot edit this booking');
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
    <div className="calendar-page">
      <header className="header">
        <div className="header-content">
          <h1 className="title">🦎 Studio Calendar</h1>
          <div className="user-info">
            <span className="role-display">
              {state.role === UserRole.ADMIN && '👑 Admin'}
              {state.role === UserRole.USER && '🎵 User'}
              {state.role === UserRole.GUEST && '👁️ Guest'}
            </span>
            <span className="welcome-text">Welcome, {state.user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="calendar-grid">
          <div className="calendar-card">
            <h3 className="calendar-title">Select a Date</h3>
            <Calendar
              className="react-calendar"
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              tileContent={({ date, view }: { date: Date; view: string }) => {
                if (view === 'month') {
                  const dayBookings = getBookingsForDate(date);
                  if (dayBookings.length > 0) {
                    return (
                      <div className="calendar-dot">
                        <div className="dot" />
                        {dayBookings.length > 1 && (
                          <div className="count">{dayBookings.length}</div>
                        )}
                      </div>
                    );
                  }
                }
                return null;
              }}
            />
          </div>

          <div className="bookings-card">
            <div className="bookings-header">
              <h3>{formatDate(selectedDate)}</h3>
              {canCreateBooking() && (
                <button className="add-booking-btn" onClick={handleCreateBooking}>
                  {state.role === UserRole.ADMIN ? 'Add Event' : 'Book Time'}
                </button>
              )}
            </div>

            <div className="bookings-list">
              {selectedDateBookings.length === 0 ? (
                <div className="empty-state">
                  {state.role === UserRole.GUEST 
                    ? 'No events scheduled for this date.'
                    : 'No bookings for this date. Click "Book Time" to reserve studio time.'
                  }
                </div>
              ) : (
                selectedDateBookings.map((booking: BookingSlot) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-time">
                      <div className="time-range">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                      <div className="duration">
                        ({calculateDuration(booking.startTime, booking.endTime)})
                      </div>
                    </div>
                    <div className="booking-details">
                      <div className="booking-title">{booking.title}</div>
                      <div className="booking-user">by {booking.userName}</div>
                      {booking.description && (
                        <div className="booking-description">{booking.description}</div>
                      )}
                    </div>
                    {canEditBooking(booking) && (
                      <div className="booking-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditBooking(booking)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          {state.role === UserRole.ADMIN ? 'Delete' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Day Detail View Modal */}
      {showDayDetail && (
        <DayDetailView
          date={selectedDate}
          bookings={selectedDateBookings}
          onClose={() => setShowDayDetail(false)}
          onBookTimeSlot={() => {
            setShowDayDetail(false);
            setEditingBooking(null);
            setFormData({ title: '', description: '', startTime: '', endTime: '' });
            setShowBookingForm(true);
          }}
          userRole={state.role}
        />
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="booking-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingBooking 
                  ? 'Edit Studio Event' 
                  : (state.role === UserRole.ADMIN ? 'Add Studio Event' : 'Book Studio Time')
                }
              </h3>
              <button className="close-button" onClick={() => {
                setShowBookingForm(false);
                setEditingBooking(null);
                setFormData({ title: '', description: '', startTime: '', endTime: '' });
              }}>×</button>
            </div>
            <form className="booking-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Band Practice, Recording Session"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about your session..."
                  rows={3}
                />
              </div>
              
              <div className="time-container">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="selected-date-display">
                📅 {formatDate(selectedDate)}
              </div>
              
              <div className="form-actions">
                <button type="button" className="secondary" onClick={() => {
                  setShowBookingForm(false);
                  setEditingBooking(null);
                  setFormData({ title: '', description: '', startTime: '', endTime: '' });
                }}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (editingBooking ? 'Updating...' : 'Booking...') 
                    : (editingBooking ? 'Update Event' : 'Book Studio Time')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

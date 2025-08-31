import React from 'react';
import { BookingSlot, UserRole } from '../types';
import { addToGoogleCalendar, downloadICSFile, downloadMultipleICSFile } from '../utils/googleCalendar';

interface DayDetailViewProps {
  date: Date;
  bookings: BookingSlot[];
  onClose: () => void;
  onBookTimeSlot: () => void;
  userRole: UserRole;
}

const DayDetailView: React.FC<DayDetailViewProps> = ({ 
  date, 
  bookings, 
  onClose, 
  onBookTimeSlot,
  userRole 
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours >= 1) {
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
      const minutes = Math.round(diffHours * 60);
      return `${minutes}m`;
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="day-detail-modal" onClick={onClose}>
      <div className="day-detail-content" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="day-detail-header">
          <div className="date-info">
            <h2>{formatDate(date)}</h2>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="day-detail-body">
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{bookings.length}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {bookings.reduce((total, booking) => {
                    const start = new Date(`2000-01-01T${booking.startTime}`);
                    const end = new Date(`2000-01-01T${booking.endTime}`);
                    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }, 0).toFixed(1)}h
                </div>
                <div className="stat-label">Total Studio Time</div>
              </div>
            </div>
          </div>

          <div className="timeline-section">
            <div className="section-header">
              <h3>Schedule for Today</h3>
              {(userRole === UserRole.ADMIN || userRole === UserRole.USER) && (
                <button className="primary" onClick={onBookTimeSlot}>
                  + Book Time Slot
                </button>
              )}
            </div>

            {sortedBookings.length === 0 ? (
              <div className="empty-timeline">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  No bookings scheduled
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  {userRole === UserRole.GUEST 
                    ? 'The studio is available all day!'
                    : 'Click "Book Time Slot" to schedule studio time.'
                  }
                </div>
              </div>
            ) : (
              <div className="timeline">
                <div className="timeline-hours">
                  {Array.from({ length: 24 }, (_, hour) => {
                    // Get bookings that overlap with this hour
                    const hourBookings = sortedBookings.filter(booking => {
                      const startHour = parseInt(booking.startTime.split(':')[0]);
                      const endHour = parseInt(booking.endTime.split(':')[0]);
                      const endMinute = parseInt(booking.endTime.split(':')[1]);
                      
                      // Include booking if it starts in this hour, or spans through this hour
                      return startHour <= hour && (endHour > hour || (endHour === hour && endMinute > 0));
                    });

                    return (
                      <div key={hour} className="hour-slot">
                        <div className="hour-label">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </div>
                        <div className="hour-bookings">
                          {hourBookings.map((booking) => {
                            const startHour = parseInt(booking.startTime.split(':')[0]);
                            const startMinute = parseInt(booking.startTime.split(':')[1]);
                            const endHour = parseInt(booking.endTime.split(':')[0]);
                            const endMinute = parseInt(booking.endTime.split(':')[1]);
                            
                            // Calculate position and height for this specific hour
                            let startPosition = 0;
                            let endPosition = 60;
                            
                            if (startHour === hour) {
                              // Booking starts in this hour
                              startPosition = (startMinute / 60) * 60;
                            }
                            
                            if (endHour === hour) {
                              // Booking ends in this hour
                              endPosition = (endMinute / 60) * 60;
                            } else if (endHour > hour) {
                              // Booking continues past this hour
                              endPosition = 60;
                            }
                            
                            const height = endPosition - startPosition;
                            
                            // Only show the booking details in the hour it starts
                            const showDetails = startHour === hour;
                            
                            return (
                              <div
                                key={`${booking._id}-${hour}`}
                                className={`booking-block ${!showDetails ? 'booking-continuation' : ''}`}
                                style={{
                                  top: `${startPosition}px`,
                                  height: `${Math.max(height, 5)}px`
                                }}
                              >
                                {showDetails && (
                                  <>
                                    <div className="booking-header">
                                      <div className="booking-title">{booking.title}</div>
                                      <button 
                                        className="booking-export-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addToGoogleCalendar(booking);
                                        }}
                                        title="Add to Google Calendar"
                                      >
                                        📆
                                      </button>
                                    </div>
                                    <div className="booking-time">
                                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                  </>
                                )}
                                {!showDetails && (
                                  <div className="booking-continuation-label">
                                    {booking.title} (continues)
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="day-detail-actions">
          <div className="action-buttons">
            <button className="secondary" onClick={onClose}>
              Close
            </button>
            {bookings.length > 0 && (
              <>
                <button 
                  className="google-calendar-btn"
                  onClick={() => downloadMultipleICSFile(bookings, `studio-${date.toISOString().split('T')[0]}`)}
                  title="Download .ics file for all bookings"
                >
                  📅 Export Day (.ics)
                </button>
                {bookings.length === 1 && (
                  <button 
                    className="google-calendar-btn primary"
                    onClick={() => addToGoogleCalendar(bookings[0])}
                    title="Add to Google Calendar"
                  >
                    📆 Add to Google Calendar
                  </button>
                )}
              </>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            🎵 Studio Hours: Open 24/7 for your creative needs
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetailView;

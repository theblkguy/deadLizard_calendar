import React from 'react';
import styled from 'styled-components';
import { BookingSlot } from '../types';

interface DayDetailViewProps {
  date: Date;
  bookings: BookingSlot[];
  onClose: () => void;
  onBookTimeSlot: () => void;
  userRole: string;
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
    <Overlay onClick={onClose}>
      <DetailModal onClick={(e) => e.stopPropagation()}>
        <Header>
          <DateTitle>{formatDate(date)}</DateTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        
        <BookingsSummary>
          <SummaryStats>
            <StatItem>
              <StatNumber>{bookings.length}</StatNumber>
              <StatLabel>Total Bookings</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>
                {bookings.reduce((total, booking) => {
                  const start = new Date(`2000-01-01T${booking.startTime}`);
                  const end = new Date(`2000-01-01T${booking.endTime}`);
                  return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                }, 0).toFixed(1)}h
              </StatNumber>
              <StatLabel>Total Studio Time</StatLabel>
            </StatItem>
          </SummaryStats>
        </BookingsSummary>

        <BookingsContainer>
          <SectionHeader>
            <SectionTitle>Schedule for Today</SectionTitle>
            {(userRole === 'admin' || userRole === 'user') && (
              <BookTimeButton onClick={onBookTimeSlot}>
                + Book Time Slot
              </BookTimeButton>
            )}
          </SectionHeader>

          {sortedBookings.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📅</EmptyIcon>
              <EmptyTitle>No bookings scheduled</EmptyTitle>
              <EmptyMessage>
                {userRole === 'guest' 
                  ? 'The studio is available all day!'
                  : 'Click "Book Time Slot" to schedule studio time.'
                }
              </EmptyMessage>
            </EmptyState>
          ) : (
            <BookingsList>
              {sortedBookings.map((booking) => (
                <BookingCard key={booking._id} priority={booking.priority || 'normal'}>
                  <BookingTime>
                    <TimeRange>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </TimeRange>
                    <Duration>
                      {calculateDuration(booking.startTime, booking.endTime)}
                    </Duration>
                  </BookingTime>
                  
                  <BookingContent>
                    <BookingTitle>{booking.title}</BookingTitle>
                    {booking.description && (
                      <BookingDescription>{booking.description}</BookingDescription>
                    )}
                    <BookingMeta>
                      <MetaItem>
                        <MetaLabel>Artist:</MetaLabel>
                        <MetaValue>{booking.artistName}</MetaValue>
                      </MetaItem>
                      {booking.priority && booking.priority !== 'normal' && (
                        <PriorityBadge priority={booking.priority}>
                          {booking.priority.toUpperCase()}
                        </PriorityBadge>
                      )}
                    </BookingMeta>
                  </BookingContent>
                </BookingCard>
              ))}
            </BookingsList>
          )}
        </BookingsContainer>

        <StudioHours>
          <small>🎵 Studio Hours: Open 24/7 for your creative needs</small>
        </StudioHours>
      </DetailModal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const DetailModal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const DateTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #95a5a6;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #2c3e50;
  }
`;

const BookingsSummary = styled.div`
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const SummaryStats = styled.div`
  display: flex;
  gap: 32px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const BookingsContainer = styled.div`
  padding: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
`;

const BookTimeButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const EmptyMessage = styled.div`
  font-size: 0.95rem;
  line-height: 1.5;
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BookingCard = styled.div<{ priority: string }>`
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  background: white;
  transition: all 0.2s ease;
  border-left: 4px solid ${props => 
    props.priority === 'high' ? '#e74c3c' :
    props.priority === 'medium' ? '#f39c12' : '#3498db'
  };

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const BookingTime = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TimeRange = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
`;

const Duration = styled.div`
  background: #f8f9fa;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const BookingContent = styled.div``;

const BookingTitle = styled.div`
  font-weight: 600;
  font-size: 1.05rem;
  color: #2c3e50;
  margin-bottom: 6px;
`;

const BookingDescription = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 10px;
`;

const BookingMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetaItem = styled.div`
  display: flex;
  gap: 4px;
  font-size: 0.85rem;
`;

const MetaLabel = styled.span`
  color: #6c757d;
`;

const MetaValue = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  background: ${props => 
    props.priority === 'high' ? '#e74c3c' :
    props.priority === 'medium' ? '#f39c12' : '#3498db'
  };
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const StudioHours = styled.div`
  padding: 16px 24px;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
  text-align: center;
  color: #6c757d;
`;

export default DayDetailView;

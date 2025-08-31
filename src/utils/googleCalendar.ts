import { BookingSlot } from '../types';

// Format date for Google Calendar (ICS format)
export const formatDateForICS = (date: string, time: string): string => {
  const datetime = new Date(`${date}T${time}:00`);
  return datetime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Generate ICS file content for a single booking
export const generateICSContent = (booking: BookingSlot): string => {
  const startDateTime = formatDateForICS(booking.date, booking.startTime);
  const endDateTime = formatDateForICS(booking.date, booking.endTime);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dead Lizard Studio//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${booking._id}@deadlizardstudio.com
DTSTART:${startDateTime}
DTEND:${endDateTime}
DTSTAMP:${now}
SUMMARY:🎵 ${booking.title}
DESCRIPTION:Studio Session\\n\\nArtist: ${booking.artistName}\\nDescription: ${booking.description || 'No description'}\\n\\nPriority: ${booking.priority}\\nStatus: ${booking.status}
LOCATION:Dead Lizard Studio
CATEGORIES:MUSIC,STUDIO
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Studio session starting in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

// Download ICS file
export const downloadICSFile = (booking: BookingSlot): void => {
  const icsContent = generateICSContent(booking);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `studio-session-${booking.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${booking.date}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

// Generate Google Calendar URL
export const generateGoogleCalendarURL = (booking: BookingSlot): string => {
  const startDate = new Date(`${booking.date}T${booking.startTime}:00`);
  const endDate = new Date(`${booking.date}T${booking.endTime}:00`);
  
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startDateTime = formatGoogleDate(startDate);
  const endDateTime = formatGoogleDate(endDate);
  
  const title = encodeURIComponent(`🎵 ${booking.title}`);
  const details = encodeURIComponent(
    `Studio Session\n\nArtist: ${booking.artistName}\nDescription: ${booking.description || 'No description'}\n\nPriority: ${booking.priority}\nStatus: ${booking.status}`
  );
  const location = encodeURIComponent('Dead Lizard Studio');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}&sf=true&output=xml`;
};

// Open Google Calendar in new tab
export const addToGoogleCalendar = (booking: BookingSlot): void => {
  const url = generateGoogleCalendarURL(booking);
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Generate ICS content for multiple bookings
export const generateMultipleICSContent = (bookings: BookingSlot[]): string => {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dead Lizard Studio//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH`;

  bookings.forEach(booking => {
    const startDateTime = formatDateForICS(booking.date, booking.startTime);
    const endDateTime = formatDateForICS(booking.date, booking.endTime);
    
    icsContent += `
BEGIN:VEVENT
UID:${booking._id}@deadlizardstudio.com
DTSTART:${startDateTime}
DTEND:${endDateTime}
DTSTAMP:${now}
SUMMARY:🎵 ${booking.title}
DESCRIPTION:Studio Session\\n\\nArtist: ${booking.artistName}\\nDescription: ${booking.description || 'No description'}\\n\\nPriority: ${booking.priority}\\nStatus: ${booking.status}
LOCATION:Dead Lizard Studio
CATEGORIES:MUSIC,STUDIO
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Studio session starting in 15 minutes
END:VALARM
END:VEVENT`;
  });

  icsContent += `
END:VCALENDAR`;

  return icsContent;
};

// Download ICS file for multiple bookings
export const downloadMultipleICSFile = (bookings: BookingSlot[], fileName: string = 'studio-bookings'): void => {
  const icsContent = generateMultipleICSContent(bookings);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

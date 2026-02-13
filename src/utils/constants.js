/**
 * Application constants for Bus Ticket Booking System
 */

// Seat Configuration
export const SEAT_ROWS = 15;
export const SEAT_COLUMNS = ['A', 'B', 'C', 'D'];
export const MAX_SEATS_PER_BOOKING = 6;
export const TOTAL_SEATS = SEAT_ROWS * SEAT_COLUMNS.length;

// Seat States
export const SEAT_STATES = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
};

// Colors (matching the UI screenshots)
export const COLORS = {
  PRIMARY: '#5B9FF9', // Blue for primary actions and accents
  PRIMARY_DARK: '#4A8CE8',
  SECONDARY: '#FFFFFF',
  ORANGE: '#FF9500', // For selection indicators
  SUCCESS: '#4CAF50', // Green for success states
  ERROR: '#F44336', // Red for errors
  WARNING: '#FF9800',
  TEXT_DARK: '#333333',
  TEXT_LIGHT: '#666666',
  TEXT_MUTED: '#999999',
  BORDER: '#E0E0E0',
  BACKGROUND: '#F5F5F5',
  CARD_BACKGROUND: '#FFFFFF',
  SEAT_AVAILABLE: '#FFFFFF',
  SEAT_SELECTED: '#FF9500',
  SEAT_BOOKED: '#E0E0E0',
};

// Mobile Number Validation
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;
export const MOBILE_ERROR = 'Please enter a valid 10-digit mobile number starting with 6-9';

// Booking ID Format
export const BOOKING_ID_PREFIX = 'BK';
export const BOOKING_DATE_FORMAT = 'YYYYMMDD';

// Local Storage Keys
export const STORAGE_KEYS = {
  BOOKINGS: 'busBookings',
};

// Boarding Status
export const BOARDING_STATUS = {
  NOT_BOARDED: 'not_boarded',
  BOARDED: 'boarded',
};

// Messages
export const MESSAGES = {
  SEAT_LIMIT_REACHED: 'Seat limit reached. Maximum 6 seats per mobile number per day.',
  DUPLICATE_BOOKING: 'These seats are already booked for this date.',
  BOOKING_SUCCESS: 'Booking created successfully!',
  BOOKING_UPDATED: 'Booking updated successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully!',
  PAST_DATE_ERROR: 'Cannot book for past dates.',
  NO_BOOKINGS: 'No bookings found for the selected date.',
  CONFIRM_DELETE: 'Are you sure you want to cancel this booking?',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  STORAGE: 'YYYY-MM-DD',
  READABLE: 'D MMMM YYYY',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to save booking. Please try again.',
  INVALID_MOBILE: MOBILE_ERROR,
  PAST_DATE: 'Travel date cannot be in the past.',
  NO_SEATS_SELECTED: 'Please select at least one seat.',
  SEAT_LIMIT: `You cannot book more than ${MAX_SEATS_PER_BOOKING} seats.`,
  SAME_MOBILE_LIMIT: 'This mobile number has already booked {booked} seats for this date. You can book {remaining} more seats.',
};

// Pagination
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1024,
};
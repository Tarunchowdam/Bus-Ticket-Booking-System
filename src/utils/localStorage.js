/**
 * Local Storage utility functions for Bus Ticket Booking System
 * Handles all data persistence operations
 */

import { STORAGE_KEYS, BOOKING_ID_PREFIX } from './constants';

// Determine if localStorage is usable; some browsers or contexts (e.g. private mode)
// may throw when trying to access it. We cache the result for performance.
let _localStorageAvailable;
const isLocalStorageAvailable = () => {
  if (_localStorageAvailable !== undefined) {
    return _localStorageAvailable;
  }
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    _localStorageAvailable = true;
  } catch (err) {
    console.warn('Local storage unavailable, falling back to in-memory store.', err);
    _localStorageAvailable = false;
  }
  return _localStorageAvailable;
};

// In-memory fallback store used when localStorage isn't writable
let _inMemoryStore = { bookings: [], lastBookingNumber: 0 };

/**
 * Get all bookings from local storage
 * @returns {Object} Object containing bookings array and last booking number
 */
export const getBookingsFromStorage = () => {
  if (!isLocalStorageAvailable()) {
    // return our in-memory copy
    return { ..._inMemoryStore };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!data) {
      return {
        bookings: [],
        lastBookingNumber: 0,
      };
    }
    // parse and validate structure
    const parsed = JSON.parse(data);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.bookings) ||
      typeof parsed.lastBookingNumber !== 'number'
    ) {
      // if storage contains unexpected format, clear it to avoid repeated errors
      console.warn('Unexpected bookings storage format detected, resetting. Value:', parsed);
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      return { bookings: [], lastBookingNumber: 0 };
    }
    return parsed;
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return {
      bookings: [],
      lastBookingNumber: 0,
    };
  }
};

/**
 * Save bookings to local storage
 * @param {Object} data - Object containing bookings array and last booking number
 */
export const saveBookingsToStorage = (data) => {
  if (!isLocalStorageAvailable()) {
    // simply update in-memory store and pretend it succeeded
    _inMemoryStore = { ...data };
    return true;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data));
    return true;
  } catch (error) {
    // include the data being saved to aid debugging (may be stringified safely)
    console.error('Error saving to local storage in saveBookingsToStorage:', error, data);
    return false;
  }
};

/**
 * Save a booking (create or update)
 * @param {Object} booking - Booking object to save
 * @returns {Object} Result object with success flag and message
 */
export const saveBooking = (booking) => {
  try {
    const data = getBookingsFromStorage();
    const existingIndex = data.bookings.findIndex(
      (b) => b.bookingId === booking.bookingId
    );

    if (existingIndex >= 0) {
      // Update existing booking
      data.bookings[existingIndex] = booking;
    } else {
      // Add new booking
      data.bookings.push(booking);
      // Update last booking number if it's higher
      const bookingNumber = parseInt(booking.bookingId.split('-').pop(), 10);
      if (bookingNumber > data.lastBookingNumber) {
        data.lastBookingNumber = bookingNumber;
      }
    }

    const success = saveBookingsToStorage(data);
    if (!success) {
      // Local storage write failed; provide more context to the caller
      console.error('saveBooking failed because saveBookingsToStorage returned false', booking);
      return {
        success: false,
        message: 'Unable to save booking. Please try again.',
      };
    }

    return {
      success: true,
      message: existingIndex >= 0 
        ? 'Booking updated successfully!' 
        : 'Booking created successfully!',
      booking,
    };
  } catch (error) {
    console.error('Error saving booking (exception thrown):', error, booking);
    return {
      success: false,
      message: 'Unable to save booking. Please try again.',
    };
  }
};

/**
 * Get all bookings for a specific date
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Array} Array of booking objects for the specified date
 */
export const getBookingsByDate = (date) => {
  try {
    const data = getBookingsFromStorage();
    return data.bookings.filter((booking) => booking.travelDate === date);
  } catch (error) {
    console.error('Error getting bookings by date:', error);
    return [];
  }
};

/**
 * Get all bookings for a specific mobile number and date
 * @param {string} mobileNumber - 10-digit mobile number
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {string} excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns {Array} Array of booking objects
 */
export const getBookingsByMobileAndDate = (mobileNumber, date, excludeBookingId = null) => {
  try {
    const data = getBookingsFromStorage();
    if (!data || !Array.isArray(data.bookings)) {
      console.warn('getBookingsByMobileAndDate received invalid data:', data);
      return [];
    }
    return data.bookings.filter(
      (booking) =>
        booking.mobileNumber === mobileNumber &&
        booking.travelDate === date &&
        booking.bookingId !== excludeBookingId
    );
  } catch (error) {
    console.error('Error getting bookings by mobile and date:', error);
    return [];
  }
};

/**
 * Get booked seats for a specific date
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {string} excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns {Array} Array of booked seat numbers
 */
export const getBookedSeatsByDate = (date, excludeBookingId = null) => {
  try {
    const bookings = getBookingsByDate(date);
    const bookedSeats = bookings
      .filter((booking) => booking.bookingId !== excludeBookingId)
      .flatMap((booking) => booking.seats);
    return bookedSeats;
  } catch (error) {
    console.error('Error getting booked seats:', error);
    return [];
  }
};

/**
 * Get total seats booked by a mobile number for a specific date
 * @param {string} mobileNumber - 10-digit mobile number
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {string} excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns {number} Total number of seats booked
 */
export const getSeatsCountByMobileAndDate = (mobileNumber, date, excludeBookingId = null) => {
  try {
    const bookings = getBookingsByMobileAndDate(mobileNumber, date, excludeBookingId);
    return bookings.reduce((total, booking) => total + booking.seats.length, 0);
  } catch (error) {
    console.error('Error getting seats count:', error);
    return 0;
  }
};

/**
 * Delete a booking by ID
 * @param {string} bookingId - Booking ID to delete
 * @returns {Object} Result object with success flag and message
 */
export const deleteBooking = (bookingId) => {
  try {
    const data = getBookingsFromStorage();
    const initialLength = data.bookings.length;
    data.bookings = data.bookings.filter((booking) => booking.bookingId !== bookingId);
    
    if (data.bookings.length === initialLength) {
      return {
        success: false,
        message: 'Booking not found.',
      };
    }

    const success = saveBookingsToStorage(data);
    return {
      success,
      message: success ? 'Booking cancelled successfully!' : 'Unable to cancel booking.',
    };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      success: false,
      message: 'Unable to cancel booking. Please try again.',
    };
  }
};

/**
 * Update boarding status for a booking
 * @param {string} bookingId - Booking ID to update
 * @param {string} status - New boarding status ('boarded' or 'not_boarded')
 * @returns {Object} Result object with success flag and message
 */
export const updateBoardingStatus = (bookingId, status) => {
  try {
    const data = getBookingsFromStorage();
    const booking = data.bookings.find((b) => b.bookingId === bookingId);
    
    if (!booking) {
      return {
        success: false,
        message: 'Booking not found.',
      };
    }

    booking.boardingStatus = status;
    const success = saveBookingsToStorage(data);
    return {
      success,
      message: success ? 'Boarding status updated!' : 'Unable to update status.',
      booking,
    };
  } catch (error) {
    console.error('Error updating boarding status:', error);
    return {
      success: false,
      message: 'Unable to update status. Please try again.',
    };
  }
};

/**
 * Get next sequential booking number for a date
 * @returns {number} Next booking number
 */
export const getNextBookingNumber = () => {
  try {
    const data = getBookingsFromStorage();
    return data.lastBookingNumber + 1;
  } catch (error) {
    console.error('Error getting next booking number:', error);
    return 1;
  }
};

/**
 * Generate a new booking ID
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {string} Booking ID in format BK-YYYYMMDD-XXX
 */
export const generateBookingId = (date) => {
  const datePart = date.replace(/-/g, '');
  const sequenceNumber = getNextBookingNumber().toString().padStart(6, '0');
  return `${BOOKING_ID_PREFIX}-${datePart}-${sequenceNumber}`;
};

/**
 * Clear all bookings (for testing/reset purposes)
 * @returns {boolean} Success status
 */
export const clearAllBookings = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    return true;
  } catch (error) {
    console.error('Error clearing bookings:', error);
    return false;
  }
};
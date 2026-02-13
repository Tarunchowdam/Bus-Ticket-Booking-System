/**
 * Validation utility functions for Bus Ticket Booking System
 * Handles input validation and error checking
 */

import { MOBILE_PATTERN, MAX_SEATS_PER_BOOKING, ERROR_MESSAGES } from './constants';

/**
 * Validate Indian mobile number
 * @param {string} mobileNumber - Mobile number to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateMobileNumber = (mobileNumber) => {
  if (!mobileNumber) {
    return {
      isValid: false,
      error: 'Mobile number is required.',
    };
  }

  // Remove any spaces, dashes, or other formatting
  const cleanedNumber = mobileNumber.replace(/[\s-]/g, '');

  if (cleanedNumber.length !== 10) {
    return {
      isValid: false,
      error: 'Mobile number must be exactly 10 digits.',
    };
  }

  if (!MOBILE_PATTERN.test(cleanedNumber)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_MOBILE,
    };
  }

  return {
    isValid: true,
    error: null,
    cleanedNumber,
  };
};

/**
 * Validate travel date
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateTravelDate = (dateString) => {
  if (!dateString) {
    return {
      isValid: false,
      error: 'Travel date is required.',
    };
  }

  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Reset time part for comparison
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.PAST_DATE,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate seat selection
 * @param {Array} selectedSeats - Array of selected seat numbers
 * @param {number} maxSeats - Maximum allowed seats (default: 6)
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateSeatSelection = (selectedSeats, maxSeats = MAX_SEATS_PER_BOOKING) => {
  if (!selectedSeats || selectedSeats.length === 0) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.NO_SEATS_SELECTED,
    };
  }

  if (selectedSeats.length > maxSeats) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.SEAT_LIMIT,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Check for duplicate seat bookings
 * @param {Array} selectedSeats - Array of selected seat numbers
 * @param {Array} bookedSeats - Array of already booked seat numbers
 * @returns {Object} Validation result with isValid flag and error message
 */
export const checkDuplicateSeats = (selectedSeats, bookedSeats) => {
  const duplicates = selectedSeats.filter((seat) => bookedSeats.includes(seat));

  if (duplicates.length > 0) {
    return {
      isValid: false,
      error: `The following seats are already booked: ${duplicates.join(', ')}`,
      duplicates,
    };
  }

  return {
    isValid: true,
    error: null,
    duplicates: [],
  };
};

/**
 * Check seat limit for a mobile number on a specific date
 * @param {string} mobileNumber - Mobile number
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {number} selectedSeatsCount - Number of seats being selected
 * @param {number} alreadyBookedCount - Number of seats already booked
 * @returns {Object} Validation result with isValid flag and error message
 */
export const checkSeatLimitForMobile = (
  mobileNumber,
  date,
  selectedSeatsCount,
  alreadyBookedCount
) => {
  const totalSeats = selectedSeatsCount + alreadyBookedCount;

  if (totalSeats > MAX_SEATS_PER_BOOKING) {
    const remainingSeats = MAX_SEATS_PER_BOOKING - alreadyBookedCount;
    return {
      isValid: false,
      error: ERROR_MESSAGES.SAME_MOBILE_LIMIT
        .replace('{booked}', alreadyBookedCount)
        .replace('{remaining}', remainingSeats > 0 ? remainingSeats : 0),
      remainingSeats,
    };
  }

  return {
    isValid: true,
    error: null,
    remainingSeats: MAX_SEATS_PER_BOOKING - totalSeats,
  };
};

/**
 * Validate booking form data
 * @param {Object} formData - Form data object
 * @param {Array} bookedSeats - Array of already booked seat numbers
 * @param {number} existingSeatsCount - Number of seats already booked by this mobile (for updates)
 * @returns {Object} Validation result with isValid flag and errors object
 */
export const validateBookingForm = (
  formData,
  bookedSeats = [],
  existingSeatsCount = 0
) => {
  const errors = {};

  // Validate mobile number
  const mobileValidation = validateMobileNumber(formData.mobileNumber);
  if (!mobileValidation.isValid) {
    errors.mobileNumber = mobileValidation.error;
  } else {
    formData.mobileNumber = mobileValidation.cleanedNumber;
  }

  // Validate travel date
  const dateValidation = validateTravelDate(formData.travelDate);
  if (!dateValidation.isValid) {
    errors.travelDate = dateValidation.error;
  }

  // Validate seat selection
  const seatValidation = validateSeatSelection(formData.seats);
  if (!seatValidation.isValid) {
    errors.seats = seatValidation.error;
  }

  // Check for duplicate seats (only for new bookings)
  if (Object.keys(errors).length === 0 && formData.bookingId) {
    // For updates, exclude current booking from duplicate check
    const excludeSeats = bookedSeats.filter(
      (seat) => !formData.currentSeats || !formData.currentSeats.includes(seat)
    );
    const duplicateCheck = checkDuplicateSeats(formData.seats, excludeSeats);
    if (!duplicateCheck.isValid) {
      errors.seats = duplicateCheck.error;
    }
  } else if (Object.keys(errors).length === 0 && !formData.bookingId) {
    // For new bookings, check all booked seats
    const duplicateCheck = checkDuplicateSeats(formData.seats, bookedSeats);
    if (!duplicateCheck.isValid) {
      errors.seats = duplicateCheck.error;
    }
  }

  // Check seat limit for mobile number
  if (Object.keys(errors).length === 0) {
    const limitCheck = checkSeatLimitForMobile(
      formData.mobileNumber,
      formData.travelDate,
      formData.seats.length,
      existingSeatsCount
    );
    if (!limitCheck.isValid) {
      errors.seats = limitCheck.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format mobile number for display
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {string} Formatted mobile number (XXX-XXX-XXXX)
 */
export const formatMobileNumber = (mobileNumber) => {
  if (!mobileNumber || mobileNumber.length !== 10) {
    return mobileNumber;
  }
  return `${mobileNumber.slice(0, 3)}-${mobileNumber.slice(3, 6)}-${mobileNumber.slice(6)}`;
};

/**
 * Parse formatted mobile number
 * @param {string} formattedNumber - Formatted mobile number (XXX-XXX-XXXX)
 * @returns {string} Clean 10-digit mobile number
 */
export const parseMobileNumber = (formattedNumber) => {
  if (!formattedNumber) {
    return '';
  }
  return formattedNumber.replace(/[\s-]/g, '');
};

/**
 * Format date for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "15 June 2025")
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
};

/**
 * Format date time for display
 * @param {string} dateTimeString - Date time string in ISO format
 * @returns {string} Formatted date time
 */
export const formatDateTimeForDisplay = (dateTimeString) => {
  if (!dateTimeString) {
    return '';
  }
  const date = new Date(dateTimeString);
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-IN', options);
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date string
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format seats for display (sorted)
 * @param {Array} seats - Array of seat numbers
 * @returns {string} Comma-separated sorted seats
 */
export const formatSeatsForDisplay = (seats) => {
  if (!seats || seats.length === 0) {
    return '';
  }
  return [...seats].sort().join(', ');
};
/**
 * Optimal Boarding Sequence Algorithm
 * 
 * Problem: Calculate the optimal boarding sequence to minimize total boarding time.
 * 
 * Assumptions:
 * 1. Each passenger takes 60 seconds to settle into their seat
 * 2. While a passenger is settling, no one behind them can pass
 * 3. All passengers under the same Booking ID board together as a group
 * 4. Boarding happens only through the front gate (Row 1 is nearest, Row 15 is farthest)
 * 5. Walking time inside the bus is negligible compared to settling time
 * 6. Back-to-front strategy minimizes blocking
 */

/**
 * Extract row number from seat identifier
 * @param {string} seat - Seat identifier (e.g., "A1", "B5", "C15")
 * @returns {number} Row number
 */
export const extractRowNumber = (seat) => {
  if (!seat) return 0;
  // Seat format is [Column][Row], e.g., "A1", "B5"
  // Extract the numeric part
  const rowMatch = seat.match(/\d+/);
  return rowMatch ? parseInt(rowMatch[0], 10) : 0;
};

/**
 * Find the farthest seat row number in a booking
 * @param {Array} seats - Array of seat identifiers
 * @returns {number} Farthest row number (highest row)
 */
export const findFarthestRow = (seats) => {
  if (!seats || seats.length === 0) return 0;
  return Math.max(...seats.map(extractRowNumber));
};

/**
 * Count seats in a specific row
 * @param {Array} seats - Array of seat identifiers
 * @param {number} row - Row number
 * @returns {number} Number of seats in the specified row
 */
export const countSeatsInRow = (seats, row) => {
  if (!seats || seats.length === 0) return 0;
  return seats.filter((seat) => extractRowNumber(seat) === row).length;
};

/**
 * Calculate optimal boarding sequence for bookings
 * This algorithm minimizes total boarding time by using back-to-front boarding
 * 
 * Algorithm Logic:
 * 1. For each booking, identify the farthest seat (highest row number)
 * 2. Primary Sort: Sort bookings by farthest seat in descending order (highest row first)
 * 3. Secondary Sort: If tied on farthest row:
 *    - Prioritize booking with more seats in that row
 *    - If still tied, sort by total number of seats (more seats first)
 *    - If still tied, sort by Booking ID alphabetically
 * 
 * @param {Array} bookings - Array of booking objects with seats array
 * @returns {Array} Sorted bookings with sequence numbers and farthest row
 */
export const calculateOptimalBoardingSequence = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return [];
  }

  // Create a copy of bookings to avoid mutating the original array
  const bookingsWithMetadata = bookings.map((booking) => ({
    ...booking,
    farthestRow: findFarthestRow(booking.seats),
    totalSeats: booking.seats.length,
    seatsInFarthestRow: countSeatsInRow(booking.seats, findFarthestRow(booking.seats)),
  }));

  // Sort by the optimal boarding sequence algorithm
  const sortedBookings = bookingsWithMetadata.sort((a, b) => {
    // Primary sort: Farthest row (descending - back to front)
    if (b.farthestRow !== a.farthestRow) {
      return b.farthestRow - a.farthestRow;
    }

    // Secondary sort 1: More seats in farthest row (descending)
    if (b.seatsInFarthestRow !== a.seatsInFarthestRow) {
      return b.seatsInFarthestRow - a.seatsInFarthestRow;
    }

    // Secondary sort 2: Total seats (descending)
    if (b.totalSeats !== a.totalSeats) {
      return b.totalSeats - a.totalSeats;
    }

    // Tertiary sort: Booking ID (alphabetical)
    return a.bookingId.localeCompare(b.bookingId);
  });

  // Assign sequence numbers
  return sortedBookings.map((booking, index) => ({
    ...booking,
    sequenceNumber: index + 1,
  }));
};

/**
 * Calculate estimated total boarding time based on optimal sequence
 * In the optimal back-to-front approach, all passengers can board simultaneously
 * without blocking, so the total time is simply the settling time of one passenger
 * 
 * However, if we want to be conservative and account for any inefficiencies,
 * we can use the maximum sequence number * 60 seconds
 * 
 * @param {Array} bookings - Array of bookings with sequence numbers
 * @returns {Object} Time information object
 */
export const calculateBoardingTime = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return {
      optimalTimeSeconds: 0,
      optimalTimeMinutes: 0,
      optimalTimeMessage: '0 seconds',
    };
  }

  // In optimal back-to-front boarding, all groups board simultaneously
  // Total time = settling time of one passenger = 60 seconds
  const optimalTimeSeconds = 60;
  const optimalTimeMinutes = Math.floor(optimalTimeSeconds / 60);
  const remainingSeconds = optimalTimeSeconds % 60;

  let optimalTimeMessage;
  if (optimalTimeMinutes > 0 && remainingSeconds > 0) {
    optimalTimeMessage = `${optimalTimeMinutes} min ${remainingSeconds} sec`;
  } else if (optimalTimeMinutes > 0) {
    optimalTimeMessage = `${optimalTimeMinutes} minute${optimalTimeMinutes > 1 ? 's' : ''}`;
  } else {
    optimalTimeMessage = `${remainingSeconds} seconds`;
  }

  return {
    optimalTimeSeconds,
    optimalTimeMinutes,
    optimalTimeMessage,
  };
};

/**
 * Calculate what the boarding time would be with natural (front-to-back) order
 * This is used to show time savings of the optimal sequence
 * 
 * @param {Array} bookings - Array of bookings (any order)
 * @returns {number} Total boarding time in seconds for natural order
 */
export const calculateNaturalOrderTime = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return 0;
  }

  // Natural order (front-to-back): Each group must wait for previous groups to settle
  // Total time = sum of settling times for all groups = number of groups * 60 seconds
  const totalGroups = bookings.length;
  return totalGroups * 60;
};

/**
 * Calculate time savings of optimal vs natural order
 * @param {number} naturalTimeSeconds - Natural order time in seconds
 * @param {number} optimalTimeSeconds - Optimal order time in seconds
 * @returns {Object} Savings information
 */
export const calculateTimeSavings = (naturalTimeSeconds, optimalTimeSeconds) => {
  const savingsSeconds = naturalTimeSeconds - optimalTimeSeconds;
  const savingsMinutes = Math.floor(savingsSeconds / 60);
  const remainingSeconds = savingsSeconds % 60;

  let savingsMessage;
  if (savingsMinutes > 0 && remainingSeconds > 0) {
    savingsMessage = `${savingsMinutes}m ${remainingSeconds}s`;
  } else if (savingsMinutes > 0) {
    savingsMessage = `${savingsMinutes}m`;
  } else {
    savingsMessage = `${remainingSeconds}s`;
  }

  const savingsPercentage = ((savingsSeconds / naturalTimeSeconds) * 100).toFixed(0);

  return {
    savingsSeconds,
    savingsMinutes,
    savingsMessage,
    savingsPercentage,
  };
};

/**
 * Sort bookings by a specific column (for table sorting)
 * @param {Array} bookings - Array of bookings
 * @param {string} column - Column to sort by ('sequence', 'bookingId', 'seats', 'mobile')
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted bookings
 */
export const sortBookingsByColumn = (bookings, column, direction = 'asc') => {
  if (!bookings || bookings.length === 0) {
    return [];
  }

  const sorted = [...bookings].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case 'sequence':
        comparison = (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
        break;
      case 'bookingId':
        comparison = a.bookingId.localeCompare(b.bookingId);
        break;
      case 'seats':
        // Sort by first seat in booking
        const aSeats = [...a.seats].sort();
        const bSeats = [...b.seats].sort();
        comparison = aSeats[0]?.localeCompare(bSeats[0]) || 0;
        break;
      case 'mobile':
        comparison = a.mobileNumber.localeCompare(b.mobileNumber);
        break;
      default:
        comparison = 0;
    }

    return direction === 'desc' ? -comparison : comparison;
  });

  return sorted;
};

/**
 * Filter bookings by search term
 * @param {Array} bookings - Array of bookings
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered bookings
 */
export const filterBookingsBySearch = (bookings, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return bookings;
  }

  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  return bookings.filter((booking) => {
    return (
      booking.bookingId.toLowerCase().includes(lowerSearchTerm) ||
      booking.mobileNumber.includes(lowerSearchTerm)
    );
  });
};

/**
 * Calculate boarding statistics
 * @param {Array} bookings - Array of bookings
 * @returns {Object} Statistics object
 */
export const calculateBoardingStatistics = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return {
      totalBookings: 0,
      totalPassengers: 0,
      boardedPassengers: 0,
      notBoardedPassengers: 0,
      boardingProgress: 0,
    };
  }

  const totalBookings = bookings.length;
  const totalPassengers = bookings.reduce((sum, booking) => sum + booking.seats.length, 0);
  const boardedBookings = bookings.filter((b) => b.boardingStatus === 'boarded');
  const boardedPassengers = boardedBookings.reduce(
    (sum, booking) => sum + booking.seats.length,
    0
  );
  const notBoardedPassengers = totalPassengers - boardedPassengers;
  const boardingProgress = totalPassengers > 0 ? (boardedPassengers / totalPassengers) * 100 : 0;

  return {
    totalBookings,
    totalPassengers,
    boardedPassengers,
    notBoardedPassengers,
    boardingProgress: Math.round(boardingProgress),
  };
};

/**
 * Check if all passengers have boarded
 * @param {Array} bookings - Array of bookings
 * @returns {boolean} True if all boarded, false otherwise
 */
export const areAllPassengersBoarded = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return true;
  }
  return bookings.every((booking) => booking.boardingStatus === 'boarded');
};

/**
 * Get the next passenger to board based on optimal sequence
 * @param {Array} bookings - Array of bookings with sequence numbers
 * @returns {Object|null} Next booking to board or null if all boarded
 */
export const getNextPassengerToBoard = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return null;
  }

  // Find the first booking in sequence that hasn't boarded yet
  const sortedBySequence = [...bookings].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  return sortedBySequence.find((booking) => booking.boardingStatus !== 'boarded') || null;
};
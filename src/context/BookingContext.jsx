import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getBookingsByDate,
  getBookedSeatsByDate,
  getSeatsCountByMobileAndDate,
  saveBooking,
  deleteBooking,
  updateBoardingStatus,
  generateBookingId,
} from '../utils/localStorage';
import { getTodayDate } from '../utils/validation';
import {
  calculateOptimalBoardingSequence,
  calculateBoardingTime,
  calculateNaturalOrderTime,
  calculateTimeSavings,
  calculateBoardingStatistics,
  sortBookingsByColumn,
  filterBookingsBySearch,
} from '../utils/boardingAlgorithm';

// Create Context
const BookingContext = createContext();

/**
 * Booking Provider Component
 * Wraps the application and provides booking state and functions
 */
export const BookingProvider = ({ children }) => {
  // Current selected date (defaults to today)
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // All bookings for the selected date
  const [bookings, setBookings] = useState([]);

  // Currently selected seats for new booking
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Current form data
  const [formData, setFormData] = useState({
    travelDate: getTodayDate(),
    mobileNumber: '',
    seats: [],
  });

  // Currently editing booking (null if creating new)
  const [editingBooking, setEditingBooking] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Success message state
  const [successMessage, setSuccessMessage] = useState(null);

  // Show confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState(null);

  // Show booking confirmation modal state
  const [showBookingConfirmModal, setShowBookingConfirmModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Boarding page state
  const [boardingSortColumn, setBoardingSortColumn] = useState('sequence');
  const [boardingSortDirection, setBoardingSortDirection] = useState('asc');
  const [boardingSearchTerm, setBoardingSearchTerm] = useState('');
  const [boardingMode, setBoardingMode] = useState('natural');

  /**
   * Load bookings for the selected date
   */
  const loadBookings = useCallback(() => {
    try {
      setLoading(true);
      const dateBookings = getBookingsByDate(selectedDate);
      
      // Calculate optimal boarding sequence
      // const optimizedBookings = calculateOptimalBoardingSequence(dateBookings);
      
      // setBookings(optimizedBookings);
      setBookings(dateBookings); // store raw natural order
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Load bookings when selected date changes
  // include loadBookings in dependency array to satisfy lint rules
  useEffect(() => {
    loadBookings();
  }, [selectedDate, loadBookings]);

  /**
   * Get booked seats for the current date (excluding current editing booking)
   */
  const getBookedSeats = useCallback(() => {
    const excludeBookingId = editingBooking ? editingBooking.bookingId : null;
    return getBookedSeatsByDate(selectedDate, excludeBookingId);
  }, [selectedDate, editingBooking]);

  /**
   * Get seats count for a mobile number
   */
  const getMobileSeatsCount = useCallback((mobileNumber) => {
    const excludeBookingId = editingBooking ? editingBooking.bookingId : null;
    return getSeatsCountByMobileAndDate(mobileNumber, selectedDate, excludeBookingId);
  }, [selectedDate, editingBooking]);

  /**
   * Handle date change
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      travelDate: date,
    }));
    // Reset selected seats when date changes
    setSelectedSeats([]);
  };

  /**
   * Handle seat selection
   */
  const handleSeatSelect = useCallback((seat) => {
    setSelectedSeats((prevSeats) => {
      if (prevSeats.includes(seat)) {
        // Deselect seat
        return prevSeats.filter((s) => s !== seat);
      } else {
        // Select seat (max 6)
        if (prevSeats.length >= 6) {
          setError('Maximum 6 seats allowed per booking');
          return prevSeats;
        }
        return [...prevSeats, seat];
      }
    });
  }, []);

  /**
   * Clear all selected seats
   */
  const clearSelectedSeats = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  /**
   * Handle form input changes
   */
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      travelDate: selectedDate,
      mobileNumber: '',
      seats: [],
    });
    setSelectedSeats([]);
    setEditingBooking(null);
    setError(null);
  }, [selectedDate]);

  /**
   * Start editing a booking
   */
  const startEditBooking = useCallback((booking) => {
    setEditingBooking(booking);
    setFormData({
      travelDate: booking.travelDate,
      mobileNumber: booking.mobileNumber,
      seats: booking.seats,
      currentSeats: booking.seats,
    });
    setSelectedSeats(booking.seats);
    setSelectedDate(booking.travelDate);
  }, []);

  /**
   * Cancel editing
   */
  const cancelEditBooking = useCallback(() => {
    resetForm();
  }, [resetForm]);

  /**
   * Create or update a booking
   */
  const handleCreateBooking = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      // Prepare booking data
      const bookingData = {
        travelDate: formData.travelDate,
        mobileNumber: formData.mobileNumber,
        seats: [...selectedSeats],
      };

      // If editing, keep the same booking ID
      if (editingBooking) {
        bookingData.bookingId = editingBooking.bookingId;
        bookingData.bookingTime = editingBooking.bookingTime;
      } else {
        // Generate new booking ID
        bookingData.bookingId = generateBookingId(formData.travelDate);
        bookingData.bookingTime = new Date().toISOString();
      }

      // Default boarding status
      bookingData.boardingStatus = editingBooking ? editingBooking.boardingStatus : 'not_boarded';

      // Save booking
      const result = saveBooking(bookingData);

      if (result.success) {
        setSuccessMessage(editingBooking ? 'Booking updated successfully!' : 'Booking created successfully!');
        setConfirmedBooking(result.booking);
        setShowBookingConfirmModal(true);
        resetForm();
        loadBookings();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to create booking');
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  }, [formData, selectedSeats, editingBooking, resetForm, loadBookings]);

  /**
   * Handle delete booking
   */
  const handleDeleteBooking = useCallback((bookingId) => {
    const result = deleteBooking(bookingId);
    
    if (result.success) {
      setSuccessMessage('Booking cancelled successfully!');
      setShowConfirmModal(false);
      setConfirmModalData(null);
      loadBookings();
    } else {
      setError(result.message);
    }
  }, [loadBookings]);

  /**
   * Show confirmation modal
   */
  const showConfirm = useCallback((data) => {
    setConfirmModalData(data);
    setShowConfirmModal(true);
  }, []);

  /**
   * Hide confirmation modal
   */
  const hideConfirm = useCallback(() => {
    setShowConfirmModal(false);
    setConfirmModalData(null);
  }, []);

  /**
   * Handle boarding status toggle
   */
  const handleToggleBoardingStatus = useCallback((bookingId, currentStatus) => {
    const newStatus = currentStatus === 'boarded' ? 'not_boarded' : 'boarded';
    const result = updateBoardingStatus(bookingId, newStatus);
    
    if (result.success) {
      loadBookings();
    } else {
      setError(result.message);
    }
  }, [loadBookings]);
  // Get sorted and filtered bookings for boarding page
  
  const getSortedFilteredBookings = useCallback(() => {

  let processedBookings =
    boardingMode === 'optimal'
      ? calculateOptimalBoardingSequence(bookings)
      : bookings.map((b, index) => ({
          ...b,
          sequenceNumber: index + 1,
        }));

  let filtered = filterBookingsBySearch(processedBookings, boardingSearchTerm);

  filtered = sortBookingsByColumn(
    filtered,
    boardingSortColumn,
    boardingSortDirection
  );

  return filtered;

}, [
  bookings,
  boardingMode,
  boardingSearchTerm,
  boardingSortColumn,
  boardingSortDirection,
]);


  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((column) => {
    setBoardingSortColumn((prevColumn) => {
      if (prevColumn === column) {
        // Toggle direction
        setBoardingSortDirection((prevDirection) => 
          prevDirection === 'asc' ? 'desc' : 'asc'
        );
      } else {
        setBoardingSortDirection('asc');
      }
      return column;
    });
  }, []);

  // Clear success/error messages
   
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Calculate boarding statistics
  const boardingStats = calculateBoardingStatistics(bookings);

  // Calculate boarding time estimates
  // const optimalTime = calculateBoardingTime(bookings);
  const optimalBookings = calculateOptimalBoardingSequence(bookings);
const optimalTime = calculateBoardingTime(optimalBookings);

  const naturalTimeSeconds = calculateNaturalOrderTime(bookings);
  const timeSavings = calculateTimeSavings(naturalTimeSeconds, optimalTime.optimalTimeSeconds);

  // Context value
  const value = {
    // State
    selectedDate,
    bookings,
    selectedSeats,
    formData,
    editingBooking,
    loading,
    error,
    successMessage,
    showConfirmModal,
    confirmModalData,
    showBookingConfirmModal,
    confirmedBooking,
    // Boarding page state
    boardingSortColumn,
    boardingSortDirection,
    boardingSearchTerm,
    boardingMode,
    setBoardingMode,  
    // Computed values
    bookedSeats: getBookedSeats(),
    mobileSeatsCount: getMobileSeatsCount(formData.mobileNumber),
    sortedFilteredBookings: getSortedFilteredBookings(),
    boardingStats,
    optimalTime,
    timeSavings,  
    // Actions
    handleDateChange,
    handleSeatSelect,
    clearSelectedSeats,
    handleInputChange,
    resetForm,
    startEditBooking,
    cancelEditBooking,
    handleCreateBooking,
    handleDeleteBooking,
    showConfirm,
    hideConfirm,
    handleToggleBoardingStatus,
    handleSortChange,
    setBoardingSearchTerm,
    setShowBookingConfirmModal,
    clearMessages,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

/**
 * Custom hook to use the Booking Context
 * @returns {Object} Booking context value
 */
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
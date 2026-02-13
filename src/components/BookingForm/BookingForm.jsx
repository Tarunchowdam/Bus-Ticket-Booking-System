import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useBooking } from '../../context/BookingContext';
import { validateBookingForm, formatMobileNumber, getTodayDate } from '../../utils/validation';
import { MAX_SEATS_PER_BOOKING } from '../../utils/constants';
import Input from '../common/Input';
import Button from '../common/Button';
import SeatMap from '../SeatMap/SeatMap';
import Modal from '../common/Modal';
import './BookingForm.css';

// Handles booking creation and editing with seat selection
const BookingForm = ({ onNavigateToBookings }) => {
  const {
    selectedSeats,
    formData,
    editingBooking,
    bookedSeats,
    mobileSeatsCount,
    loading,
    error,
    successMessage,
    showConfirmModal,
    confirmModalData,
    showBookingConfirmModal,
    confirmedBooking,
    handleDateChange,
    handleSeatSelect,
    handleInputChange,
    handleCreateBooking,
    hideConfirm,
    cancelEditBooking,
    setShowBookingConfirmModal,
    clearMessages,
  } = useBooking();

  // Local state for form validation
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

//  Validate form whenever inputs change
  useEffect(() => {
    const validation = validateBookingForm(
      {
        ...formData,
        seats: selectedSeats,
        bookingId: editingBooking?.bookingId,
        currentSeats: editingBooking?.seats,
      },
      bookedSeats,
      mobileSeatsCount
    );
    setFormErrors(validation.errors);
    setIsFormValid(validation.isValid);
  }, [formData, selectedSeats, bookedSeats, mobileSeatsCount, editingBooking]);

  /**
   * Handle date input change
   */
  const handleDateInputChange = (date) => {
    handleDateChange(date);
    clearMessages();
  };

  /**
   * Handle mobile number input change
   */
  const handleMobileChange = (value) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const truncatedValue = numericValue.slice(0, 10);
    
    handleInputChange('mobileNumber', truncatedValue);
    clearMessages();
  };

  /**
   * Handle seat selection
   */
  const handleSeatClick = useCallback((seatId) => {
    if (editingBooking) {
      // Check if trying to select more than 6 seats
      const newSelectedSeats = selectedSeats.includes(seatId)
        ? selectedSeats.filter((s) => s !== seatId)
        : [...selectedSeats, seatId];

      if (newSelectedSeats.length > MAX_SEATS_PER_BOOKING) {
        clearMessages();
        return;
      }
    }

    handleSeatSelect(seatId);
    clearMessages();
  }, [selectedSeats, editingBooking, handleSeatSelect, clearMessages]);

  /**
   * Handle form submission
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);

    // Simulate a brief delay for better UX
    setTimeout(() => {
      handleCreateBooking();
      setIsSubmitting(false);
    }, 300);
  };

  /**
   * Handle cancel booking
   */
  const handleCancel = () => {
    if (editingBooking) {
      cancelEditBooking();
    } else {
      onNavigateToBookings();
    }
  };

  /**
   * Calculate remaining seats for current mobile
   */

  /**
   * Get seat limit error message
   */
  const getSeatLimitError = () => {
    if (mobileSeatsCount >= MAX_SEATS_PER_BOOKING) {
      return `Maximum ${MAX_SEATS_PER_BOOKING} seats per mobile number per day.`;
    }
    if (formErrors.seats) {
      return formErrors.seats;
    }
    return null;
  };

  return (
    <div className="booking-form">
      {/* Error Message */}
      {error && (
        <div className="booking-form__error" role="alert">
          <span className="booking-form__error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && !showBookingConfirmModal && (
        <div className="booking-form__success" role="status">
          <span className="booking-form__success-icon">✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Edit Mode Indicator */}
      {editingBooking && (
        <div className="booking-form__edit-mode">
          <span className="booking-form__edit-mode-icon">✏</span>
          <div>
            <strong>Edit Mode</strong>
            <br />
            Editing booking {editingBooking.bookingId}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="booking-form__grid">
          {/* Travel Date */}
          <div className="booking-form__field">
            <Input
              id="travelDate"
              name="travelDate"
              type="date"
              label="Travel Date"
              value={formData.travelDate}
              onChange={handleDateInputChange}
              error={formErrors.travelDate}
              min={getTodayDate()}
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="booking-form__field">
            <Input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              label="Mobile Number"
              value={formatMobileNumber(formData.mobileNumber)}
              onChange={handleMobileChange}
              placeholder="e.g. 9876543210"
              error={formErrors.mobileNumber}
              maxLength={13} // XXX-XXX-XXXX format
              required
              disabled={editingBooking} // Don't allow changing mobile during edit
            />
          </div>
        </div>

        {/* Seat Map */}
        <SeatMap
          selectedSeats={selectedSeats}
          bookedSeats={bookedSeats}
          onSeatSelect={handleSeatClick}
          disabled={loading || isSubmitting}
          error={getSeatLimitError()}
        />

        {/* Form Actions */}
        <div className="booking-form__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading || isSubmitting}
          >
            {editingBooking ? 'Cancel Edit' : 'Back'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading || isSubmitting}
            disabled={!isFormValid || selectedSeats.length === 0}
            size="large"
          >
            {editingBooking ? 'Update Booking' : 'Book Tickets'}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={hideConfirm}
        title="Confirm Booking"
        size="small"
      >
        {confirmModalData && (
          <div>
            <p>{confirmModalData.message}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Button
                variant="secondary"
                onClick={hideConfirm}
                block
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmModalData.onConfirm}
                block
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showBookingConfirmModal}
        onClose={() => setShowBookingConfirmModal(false)}
        booking={confirmedBooking}
        onNavigateToBookings={onNavigateToBookings}
      />
    </div>
  );
};

BookingForm.propTypes = {
  onNavigateToBookings: PropTypes.func.isRequired,
};

/**
 * Booking Confirmation Modal Component
 * Displays booking details after successful booking
 */
const BookingConfirmationModal = ({ isOpen, onClose, booking, onNavigateToBookings }) => {
  const { formatSeatsForDisplay, formatDateTimeForDisplay } = require('../../utils/validation');

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    onClose();
  };

  const handleGoToBookings = () => {
    onClose();
    onNavigateToBookings();
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Booking Confirmed! ✓"
      size="medium"
    >
      <div className="booking-confirmation">
        <div className="booking-confirmation__details">
          <div className="booking-confirmation__row">
            <span className="booking-confirmation__label">Booking ID:</span>
            <span className="booking-confirmation__value">{booking.bookingId}</span>
          </div>
          <div className="booking-confirmation__row">
            <span className="booking-confirmation__label">Travel Date:</span>
            <span className="booking-confirmation__value">
              {formatDateTimeForDisplay(booking.travelDate)}
            </span>
          </div>
          <div className="booking-confirmation__row">
            <span className="booking-confirmation__label">Mobile Number:</span>
            <span className="booking-confirmation__value">
              {formatMobileNumber(booking.mobileNumber)}
            </span>
          </div>
          <div className="booking-confirmation__row">
            <span className="booking-confirmation__label">Selected Seats:</span>
            <span className="booking-confirmation__value">
              {formatSeatsForDisplay(booking.seats)}
            </span>
          </div>
          <div className="booking-confirmation__row">
            <span className="booking-confirmation__label">Booking Time:</span>
            <span className="booking-confirmation__value">
              {formatDateTimeForDisplay(booking.bookingTime)}
            </span>
          </div>
        </div>

        <div className="booking-confirmation__actions">
          <Button
            variant="secondary"
            onClick={handlePrint}
            block
          >
            Print Confirmation
          </Button>
          <Button
            variant="primary"
            onClick={handleGoToBookings}
            block
          >
            View Bookings
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            block
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

BookingConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onNavigateToBookings: PropTypes.func.isRequired,
};

export default BookingForm;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useBooking } from '../../context/BookingContext';
import { formatMobileNumber, formatSeatsForDisplay } from '../../utils/validation';
import Modal from '../common/Modal';
import './BookingList.css';

const BookingList = ({ onNavigateToBooking }) => {
  const {
    selectedDate,
    sortedFilteredBookings,
    boardingStats,
    optimalTime,
    timeSavings,
    boardingSortColumn,
    boardingSortDirection,
    boardingSearchTerm,
    boardingMode,
    setBoardingMode,
    error,
    showConfirmModal,
    confirmModalData,
    handleDateChange,
    handleToggleBoardingStatus,
    handleSortChange,
    setBoardingSearchTerm,
    showConfirm,
    hideConfirm,
    handleDeleteBooking,
    startEditBooking,
  } = useBooking();

  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleDateInputChange = (e) => handleDateChange(e.target.value);
  const handleSearchChange = (e) => setBoardingSearchTerm(e.target.value);

  const handleBoardingToggle = (booking) =>
    handleToggleBoardingStatus(booking.bookingId, booking.boardingStatus);

  const handleEdit = (booking) => {
    startEditBooking(booking);
    onNavigateToBooking();
  };

  const handleDelete = (booking) => {
    showConfirm({
      message: `Are you sure you want to cancel booking ${booking.bookingId}?`,
      onConfirm: () => handleDeleteBooking(booking.bookingId),
    });
  };

  const handleConfirm = () => confirmModalData?.onConfirm?.();

  const getSortIndicator = (column) => {
    if (boardingSortColumn !== column) return null;
    return boardingSortDirection === 'asc' ? '↑' : '↓';
  };

  const renderTableRows = () => {
    if (sortedFilteredBookings.length === 0) {
      return (
        <tr>
          <td colSpan="6">
            <div className="booking-list__empty">
              <div className="booking-list__empty-icon">📋</div>
              <div className="booking-list__empty-text">No bookings found</div>
              <div className="booking-list__empty-subtext">
                {boardingSearchTerm
                  ? 'Try adjusting your search'
                  : 'No bookings for this date'}
              </div>
            </div>
          </td>
        </tr>
      );
    }

    return sortedFilteredBookings.map((booking) => (
      <tr key={booking.bookingId}>
        <td>
          <span className="booking-list__sequence">
            #{booking.sequenceNumber}
          </span>
        </td>

        <td>
          <button className="booking-list__booking-id" type="button">
            {booking.bookingId}
          </button>
        </td>

        <td>
          <span className="booking-list__seats">
            {formatSeatsForDisplay(booking.seats)}
          </span>
        </td>

        <td>
          <div className="booking-list__mobile">
            <span>{formatMobileNumber(booking.mobileNumber)}</span>
            <a href={`tel:+91${booking.mobileNumber}`} className="booking-list__phone-link">
              📞
            </a>
          </div>
        </td>

        <td>
          <button
            type="button"
            className={`booking-list__status-btn booking-list__status-btn--${booking.boardingStatus}`}
            onClick={() => handleBoardingToggle(booking)}
          >
            {booking.boardingStatus === 'boarded'
              ? '✓ Boarded'
              : '⏳ Not Boarded'}
          </button>
        </td>

        <td>
          <div className="booking-list__actions">
            <button
              className="booking-list__action-btn booking-list__action-btn--edit"
              onClick={() => handleEdit(booking)}
            >
              Edit
            </button>

            <button
              className="booking-list__action-btn booking-list__action-btn--delete"
              onClick={() => handleDelete(booking)}
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="booking-list">

      {error && (
        <div className="booking-form__error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* DATE SELECTOR */}
      <div className="booking-list__date-selector">
        <div className="booking-list__date-label">Filter by Travel Date:</div>
        <input
          type="date"
          className="booking-list__date-input"
          value={selectedDate}
          onChange={handleDateInputChange}
        />
      </div>

      {/* STATS SECTION */}
      <div className="booking-list__stats">

        <div className="booking-list__stats-header">
          <h2 className="booking-list__stats-title">Boarding Statistics</h2>
        </div>

        {/* STATS CARDS */}
        <div className="booking-list__stats-cards">
          <div className="booking-list__stat-card">
            <div className="booking-list__stat-value">{boardingStats.totalBookings}</div>
            <div className="booking-list__stat-label">Total Bookings</div>
          </div>

          <div className="booking-list__stat-card">
            <div className="booking-list__stat-value">{boardingStats.totalPassengers}</div>
            <div className="booking-list__stat-label">Total Passengers</div>
          </div>

          <div className="booking-list__stat-card">
            <div className="booking-list__stat-value" style={{ color: '#4CAF50' }}>
              {boardingStats.boardedPassengers}
            </div>
            <div className="booking-list__stat-label">Boarded</div>
          </div>

          <div className="booking-list__stat-card">
            <div className="booking-list__stat-value" style={{ color: '#FF9500' }}>
              {boardingStats.notBoardedPassengers}
            </div>
            <div className="booking-list__stat-label">Not Boarded</div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {boardingStats.totalPassengers > 0 && (
          <div className="booking-list__progress">
            <div className="booking-list__progress-label">
              <span>{boardingStats.boardingProgress}%</span>
            </div>

            <div className="booking-list__progress-bar">
              <div
                className="booking-list__progress-fill"
                style={{ width: `${boardingStats.boardingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* TIME COMPARISON */}
        {boardingStats.totalBookings > 0 && (
          <div className="booking-list__time-comparison">

            <div
              className={`booking-list__time-card clickable-card ${
                boardingMode === 'natural' ? 'active-card' : ''
              }`}
              onClick={() => setBoardingMode('natural')}
            >
              <div className="booking-list__time-title">Natural Order</div>
              <div className="booking-list__time-value">
                {boardingStats.totalBookings * 60}s
              </div>
            </div>

            <div
              className={`booking-list__time-card booking-list__time-card--optimal clickable-card ${
                boardingMode === 'optimal' ? 'active-card' : ''
              }`}
              onClick={() => setBoardingMode('optimal')}
            >
              <div className="booking-list__time-title">Optimal Order</div>
              <div className="booking-list__time-value">
                {optimalTime.optimalTimeSeconds}s
              </div>

              {timeSavings.savingsSeconds > 0 && (
                <div className="booking-list__time-savings">
                  Saves {timeSavings.savingsSeconds}s ({timeSavings.savingsPercentage}%)
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* TABLE */}
      <div className="booking-list__table-container">
        <table className="booking-list__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Booking ID</th>
              <th>Seat(s)</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={showConfirmModal}
        onClose={hideConfirm}
        title="Confirm Cancellation"
        size="small"
      >
        <p>{confirmModalData?.message}</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={hideConfirm}>Keep Booking</button>
          <button onClick={handleConfirm}>Cancel Booking</button>
        </div>
      </Modal>

    </div>
  );
};

BookingList.propTypes = {
  onNavigateToBooking: PropTypes.func.isRequired,
};

export default BookingList;
  
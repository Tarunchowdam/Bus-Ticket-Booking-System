// Visual representation of bus seats with selection functionality


import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { SEAT_COLUMNS, SEAT_ROWS } from '../../utils/constants';
import Seat from './Seat';
import './SeatMap.css';

/**
 * SeatMap Component
 * Displays a grid of seats with interactive selection
 * @param {Array} selectedSeats - Currently selected seats
 * @param {Array} bookedSeats - Already booked seats for the date
 * @param {function} onSeatSelect - Callback when a seat is selected/deselected
 * @param {boolean} disabled - Whether the seat map is disabled
 * @param {string} error - Error message to display
 */
const SeatMap = memo(({ selectedSeats, bookedSeats, onSeatSelect, disabled = false, error }) => {
  /**
   * Get the state of a seat
   * @param {string} seatId - Seat identifier
   * @returns {string} Seat state ('available', 'selected', 'booked')
   */
  const getSeatState = (seatId) => {
    if (bookedSeats.includes(seatId)) {
      return 'booked';
    }
    if (selectedSeats.includes(seatId)) {
      return 'selected';
    }
    return 'available';
  };

  /**
   * Check if a seat is disabled
   * @param {string} seatId - Seat identifier
   * @returns {boolean} True if disabled
   */
  const isSeatDisabled = (seatId) => {
    return bookedSeats.includes(seatId) || disabled;
  };

  /**
   * Generate seat rows
   */
  const generateSeatRows = () => {
    const rows = [];
    
    for (let row = 1; row <= SEAT_ROWS; row++) {
      const rowSeats = [];
      
      // Left side seats (A, B)
      for (let col = 0; col < 2; col++) {
        const seatId = `${SEAT_COLUMNS[col]}${row}`;
        rowSeats.push(
          <Seat
            key={seatId}
            seatId={seatId}
            state={getSeatState(seatId)}
            disabled={isSeatDisabled(seatId)}
            onClick={onSeatSelect}
          />
        );
      }
      
      // Aisle indicator
      rowSeats.push(
        <div key={`aisle-${row}`} className="seat-map__aisle">
          {row}
        </div>
      );
      
      // Right side seats (C, D)
      for (let col = 2; col < SEAT_COLUMNS.length; col++) {
        const seatId = `${SEAT_COLUMNS[col]}${row}`;
        rowSeats.push(
          <Seat
            key={seatId}
            seatId={seatId}
            state={getSeatState(seatId)}
            disabled={isSeatDisabled(seatId)}
            onClick={onSeatSelect}
          />
        );
      }
      
      rows.push(
        <div key={`row-${row}`} className="seat-map__row">
          {rowSeats}
        </div>
      );
    }
    
    return rows;
  };

  return (
    <div className="seat-map">
      <div className="seat-map__header">
        <h3 className="seat-map__title">Select Seats</h3>
        <span className="seat-map__count">
          {selectedSeats.length} selected
        </span>
      </div>

      <div className="seat-map__front">
        <div className="seat-map__door">Front / Door</div>
        <div className="seat-map__driver">
          {/* Steering wheel icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2v6"></path>
            <path d="M12 18v4"></path>
            <path d="M4.93 4.93l4.24 4.24"></path>
            <path d="M14.83 14.83l4.24 4.24"></path>
            <path d="M2 12h6"></path>
            <path d="M18 12h4"></path>
            <path d="M4.93 19.07l4.24-4.24"></path>
            <path d="M14.83 9.17l4.24-4.24"></path>
          </svg>
        </div>
        
      </div>

      <div className="seat-map__grid">
        {generateSeatRows()}
      </div>

      {error && (
        <div className="seat-map__error" role="alert">
          <span>⚠</span>
          {error}
        </div>
      )}

      <div className="seat-map__legend">
        <div className="seat-map__legend-item">
          <div className="seat-map__legend-indicator seat-map__legend-indicator--available">
            A1
          </div>
          <span>Available</span>
        </div>
        <div className="seat-map__legend-item">
          <div className="seat-map__legend-indicator seat-map__legend-indicator--selected">
            A1
          </div>
          <span>Selected</span>
        </div>
        <div className="seat-map__legend-item">
          <div className="seat-map__legend-indicator seat-map__legend-indicator--booked">
            A1
          </div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
});

SeatMap.displayName = 'SeatMap';

SeatMap.propTypes = {
  selectedSeats: PropTypes.arrayOf(PropTypes.string).isRequired,
  bookedSeats: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSeatSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
};

export default SeatMap;
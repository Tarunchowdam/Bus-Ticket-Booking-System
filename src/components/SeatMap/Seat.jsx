// Individual seat button with state-based styling


import React from 'react';
import PropTypes from 'prop-types';
import './SeatMap.css';

/**
 * Seat Component
 * @param {string} seatId - Seat identifier (e.g., "A1", "B5")
 * @param {string} state - Seat state ('available', 'selected', 'booked')
 * @param {boolean} disabled - Whether the seat is disabled
 * @param {function} onClick - Click handler
 * @param {string} label - Label to display on the seat
 */
const Seat = ({ seatId, state = 'available', disabled = false, onClick, label }) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(seatId);
    }
  };

  const getSeatClass = () => {
    const baseClass = 'seat';
    const stateClass = `seat--${state}`;
    return `${baseClass} ${stateClass}`.trim();
  };

  return (
    <button
      type="button"
      className={getSeatClass()}
      disabled={disabled}
      onClick={handleClick}
      aria-label={`Seat ${seatId}, ${state}`}
      aria-pressed={state === 'selected'}
      title={disabled ? `Seat ${seatId} is already booked` : `Seat ${seatId}`}
    >
      <span className="seat__label">{label || seatId}</span>
    </button>
  );
};

Seat.propTypes = {
  seatId: PropTypes.string.isRequired,
  state: PropTypes.oneOf(['available', 'selected', 'booked']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  label: PropTypes.string,
};

export default Seat;
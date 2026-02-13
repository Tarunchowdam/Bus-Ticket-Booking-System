import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * Button Component
 * @param {string} variant - Button variant ('primary', 'secondary', 'danger', 'success', 'ghost')
 * @param {string} size - Button size ('small', 'medium', 'large')
 * @param {boolean} disabled - Whether the button is disabled
 * @param {boolean} loading - Whether to show loading state
 * @param {boolean} block - Whether to take full width
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {string} type - Button type ('button', 'submit', 'reset')
 * @param {string} className - Additional CSS classes
 * @param {object} props - Additional props to pass to button element
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  block = false,
  onClick,
  children,
  type = 'button',
  className = '',
  ...props
}) => {
  const handleClick = (event) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${block ? 'btn--block' : ''} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="btn__spinner" aria-hidden="true"></span>}
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;
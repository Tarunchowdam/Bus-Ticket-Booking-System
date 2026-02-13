import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

/**
 * Input Component
 * @param {string} label - Input label
 * @param {string} type - Input type ('text', 'number', 'tel', 'email', 'password', 'date')
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the input is required
 * @param {string} className - Additional CSS classes
 * @param {object} props - Additional props to pass to input element
 */
const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      value,
      onChange,
      error,
      placeholder,
      disabled = false,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleChange = (event) => {
      if (onChange) {
        onChange(event.target.value);
      }
    };

    return (
      <div className={`input-group ${className}`.trim()}>
        {label && (
          <label htmlFor={props.id || props.name} className="input-group__label">
            {label}
            {required && <span className="input-group__required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input-group__input ${error ? 'input-group__input--error' : ''}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          {...props}
        />
        {error && (
          <span
            id={error ? `${props.id || props.name}-error` : undefined}
            className="input-group__error"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'number', 'tel', 'email', 'password', 'date']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
};

export default Input;
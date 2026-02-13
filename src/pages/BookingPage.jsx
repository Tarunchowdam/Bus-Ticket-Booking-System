
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm/BookingForm';

const BookingPage = () => {
  const navigate = useNavigate();

  const handleNavigateToBookings = () => {
    navigate('/bookings');
  };

  return (
    <BookingForm onNavigateToBookings={handleNavigateToBookings} />
  );
};

export default BookingPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookingList from '../components/BookingList/BookingList';

const BoardingPage = () => {
  const navigate = useNavigate();

  const handleNavigateToBooking = () => {
    navigate('/');
  };

  return (
    <BookingList onNavigateToBooking={handleNavigateToBooking} />
  );
};

export default BoardingPage;
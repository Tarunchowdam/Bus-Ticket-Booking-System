import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import Layout from './components/Layout/Layout';
import BookingPage from './pages/BookingPage';
import BoardingPage from './pages/BoardingPage';
import './App.css';

function App() {
  return (
    <BookingProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/bookings" element={<BoardingPage />} />
          </Routes>
        </Layout>
      </Router>
    </BookingProvider>
  );
}

export default App;
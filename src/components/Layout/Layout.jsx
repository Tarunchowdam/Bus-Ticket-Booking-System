import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Navigation from './Navigation';
import './Layout.css';
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <Navigation />
      <main className="layout__main">
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
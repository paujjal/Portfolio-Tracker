import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pb-4 border-b-2 border-cyan-800 flex items-center">
      <img src="/logo.png" alt="Portfolio Tracker Logo" className="h-12 w-12 mr-4" />
      <div>
        <h1 className="text-4xl font-bold text-white tracking-wider">
          Portfolio Tracker
        </h1>
        <p className="text-cyan-400 text-lg">Your Financial Doctor</p>
      </div>
    </header>
  );
};

export default Header;
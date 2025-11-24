import React from 'react';
import { Link } from 'react-router-dom';

const TopNav: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-drivecash-primary font-extrabold text-xl">DriveCash</Link>
            <Link to="/dashboard" className="hidden md:inline-block text-sm text-gray-600 hover:text-drivecash-primary">Dashboard</Link>
            <Link to="/portal" className="hidden md:inline-block text-sm text-gray-600 hover:text-drivecash-primary">Portal</Link>
            <Link to="/benefits" className="hidden md:inline-block text-sm text-gray-600 hover:text-drivecash-primary">Benefits</Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="http://localhost:3000/" className="px-4 py-2 border border-drivecash-primary rounded text-drivecash-primary text-sm">Login</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;

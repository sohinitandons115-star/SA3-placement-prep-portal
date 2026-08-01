import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-zinc-950 border-b-4 border-zinc-900 dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <img src="/kalvium-logo.png" alt="Kalvium Logo" className="h-10 w-auto" />
              <span className="font-extrabold tracking-tighter text-2xl uppercase text-zinc-900 dark:text-white hidden sm:block">
                PrepPortal
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="font-bold uppercase tracking-wider text-sm hover:underline underline-offset-4"
            >
              {darkMode ? 'Light' : 'Dark'} Mode
            </button>
            {user ? (
              <>
                <Link to="/dashboard" className="font-bold uppercase tracking-wider text-sm hover:underline underline-offset-4 transition-colors">
                  Dashboard
                </Link>
                <Link to="/resources" className="font-bold uppercase tracking-wider text-sm hover:underline underline-offset-4 transition-colors">
                  Resources
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-bold uppercase tracking-wider text-sm text-red-600 dark:text-red-400 hover:underline underline-offset-4 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-bold uppercase tracking-wider text-sm hover:underline underline-offset-4 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="brutalist-button text-sm py-1">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

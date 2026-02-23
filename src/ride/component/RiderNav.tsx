import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, Package, User, LocationEdit, DollarSign, MessageSquare } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";

export const RiderNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { to: "/rider-dashboard", label: "Home", icon: Home },
    { to: "/rider-order", label: "Order", icon: Package },
    { to: "/rider-earning", label: "Earnings", icon: DollarSign },
    { to: "/rider-chat", label: "Inbox", icon: MessageSquare },
    { to: "/map", label: "Map", icon: LocationEdit },
    { to: "/rider-profile", label: "Account", icon: User },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/rider-dashboard" className="flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-base"
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors duration-200"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 bg-gray-50 border-t border-gray-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

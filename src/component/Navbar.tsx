import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, ShoppingCart, Package, User, Mail, Sun, Moon } from "lucide-react";
import logo from "../assets/Logo SVG 1.png";
import { useTheme } from "../context/ThemeContext";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { to: "/user-dashboard", label: "Home", icon: Home },
    { to: "/booking", label: "Order", icon: Package },
    { to: "/cart", label: "Cart", icon: ShoppingCart },
    { to: "/profile", label: "Account", icon: User },
    { to: "/market", label: "Market", icon: ShoppingCart },
    { to: "/inbox", label: "Message", icon: Mail },
  ];

  return (
    <nav className="bg-white dark:bg-gray-950 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/user-dashboard" className="flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain dark:brightness-110"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 text-base"
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors duration-200"
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
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
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

// import React from 'react';
// import { Sun, Moon } from 'lucide-react';
// import { useTheme } from '../context/ThemeContext';

// const GlobalThemeToggle: React.FC = () => {
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <button
//       onClick={toggleTheme}
//       className="fixed bottom-8 left-8 z-[9998] p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center justify-center"
//       title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
//     >
//       <div className="relative">
//         {theme === 'dark' ? (
//           <Sun className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform" />
//         ) : (
//           <Moon className="w-6 h-6 text-indigo-600 group-hover:-rotate-12 transition-transform" />
//         )}
//       </div>
//     </button>
//   );
// };

// export default GlobalThemeToggle;

import React from 'react';
import { ICONS } from '../constants';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
  return (
    <header className="bg-gray-900 text-white p-4 border-b border-gray-700 fixed top-0 left-0 right-0 z-20 h-16 flex items-center">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 -ml-2 mr-2 text-gray-300 hover:text-white"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            {ICONS.MENU}
          </svg>
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
          {ICONS.WRITER}
        </svg>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">StoryCraft Studio</h1>
      </div>
    </header>
  );
};
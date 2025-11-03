import React from 'react';
import { View } from '../types';
import { ICONS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 mr-3"
      >
        {icon}
      </svg>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isSidebarOpen, setIsSidebarOpen }) => {
  const { t } = useTranslation();
  
  const handleNavigation = (view: View) => {
    onNavigate(view);
    setIsSidebarOpen(false); // Always close sidebar on navigation
  };
  
  const navItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: ICONS.DASHBOARD },
    { id: 'templates', label: t('sidebar.templates'), icon: ICONS.TEMPLATES },
    { id: 'outline', label: t('sidebar.outline'), icon: ICONS.OUTLINE },
    { id: 'characters', label: t('sidebar.characters'), icon: ICONS.CHARACTERS },
    { id: 'world', label: t('sidebar.world'), icon: ICONS.WORLD },
    { id: 'writer', label: t('sidebar.writer'), icon: ICONS.SPARKLES },
    { id: 'export', label: t('sidebar.export'), icon: ICONS.EXPORT },
  ];

  const bottomNavItems = [
    { id: 'settings', label: t('sidebar.settings'), icon: ICONS.SETTINGS },
    { id: 'help', label: t('sidebar.help'), icon: ICONS.HELP },
  ];

  return (
    <aside className={`bg-gray-800 text-white w-64 fixed top-0 left-0 h-full p-4 border-r border-gray-700 z-30 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)]`}>
      <div>
        <div className="md:hidden h-16 flex items-center px-4">
            <h2 className="text-xl font-bold">Menu</h2>
        </div>
        <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
            <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={currentView === item.id}
                onClick={() => handleNavigation(item.id as View)}
            />
            ))}
        </nav>
      </div>
      <nav className="flex flex-col space-y-2">
        {bottomNavItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={currentView === item.id}
            onClick={() => handleNavigation(item.id as View)}
          />
        ))}
      </nav>
    </aside>
  );
};
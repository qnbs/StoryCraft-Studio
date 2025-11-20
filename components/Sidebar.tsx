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
}> = React.memo(({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-200 active:scale-[0.98] group touch-manipulation ${
        isActive
          ? 'bg-[var(--nav-background-active)] text-[var(--nav-text-active)] shadow-sm'
          : 'text-[var(--foreground-secondary)] hover:bg-[var(--nav-background-hover)] hover:text-[var(--foreground-primary)]'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-indigo-300 rounded-r-full transition-transform duration-300 ease-out ${isActive ? 'scale-y-100' : 'scale-y-0'} group-hover:scale-y-50`}></span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 mr-3 transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      >
        {icon}
      </svg>
      <span className="font-medium">{label}</span>
    </button>
  );
});

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isSidebarOpen, setIsSidebarOpen }) => {
  const { t } = useTranslation();
  
  const handleNavigation = (view: View) => {
    onNavigate(view);
    setIsSidebarOpen(false); // Always close sidebar on navigation
  };
  
  const navItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: ICONS.DASHBOARD },
    { id: 'manuscript', label: t('sidebar.manuscript'), icon: ICONS.WRITER },
    { id: 'writer', label: t('sidebar.writer'), icon: ICONS.SPARKLES },
    { id: 'templates', label: t('sidebar.templates'), icon: ICONS.TEMPLATES },
    { id: 'outline', label: t('sidebar.outline'), icon: ICONS.OUTLINE },
    { id: 'characters', label: t('sidebar.characters'), icon: ICONS.CHARACTERS },
    { id: 'world', label: t('sidebar.world'), icon: ICONS.WORLD },
    { id: 'export', label: t('sidebar.export'), icon: ICONS.EXPORT },
  ];

  const bottomNavItems = [
    { id: 'settings', label: t('sidebar.settings'), icon: ICONS.SETTINGS },
    { id: 'help', label: t('sidebar.help'), icon: ICONS.HELP },
  ];

  return (
    <>
      {/* Backdrop Overlay for Mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside id="sidebar" className={`bg-[var(--background-secondary)]/95 backdrop-blur-xl text-[var(--foreground-primary)] w-[85vw] max-w-xs md:w-64 fixed top-0 left-0 h-[100dvh] p-4 border-r border-[var(--border-primary)]/50 z-40 flex flex-col justify-between transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)]`}>
        <div className="flex-grow flex flex-col overflow-y-auto no-scrollbar">
          <div className="md:hidden h-16 flex items-center px-4 mb-2 border-b border-[var(--border-primary)]/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">StoryCraft</h2>
          </div>
          <nav className="flex flex-col space-y-1 mt-2 md:mt-0" aria-label="Main navigation">
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
        <nav className="flex flex-col space-y-1 mt-4 border-t border-[var(--border-primary)]/50 pt-4" aria-label="Secondary navigation">
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
    </>
  );
};
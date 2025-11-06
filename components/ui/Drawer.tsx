import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, position = 'left' }) => {
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);

      const drawerElement = drawerRef.current;
      if (drawerElement) {
        const focusableElements = drawerElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            firstElement.focus();
        }
      }
      
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
        previouslyFocusedElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const backdropClasses = `fixed inset-0 bg-gray-900/50 dark:bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`;
  
  const drawerContainerClasses = `fixed top-0 h-full w-4/5 max-w-sm bg-[var(--background-primary)] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-[var(--border-primary)] ${position === 'left' ? 'left-0 border-r' : 'right-0 border-l'}`;

  const transformClass = {
      left: isOpen ? 'translate-x-0' : '-translate-x-full',
      right: isOpen ? 'translate-x-0' : 'translate-x-full'
  };

  return (
    <>
      <div className={backdropClasses} onClick={onClose} aria-hidden="true"></div>
      <div ref={drawerRef} className={`${drawerContainerClasses} ${transformClass[position]}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] flex-shrink-0">
          <h2 id="drawer-title" className="text-xl font-semibold text-[var(--foreground-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)] transition-colors" aria-label={t('common.close')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};
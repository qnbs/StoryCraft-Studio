import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'default' }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      window.addEventListener('keydown', handleEsc);

      // Focus trapping logic
      const modalElement = modalRef.current;
      if (modalElement) {
        const focusableElements = modalElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (firstElement) {
          firstElement.focus();
        }

        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return;

          if (e.shiftKey) { // Shift+Tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else { // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        };

        modalElement.addEventListener('keydown', handleTabKey);

        return () => {
          window.removeEventListener('keydown', handleEsc);
          modalElement.removeEventListener('keydown', handleTabKey);
          previouslyFocusedElement.current?.focus();
        };
      }
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
      default: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ animation: 'fade-in 0.2s ease-out' }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
      <div 
        ref={modalRef} 
        className={`relative bg-[var(--background-primary)] rounded-lg shadow-[var(--shadow-xl)] border border-[var(--border-primary)] w-full ${sizeClasses[size]} m-4 flex flex-col max-h-[90vh]`}
        style={{ animation: 'scale-in 0.2s ease-out' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-semibold text-[var(--foreground-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)] transition-colors"
            aria-label={t('common.close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
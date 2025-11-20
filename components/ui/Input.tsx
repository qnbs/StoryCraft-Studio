import React, { useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null);
    // Use the forwarded ref if available, otherwise use innerRef
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || innerRef;
    
    const { isListening, transcript, toggleListening, setTranscript } = useSpeechRecognition();

    // Handle incoming transcript
    useEffect(() => {
        if (transcript && inputRef.current) {
            const input = inputRef.current;
            
            // React overrides the native value setter. To programmatically set the value
            // and trigger React's onChange, we need to get the native setter.
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
            )?.set;
            
            if (nativeInputValueSetter) {
                const currentValue = input.value;
                // Add space if appending
                const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
                
                nativeInputValueSetter.call(input, newValue);
                
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            }
            
            // Clear transcript from hook to prevent re-appending
            setTranscript(''); 
        }
    }, [transcript, setTranscript, inputRef]);

    return (
      <div className="relative w-full">
          <input
            className={`flex h-10 sm:h-10 min-h-[44px] sm:min-h-[40px] w-full rounded-md border border-[var(--border-primary)] bg-[var(--background-secondary)] pl-3 pr-10 py-2 text-base sm:text-sm text-[var(--foreground-primary)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--border-interactive)] focus:ring-2 focus:ring-[var(--ring-focus)] focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] touch-manipulation transition-all duration-200 ${className}`}
            ref={inputRef}
            {...props}
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--ring-focus)] z-10 ${
                isListening 
                ? 'text-red-500 bg-red-500/10 animate-pulse shadow-[0_0_0_3px_rgba(239,68,68,0.3)]' 
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)] hover:bg-[var(--background-tertiary)]'
            }`}
            title="Dictate text"
            aria-label={isListening ? "Stop dictation" : "Start dictation"}
          >
            {isListening ? (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-3.5 sm:h-3.5">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                 </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-3.5 sm:h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
            )}
          </button>
      </div>
    );
  }
);
Input.displayName = 'Input';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ISpeechRecognition } from '../types';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        if (recognitionRef.current) {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US'; // Default, can be dynamic if needed

            recognitionRef.current.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(finalTranscript);
            }
            };

            recognitionRef.current.onend = () => {
                // If it stops automatically but we didn't intent to stop, we could restart.
                // For now, we just update state.
                if (isListening) {
                    setIsListening(false);
                }
            };
            
            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
      }
    }
  }, []); // Remove isListening dependency to prevent re-initialization

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
          recognitionRef.current.start();
          setIsListening(true);
      } catch (e) {
          console.error("Failed to start recognition", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
      if (isListening) {
          stopListening();
      } else {
          startListening();
      }
  }, [isListening, startListening, stopListening]);

  return { isListening, transcript, startListening, stopListening, toggleListening, setTranscript };
};

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  largeFont: boolean;
  highContrast: boolean;
  toggleLargeFont: () => void;
  toggleHighContrast: () => void;
  isSpeechSupported: boolean;
  listenToSpeech: (onTranscript: (text: string) => void, onError?: (err: string) => void) => () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [largeFont, setLargeFont] = useState<boolean>(() => {
    return localStorage.getItem('sahaay_large_font') === 'true';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('sahaay_high_contrast') === 'true';
  });

  // Check if browser supports Web Speech API
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (largeFont) {
      document.documentElement.classList.add('large-font');
    } else {
      document.documentElement.classList.remove('large-font');
    }
    localStorage.setItem('sahaay_large_font', String(largeFont));
  }, [largeFont]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('sahaay_high_contrast', String(highContrast));
  }, [highContrast]);

  const toggleLargeFont = () => setLargeFont((prev) => !prev);
  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  /**
   * Accessible Voice-to-Text Speech Recognition
   */
  const listenToSpeech = (
    onTranscript: (text: string) => void,
    onError?: (err: string) => void
  ): (() => void) => {
    if (!isSpeechSupported) {
      onError?.('Speech recognition is not supported in this browser.');
      return () => {};
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        onError?.(event.error);
      };

      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch {}
      };
    } catch (err: any) {
      onError?.(err?.message || 'Error starting speech recognition');
      return () => {};
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        largeFont,
        highContrast,
        toggleLargeFont,
        toggleHighContrast,
        isSpeechSupported,
        listenToSpeech,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

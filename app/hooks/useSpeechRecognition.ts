'use client';

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Speech Recognition is available
    // Safari on iOS 14.5+ supports it with webkit prefix
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // Check iOS version - need 14.5+ for Web Speech API support
        const iosVersion = navigator.userAgent.match(/OS (\d+)_(\d+)/);
        if (iosVersion) {
          const major = parseInt(iosVersion[1]);
          const minor = parseInt(iosVersion[2]);
          if (major < 14 || (major === 14 && minor < 5)) {
            setError('Voice input requires iOS 14.5 or later. Please update your device.');
          } else {
            setError('Speech recognition is not available. Please check your browser settings.');
          }
        } else {
          setError('Speech recognition is not supported in your browser.');
        }
      } else {
        setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, Safari, or a supported browser.');
      }
      setIsSupported(false);
      return;
    }

    // Check if we're in a secure context (required for microphone access)
    // Web Speech API requires HTTPS in production, but localhost is considered secure
    const isSecure = window.isSecureContext || 
                     window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '[::1]';
    
    if (!isSecure) {
      const protocol = window.location.protocol;
      if (protocol === 'http:') {
        setError('Voice input requires HTTPS. Please access this site over HTTPS (or use localhost for development).');
        setIsSupported(false);
        return;
      }
      // For other cases, log a warning but let it try
      console.warn('Not in secure context - voice may not work');
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Add debugging
    console.log('Speech Recognition initialized:', {
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      lang: recognition.lang,
    });

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      const errorCode = event.error;
      console.error('Speech recognition error:', errorCode, event);
      
      // Handle specific error cases
      if (errorCode === 'not-allowed') {
        setError('Microphone permission denied. Please tap the button again and allow microphone access when the browser prompts you.');
      } else if (errorCode === 'no-speech') {
        // Don't show error for no-speech - user might just be waiting
        setIsListening(false);
        return;
      } else if (errorCode === 'aborted') {
        // User aborted or recognition stopped, don't show error
        setIsListening(false);
        return;
      } else if (errorCode === 'network') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (errorCode === 'audio-capture') {
        setError('No microphone found or microphone is not accessible. Please check your device settings.');
      } else if (errorCode === 'service-not-allowed') {
        setError('Speech recognition service is not available. Please check your browser settings.');
      } else {
        setError(`Voice recognition error: ${errorCode}. Please try again.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      // Check permission status if Permissions API is available
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionStatus(result.state);
          
          const state = result.state;
          if (state === 'denied') {
            setError('Microphone permission is denied. Please enable it in your browser settings.');
            return false;
          }
          
          // If granted or prompt, we can proceed
          return state === 'granted' || state === 'prompt';
        } catch (permErr) {
          // Permissions API might not support 'microphone' query in all browsers
          // Fall through and let Speech Recognition handle it
        }
      }
      return true;
    } catch (err) {
      // If permission check fails, proceed anyway - Speech Recognition will handle it
      return true;
    }
  };

  const startListening = () => {
    console.log('startListening called', {
      hasRecognition: !!recognitionRef.current,
      isSupported,
      isListening,
    });

    if (!recognitionRef.current) {
      console.error('Recognition not initialized');
      setError('Speech recognition not initialized. Please refresh the page.');
      return;
    }

    if (!isSupported) {
      console.error('Not supported');
      setError('Speech recognition is not supported in your browser');
      return;
    }

    // Don't start if already listening
    if (isListening) {
      console.log('Already listening, ignoring');
      return;
    }

    setError(null);
    setTranscript('');
    
    try {
      console.log('Calling recognition.start()');
      setIsListening(true);
      
      // On mobile, calling start() will automatically trigger the microphone permission prompt
      // According to MDN: Speech Recognition API handles permission requests automatically
      // https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
      // Important: start() must be called in response to a user gesture (button click)
      recognitionRef.current.start();
      
      console.log('recognition.start() called successfully');
    } catch (err: any) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
      
      // Some browsers throw errors synchronously, but most errors come through onerror callback
      if (err.message?.includes('not-allowed') || err.name === 'NotAllowedError') {
        setError('Microphone permission is required. Please allow microphone access when prompted.');
      } else if (err.message?.includes('service-not-allowed')) {
        setError('Speech recognition service is not available. Please check your browser settings.');
      } else if (err.message?.includes('aborted')) {
        // Already aborted, just reset state
        setIsListening(false);
      } else {
        // Let the onerror callback handle other errors, but set a generic message
        setError(`Failed to start: ${err.message || err.toString()}. Please try again.`);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
  };

  return {
    isListening,
    transcript,
    error,
    permissionStatus,
    startListening,
    stopListening,
    clearTranscript,
    isSupported,
  };
}


import { useState, useEffect, useCallback } from 'react';

export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (!document.hidden) {
        updateActivity();
      }
    };

    const handleFocus = () => {
      setIsVisible(true);
      updateActivity();
    };

    const handleBlur = () => {
      setIsVisible(false);
    };

    // Set initial state
    setIsVisible(!document.hidden);
    setLastActivity(Date.now());

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Activity tracking
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  return { isVisible, lastActivity };
}

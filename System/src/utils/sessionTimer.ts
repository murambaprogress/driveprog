import { useEffect, useState, useCallback } from 'react';
import { timeUntilExpiryMs, setSession, getSessionExpiry } from './session';

// Hook that returns ms remaining and a function to extend session
export function useSessionTimer(pollInterval = 1000) {
  const [msRemaining, setMsRemaining] = useState<number>(() => timeUntilExpiryMs());

  useEffect(() => {
    let raf: ReturnType<typeof setInterval> | null = null;
    const tick = () => setMsRemaining(timeUntilExpiryMs());
    tick();
    raf = setInterval(tick, pollInterval);
    return () => { if (raf) clearInterval(raf); };
  }, [pollInterval]);

  const extendSession = useCallback((minutes = 5) => {
    setSession(minutes);
    setMsRemaining(timeUntilExpiryMs());
  }, []);

  const expiry = getSessionExpiry();

  return { msRemaining, extendSession, expiry };
}

export default useSessionTimer;

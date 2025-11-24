import { useRef, useCallback } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router-dom';

/**
 * useSafeNavigate
 * A tiny wrapper around react-router's navigate that queues and throttles
 * navigation requests to avoid bursts of rapid navigations (which can trigger
 * Chromium's "IPC flooding" protection under automation).
 */
export default function useSafeNavigate() {
  const navigate = useNavigate();
  const queueRef = useRef<Array<{ to: To; options?: NavigateOptions }>>([]);
  const runningRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const intervalMs = 200; // spacing between navigations

  const processQueue = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;

    const step = () => {
      const item = queueRef.current.shift();
      if (item) {
        try {
          // `navigate` accepts the `To` type from react-router; we preserved
          // `To` in the queue typing so this call is safe without casts.
          navigate(item.to, item.options);
        } catch {
          // swallow navigation errors here
        }
        timerRef.current = window.setTimeout(step, intervalMs);
      } else {
        runningRef.current = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    step();
  }, [navigate]);

  const safeNavigate = useCallback((to: To | number | URL, options?: NavigateOptions) => {
    const queuedTo: To = typeof to === 'number' ? String(to) as To : (to as To);
    queueRef.current.push({ to: queuedTo, options });
    if (!runningRef.current) processQueue();
  }, [processQueue]);

  return safeNavigate;
}

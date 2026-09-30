import { useEffect, useState } from 'react';

/**
 * Checks the backend in a React effect rather than embedding executable HTML.
 * The banner never includes patient data or authorization headers.
 */
export const ServerWakeBanner = ({ delayMs = 1500 }: { delayMs?: number }) => {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    let stopped = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const probe = async () => {
      if (stopped) return;
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(4000),
        });
        if (!response.ok) throw new Error('Backend unavailable');
        if (!stopped) setWaiting(false);
      } catch {
        if (!stopped) {
          setWaiting(true);
          // Avoid runaway polling if the endpoint is genuinely unavailable.
          if (++attempts < 20) retryTimer = setTimeout(probe, 3000);
        }
      }
    };

    retryTimer = setTimeout(probe, delayMs);
    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [delayMs]);

  if (!waiting) return null;
  return (
    <div role="status" aria-live="polite" style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, #5E6AD2, #7B85E0)',
      color: '#fff', textAlign: 'center', padding: '6px', fontSize: 13,
      fontWeight: 500,
    }}>
      Iniciando servidor na nuvem. Aguarde alguns segundos.
    </div>
  );
};

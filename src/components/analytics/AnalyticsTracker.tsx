'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

function TrackerInternal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    // Evitar doble conteo en re-renders inmediatos
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    trackPageView(fullPath, document.referrer);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInternal />
    </Suspense>
  );
}

export default AnalyticsTracker;

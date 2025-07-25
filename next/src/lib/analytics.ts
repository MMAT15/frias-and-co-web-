export function gaEvent(action: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', action, params);
}

export const GA_MEASUREMENT_ID = 'G-XXXXXXXX';

// Google Analytics 4 (gtag.js charge en tant que <script src="/ga-init.js">
// dans index.html, en dehors de React — voir CSP dans vercel.json). Ce
// module ne fait qu'appeler window.gtag s'il existe, jamais planter si le
// script n'a pas encore charge (bloqueur de pub, reseau lent, etc.).
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  window.gtag?.('event', name, params);
}

export function trackPageView(path: string): void {
  window.gtag?.('event', 'page_view', { page_path: path });
}

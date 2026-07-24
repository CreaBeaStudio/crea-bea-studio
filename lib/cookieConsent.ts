// Cookie/tracking consent state -- gates non-essential analytics (GA4,
// Microsoft Clarity) behind an explicit opt-in, per GDPR/ePrivacy.
// Stored in localStorage (not a cookie itself), so reading/writing it
// doesn't require any consent of its own.
//
// Save this file as lib/cookieConsent.ts

export interface ConsentState {
    version: number; // bump this if the cookie policy materially changes, to force re-consent on next visit
    analytics: boolean;
    decidedAt: string; // ISO timestamp
  }
  
  const STORAGE_KEY = "creabea-cookie-consent";
  export const CONSENT_VERSION = 1;
  
  export function getConsent(): ConsentState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ConsentState;
      if (parsed.version !== CONSENT_VERSION) return null; // policy changed since they last decided -- ask again
      return parsed;
    } catch {
      return null;
    }
  }
  
  export function setConsent(analytics: boolean) {
    if (typeof window === "undefined") return;
    const state: ConsentState = { version: CONSENT_VERSION, analytics, decidedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("creabea-consent-changed", { detail: state }));
  }
  
  // Lets a "Cookie settings" link (e.g. in the Footer) reopen the banner
  // without a page reload -- CookieConsentBanner listens for this event.
  export function reopenConsentBanner() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("creabea-consent-reopen"));
  }
  
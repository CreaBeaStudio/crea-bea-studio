"use client";

// Wraps your EXISTING GoogleAnalytics (@next/third-parties/google) and
// ClarityInit components so neither one renders until analytics consent
// is granted. Doesn't touch how either one works internally -- just
// decides whether they mount at all.
//
// Vercel's <Analytics /> and <SpeedInsights /> are NOT wrapped here --
// Vercel's own docs describe both as cookie-less and not collecting
// personal data, which is the generally accepted reason they don't need
// a consent gate the way GA4/Clarity do. Worth a second look if you
// want a stricter stance, but this is the standard treatment.
//
// Save this file as app/[locale]/components/ConsentGatedScripts.tsx

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import ClarityInit from "../clarity-init";
import { getConsent } from "@/lib/cookieConsent";

const GA_MEASUREMENT_ID = "G-PFXB1CJ13C";

export default function ConsentGatedScripts() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAnalyticsAllowed(getConsent()?.analytics === true);
    sync();
    window.addEventListener("creabea-consent-changed", sync);
    return () => window.removeEventListener("creabea-consent-changed", sync);
  }, []);

  if (!analyticsAllowed) return null;

  return (
    <>
      <ClarityInit />
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </>
  );
}

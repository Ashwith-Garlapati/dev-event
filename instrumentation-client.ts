import posthog from "posthog-js"

try {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  
  if (posthogKey) { // Only initialize if key exists
    posthog.init(posthogKey, {
      ui_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
    });
  } else {
    console.warn("PostHog key not configured");
  }
} catch (error: any) {
  console.error("PostHog initialization failed:", error);
}
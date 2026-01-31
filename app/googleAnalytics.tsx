"use client";

import { GoogleAnalytics, event } from "nextjs-google-analytics";

export function Analytics() {
return <GoogleAnalytics gaMeasurementId="G-23PE17HWN8" />;
}

export const trackEvent = (name: string, options?: { category?: string; label?: string }) => {
  event(name, options);
};

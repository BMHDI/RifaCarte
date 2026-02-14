'use client';

import { GoogleAnalytics, event } from 'nextjs-google-analytics';

export function Analytics() {
  return <GoogleAnalytics gaMeasurementId="G-23PE17HWN8" />;
}

// Added [key: string]: any to allow custom parameters like session_id
export const trackEvent = (
  name: string, 
  options?: { 
    category?: string; 
    label?: string; 
    [key: string]: any; 
  }
) => {
  event(name, {
    ...options,
    // Using beacon ensures the event is sent even if the user 
    // navigates away or refreshes the page immediately
    transport_type: 'beacon', 
  });
};
"use client"; // ⚠️ This makes it a Client Component

import { GoogleAnalytics } from "nextjs-google-analytics";

export default function Analytics() {
  return <GoogleAnalytics measurementId="G-23PE17HWN8" />;
}

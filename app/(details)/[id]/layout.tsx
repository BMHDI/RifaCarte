import '../../globals.css'; // ✅ important
import { OrgProvider } from '@/app/context/OrgContext'; // import your context provider

export default function DetailsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OrgProvider>{children}</OrgProvider>
      </body>
    </html>
  );
}

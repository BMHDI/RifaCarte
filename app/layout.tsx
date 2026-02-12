import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'carte des organisations',
  description: "carte des organisations, en Alberta trouver test d'anglais, service de santé, etc.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <html lang="fr"  >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className='overflow-hidden'>
        {children}
        </body>
    </html>
  );
}

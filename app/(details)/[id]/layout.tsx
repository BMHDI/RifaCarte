import { OrgProvider } from '@/app/context/OrgContext';

export default function DetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrgProvider>{children}</OrgProvider>;
}

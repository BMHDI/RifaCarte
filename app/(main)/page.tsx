import { MapView } from '@/components/map/MapView';
import { Page } from '@/components/layout/Page';
import { MobileSidebarButton } from '@/components/ui/MobileSidebarButton';
import { AichatFloatingBtn } from '@/components/ui/AichatFloatingBtn';

export default function Home() {
  return (
    <Page>
      <div className="flex flex-row">
        <AichatFloatingBtn />
        <MobileSidebarButton />
      </div>
      {/* <SidebarTrigger className="fixed z-50 bottom-16 right-8 md:hidden" /> */}
      <MapView />
    </Page>
  );
}

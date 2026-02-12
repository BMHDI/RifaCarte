import { MapView } from '@/components/map/MapView';
import { MobileSidebarButton } from '@/components/ui/MobileSidebarButton';
import { AichatFloatingBtn } from '@/components/ui/AichatFloatingBtn';

export default function Home() {
  return (
    <>
     
        <AichatFloatingBtn />
        <MobileSidebarButton />
      {/* <SidebarTrigger className="fixed z-50 bottom-16 right-8 md:hidden" /> */}
      <MapView />
    </>
  );
}

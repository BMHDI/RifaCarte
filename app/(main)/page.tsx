import { MapView } from '@/components/map/MapView';
import { MobileSidebarButton } from '@/components/ui/MobileSidebarButton';
import { AichatFloatingBtn } from '@/components/ui/AichatFloatingBtn';
import GoogleTranslate from '@/components/ui/GoogleTranslate';

export default function Home() {
  return (
    <>
        <AichatFloatingBtn />
        <MobileSidebarButton />
     
      <MapView />
    </>
  );
}

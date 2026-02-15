import { MobileSidebarButton } from '@/components/ui/MobileSidebarButton';
import { AichatFloatingBtn } from '@/components/ui/AichatFloatingBtn';
import LazyMap from '@/components/map/lazyMap';

export default function Home() {
  return (
    <>
        <AichatFloatingBtn />
        <MobileSidebarButton />
     
      <LazyMap />
    </>
  );
}

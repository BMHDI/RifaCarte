import { MapView } from "@/components/map/MapView";
import { Page } from "@/components/layout/Page";
import { MobileSidebarButton } from "@/components/ui/MobileSidebarButton";

export default function Home() {
  return (
    <Page>
      <MobileSidebarButton />
      {/* <SidebarTrigger className="fixed z-50 bottom-16 right-8 md:hidden" /> */}
      <MapView />
    </Page>
  );
}

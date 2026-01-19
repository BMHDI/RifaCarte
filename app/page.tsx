import { MapView } from "@/components/map/MapView";
import { Page } from "@/components/layout/Page";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <Page>
      <SidebarTrigger className="fixed z-50 bottom-16 right-8  md:top-6 md:left-8 " />
      <MapView />
    </Page>
  );
}

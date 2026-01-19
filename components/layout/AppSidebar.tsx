"use client";

import { Home, Search, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { OrgSearch } from "../filters/OrgSearch";

const items = [
  { title: "Chatbot", url: "#", icon: Home },
  { title: "Saved", url: "#", icon: Heart },
];

export function AppSidebar() {
  const isMobile = useIsMobile();

  // 🔥 Get sidebar context
  const { state, open, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="md:w-160">
      <SidebarContent>
        <SidebarGroup>
          {/* Trigger toggles the sidebar open/collapsed */}
          {isMobile ? (
            <SidebarTrigger>Close</SidebarTrigger>
          ) : (
            <SidebarTrigger onClick={toggleSidebar} />
          )}
          <SidebarGroupLabel> Trouve un service </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu  >
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Render OrgSearch only if sidebar is expanded */}
            {state === "expanded" && <OrgSearch />}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

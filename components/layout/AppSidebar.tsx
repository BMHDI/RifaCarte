"use client";

import { Bot, Heart, List } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { OrgSearch } from "../filters/OrgSearch";
import { SidebarToggleButton } from "../ui/SidebarToggleButton";
import { ChatBox } from "../chatbot/ChatBox";
import { useOrg } from "@/app/context/OrgContext";

import { useState } from "react";
import FavoritesPage from "../Favorite";
import { RegionSelectorList } from "../ui/RegionSelectorList";

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { state, toggleSidebar } = useSidebar();
  const { activeRegion } = useOrg();
  // Track active menu content
  const [activeTab, setActiveTab] = useState<"search" | "ai" | "Favorites">(
    "search",
  );

  const menuItems = [
    { title: "Rechercher ", key: "search", icon: List },
    { title: "Conversation AI", key: "ai", icon: Bot },
    { title: "Mes favoris", key: "Favorites", icon: Heart },
  ];

  return (
    <Sidebar collapsible="icon" className="md:w-170 mt-19 ">
      {isMobile ? <SidebarTrigger /> : <SidebarToggleButton />}

      {!activeRegion ? (
        <div className="h-[calc(80vh-50px)] grid  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <RegionSelectorList />
        </div>
      ) : (
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => {
                        setActiveTab(item.key as "search" | "ai" | "Favorites");
                        if (state !== "expanded" && !isMobile) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <button
                        className={`items-center text-left ${
                          activeTab === item.key
                            ? "font-bold text-primary border-black/20 rounded-t-md"
                            : ""
                        }`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              {/* Render the content of the selected menu item */}
              {(state === "expanded" || isMobile) && (
                <div className="mt-4">
                  {activeTab === "search" && <OrgSearch />}
                  {activeTab === "ai" && <ChatBox />}
                  {activeTab === "Favorites" && <FavoritesPage />}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      )}
    </Sidebar>
  );
}

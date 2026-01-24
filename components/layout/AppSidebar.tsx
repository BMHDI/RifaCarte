"use client";

import {  Bot, List } from "lucide-react";
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
import { AIConversationMock } from "../chatbot/AIConversationMock";
import { useState } from "react";

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { state } = useSidebar();

  // Track active menu content
  const [activeTab, setActiveTab] = useState<"search" | "ai">("search");

  const menuItems = [
    { title: "List des organismes", key: "search", icon: List },
    { title: "Conversation AI", key: "ai", icon: Bot },
  ];

  return (
    <Sidebar collapsible="icon" className="md:w-170 mt-17 ">
      {isMobile ? <SidebarTrigger /> : <SidebarToggleButton />}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => setActiveTab(item.key as "search" | "ai")}
                  >
                    <button
                      className={`flex items-center gap-2 w-full text-left ${
                        activeTab === item.key ? "font-bold text-red-800" : ""
                      }`}
                    >
                      <item.icon />
                      {item.title}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Render the content of the selected menu item */}
            {(state === "expanded" || isMobile) && (
              <div className="mt-4">
                {activeTab === "search" && <OrgSearch />}
                {activeTab === "ai" && <AIConversationMock />}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

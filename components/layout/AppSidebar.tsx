'use client';

import { Bot, Heart, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
} from '@/components/ui/sidebar';
import { OrgSearch } from '../filters/OrgSearch';
import { SidebarToggleButton } from '../ui/SidebarToggleButton';
import { ChatBox } from '../chatbot/ChatBox';
import { useOrg } from '@/app/context/OrgContext';

import FavoritesPage from '../Favorite';

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { state, toggleSidebar } = useSidebar();
  const { activeRegion, activeTab, setActiveTab } = useOrg();

  const menuItems = [
    { title: 'Rechercher', key: 'search', icon: List },
    { title: 'Assistant IA', key: 'ai', icon: Bot },
    { title: 'Mes Favoris', key: 'Favorites', icon: Heart },
  ];

  return (
    <Sidebar collapsible="icon" className="md:w-170 mt-19">
      {isMobile ? <SidebarTrigger /> : activeRegion ? <SidebarToggleButton /> : null}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon; // Assign variable for dynamic icon

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => {
                        setActiveTab(item.key as 'search' | 'ai' | 'Favorites');
                        if (state !== 'expanded' && !isMobile) toggleSidebar();
                      }}
                    >
                      <button
                        className={`flex items-center gap-2 text-left font-medium md:mt-2 transition-all duration-300 relative
                          ${
                            activeTab === item.key
                              ? 'font-extrabold text-primary underline decoration-6 underline-offset-3 ease-in-out'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <Icon
                          className={`transition-transform duration-300 ${
                            activeTab === item.key ? 'scale-155' : 'scale-100'
                          }`}
                        />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* Render the content of the selected menu item */}
            {(state === 'expanded' || isMobile) && (
              <div className="mt-4">
                {activeTab === 'search' && <OrgSearch />}
                {activeTab === 'ai' && <ChatBox />}
                {activeTab === 'Favorites' && <FavoritesPage />}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

'use client';

import { useState } from 'react';
import { Button } from './button';
import { useSidebar } from './sidebar';
import { List, X } from 'lucide-react';
import { useOrg } from '@/app/context/OrgContext';

export function MobileSidebarButton() {
  const { toggleSidebar, state } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveTab } = useOrg();

  const handleClick = () => {
    toggleSidebar(); // toggles the sidebar
    setIsOpen((prev) => !prev); // update local state
    setActiveTab('search');
  };

  return (
    <Button
      onClick={handleClick}
      className="
        fixed bottom-6 right-6
        z-50
        h-15 w-15 rounded-full
        shadow-lg
        flex md:hidden
      "
      aria-label={isOpen ? 'Close sidebar' : 'Open search'}
    >
      {isOpen && state === 'collapsed' ? <X className="size-5" /> : <List className="size-5" />}
    </Button>
  );
}

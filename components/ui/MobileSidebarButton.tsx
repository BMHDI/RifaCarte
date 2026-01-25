"use client";

import { useState } from "react";
import { Button } from "./button";
import { useSidebar } from "./sidebar";
import { List, Search, X } from "lucide-react";

export function MobileSidebarButton() {
  const { toggleSidebar , state } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    toggleSidebar(); // toggles the sidebar
    setIsOpen((prev) => !prev); // update local state
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
      aria-label={isOpen ? "Close sidebar" : "Open search"}
    >
      {isOpen && state === "collapsed"  ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
    </Button>
  );
}

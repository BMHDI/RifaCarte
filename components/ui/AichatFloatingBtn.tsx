"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { useSidebar } from "./sidebar";
import { BotMessageSquare } from "lucide-react";
import { useOrg } from "@/app/context/OrgContext";

export function AichatFloatingBtn() {
  const { toggleSidebar, state } = useSidebar();
  const [showInvite, setShowInvite] = useState(true);

  const { setActiveTab,activeTab } = useOrg();

  // Hide message after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInvite(false);
    }, 6000); // 6 seconds

    return () => clearTimeout(timer);
  }, []);
const handleClick = () => {
  setShowInvite(false); // hide the bubble immediately

  if (state == "collapsed") {
    // Sidebar is closed → open it and set tab to AI
    toggleSidebar();
    setActiveTab("ai");
  } else {
    // Sidebar is open
    if (activeTab !== "ai") {
      // Switch tab to AI without closing
      setActiveTab("ai");
    } else {
      // Already in AI tab → close sidebar
      toggleSidebar();
    }
  }
};


  return (
    <div className="fixed md:bottom-12 bottom-25  right-6 z-50 flex items-center gap-2 flex-col items-end

     ">
      
      {/* Invite bubble */}
      {showInvite && (
        <div
          className="
            bg-white text-gray-800
            px-3 py-2
            rounded-lg
            shadow-md
            text-sm
            animate-bounce
            max-w-[180px]
          "
        >
          👋 Bonjour !  
          <br />
          Je suis là pour vous aider.
        </div>
      )}

      {/* Button */}
      <Button
        onClick={handleClick}
        className="
          h-15 w-15 rounded-full
          shadow-lg
          flex items-center justify-center
        "
        aria-label="Ouvrir le Chat"
      >
        <BotMessageSquare />
      </Button>
    </div>
  );
}

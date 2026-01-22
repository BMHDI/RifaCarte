"use client"

import { Button } from "./button"
import { useSidebar } from "./sidebar"
import { Search, X } from "lucide-react"

export function SidebarToggleButton() {
  const { toggleSidebar, state } = useSidebar()

  const isCollapsed = state === "collapsed"

  return (
    <Button
      onClick={toggleSidebar}
      variant={"outline"}
      size="icon"
      className="
        absolute
        top-2
        -right-12
        z-50
        h-10 w-10 rounded-full
        shadow-lg
        hidden md:flex
      "
      aria-label={isCollapsed ? "Ouvrir" : "Fermer"}
    >
      {isCollapsed ? (
        <Search className="h-5 w-5" />
      ) : (
        <X className="h-5 w-5" />
      )}
    </Button>
  )
}

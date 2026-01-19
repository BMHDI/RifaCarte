import { Button } from "./button"
import { useSidebar } from "./sidebar"
export function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      onClick={toggleSidebar}
      className="
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        bg-blue-600 text-white shadow-xl
        flex justify-center items-center
        hover:bg-blue-700 transform hover:scale-105 transition-transform duration-200
        md:hidden
      "
    >
      ☰
    </Button>
  )
}
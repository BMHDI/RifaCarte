import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import Logo from "@/public/assets/logo.svg"

export function Header() {
  return (
    <header className="sticky top-0 z-50   shadow-sm "  style={{
    background:
      "linear-gradient(135deg, rgb(97, 178, 224) 0%, rgba(230, 67, 96, 0.64) 100%)",
  }}>
      <div className="max-w-7xl font-extrabold text text-xl text-white  mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
   LOGO
       

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="flex space-x-2">
            {/* Home */}
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className="text-white text-lg hover:text-gray-900 font-bold">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* About */}
            <NavigationMenuItem  >
              <NavigationMenuLink href="/about" className="text-white text-lg  font-bold" >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>

        
          </NavigationMenuList>

          {/* Optional viewport for animations */}
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>
    </header>
  )
}

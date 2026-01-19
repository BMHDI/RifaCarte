import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <h1 className="text-xl font-bold text-gray-900">
          Alberta Organizations Directory
        </h1>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="flex space-x-2">
            {/* Home */}
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* About */}
            <NavigationMenuItem>
              <NavigationMenuLink href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
                About
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Example Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-gray-600 hover:text-gray-900 font-medium">
                More
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-48 p-2">
                <ul className="space-y-1">
                  <li>
                    <NavigationMenuLink href="/contact" className="block px-2 py-1 rounded hover:bg-gray-100">
                      Contact
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="/faq" className="block px-2 py-1 rounded hover:bg-gray-100">
                      FAQ
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>

          {/* Optional viewport for animations */}
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>
    </header>
  )
}

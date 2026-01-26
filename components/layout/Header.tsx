import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import Logo from "@/public/assets/logo.svg";

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-white   shadow-sm "
     
    >
      <div className="max-w-7xl font-extrabold text text-xl  mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        LOGO
        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="flex space-x-2">
            {/* Home */}
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/"
                className=" text-lg hover:text-gray-900 font-bold"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* About */}
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/about"
                className="text-lg  font-bold"
              >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          {/* Optional viewport for animations */}
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>
    </header>
  );
}

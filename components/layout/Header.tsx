import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import logo from "@/public/assets/logo.png";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <>
      <div
        className=" w-full bg-gradient-to-r 
  from-sky-300 
  via-indigo-400 
  via-purple-300 
  to-rose-300
  "
      >
        <div className="flex items-center  justify-between h-4 align w-[75dvw] mx-auto">
          {/* <div className="flex items-center gap-2">
            <Mail  className="h-5"  color="white" />
            <p className="text-white font-bold text-xs">rifa@rifalberta.com</p>
          </div>
          <div className="flex  items-center gap-2 ">
            <Facebook className="h-5"  color="white" />
            <Instagram  className="h-5" color="white" />
          </div> */}
        </div>
        <div />
      </div>
      <header className="sticky top-0 z-50 bg-white   shadow-sm ">
        <div className="max-w-7xl font-extrabold text text-xl  mx-auto px-4 py-2 flex items-center justify-between">
          {/* Logo / Title */}
<Link href="https://rifalberta.com/" target="_blank" rel="noopener noreferrer">
  <Image src={logo} alt="Logo" className="h-14 w-auto cursor-pointer" />
</Link>
          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-2">
              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/"
                
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* About */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/about"
                 
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
    </>
  );
}

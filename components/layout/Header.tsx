import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import logo from '@/public/assets/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import GoogleTranslate from '../ui/GoogleTranslate';

export function Header() {
  return (
    <>
      <div
        className="h-3 w-full bg-gradient-to-r 
  from-sky-300 
  via-indigo-400 
  via-purple-300 
  to-rose-300
  "
      >
      </div>
      <header className="sticky top-0 z-50 bg-white   shadow-sm ">
        <div className="md:max-w-[70dvw] font-extrabold text text-xl  mx-auto px-4  flex items-center justify-between">
          {/* Logo / Title */}
          <Link href="https://rifalberta.com/" target="_blank" rel="noopener noreferrer">
<Image 
  src={logo} 
  alt="Logo" 
  className="h-20 w-auto cursor-pointer" 
  priority  // <-- this tells Next.js to load immediately
  fetchPriority="high" // optional, browser hint
/>          </Link>
          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-2">
              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink href="/">Accueil</NavigationMenuLink>
              </NavigationMenuItem>

              {/* About */}
              <NavigationMenuItem>
                <NavigationMenuLink className='whitespace-nowrap' href="/Àpropos">À propos</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>

            {/* Optional viewport for animations */}
            <NavigationMenuViewport />
            <GoogleTranslate/>
          </NavigationMenu>
        </div>
      </header>
    </>
  );
}

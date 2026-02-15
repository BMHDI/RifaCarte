"use client";

import dynamic from "next/dynamic";
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

// Dynamically import GoogleTranslate so it won't block SSR
const GoogleTranslate = dynamic(() => import("../ui/GoogleTranslate"), { ssr: false });

export function Header() {
  return (
    <>
      {/* Gradient Top Bar */}
      <div
        className="h-3 w-full bg-gradient-to-r 
          from-sky-300 
          via-indigo-400 
          via-purple-300 
          to-rose-300"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm h-[88px] md:h-[80px]">
        <div className="md:max-w-[70dvw] font-extrabold text-xl mx-auto px-4 flex items-center justify-between h-full">
          
          {/* Logo */}
          <Link href="https://rifalberta.com/" target="_blank" rel="noopener noreferrer">
            <Image
              src={logo}
              alt="Logo"
              className="h-20 w-auto cursor-pointer"
              priority // loads immediately
              fetchPriority="high" // browser hint
            />
          </Link>
          
          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-2">
              
              <NavigationMenuItem>
                <NavigationMenuLink href="/">Accueil</NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="whitespace-nowrap" href="/Àpropos">
                  À propos
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>

            {/* Optional viewport for animations */}
            <NavigationMenuViewport />

            {/* Translate Button (loads on click) */}
            <GoogleTranslate />
          </NavigationMenu>
        </div>
      </header>
    </>
  );
}

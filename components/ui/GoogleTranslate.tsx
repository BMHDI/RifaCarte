"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { Button } from "./button";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(""); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. SYNC ICON WITH CURRENT GOOGLE STATE
    // Google stores language in a cookie like "/fr/en" or "/fr/fr"
    const getActiveLanguage = () => {
      const name = "googtrans=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
          const value = c.substring(name.length, c.length);
          return value.split('/').pop() || "fr";
        }
      }
      return "fr";
    };

    setCurrentLang(getActiveLanguage());

    // 2. INITIALIZE GOOGLE
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: "fr", 
          includedLanguages: "en,fr,ar",
          autoDisplay: false 
        },
        "google_translate_element"
      );
    };

    // 3. THE WATCHDOG (Stops the banner from pushing header)
    const observer = new MutationObserver(() => {
      // Force the top offset to zero immediately
      if (document.documentElement.style.top !== "0px") {
        document.documentElement.style.setProperty("top", "0px", "important");
      }
      if (document.body.style.top !== "0px") {
        document.body.style.setProperty("top", "0px", "important");
      }
      
      // Hide the banner if it exists
      const banner = document.querySelector(".goog-te-banner-frame") as HTMLElement;
      if (banner) {
        banner.style.display = "none";
        banner.style.visibility = "hidden";
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      observer.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (lang: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
      setCurrentLang(lang);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      
      {/* Hidden Google Widget */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Main Circular Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="font-extrabold capitalize  cursor-pointer "
        variant={"ghost"}
      >
        {currentLang}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-[9999] animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => handleLanguageChange("fr")}
            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
              currentLang === "fr" ? "font-bold text-primary" : "text-gray-700"
            }`}
          >
            Français
          </button>
          <div className="h-[1px] bg-gray-100 w-full" />
          <button
            onClick={() => handleLanguageChange("en")}
            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
              currentLang === "en" ? "font-bold text-primary" : "text-gray-700"
            }`}
          >
            English
          </button>
                    <div className="h-[1px] bg-gray-100 w-full" />

          <button
            onClick={() => handleLanguageChange("ar")}
            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
              currentLang === "ar" ? "font-bold text-primary" : "text-gray-700"
            }`}
          >
            Arabic
          </button>
        </div>
        
      )}
    </div>
  );
};

export default GoogleTranslate;
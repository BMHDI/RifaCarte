"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "./button";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("fr"); // default to French
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Always reset to French on refresh
  useEffect(() => {
    document.cookie = "googtrans=/fr/fr; path=/"; // reset cookie
    setCurrentLang("fr");
  }, []);

  // Watchdog to hide Google banner
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.documentElement.style.top !== "0px") {
        document.documentElement.style.setProperty("top", "0px", "important");
      }
      if (document.body.style.top !== "0px") {
        document.body.style.setProperty("top", "0px", "important");
      }
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

  const handleButtonClick = () => {
    setIsOpen(!isOpen);

    if (!scriptLoaded) {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        // Always start in French
        document.cookie = "googtrans=/fr/fr; path=/";
        new window.google.translate.TranslateElement(
          { pageLanguage: "fr", includedLanguages: "en,fr,ar", autoDisplay: false },
          "google_translate_element"
        );
      };

      setScriptLoaded(true);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Hidden Google Widget */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Main Button */}
      <Button
        onClick={handleButtonClick}
        className="font-extrabold capitalize cursor-pointer"
        variant={"ghost"}
      >
        {currentLang}
      </Button>

      {/* Dropdown */}
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

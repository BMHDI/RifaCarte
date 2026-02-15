"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "./button";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  /* ----------------------------------------
     Get current language from cookie
  -----------------------------------------*/
  const getActiveLanguage = () => {
    const name = "googtrans=";
    const ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();

      if (c.indexOf(name) === 0) {
        const value = c.substring(name.length, c.length);
        return value.split("/").pop() || "fr";
      }
    }

    return "fr";
  };

  /* ----------------------------------------
     Load Google Translate ONLY on demand
  -----------------------------------------*/
  const loadGoogleTranslate = () => {
    if (scriptLoaded.current) return;
    if (window.google?.translate) return;

    scriptLoaded.current = true;

    // Init callback
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "fr",
          includedLanguages: "en,fr,ar",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Inject script
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    document.body.appendChild(script);
  };

  /* ----------------------------------------
     Prevent Google banner + sync lang
  -----------------------------------------*/
  useEffect(() => {
    setCurrentLang(getActiveLanguage());

    // Block Google banner
    const observer = new MutationObserver(() => {
      document.documentElement.style.setProperty("top", "0px", "important");
      document.body.style.setProperty("top", "0px", "important");

      const banner = document.querySelector(
        ".goog-te-banner-frame"
      ) as HTMLElement;

      if (banner) {
        banner.style.display = "none";
        banner.style.visibility = "hidden";
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      observer.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ----------------------------------------
     Change language
  -----------------------------------------*/
  const handleLanguageChange = (lang: string) => {
    const select = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;

    if (!select) return;

    select.value = lang;
    select.dispatchEvent(new Event("change"));

    setCurrentLang(lang);
    setIsOpen(false);
  };

  /* ----------------------------------------
     Toggle + load
  -----------------------------------------*/
  const handleToggle = () => {
    loadGoogleTranslate(); // <-- only here
    setIsOpen((prev) => !prev);
  };

  /* ----------------------------------------
     Render
  -----------------------------------------*/
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Hidden Google Widget */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Main Button */}
      <Button
        onClick={handleToggle}
        className="font-extrabold capitalize cursor-pointer"
        variant="ghost"
      >
        {currentLang}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-[9999] animate-in fade-in zoom-in duration-200">
          {/* French */}
          <button
            onClick={() => handleLanguageChange("fr")}
            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
              currentLang === "fr"
                ? "font-bold text-primary"
                : "text-gray-700"
            }`}
          >
            Français
          </button>

          <div className="h-[1px] bg-gray-100 w-full" />

          {/* English */}
          <button
            onClick={() => handleLanguageChange("en")}
            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
              currentLang === "en"
                ? "font-bold text-primary"
                : "text-gray-700"
            }`}
          >
            English
          </button>

          <div className="h-[1px] bg-gray-100 w-full" />

          {/* Arabic */}
          <button
            onClick={() => handleLanguageChange("ar")}
            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
              currentLang === "ar"
                ? "font-bold text-primary"
                : "text-gray-700"
            }`}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );
}

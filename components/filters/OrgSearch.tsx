"use client";

import { useState, useMemo, useEffect } from "react";
import organizations from "@/lib/org.json";
import { useOrg } from "@/app/context/OrgContext";
import { filterOrgs } from "@/lib/orgFilter";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { useSidebar } from "../ui/sidebar";
import { ArrowBigDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { OrgCard } from "../ui/OrgCard";
import { Org } from "@/types/types";
import CATEGORIES from "@/lib/categories";
import { useCities } from "@/hooks/useCities";
import { RegionSelectorList } from "../ui/RegionSelectorList";
import SearchWithFilters from "./SearchWithFilters";

export function OrgSearch() {
  const {
    query,
    setQuery,
    selectedCategories,
    setSelectedCategories,
    selectedCities,
    setSelectedCities,
    setSelectedOrg,
    toggleSavedOrg,
    isSaved,
    activeRegion,
    resetAllFilters,
  } = useOrg();
  const filteredOrgs: Org[] = filterOrgs(
    organizations,
    query,
    selectedCategories,
    selectedCities,
    activeRegion,
  );

  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  // ✅ unique categories
const groupNames = useMemo(() => {
  return CATEGORIES.map(group => group.group);
}, []);

  // ✅ unique cities
  const cities = useCities();
  useEffect(() => {
    if (!activeRegion) return;

    setSelectedCities((prev) =>
      prev.filter((city) =>
        organizations.some(
          (o) =>
            o.region === activeRegion &&
            o.locations.some((l) => l.city === city),
        ),
      ),
    );
  }, [activeRegion, setSelectedCities]);
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };
  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  // 🔹 SAME LOGIC + category filter added

  return (
    <div>
      <div className="flex w-full flex-col h-[80vh] bg-gray-60">
        <div className="h-full grid gap-2 mb-2 overflow-y-auto [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {filteredOrgs.length === 0 && activeRegion && (
            <p>Aucun organisme trouvé.</p>
          )}
          {!activeRegion && <RegionSelectorList />}
          {activeRegion &&
            filteredOrgs.map((org) => (
              <OrgCard
                logo=""
                key={org.id + org.name}
                name={org.name}
                phone={org.contact?.phone ?? ""}
                address={org.locations[0]?.address ?? ""}
                category={org.category}
                onDetails={() => {}}
                onShare={() => {}}
                onMap={() => {
                  if (org.locations.length === 1) {
                    // single location → select directly
                    setSelectedOrg({
                      org,
                      location: org.locations[0] as {
                        lat: number;
                        lng: number;
                        city?: string | undefined;
                        address?: string | undefined;
                      },
                    });
                  } else {
                    // multiple locations → show all markers, no flying yet
                    setSelectedOrg({
                      org,
                      locations: org.locations.map((location) => ({
                        lat: location.lat ?? 0,
                        lng: location.lng ?? 0,
                        city: location.city,
                        address: location.address,
                      })),
                    });
                  }
                  if (isMobile) toggleSidebar();
                }}
                onSave={() => toggleSavedOrg(org)} // toggle instead of just add
                isSaved={isSaved(org.id ?? "")} // pass the boolean to OrgCard for UI
              />
            ))}
        </div>
        {/* ✅ SAME STYLING — button becomes dropdown */}
        <div className="mx-4 flex flex-col  ">
          {selectedCategories.length > 0 || selectedCities.length > 0 ? (
            <>
              <div className="flex flex-row justify-center ">
                <button
                  onClick={resetAllFilters}
                  className="text-sm font-semibold  hover:underline hover:text-red-600 "
                >
                  ↺ Réinitialiser tous les filtres
                </button>
              </div>
              {selectedCategories.length > 0 && (
                <>
                  <span className="text-sm">Catégories:</span>

                  <div className="flex flex-wrap items-center gap-1">
                    {selectedCategories.map((c) => (
                      <Badge
                        key={`cat-${c}`}
                        variant="default"
                        className="rounded-full cursor-pointer flex-shrink-0"
                        onClick={() => toggleCategory(c)}
                      >
                        {c} ✕
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {selectedCities.length > 0 && (
                <>
                  <span className="text-sm font-medium flex-shrink-0">
                    Villes :
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {selectedCities.map((c) => (
                      <Badge key={`city-${c}`} onClick={() => toggleCity(c)}>
                        {c} ✕
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-row justify-center ">
              {activeRegion ||
              selectedCategories.length ||
              selectedCities.length ||
              query ? (
                <button
                  onClick={resetAllFilters}
                  className="text-sm font-semibold  hover:underline hover:text-red-600 "
                >
                  ↺ Réinitialiser tous les filtres
                </button>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-900 flex">
                    Utilisez le bouton filtres pour choisir la ville ou la
                    catégorie
                  </p>
                  <ArrowBigDown className="h-5" fill="#e6425f" />
                </>
              )}
            </div>
          )}
        </div>
        {/* ✅ SAME STYLING — button becomes dropdown */}
        <div className="z-50">
        <SearchWithFilters
          query={query}
          setQuery={setQuery}
          categories={groupNames}
          cities={cities}
          selectedCategories={selectedCategories}
          selectedCities={selectedCities}
          toggleCategory={toggleCategory}
          toggleCity={toggleCity}
        />
        </div>
      </div>
    </div>
  );
}
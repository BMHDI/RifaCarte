"use client";

import { useState, useMemo } from "react";
import organizations from "@/lib/org.json";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command";

import { Check, ChevronDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { OrgCard } from "../ui/OrgCard";

// normalisation : minuscules + enlever accents
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const stopWords = [
  "pour",
  "les",
  "de",
  "du",
  "des",
  "la",
  "le",
  "un",
  "une",
  "et",
];

export function OrgSearch() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // ✅ unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach((o) => set.add(o.category));
    return Array.from(set).sort();
  }, []);

  // ✅ unique cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach((o) =>
      o.locations.forEach((loc) => set.add(loc.city)),
    );
    return Array.from(set).sort();
  }, [organizations]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };
  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  // 🔹 SAME LOGIC + category filter added
  const filteredOrgs = organizations.filter((org) => {
    // ----- text logic (UNCHANGED) -----
    let textMatch = true;

    if (query) {
      const services = normalize(query)
        .split(/\s+/)
        .filter((w) => w && !stopWords.includes(w));

      if (services.length === 0) return false;

      textMatch = services.some((word) =>
        org.services.some((k) => normalize(k).includes(word)),
      );
    }

    // ----- category filter (UNCHANGED) -----
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(org.category);

    // ----- city filter (UNCHANGED) -----
    const cityMatch =
      selectedCities.length === 0 ||
      selectedCities.includes(org.locations[0].city);

    return textMatch && categoryMatch && cityMatch;
  });

  return (
    <div>
      <div className="flex flex-col h-[70vh] bg-gray-60  ">
        <div
          className="h-full
         grid
          gap-2
         mb-2
          overflow-y-auto
         [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
        >
          {filteredOrgs.length === 0 && <p>Aucun organisme trouvé.</p>}

          {filteredOrgs.map((org) => (
            <OrgCard
              key={org.id}
              {...org}
              onDetails={() => {}}
              onShare={() => {}}
              onMap={() => {}}
              name={org.name}
              // logo={org.logo ?? ""} // fallback if logo is missing
              phone={org.contact?.phone ?? ""} // fallback if phone is missing
              address={org.locations[0].address}
            />
          ))}
        </div>

        {/* ✅ SAME STYLING — button becomes dropdown */}
        <div className="flex w-full p-4 ">
          <Input
            className="rounded-r-none"
            value={query}
            placeholder="Chercher un organisme..."
            onChange={(e) => setQuery(e.target.value)}
          />

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="default" className="rounded-l-none flex gap-1">
                filtres
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[220px] p-0" align="end">
              <Command>
                Categories:
                <CommandList>
                  <CommandGroup>
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat}
                        onSelect={() => toggleCategory(cat)}
                        className="flex items-center justify-between"
                      >
                        <span>{cat}</span>
                        {selectedCategories.includes(cat) && (
                          <Check className="h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <Command>
                Villes:
                <CommandList>
                  <CommandGroup>
                    {cities.map((city) => (
                      <CommandItem
                        key={city}
                        onSelect={() => toggleCity(city)}
                        className="flex items-center justify-between"
                      >
                        <span>{city}</span>
                        {selectedCities.includes(city) && (
                          <Check className="h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ✅ SAME STYLING — button becomes dropdown */}
      <div className="mx-6 flex flex-col flex-wrap items-start gap-2 ">
        {selectedCategories.length > 0 || selectedCities.length > 0 ? (
          <>
            {selectedCategories.length > 0 && (
              <>
                <div className="flex flex-row flex-wrap items-start gap-2 ">
                  <span className="text-sm font-medium">
                    Catégories choisies:
                  </span>
                  {selectedCategories.map((c) => (
                    <Badge
                      key={`cat-${c}`}
                      variant="default"
                      className="rounded-full cursor-pointer"
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
                <div className="flex flex-row flex-wrap items-start gap-2 ">
                  <span className="text-sm font-medium">Villes choisies:</span>
                  {selectedCities.map((c) => (
                    <Badge
                      key={`city-${c}`}
                      variant="default"
                      className="rounded-full cursor-pointer"
                      onClick={() => toggleCity(c)}
                    >
                      {c} ✕
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-md text-gray-900 m-2">
            Utilisez le bouton filtres pour choisir la ville ou la catégorie
          </p>
        )}
      </div>
    </div>
  );
}

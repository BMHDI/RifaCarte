"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, Check } from "lucide-react";
import { SearchWithFiltersProps } from "@/types/types";

export default function SearchWithFilters({
  query,
  setQuery,
  categories,
  cities,
  selectedCategories,
  selectedCities,
  toggleCategory,
  toggleCity,
}: SearchWithFiltersProps) {
  const [open, setOpen] = React.useState(false);

  const scrollableContent = (
    <div className="max-h-[70vh] overflow-y-auto">
      <Command>
        <span className="text-md font-bold px-2">Catégories :</span>
        <CommandList>
          <CommandGroup>
            {categories.map((cat) => (
              <CommandItem
                key={cat}
                onSelect={() => toggleCategory(cat)}
                className="flex justify-between"
              >
                <span>{cat}</span>
                {selectedCategories.includes(cat) && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>

      <Command>
        <span className="text-md font-bold px-2">Villes :</span>
        <CommandList>
          <CommandGroup>
            {cities.map((city) => (
              <CommandItem
                key={city}
                onSelect={() => toggleCity(city)}
                className="flex justify-between"
              >
                <span>{city}</span>
                {selectedCities.includes(city) && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );

  return (
    <div className="flex w-full p-4">
      <Input
        className="rounded-r-none flex-1"
        value={query}
        placeholder="Chercher un organisme..."
        onChange={(e) => setQuery(e.target.value)}
      />

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-l-none flex gap-1">
            filtres
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[220px] p-0 max-h-[80vh] overflow-y-scroll">
          {scrollableContent}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

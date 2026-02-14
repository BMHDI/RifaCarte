'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronDown, Check, Filter, SlidersHorizontal } from 'lucide-react';
import { SearchWithFiltersProps } from '@/types/types';
import { useRef } from 'react'; // Import useRef

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
  // Inside your component:
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur(); // This hides the keyboard
    }
  };
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
    <div className="flex w-full px-4 ">
      <Input
        onKeyDown={handleKeyDown} // Listen for the Enter key
        className="rounded-r-none flex-1 cursor-text"
        value={query}
        placeholder="Chercher un organisme..."
        onChange={(e) => setQuery(e.target.value)}
      />

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-l-none flex gap-1 hover:scale-101 cursor-pointer">
            <SlidersHorizontal />
            Filtres
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

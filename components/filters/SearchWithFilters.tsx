"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown, Check } from "lucide-react"
import { SearchWithFiltersProps } from "@/types/types"
import {  trackEvent } from "@/app/googleAnalytics"


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
  const [open, setOpen] = React.useState(false)

  // Mobile detection

  const scrollableContent = (
    <div className="max-h-[70vh] z-50 overflow-hidden ">
      <Command className="max-h-[30vh] overflow-y-auto">
        <span className="text-md font-bold px-2">Categories:</span>
        <CommandList>
          <CommandGroup className="">
            {categories.map((cat) => (
              <CommandItem
                key={cat}
                onSelect={() => toggleCategory(cat)}
                className="flex items-center justify-between"
              >
                <span>{cat}</span>
                {selectedCategories.includes(cat) && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>

      <Command className="max-h-[30vh] overflow-y-auto">
        <span className="text-md font-bold px-2">Villes:</span>
        <CommandList>
          <CommandGroup>
            {cities.map((city) => (
              <CommandItem
                key={city}
                onSelect={() => toggleCity(city)}
                className="flex items-center justify-between"
              >
                <span>{city}</span>
                {selectedCities.includes(city) && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )

  return (
    <div className="flex w-full p-4">
      <Input
        className="rounded-r-none flex-1"
        value={query}
        placeholder="Chercher un organisme..."
onChange={(e) => {
    setQuery(e.target.value);

    // Track event for GA
    trackEvent("org_search_input", {
      category: "search",
      label: e.target.value.slice(0, 50), // first 50 chars only
    });
  }}   
  onKeyDown={(e) => {
  if (e.key === "Enter") {
    trackEvent("org_search", { category: "search", label: query.slice(0, 50) });
  }
}}   />

    
        <DropdownMenu open={open} onOpenChange={setOpen} >
          <DropdownMenuTrigger asChild>
            <Button className="rounded-l-none flex gap-1">
              filtres
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[220px] p-0 max-h-[80vh] overflow-y-scroll touch-pan-y">
            {scrollableContent}
          </DropdownMenuContent>
        </DropdownMenu>
     
      
   
    </div>
  )
}

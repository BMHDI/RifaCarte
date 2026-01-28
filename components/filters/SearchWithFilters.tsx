"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { useIsMobile } from "@/hooks/use-mobile"

type SearchWithFiltersProps = {
  query: string
  setQuery: (q: string) => void
  categories: string[]
  cities: string[]
  selectedCategories: string[]
  selectedCities: string[]
  toggleCategory: (c: string) => void
  toggleCity: (c: string) => void
}

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
  const isMobile = useIsMobile()

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
        onChange={(e) => setQuery(e.target.value)}
      />

    
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

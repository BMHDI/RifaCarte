// components/RegionSelectorList.tsx
'use client';

import { useOrg } from '@/app/context/OrgContext';
import { Button } from './button';

const REGION_BUTTONS = [
  { name: 'Nord', value: 'nord' },
  { name: 'Centre', value: 'centre' },
  { name: 'Sud', value: 'sud' },
];

interface RegionSelectorProps {
  onRegionSelect?: (region: string) => void;
}

export function RegionSelectorList({ onRegionSelect }: RegionSelectorProps) {
  const { activeRegion, setActiveRegion } = useOrg();

  const handleSelect = (regionValue: string) => {
    setActiveRegion(regionValue);
    if (onRegionSelect) onRegionSelect(regionValue);
  };

  // If a region is already active, hide the buttons
  if (activeRegion) return null;

  return (
    <div className="flex flex-wrap items-center flex-col gap-8 pt-4">
      {REGION_BUTTONS.map((region) => (
        <Button
          key={region.value}
          onClick={() => handleSelect(region.value)}
          className="
           h-24 w-24 rounded-full
          shadow-lg hover:scale-110 transition-transform
          text-lg font-bold
          md:h-25 md:w-25
        "
        >
          {region.name}
        </Button>
      ))}
    </div>
  );
}

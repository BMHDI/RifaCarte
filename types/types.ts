export interface OrgCardProps {
  logo: string;
  name: string;
  phone: string;
  address: string;
  onDetails?: () => void;
  onShare?: () => void;
  onMap?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}
// types for an Org
export type OrgLocation = {
  city?: string;
  address?: string;
  lat: number ;
  lng: number ;
};
export interface Org {
  id?: string;//to be removed
  name: string;
  category: string | string[];  // Allow string or array
  description?: string;
  director?: {
    name: string;
    title?: string;
  };
  services?: string[];
  audience?: string;
  projects?: {
    name: string;
    description?: string;
  }[];
  locations: OrgLocation[];
  contact?: {
    email?: string;
    phone?: string | null; // allow null
    website?: string;
  };
  tags?: string[];
  memberOf?: string[];
  region?: string;

}
export interface SelectedOrg {
  org?: Org;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    address?: string;
  }; // the currently selected location for flying / popup
  locations?: { lat: number; lng: number; city?: string; address?: string }[]; // all locations for org
}

export interface GeoJSONFeatureCollection {
  type: string;
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: string;
  properties: {
    name: string;
  };
  geometry: GeoJSONGeometry;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[][];
}
// context value type
export type OrgContextType = {
  selectedOrg: SelectedOrg | null;
  setSelectedOrg: (org: SelectedOrg | null) => void;
  query: string;
  setQuery: (v: string) => void;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCities: string[];
  setSelectedCities: React.Dispatch<React.SetStateAction<string[]>>;
  savedOrgs: Org[];
  toggleSavedOrg: (org: Org) => void;
  isSaved: (orgId: string) => boolean;
  activeRegion: string | null;
  setActiveRegion: React.Dispatch<React.SetStateAction<string | null>>;
  resetAllFilters: () => void;
      viewState: any; // or a specific type if available
  setViewState: (view: any) => void; // or a specific type if available
  resetMapView: () => void;
};
export type SearchWithFiltersProps = {
  query: string
  setQuery: (q: string) => void
  categories: string[]
  cities: string[]
  selectedCategories: string[]
  selectedCities: string[]
  toggleCategory: (c: string) => void
  toggleCity: (c: string) => void
}
//orgCard props
export interface OrgCardProps {
  // logo: string;
  name: string;
  phone: string;
  address: string;
  category?: string [] | string;
  onDetails?: () => void;
  onShare?: () => void;
  onMap?: () => void;
}
export interface OrgSearchProps {
  activeRegion?: string | null;
}
export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface UserProfile {
  city?: string;
  intent?: "emploi" | "logement" | "immigration" | "services";
  profession?: string;
  experienceYears?: number;
  urgency?: "immediate" | "soon";
  companyType?: "large" | "sme" | "startup" | "any";
}

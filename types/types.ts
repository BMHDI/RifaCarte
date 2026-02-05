export interface OrgCardProps {
   id: string;
   image_url: string;
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
  id?: string; // required, matches DB primary key
  name: string;
  category?: string[];           // always an array in DB
  description?: string | null;
  director?: {
    name?: string | null;
    title?: string | null;
  } | null;
  services?: string[];           // array
  audience?: string | null;
  projects?: {
    name: string;
    description?: string | null;
  }[] | null;
  locations: OrgLocation[];      // must be an array, even if empty
  contact?: {
    email?: string | null;
    phone?: string | null;
    website?: string | null;
  } | null;
  tags?: string[] | null;
  members?: string[] | null;     // renamed from memberOf to match DB
  region?: string | null;
  content?: string | null;       // optional AI-generated content field
  email?: string | null;         // denormalized for DB convenience
  phone?: string | null;         // denormalized for DB convenience
  website?: string | null;       // denormalized for DB convenience
  address?: string | null;       // denormalized first location
  city?: string | null;          // denormalized first location
  lat?: number | null;           // denormalized first location
  lng?: number | null;           // denormalized first location
  image_url?: string | null;
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
  mapInstance: mapboxgl.Map | null;
  setMapInstance: (map: mapboxgl.Map | null) => void;
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
export type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  transitionDuration?: number;
  // ...other fields you use
};
 export type RateLimitRecord = { count: number; lastCall: number };

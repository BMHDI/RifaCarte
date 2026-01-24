export interface OrgCardProps {
  logo: string;
  name: string;
  phone: string;
  address: string;
  onDetails?: () => void;
  onShare?: () => void;
  onMap?: () => void;
}
// types for an Org
export interface Org {
  id: string;
  name: string;
  category?: string;
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
  locations: {
    city?: string;
    address?: string;
    lat: number | null; // allow null
    lng: number | null; // allow null
  }[];
contact?: {
  email?: string;
  phone?: string | null; // allow null
  website?: string;
};
  tags?: string[];
  memberOf?: string[];
}
export interface SelectedOrg {
  
  org?: Org;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    address?: string;
  };
}

// context value type
export interface OrgContextType {
  selectedOrg: SelectedOrg | null;
  setSelectedOrg: (org: SelectedOrg | null) => void;
  savedOrgs: Org[];
  addOrg: (org: Org) => void;
}

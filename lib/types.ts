declare module 'react-map-gl' {
  export interface LayerProps {
    id: string;
    type: string;
    paint?: string;
    layout?: Record<string, any>;
    data?: any;

  }
}
export interface OrgCardProps {
  logo: string
  name: string
  phone: string
  address: string
  onDetails?: () => void
  onShare?: () => void
  onMap?: () => void
}
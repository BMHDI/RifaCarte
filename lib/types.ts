declare module 'react-map-gl' {
  export interface LayerProps {
    id: string;
    type: string;
    paint?: Record<string, any>;
    layout?: Record<string, any>;
    data?: any;

  }
}

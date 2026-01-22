import { LayerProps } from "react-map-gl/mapbox"

export const regionFill: LayerProps = {
  id: "regions-fill",
  type: "fill",
  paint: {
    "fill-color": "#16b1f9", 
    "fill-opacity": 0.2
  }
}

export const regionBorder: LayerProps = {
  id: "regions-border",
  type: "line",
  paint: {
    "line-color": "#1b053b",
    "line-width": 2
  }
}
export const regionLabels: LayerProps = {
  id: "regions-label",
  type: "symbol",
  layout: {
    "text-field": ["get", "name"], // Use the 'name' property from GeoJSON
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-size": 16,
    "text-anchor": "center"
  },
  paint: {
    "text-color": "#c60d07",
    "text-halo-color": "#ffffff",
    "text-halo-width": 2
  }
}

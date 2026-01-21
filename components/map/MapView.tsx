"use client"

import Map, { NavigationControl, Marker, Popup, Source, Layer, LayerProps } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { useState } from "react"
import organizations from "@/lib/org.json"
import { MapPin } from 'lucide-react'

// ✅ Import your GeoJSON file
import francophoneRegions from "@/lib/francophone-regions.json"

// ✅ Layer styles
const regionFill: LayerProps = {
  id: "regions-fill",
  type: "fill",
  paint: {
    "fill-color": "#16b1f9", // orange
    "fill-opacity": 0.2
  }
}

const regionBorder: LayerProps = {
  id: "regions-border",
  type: "line",
  paint: {
    "line-color": "#1b053b",
    "line-width": 2
  }
}
const regionLabels: LayerProps = {
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

export function MapView() {
  const [viewState, setViewState] = useState({
    longitude: -113.4711,
    latitude: 53.5198,
    zoom: 5, // zoom out to see multiple regions
  })
  const [selectedOrg, setSelectedOrg] = useState<any>(null)

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map
        initialViewState={viewState}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/bmhdi/cmkoaod33000k01r83dx855i3"
        style={{ width: "100%", height: "100%" }}
        onMove={(e) => setViewState(e.viewState)}
      >
        <NavigationControl position="top-right" />

        {/* ✅ Add the Francophone regions */}
        <Source id="francophone-regions" type="geojson" data={{ type: "FeatureCollection", features: francophoneRegions.features }}>
          <Layer {...regionFill} />
          <Layer {...regionBorder} />
          <Layer {...regionLabels} />
        </Source>

        {/* ✅ MARKERS */}
        {organizations.map((org) => (
          <Marker
            key={org.id}
            longitude={org.map.lng}
            latitude={org.map.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setSelectedOrg(org)
            }}
          >
            <MapPin size={40}/>
          </Marker>
        ))}

        {/* ✅ POPUP */}
        {selectedOrg && (
          <Popup
            longitude={selectedOrg.map.lng}
            latitude={selectedOrg.map.lat}
            anchor="top"
            onClose={() => setSelectedOrg(null)}
            closeOnClick={false}
          >
            <div className="text-sm font-medium">
              {selectedOrg.name}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}

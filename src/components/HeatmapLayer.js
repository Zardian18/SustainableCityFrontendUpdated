import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";

const HeatmapLayer = ({ points, radius = 25, blur = 15, maxZoom = 17 }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius,
      blur,
      maxZoom,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, radius, blur, maxZoom]);

  return null;
};

export default HeatmapLayer;

import L from "leaflet";

// Different colored icons based on pedestrian count
export const getIconForCount = (count) => {
  const color =
    count > 200
      ? "red"
      : count > 100
      ? "orange"
      : count > 0
      ? "green"
      : "gray";

  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });
};
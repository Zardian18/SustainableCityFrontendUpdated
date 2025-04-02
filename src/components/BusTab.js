// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, useMap } from "react-leaflet";
// import L from "leaflet";
// import axios from "axios";
// import { getCachedData, setCachedData } from "../utils/cache";
// import "leaflet/dist/leaflet.css";
// import "leaflet.heat";

// const BusHeatmap = () => {
// 	const map = useMap();
// 	const [heatData, setHeatData] = useState([]);
// 	const [loading, setLoading] = useState(false);

// 	useEffect(() => {
// 		const loadData = async () => {
// 			setLoading(true);
// 			try {
// 				const cached = getCachedData("busHeatmap");
// 				if (cached) {
// 					setHeatData(cached);
// 					return;
// 				}

// 				// const response = await axios.get("/api/dashboard/");
// 				const response = await axios.get(
// 					"http://localhost:5000/api/dashboard/"
// 				);

// 				if (response.data?.bus_heatmap) {
// 					const points = response.data.bus_heatmap.map((p) => [
// 						p[0],
// 						p[1],
// 						p[2],
// 					]);
// 					setHeatData(points);
// 					setCachedData("busHeatmap", points);
// 				}
// 			} catch (err) {
// 				console.error("API Error:", err);
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		loadData();
// 	}, []);

// 	useEffect(() => {
// 		if (heatData.length > 0) {
// 			const heatLayer = L.heatLayer(heatData, {
// 				radius: 25,
// 				blur: 15,
// 				maxZoom: 17,
// 				gradient: {
// 					0.4: "blue",
// 					0.6: "lime",
// 					0.8: "yellow",
// 					1.0: "red",
// 				},
// 			}).addTo(map);

// 			return () => map.removeLayer(heatLayer);
// 		}
// 	}, [heatData, map]);

// 	return null;
// };

// const BusTab = () => {
// 	return (
// 		<MapContainer
// 			center={[53.3498, -6.2603]}
// 			zoom={13}
// 			style={{ height: "calc(100vh - 64px)", width: "100%" }}
// 		>
// 			<TileLayer
// 				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// 				attribution="&copy; OpenStreetMap contributors"
// 			/>
// 			<BusHeatmap />
// 		</MapContainer>
// 	);
// };

// export default BusTab;
//--------------------------------------------------------

// import React, { useEffect, useState, useMemo } from "react";
// import { MapContainer, TileLayer, useMap } from "react-leaflet";
// import L from "leaflet";
// import axios from "axios";
// import { getCachedData, setCachedData } from "../utils/cache";
// import "leaflet/dist/leaflet.css";
// import "leaflet.heat";

// // Dublin configuration
// const DUBLIN_CENTER = [53.3498, -6.2603];
// const CONGESTION_RADIUS = 400; // meters
// const MIN_BUSES_FOR_CONGESTION = 10;
// const DUBLIN_DESTINATIONS = [
// 	[53.3434, -6.2544],
// 	[53.3467, -6.2678],
// 	[53.3521, -6.2765],
// 	[53.3419, -6.2914],
// 	[53.3352, -6.2627],
// 	[53.3578, -6.2453],
// 	[53.3386, -6.2371],
// 	[53.3491, -6.3056],
// 	[53.3612, -6.2834],
// 	[53.3279, -6.2765],
// 	[53.3401, -6.2589],
// 	[53.3445, -6.2723],
// 	[53.3508, -6.2876],
// 	[53.3367, -6.2491],
// 	[53.3552, -6.2634],
// 	[53.3423, -6.2798],
// 	[53.3489, -6.2541],
// 	[53.3335, -6.2729],
// 	[53.3594, -6.2967],
// 	[53.3456, -6.3012],
// ];

// const BusHeatmap = () => {
// 	const map = useMap();
// 	const [heatData, setHeatData] = useState([]);

// 	useEffect(() => {
// 		const loadData = async () => {
// 			try {
// 				const cached = getCachedData("busHeatmap");
// 				if (cached) {
// 					setHeatData(cached);
// 					return;
// 				}

// 				const response = await axios.get(
// 					"http://localhost:5000/api/dashboard/"
// 				);
// 				if (response.data?.bus_heatmap) {
// 					const points = response.data.bus_heatmap.map((p) => [
// 						p[0],
// 						p[1],
// 						p[2],
// 					]);
// 					setHeatData(points);
// 					setCachedData("busHeatmap", points);
// 				}
// 			} catch (err) {
// 				console.error("API Error:", err);
// 			}
// 		};

// 		loadData();
// 	}, []);

// 	useEffect(() => {
// 		if (heatData.length > 0) {
// 			const heatLayer = L.heatLayer(heatData, {
// 				radius: 25,
// 				blur: 15,
// 				maxZoom: 17,
// 				gradient: {
// 					0.4: "blue",
// 					0.6: "lime",
// 					0.8: "yellow",
// 					1.0: "red",
// 				},
// 			}).addTo(map);

// 			return () => map.removeLayer(heatLayer);
// 		}
// 	}, [heatData, map]);

// 	return null;
// };

// const CongestionMarkers = ({ zones }) => {
// 	const map = useMap();

// 	useEffect(() => {
// 		if (!zones.length) return;

// 		const redIcon = new L.Icon({
// 			iconUrl:
// 				"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-red.png",
// 			iconSize: [25, 41],
// 			iconAnchor: [12, 41],
// 		});

// 		zones.forEach((zone) => {
// 			L.marker(zone.center, { icon: redIcon })
// 				.bindPopup(
// 					`Congestion Zone: ${zone.id}<br>Buses: ${zone.buses.length}`
// 				)
// 				.addTo(map);
// 		});
// 	}, [zones, map]);

// 	return null;
// };

// const RouteDisplay = ({ start, end }) => {
// 	const map = useMap();
// 	const [routes, setRoutes] = useState(null);

// 	useEffect(() => {
// 		if (!start || !end) return;

// 		const fetchRoutes = async () => {
// 			try {
// 				const response = await axios.get(
// 					"http://localhost:5000/api/dashboard/",
// 					{
// 						params: {
// 							start_lat: start[0],
// 							start_lon: start[1],
// 							end_lat: end[0],
// 							end_lon: end[1],
// 						},
// 					}
// 				);

// 				setRoutes({
// 					normal: response.data.normal_route?.route || [],
// 					sustainable: response.data.sustainable_route?.route || [],
// 				});
// 			} catch (err) {
// 				console.error("Route Error:", err);
// 			}
// 		};

// 		fetchRoutes();
// 	}, [start, end]);

// 	useEffect(() => {
// 		if (!routes) return;

// 		const layers = [];
// 		if (routes.normal.length) {
// 			layers.push(
// 				L.polyline(routes.normal, { color: "blue", weight: 3 }).addTo(
// 					map
// 				)
// 			);
// 		}
// 		if (routes.sustainable.length) {
// 			layers.push(
// 				L.polyline(routes.sustainable, {
// 					color: "green",
// 					weight: 3,
// 				}).addTo(map)
// 			);
// 		}

// 		return () => layers.forEach((layer) => map.removeLayer(layer));
// 	}, [routes, map]);

// 	return null;
// };

// const BusTab = () => {
// 	const [congestionZones, setCongestionZones] = useState([]);
// 	const [selectedBus, setSelectedBus] = useState(null);
// 	const [busDestinations] = useState(() => new Map());

// 	// Process heat data to find congestion zones
// 	useEffect(() => {
// 		const processHeatData = async () => {
// 			const heatData = getCachedData("busHeatmap") || [];
// 			const zones = [];

// 			// Create grid of points
// 			const grid = new L.GridLayer();
// 			const map = L.map(document.createElement("div"));

// 			heatData.forEach((point) => {
// 				const latLng = L.latLng(point[0], point[1]);
// 				let isInZone = false;

// 				// Check existing zones
// 				for (const zone of zones) {
// 					if (latLng.distanceTo(zone.center) <= CONGESTION_RADIUS) {
// 						zone.buses.push(point);
// 						isInZone = true;
// 						break;
// 					}
// 				}

// 				// Create new zone if not in any existing zone
// 				if (!isInZone) {
// 					zones.push({
// 						center: latLng,
// 						buses: [point],
// 						id: zones.length + 1,
// 					});
// 				}
// 			});

// 			// Filter zones with minimum buses
// 			const congested = zones
// 				.filter((zone) => zone.buses.length >= MIN_BUSES_FOR_CONGESTION)
// 				.slice(0, 5); // Limit to 5 zones

// 			// Generate unique bus IDs
// 			const usedIds = new Set();
// 			const finalZones = congested.map((zone) => ({
// 				...zone,
// 				buses: zone.buses.map(() => {
// 					let id;
// 					do {
// 						id = Math.floor(Math.random() * 2990) + 10;
// 					} while (usedIds.has(id));
// 					usedIds.add(id);
// 					return id;
// 				}),
// 			}));

// 			setCongestionZones(finalZones);
// 		};

// 		processHeatData();
// 	}, []);

// 	const getBusDestination = (busId) => {
// 		if (!busDestinations.has(busId)) {
// 			const randomDest =
// 				DUBLIN_DESTINATIONS[
// 					Math.floor(Math.random() * DUBLIN_DESTINATIONS.length)
// 				];
// 			busDestinations.set(busId, randomDest);
// 		}
// 		return busDestinations.get(busId);
// 	};

// 	return (
// 		<div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
// 			{/* Left Panel */}
// 			<div
// 				style={{
// 					width: "300px",
// 					padding: "20px",
// 					borderRight: "1px solid #ddd",
// 					overflowY: "auto",
// 					backgroundColor: "#f8f9fa",
// 				}}
// 			>
// 				<h2>Congestion Zones</h2>
// 				{congestionZones.map((zone) => (
// 					<div key={zone.id} style={{ marginBottom: "20px" }}>
// 						<h3>
// 							Zone {zone.id} ({zone.buses.length} buses)
// 						</h3>
// 						<div
// 							style={{
// 								display: "flex",
// 								flexWrap: "wrap",
// 								gap: "8px",
// 							}}
// 						>
// 							{zone.buses.map((busId) => (
// 								<button
// 									key={busId}
// 									onClick={() =>
// 										setSelectedBus({
// 											busId,
// 											start: [
// 												zone.center.lat,
// 												zone.center.lng,
// 											],
// 											end: getBusDestination(busId),
// 										})
// 									}
// 									style={{
// 										padding: "8px 12px",
// 										backgroundColor:
// 											selectedBus?.busId === busId
// 												? "#007bff"
// 												: "#e9ecef",
// 										color:
// 											selectedBus?.busId === busId
// 												? "white"
// 												: "#212529",
// 										border: "none",
// 										borderRadius: "4px",
// 										cursor: "pointer",
// 									}}
// 								>
// 									Bus {busId}
// 								</button>
// 							))}
// 						</div>
// 					</div>
// 				))}
// 			</div>

// 			{/* Map */}
// 			<div style={{ flex: 1 }}>
// 				<MapContainer
// 					center={DUBLIN_CENTER}
// 					zoom={13}
// 					style={{ height: "100%", width: "100%" }}
// 				>
// 					<TileLayer
// 						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// 						attribution="&copy; OpenStreetMap contributors"
// 					/>
// 					<BusHeatmap />
// 					<CongestionMarkers zones={congestionZones} />
// 					{selectedBus && (
// 						<RouteDisplay
// 							key={selectedBus.busId}
// 							start={selectedBus.start}
// 							end={selectedBus.end}
// 						/>
// 					)}
// 				</MapContainer>
// 			</div>
// 		</div>
// 	);
// };

// export default BusTab;

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Dublin configuration
const DUBLIN_CENTER = [53.3498, -6.2603];
const CONGESTION_RADIUS = 400; // meters
const MIN_BUSES_FOR_CONGESTION = 10;
// const DUBLIN_DESTINATIONS = [
// 	[53.3434, -6.2544],
// 	[53.3467, -6.2678],
// 	[53.3521, -6.2765],
// 	[53.3419, -6.2914],
// 	[53.3352, -6.2627],
// 	[53.3578, -6.2453],
// 	[53.3386, -6.2371],
// 	[53.3491, -6.3056],
// 	[53.3612, -6.2834],
// 	[53.3279, -6.2765],
// 	[53.3401, -6.2589],
// 	[53.3445, -6.2723],
// 	[53.3508, -6.2876],
// 	[53.3367, -6.2491],
// 	[53.3552, -6.2634],
// 	[53.3423, -6.2798],
// 	[53.3489, -6.2541],
// 	[53.3335, -6.2729],
// 	[53.3594, -6.2967],
// 	[53.3456, -6.3012],
// ];
const DUBLIN_DESTINATIONS = [
	// Closer to city center (within 2km)
	[53.3498, -6.2603], // Exact center
	[53.3434, -6.2544], // ~1km SW
	[53.3467, -6.2678], // ~1km W
	[53.3521, -6.2765], // ~2km NW
	[53.3419, -6.2914], // ~3km W

	// Medium distance (3-5km from center)
	[53.3352, -6.2627], // ~2km S
	[53.3578, -6.2453], // ~3km NE
	[53.3386, -6.2371], // ~3km S
	[53.3401, -6.2589], // ~1.5km S
	[53.3445, -6.2723], // ~1.5km W

	// Further out locations (5-10km from center)
	[53.3279, -6.2765], // ~4km S (Crumlin)
	[53.3612, -6.2834], // ~5km N (Glasnevin)
	[53.3126, -6.2367], // ~6km S (Harold's Cross)
	[53.3754, -6.2458], // ~5km N (Drumcondra)
	[53.2951, -6.3245], // ~8km SW (Tallaght)

	// Edge of Dublin (10-15km from center)
	[53.4023, -6.1569], // ~10km NE (Swords)
	[53.2867, -6.4362], // ~12km W (Clondalkin)
	[53.2214, -6.1666], // ~15km S (Dún Laoghaire)
	[53.3891, -6.3795], // ~10km NW (Blanchardstown)
	[53.2558, -6.1283], // ~12km SE (Dalkey)
];
// Custom icons
const BusIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
});

const DestinationIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
});

const CongestionIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
});

const BusHeatmap = () => {
	const map = useMap();
	const [heatData, setHeatData] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const cached = getCachedData("busHeatmap");
				if (cached) {
					setHeatData(cached);
					return;
				}

<<<<<<<<< Temporary merge branch 1
				const response = await axios.get("http://localhost:5000/api/dashboard/");
=========
				const response = await axios.get(
					"http://localhost:5000/api/dashboard/"
				);
>>>>>>>>> Temporary merge branch 2
				if (response.data?.bus_heatmap) {
					const points = response.data.bus_heatmap.map((p) => [
						p[0],
						p[1],
						p[2],
					]);
					setHeatData(points);
					setCachedData("busHeatmap", points);
				}
			} catch (err) {
				console.error("API Error:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	useEffect(() => {
		if (heatData.length > 0) {
			const heatLayer = L.heatLayer(heatData, {
				radius: 25,
				blur: 15,
				maxZoom: 17,
				gradient: {
					0.4: "blue",
					0.6: "lime",
					0.8: "yellow",
					1.0: "red",
				},
			}).addTo(map);

			return () => map.removeLayer(heatLayer);
		}
	}, [heatData, map]);

	return null;
};

const BusTab = () => {
	return (
		<MapContainer
			center={[53.3498, -6.2603]}
			zoom={13}
			style={{ height: "calc(100vh - 64px)", width: "100%" }}
		>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution="&copy; OpenStreetMap contributors"
			/>
			<BusHeatmap />
		</MapContainer>
	);
};

export default BusTab;

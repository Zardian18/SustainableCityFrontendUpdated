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
	// ====== MID-DUBLIN (Within 3km radius of Spire) ======
	[53.34971, -6.26029], // O'Connell St Upper (Stop 1)
	[53.34528, -6.25872], // Christchurch Place (Stop 5079)
	[53.34699, -6.28734], // Heuston Station (Stop 7183)
	[53.34379, -6.29172], // Guinness Storehouse (Stop 4802)
	[53.33862, -6.26725], // St. James's Hospital (Stop 4150)
	[53.35112, -6.26018], // Parnell Square East (Stop 2)
	[53.34156, -6.25944], // Dublin Castle (Stop 1987)
	[53.34722, -6.25917], // Four Courts (Stop 1478)
	[53.35361, -6.24419], // Connolly Station (Stop 135)
	[53.33941, -6.24895], // St. Stephen's Green South (Stop 769)

	// ====== EDGE AREAS (5-15km from center) ======
	// North Edge
	[53.38915, -6.37884], // Blanchardstown SC (Stop 7027)
	[53.4567, -6.218], // Swords Bus Depot (Stop 7910)

	// South Edge
	[53.2879, -6.3577], // Tallaght Hospital (Stop 6075)
	[53.29304, -6.13618], // Dún Laoghaire Station (Stop 2029)

	// West Edge
	[53.33558, -6.42857], // Clondalkin Village (Stop 6265)
	[53.28321, -6.43885], // Neilstown Roundabout (Stop 6151)

	// East Edge
	[53.36421, -6.1239], // Donaghmede SC (Stop 2275)
	[53.40658, -6.15854], // Dublin Airport T2 (Stop 7570)

	// Strategic Outer Nodes
	[53.29762, -6.23098], // Dundrum Luas (Stop 3265)
	[53.41856, -6.18066], // Dublin Airport T1 (Stop 7571)
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

	useEffect(() => {
		const loadData = async () => {
			try {
				const cached = getCachedData("busHeatmap");
				if (cached) {
					setHeatData(cached);
					return;
				}

				const response = await axios.get(
					"http://localhost:5000/api/dashboard/"
				);
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

const CongestionMarkers = ({ zones }) => {
	const map = useMap();

	useEffect(() => {
		if (!zones.length) return;

		const markers = zones.map((zone) => {
			const marker = L.marker([zone.center.lat, zone.center.lng], {
				icon: CongestionIcon,
			}).bindPopup(
				`Congestion Zone ${zone.id}<br>Buses: ${zone.buses.length}`
			);
			return marker.addTo(map);
		});

		return () => markers.forEach((marker) => map.removeLayer(marker));
	}, [zones, map]);

	return null;
};

const RouteDisplay = ({ start, end, busId }) => {
	const map = useMap();
	const [routes, setRoutes] = useState(null);
	const [markers, setMarkers] = useState([]);

	useEffect(() => {
		if (!start || !end) return;

		// Add bus and destination markers
		const busMarker = L.marker(start, { icon: BusIcon })
			.bindPopup(`Bus ${busId} Location`)
			.addTo(map);

		const destMarker = L.marker(end, { icon: DestinationIcon })
			.bindPopup(`Bus ${busId} Destination`)
			.addTo(map);

		setMarkers([busMarker, destMarker]);

		// Fit map to show both markers
		const bounds = L.latLngBounds([start, end]);
		map.fitBounds(bounds.pad(0.2));

		return () => {
			map.removeLayer(busMarker);
			map.removeLayer(destMarker);
		};
	}, [start, end, busId, map]);

	useEffect(() => {
		if (!start || !end) return;

		const fetchRoutes = async () => {
			try {
				const response = await axios.get(
					"http://localhost:5000/api/dashboard/",
					{
						params: {
							start_lat: start[0],
							start_lon: start[1],
							end_lat: end[0],
							end_lon: end[1],
						},
					}
				);

				setRoutes({
					normal: response.data.normal_route?.route || [],
					sustainable: response.data.sustainable_route?.route || [],
				});
			} catch (err) {
				console.error("Route Error:", err);
			}
		};

		fetchRoutes();
	}, [start, end]);

	useEffect(() => {
		if (!routes) return;

		const layers = [];
		if (routes.normal.length) {
			layers.push(
				L.polyline(routes.normal, { color: "blue", weight: 3 }).addTo(
					map
				)
			);
		}
		if (routes.sustainable.length) {
			layers.push(
				L.polyline(routes.sustainable, {
					color: "green",
					weight: 3,
				}).addTo(map)
			);
		}

		return () => layers.forEach((layer) => map.removeLayer(layer));
	}, [routes, map]);

	return null;
};

const BusTab = () => {
	const [congestionZones, setCongestionZones] = useState([]);
	const [selectedBus, setSelectedBus] = useState(null);
	const [busDestinations] = useState(() => new Map());

	useEffect(() => {
		const processHeatData = async () => {
			const heatData = getCachedData("busHeatmap") || [];
			const zones = [];

			heatData.forEach((point) => {
				const latLng = L.latLng(point[0], point[1]);
				let isInZone = false;

				for (const zone of zones) {
					if (latLng.distanceTo(zone.center) <= CONGESTION_RADIUS) {
						zone.buses.push(point);
						isInZone = true;
						break;
					}
				}

				if (!isInZone) {
					zones.push({
						center: latLng,
						buses: [point],
						id: zones.length + 1,
					});
				}
			});

			const congested = zones
				.filter((zone) => zone.buses.length >= MIN_BUSES_FOR_CONGESTION)
				.slice(0, 5);

			const usedIds = new Set();
			const finalZones = congested.map((zone) => ({
				...zone,
				buses: zone.buses.map(() => {
					let id;
					do {
						id = Math.floor(Math.random() * 2990) + 10;
					} while (usedIds.has(id));
					usedIds.add(id);
					return id;
				}),
			}));

			setCongestionZones(finalZones);
		};

		processHeatData();
	}, []);

	const getBusDestination = (busId) => {
		if (!busDestinations.has(busId)) {
			const randomDest =
				DUBLIN_DESTINATIONS[
					Math.floor(Math.random() * DUBLIN_DESTINATIONS.length)
				];
			busDestinations.set(busId, randomDest);
		}
		return busDestinations.get(busId);
	};

	return (
		<div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
			{/* Left Panel */}
			<div
				style={{
					width: "300px",
					padding: "20px",
					borderRight: "1px solid #ddd",
					overflowY: "auto",
					backgroundColor: "#f8f9fa",
				}}
			>
				<h2>Congestion Zones</h2>
				{congestionZones.map((zone) => (
					<div key={zone.id} style={{ marginBottom: "20px" }}>
						<h3>
							Zone {zone.id} ({zone.buses.length} buses)
						</h3>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "8px",
							}}
						>
							{zone.buses.map((busId) => (
								<button
									key={busId}
									onClick={() =>
										setSelectedBus({
											busId,
											start: [
												zone.center.lat,
												zone.center.lng,
											],
											end: getBusDestination(busId),
										})
									}
									style={{
										padding: "8px 12px",
										backgroundColor:
											selectedBus?.busId === busId
												? "#007bff"
												: "#e9ecef",
										color:
											selectedBus?.busId === busId
												? "white"
												: "#212529",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
										transition: "all 0.2s",
									}}
								>
									Bus {busId}
								</button>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Map */}
			<div style={{ flex: 1 }}>
				<MapContainer
					center={DUBLIN_CENTER}
					zoom={13}
					style={{ height: "100%", width: "100%" }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; OpenStreetMap contributors"
					/>
					<BusHeatmap />
					<CongestionMarkers zones={congestionZones} />
					{selectedBus && (
						<RouteDisplay
							key={selectedBus.busId}
							start={selectedBus.start}
							end={selectedBus.end}
							busId={selectedBus.busId}
						/>
					)}
				</MapContainer>
			</div>
		</div>
	);
};

export default BusTab;

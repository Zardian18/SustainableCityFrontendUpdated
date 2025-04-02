import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

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

				const response = await axios.get("http://localhost:5000/api/dashboard/");
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

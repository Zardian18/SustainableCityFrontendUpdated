// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import axios from "axios";
// import { getCachedData, setCachedData } from "../utils/cache";
// import "leaflet/dist/leaflet.css";

// // Fix leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
// 	iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
// 	iconUrl: require("leaflet/dist/images/marker-icon.png"),
// 	shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

// const WeatherTab = () => {
// 	const [pollutionData, setPollutionData] = useState([]);
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState(null);

// 	useEffect(() => {
// 		const loadData = async () => {
// 			setLoading(true);
// 			try {
// 				const cached = getCachedData("airPollution");
// 				if (cached) {
// 					setPollutionData(cached);
// 					return;
// 				}

// 				const response = await axios.get("/api/dashboard/");
// 				if (response.data?.air_pollution?.data) {
// 					setPollutionData(response.data.air_pollution.data);
// 					setCachedData(
// 						"airPollution",
// 						response.data.air_pollution.data
// 					);
// 				}
// 			} catch (err) {
// 				setError(err.message);
// 				console.error("API Error:", err);
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		loadData();
// 	}, []);

// 	if (loading)
// 		return <div className="loading">Loading air quality data...</div>;
// 	if (error) return <div className="error">Error: {error}</div>;

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

// 			{pollutionData.map((point, index) => (
// 				<Marker
// 					key={index}
// 					position={[point.latitude, point.longitude]}
// 				>
// 					<Popup>
// 						<div style={{ minWidth: "200px" }}>
// 							<h3>Air Quality: {point.health_impact}</h3>
// 							<p>AQI: {point.aqi.toFixed(1)}</p>
// 							<p>PM1: {point.pm1.toFixed(1)} µg/m³</p>
// 						</div>
// 					</Popup>
// 				</Marker>
// 			))}
// 		</MapContainer>
// 	);
// };

// export default WeatherTab;
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import { Box, Typography, Paper } from "@mui/material";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
	iconUrl: require("leaflet/dist/images/marker-icon.png"),
	shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Function to categorize AQI
const categorizeAqi = (aqi) => {
	if (aqi < 10) return "Relatively Good";
	if (aqi >= 10 && aqi <= 40) return "Relatively Moderate";
	return "Relatively High";
};

const WeatherTab = () => {
	const [pollutionData, setPollutionData] = useState([]);
	const [selectedStation, setSelectedStation] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const cached = getCachedData("airPollution");
				if (cached) {
					setPollutionData(cached);
					return;
				}

				// const response = await axios.get("/api/dashboard/");
				const response = await axios.get(
					"http://localhost:5000/api/dashboard/"
				);

				if (response.data?.air_pollution?.data) {
					setPollutionData(response.data.air_pollution.data);
					setCachedData(
						"airPollution",
						response.data.air_pollution.data
					);
				}
			} catch (err) {
				setError(err.message);
				console.error("API Error:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	if (loading)
		return <div className="loading">Loading air quality data...</div>;
	if (error) return <div className="error">Error: {error}</div>;

	return (
		<Box display="flex" height="100vh" overflow="hidden">
			{/* Left Panel */}
			<Box
				sx={{
					width: "300px",
					backgroundColor: "#f7f7f7",
					padding: "20px",
					boxShadow: 2,
					overflowY: "auto",
					maxHeight: "100vh",
				}}
			>
				{selectedStation ? (
					<Paper sx={{ padding: "20px", backgroundColor: "#fff" }}>
						<Typography variant="h6">
							{selectedStation.name}
						</Typography>
						<Typography variant="body1">
							<b>AQI:</b> {selectedStation.aqi.toFixed(1)}
						</Typography>
						<Typography variant="body1">
							<b>Health Impact:</b>{" "}
							{selectedStation.health_impact}
						</Typography>
						<Typography variant="body1">
							<b>PM1:</b> {selectedStation.pm1.toFixed(1)} µg/m³
						</Typography>
						<Typography variant="body1">
							<b>Category:</b>{" "}
							{categorizeAqi(selectedStation.aqi)}
						</Typography>
					</Paper>
				) : (
					<Typography>No station selected</Typography>
				)}
			</Box>

			{/* Map Section */}
			<Box sx={{ flexGrow: 1 }}>
				<MapContainer
					center={[53.3498, -6.2603]}
					zoom={13}
					style={{ height: "100%", width: "100%" }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; OpenStreetMap contributors"
					/>

					{pollutionData.map((point, index) => (
						<Marker
							key={index}
							position={[point.latitude, point.longitude]}
							eventHandlers={{
								click: () => {
									// Set selected station data on marker click
									setSelectedStation({
										name: `Station ${index + 1}`,
										aqi: point.aqi,
										health_impact: point.health_impact,
										pm1: point.pm1,
										latitude: point.latitude,
										longitude: point.longitude,
									});
								},
							}}
						>
							<Popup>
								<div style={{ minWidth: "200px" }}>
									<h3>Air Quality: {point.health_impact}</h3>
									<p>AQI: {point.aqi.toFixed(1)}</p>
									<p>PM1: {point.pm1.toFixed(1)} µg/m³</p>
									<p>
										<b>Category:</b>{" "}
										{categorizeAqi(point.aqi)}
									</p>
								</div>
							</Popup>
						</Marker>
					))}
				</MapContainer>
			</Box>
		</Box>
	);
};

export default WeatherTab;

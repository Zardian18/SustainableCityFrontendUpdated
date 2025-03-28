import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ activeTab }) => {
	return (
		<MapContainer
			center={[53.3498, -6.2603]} // Dublin coordinates
			zoom={13}
			style={{ height: "calc(100vh - 64px)", width: "100%" }}
		>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>

			{/* We'll add layer components here based on activeTab */}
		</MapContainer>
	);
};

export default MapComponent;

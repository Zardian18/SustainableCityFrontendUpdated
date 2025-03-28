import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const HomeMap = () => (
	<MapContainer
		center={[53.3498, -6.2603]}
		zoom={13}
		style={{ height: "calc(100vh - 64px)", width: "100%" }}
	>
		<TileLayer
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			attribution="&copy; OpenStreetMap contributors"
		/>
	</MapContainer>
);

export default HomeMap;

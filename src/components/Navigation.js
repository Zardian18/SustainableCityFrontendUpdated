import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";

const Navigation = ({ activeTab, setActiveTab }) => {
	return (
		<AppBar position="fixed">
			<Toolbar>
				<Button
					color="inherit"
					onClick={() => setActiveTab("home")}
					sx={{
						fontWeight: activeTab === "home" ? "bold" : "normal",
					}}
				>
					Home
				</Button>

				<Button
					color="inherit"
					onClick={() => setActiveTab("weather")}
					sx={{
						fontWeight: activeTab === "weather" ? "bold" : "normal",
					}}
				>
					Air Quality
				</Button>

				<Button
					color="inherit"
					onClick={() => setActiveTab("bus")}
					sx={{ fontWeight: activeTab === "bus" ? "bold" : "normal" }}
				>
					Bus
				</Button>
				<Button
					color="inherit"
					onClick={() => setActiveTab("bikes")}
					sx={{
						fontWeight: activeTab === "bikes" ? "bold" : "normal",
					}}
				>
					Bike Stations
				</Button>
				<Button
					color="inherit"
					onClick={() => setActiveTab("events")}
					sx={{
						fontWeight: activeTab === "events" ? "bold" : "normal",
					}}
				>
					Events
				</Button>
				<Button
					color="inherit"
					onClick={() => setActiveTab("pedestrian")}
					sx={{
						fontWeight:
							activeTab === "pedestrian" ? "bold" : "normal",
					}}
				>
					Pedestrian
				</Button>
			</Toolbar>
		</AppBar>
	);
};

export default Navigation;

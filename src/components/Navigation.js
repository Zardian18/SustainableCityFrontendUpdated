import React, { useState } from "react";
import {
	AppBar,
	Toolbar,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Typography,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Cookies from "js-cookie";
import useAuthStore from "../store/useAuthStore";

const Navigation = ({ activeTab, setActiveTab }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const { user, clearUser } = useAuthStore();
	const { username, role, mode } = user;

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		Cookies.remove("token");
		Cookies.remove("username");
		Cookies.remove("role");
		Cookies.remove("mode");
		clearUser();
		window.location.href = "/auth";
	};

	return (
		<AppBar position="fixed">
			<Toolbar sx={{ justifyContent: "space-between" }}>
				<div>
					<Button
						color="inherit"
						onClick={() => setActiveTab("home")}
						sx={{ fontWeight: activeTab === "home" ? "bold" : "normal" }}
					>
						Home
					</Button>
					{role !== "user" && (
						<Button
							color="inherit"
							onClick={() => setActiveTab("weather")}
							sx={{ fontWeight: activeTab === "weather" ? "bold" : "normal" }}
						>
							Air Quality
						</Button>
					)}
					{(mode === "bus" || role === "manager") && (
						<Button
							color="inherit"
							onClick={() => setActiveTab("bus")}
							sx={{ fontWeight: activeTab === "bus" ? "bold" : "normal" }}
						>
							Bus
						</Button>
					)}
					{(mode === "bike" || role === "manager") && (
						<Button
							color="inherit"
							onClick={() => setActiveTab("bikes")}
							sx={{ fontWeight: activeTab === "bikes" ? "bold" : "normal" }}
						>
							Bike Stations
						</Button>
					)}
					{(mode === "pedestrian" || role === "manager") && (
						<>
							<Button
								color="inherit"
								onClick={() => setActiveTab("events")}
								sx={{ fontWeight: activeTab === "events" ? "bold" : "normal" }}
							>
								Events
							</Button>
							<Button
								color="inherit"
								onClick={() => setActiveTab("pedestrian")}
								sx={{
									fontWeight: activeTab === "pedestrian" ? "bold" : "normal",
								}}
							>
								Pedestrian
							</Button>
						</>
					)}
				</div>

				{username && (
					<div>
						<IconButton color="inherit" onClick={handleMenuOpen}>
							<AccountCircle />
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							<MenuItem disabled>
								<Typography variant="subtitle2">{username}</Typography>
							</MenuItem>
							<MenuItem disabled>
								<Typography variant="subtitle2">{role}</Typography>
							</MenuItem>
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
					</div>
				)}
			</Toolbar>
		</AppBar>
	);
};

export default Navigation;

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const Navigation = ({ activeTab, setActiveTab }) => {
  const [anchorEl, setAnchorEl] = useState(null); // State for menu anchor
  const open = Boolean(anchorEl); // Determine if the menu is open

  // Handle opening the menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle menu item clicks
  const handleProfileClick = () => {
    console.log("Profile clicked");
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    console.log("Logout clicked");
    handleMenuClose();
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Navigation Buttons */}
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
            fontWeight: activeTab === "pedestrian" ? "bold" : "normal",
          }}
        >
          Pedestrian
        </Button>

        {/* Spacer to push the hamburger icon to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Hamburger Icon */}
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleMenuOpen}
          sx={{ ml: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <PersonIcon sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
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

const Navigation = ({ activeTab, setActiveTab }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const username = Cookies.get("username");
  const userRole = Cookies.get("role");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("username");
    Cookies.remove("user_type");
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
          <Button
            color="inherit"
            onClick={() => setActiveTab("weather")}
            sx={{ fontWeight: activeTab === "weather" ? "bold" : "normal" }}
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
            sx={{ fontWeight: activeTab === "bikes" ? "bold" : "normal" }}
          >
            Bike Stations
          </Button>
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
            sx={{ fontWeight: activeTab === "pedestrian" ? "bold" : "normal" }}
          >
            Pedestrian
          </Button>
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
                <Typography variant="subtitle2">{userRole}</Typography> 
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

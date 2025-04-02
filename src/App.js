// import React, { useState } from "react";
// import Navigation from "./components/Navigation";
// import HomeTab from "./components/HomeTab";
// import WeatherTab from "./components/WeatherTab";
// import BusTab from "./components/BusTab";
// import BikesTab from "./components/BikesTab";
// import EventsTab from "./components/EventsTab";
// import PedestrianTab from "./components/PedestrianTab";
// import { Box } from "@mui/material";
// import { Button } from "@mui/material";	
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LandingPage from "./pages/LandingPage";

// function Dashboard() {
// 	const [activeTab, setActiveTab] = useState("home");
// 	const clearCache = () => {
// 		localStorage.clear();
// 		window.location.reload(); // Optional: reload to see changes
// 		console.log("LocalStorage cache cleared");
// 	};

// 	return (
		
// 		<div className="App">
// 			<Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

// 			<Box sx={{ marginTop: "64px" }}>
// 				{activeTab === "home" && <HomeTab />}
// 				{activeTab === "weather" && <WeatherTab />}
// 				{activeTab === "bus" && <BusTab />}
// 				{activeTab === "bikes" && <BikesTab />}
// 				{activeTab === "events" && <EventsTab />}
// 				{activeTab === "pedestrian" && <PedestrianTab />}
// 			</Box>
// 			<Button
// 				color="warning"
// 				variant="outlined"
// 				onClick={clearCache}
// 				sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
// 			>
// 				Clear Cache
// 			</Button>
		

    

			
// 		</div>
// 	);
// 	function App() {
// 		return (
// 		  <Router>
// 			<Routes>
// 			  {/* Default route → Landing Page */}
// 			  <Route path="/" element={<LandingPage />} />
	  
// 			  {/* Dashboard route → Existing tabbed interface */}
// 			  <Route path="/dashboard" element={<Dashboard />} />
// 			</Routes>
// 		  </Router>
// 		);
// 	  }
	  
// }

// export default App;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";
import HomeTab from "./components/HomeTab";
import WeatherTab from "./components/WeatherTab";
import BusTab from "./components/BusTab";
import BikesTab from "./components/BikesTab";
import EventsTab from "./components/EventsTab";
import PedestrianTab from "./components/PedestrianTab";
import ForgotPasswordPage from "./pages/ForgotPassword";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import { Box, Button } from "@mui/material";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");

  const clearCache = () => {
    localStorage.clear();
    window.location.reload();
    console.log("LocalStorage cache cleared");
  };

  return (
    <div className="App">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <Box sx={{ marginTop: "64px" }}>
        {activeTab === "home" && <HomeTab />}
        {activeTab === "weather" && <WeatherTab />}
        {activeTab === "bus" && <BusTab />}
        {activeTab === "bikes" && <BikesTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "pedestrian" && <PedestrianTab />}
      </Box>

      <Button
        color="warning"
        variant="outlined"
        onClick={clearCache}
        sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
      >
        Clear Cache
      </Button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard route → Existing tabbed interface */}
        <Route path="/dashboard" element={<Dashboard />} />
		<Route path="/auth" element={<AuthPage />} />
		<Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;

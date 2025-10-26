import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate  } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import SurveyPage from "./components/SurveyPage";
import SurveyResults from "./components/SurveyResults";
import CustomMap from "./components/CustomMap";
import CustomMap2 from "./components/CustomMap2";
import PinsList from "./components/PinList";
import DiscordCallback from "./components/DiscordCallback"; // we’ll create this
import Dashboard from "./components/Dashboard";
import { UserProvider } from "./components/UserContext";

const backendUrl = process.env.REACT_APP_BACKEND_URL

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/survey" element={<SurveyPage backendUrl={backendUrl}/>} />
          <Route path="/results" element={<SurveyResults backendUrl={backendUrl} />} />
          <Route path="/map" element={<CustomMap backendUrl={backendUrl} />} />
          <Route path="/map2" element={<CustomMap2 backendUrl={backendUrl} />} />
          <Route path="/pins" element={<PinsList backendUrl={backendUrl} />} />
          <Route path="/dashboard" element={<Dashboard backendUrl={backendUrl} />} />
          <Route path="/auth/callback" element={<DiscordCallback backendUrl={backendUrl} />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
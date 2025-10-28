import React, { useEffect, useState, useContext, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Slider,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
  Tooltip,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  styled
} from "@mui/material";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PinForm from "../PinForm";
import polygons from "../polygons";
import * as turf from "@turf/turf";
import { UserContext } from "../UserContext";
import CloseIcon from '@mui/icons-material/Close';

/* ===========================
   Constants & Configuration
   =========================== */
const ZOOM_LEVELS = {
  FULL_MAP: -1,
  ZOOMED_LEVEL: 1,
};

// Fix default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Marker icons
const markerIcons = {
  Lore: new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/TRACKING/Profession.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [20, 41],
    popupAnchor: [1, -34],
  }),
  Raid: new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Raid_Icon.PNG?raw=true",
    iconSize: [75, 75],
    iconAnchor: [35, 55],
    popupAnchor: [1, -34],
  }),
  Quest: new L.Icon({
    iconUrl: "https://i.imgur.com/IPEOEew.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [12, 40],
    iconAnchor: [5, 31],
    popupAnchor: [1, -34],
  }),
  Dungeon: new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Dungeon_Icon.PNG?raw=true",
    iconSize: [75, 75],
    iconAnchor: [35, 55],
    popupAnchor: [1, -34],
  }),
  "Flight Path": new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/TRACKING/FlightMaster.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [25, 35],
    popupAnchor: [1, -34],
  }),
  Zone: new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/Buttons/UI-PlusButton-Up.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [20, 35],
    popupAnchor: [1, -34],
  }),
  PvP: new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/WorldStateFrame/CombatSwords.PNG?raw=true",
    iconSize: [100, 100],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  "World Boss": new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_skull_normal.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  "World Event": new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_shield_elite.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  Races: new L.Icon({
    iconUrl: "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_shield_elite.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
};

/* ===========================
   Map Child Components 
   (Must be inside MapContainer)
   =========================== */

function ZoomTracker({ setZoomLevel, setIsZooming, setIsResetting }) {
  const map = useMap();
  useMapEvents({
    zoomstart() {
      setIsZooming(true);
    },
    zoomend() {
      setZoomLevel(map.getZoom());
      setIsZooming(false);
      setIsResetting(false);
    },
    moveend() {
      setZoomLevel(map.getZoom());
      setIsResetting(false);
    },
  });
  useEffect(() => {
    setZoomLevel(map.getZoom());
  }, [map, setZoomLevel]);
  return null;
}

function AddPinOnClick({ setNewPinCoords }) {
  useMapEvents({
    dblclick(e) {
      setNewPinCoords(e.latlng);
    },
  });
  return null;
}

function ZoomOutOnRightClick({ setSelectedRegion, imageBounds, setIsResetting }) {
  const map = useMap();
  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault();
      setIsResetting(true);
      setSelectedRegion("");
      map.flyToBounds(imageBounds, { duration: 0.7 });
    },
  });
  return null;
}

function ZoomToRegionInternal({ polygons, selectedRegion, imageBounds }) {
  const map = useMap();
  const last = useRef("");
  useEffect(() => {
    if (selectedRegion === last.current) return;
    if (!selectedRegion) {
      map.flyToBounds(imageBounds, { duration: 0.7 });
    } else {
      const poly = polygons.find((p) => p.name === selectedRegion);
      if (poly) {
        map.flyToBounds(L.latLngBounds(poly.coords), { duration: 0.7 });
      }
    }
    last.current = selectedRegion;
  }, [selectedRegion, polygons, imageBounds, map]);
  return null;
}

// NEW: Component to handle recentering when drawer state changes
function DrawerAwareRecentering({ drawerOpen, imageBounds }) {
  const map = useMap();
  const lastDrawerState = useRef(drawerOpen);

  useEffect(() => {
    // Only recenter if drawer state actually changed
    if (lastDrawerState.current !== drawerOpen) {
      // Small timeout to ensure the DOM has updated
      setTimeout(() => {
        map.invalidateSize(); // Critical: force Leaflet to recalculate map dimensions
        map.flyToBounds(imageBounds, { 
          duration: 0.5,
          padding: [20, 20] // Add some padding for better visual appearance
        });
      }, 100);
      
      lastDrawerState.current = drawerOpen;
    }
  }, [drawerOpen, map, imageBounds]);

  return null;
}

/* ===========================
   UI Helper Components
   =========================== */

function MapStatistics({ pins, polygons }) {
  const totalPins = pins.length;
  const pinsThisWeek = pins.filter((pin) => {
    const pinDate = new Date(pin.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return pinDate > weekAgo;
  }).length;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Map Statistics</Typography>
      <Typography>Total Pins: {totalPins}</Typography>
      <Typography>New This Week: {pinsThisWeek}</Typography>
      <Typography>Regions: {polygons.length}</Typography>
    </Paper>
  );
}

function RegionList({ polygons, pinCounts, onRegionClick }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Regions
      </Typography>
      <Stack spacing={1}>
        {polygons
          .map((poly) => ({
            ...poly,
            pinCount: pinCounts[poly.name] || 0
          }))
          .sort((a, b) => b.pinCount - a.pinCount)
          .map((poly) => (
            <Paper
              key={poly.name}
              sx={{ p: 1, cursor: "pointer" }}
              onClick={() => onRegionClick(poly)}
              elevation={1}
            >
              <Typography sx={{ fontWeight: "bold" }}>{poly.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Pins: {poly.pinCount}
              </Typography>
            </Paper>
          ))}
      </Stack>
    </Box>
  );
}

function MapInfoPanel({ 
  zoomLevel, 
  zoomConditions, 
  selectedRegion, 
  hoveredRegion, 
  mapInfoOpen, 
  setMapInfoOpen,
  theme
}) {
  return (
    <Paper sx={{ minWidth: 220, overflow: 'hidden' }}>
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
        p: 1.5,
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>🗺️ Map Info</Typography>
          <Tooltip title="Toggle Info Panel">
            <IconButton size="small" onClick={() => setMapInfoOpen((s) => !s)} sx={{ color: "white" }}>
              <Typography variant="h6">ⓘ</Typography>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      
      {mapInfoOpen && (
        <Box sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.65)", color: "white" }}>
          <Typography variant="body2">Selected: <Chip label={selectedRegion || "None"} size="small" sx={{ ml: 1 , color: "limegreen"}} /></Typography>
          <Typography variant="body2">Hovered: <Chip label={hoveredRegion || "None"} size="small" sx={{ ml: 1 , color: "red"}} /></Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 1, color: "rgba(255,255,255,0.8)" }}>
            {!zoomConditions.isZoomedIn ? "🔍 Click regions to zoom in" : "📍 Right-click to zoom out"}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

function FilterPanel({
  selectedRegion,
  setSelectedRegion,
  polygons,
  selectedCategories,
  setSelectedCategories,
  allCategories,
  minUpvotes,
  setMinUpvotes,
  pins,
  handleReset
}) {
  return (
    <Paper sx={{ p: 2, width: 220 }}>
      <Typography variant="subtitle2">Region</Typography>
      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
        <Select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {polygons.map((poly) => (
            <MenuItem key={poly.name} value={poly.name}>{poly.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 1 }} />

      <Typography variant="subtitle2">Categories</Typography>
      <Box sx={{ maxHeight: 160, overflowY: "auto", mt: 1 }}>
        {allCategories.map((cat) => (
          <FormControlLabel
            key={cat}
            control={
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedCategories((prev) =>
                    checked ? [...prev, cat] : prev.filter((c) => c !== cat)
                  );
                }}
                size="tiny"
                sx={{ py: 0.5 }}
              />
            }
            label={<Typography variant="caption">{cat}</Typography>}
            sx={{ 
              display: "flex",
              alignItems: "center",
              ml: 0,
              mr: 0,
              py: 0,
              my: 0.1,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.7rem',
              }
            }}
          />
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ mt: 1 }}>Filter by Pin Popularity</Typography>
      <Slider
        min={0}
        max={Math.max(...pins.map((p) => p.upvotes), 50)}
        value={minUpvotes}
        onChange={(e, v) => setMinUpvotes(v)}
        valueLabelDisplay="auto"
        sx={{ mt: 1 }}
      />

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button variant="contained" size="small" onClick={handleReset}>Reset</Button>
        <Button variant="outlined" size="small" onClick={() => setSelectedCategories(allCategories)}>All</Button>
      </Stack>
    </Paper>
  );
}

/* ===========================
   Styled Components
   =========================== */

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'drawerOpen' })(
  ({ theme, drawerOpen }) => ({
    flexGrow: 1,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: drawerOpen ? 0 : -350,
    width: drawerOpen ? `calc(100% - 350px)` : '100%',
    position: 'relative',
    height: 'calc(100vh - 70px)',
  }),
);

/* ===========================
   Main Component
   =========================== */

export default function CustomMap({ backendUrl }) {
  const theme = useTheme();
  const { user: discordUser } = useContext(UserContext);
  const mapRef = useRef(null)

  // State
  const [pins, setPins] = useState([]);
  const [newPinCoords, setNewPinCoords] = useState(null);
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinName, setNewPinName] = useState("");
  const [newPinCategory, setNewPinCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [votedPins, setVotedPins] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [minUpvotes, setMinUpvotes] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [mapInfoOpen, setMapInfoOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Constants
  const imageBounds = useMemo(() => [[0, 0], [1500, 2000]], []);
  const paddedBounds = useMemo(() => [[-150, -150], [1650, 2150]], []);

  // Simple zoom conditions helper
  const useZoomConditions = (zoomLevel) => {
    const isZoomedIn = zoomLevel >= ZOOM_LEVELS.ZOOMED_LEVEL;
    const isZoomedOut = zoomLevel < ZOOM_LEVELS.ZOOMED_LEVEL;

    return {
      isZoomedIn,
      isZoomedOut,
      shouldShowPins: isZoomedIn,
      isZoomed: isZoomedIn,
    };
  };

  const zoomConditions = useZoomConditions(zoomLevel);

  // Only show pins when zoomed in AND not currently zooming AND not resetting
  const shouldRenderPins = zoomConditions.isZoomedIn && !isZooming && !isResetting;

  // Geometry helpers
  const isPinInPolygon = useCallback((pin, coords) => {
    if (!coords?.length) return false;
    const polygon = turf.polygon([coords.map(([lat, lng]) => [lng, lat])]);
    const point = turf.point([pin.y, pin.x]);
    return turf.booleanPointInPolygon(point, polygon);
  }, []);

  const getPolygonName = useCallback((pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  }, []);

  const calculatePinCounts = useCallback(() => {
    const counts = {};
    polygons.forEach((poly) => {
      counts[poly.name] = pins.filter((pin) => isPinInPolygon(pin, poly.coords)).length;
    });
    return counts;
  }, [pins, isPinInPolygon]);

  const pinCounts = calculatePinCounts();

  // Data fetching
  useEffect(() => {
    fetch(`${backendUrl}/pins/categories`)
      .then((res) => res.json())
      .then((data) => {
        setAllCategories(data);
        setSelectedCategories(data);
        setNewPinCategory((prev) => prev || data[0] || "Lore");
      })
      .catch((err) => console.error("Failed to fetch categories", err));
  }, [backendUrl]);

  // Fetch pins + votes
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`${backendUrl}/pins/`);
        const data = await res.json();
        setPins(
          data.map((p) => ({
            ...p,
            polygon: getPolygonName(p),
            upvotes: p.upvotes || 0,
            downvotes: p.downvotes || 0,
          }))
        );

        if (discordUser) {
          const voteRes = await fetch(
            `${backendUrl}/pins/votes/${discordUser.username}`
          );
          const votes = await voteRes.json();
          const voteMap = {};
          votes.forEach((v) => (voteMap[v.pin_id] = v.vote_type));
          setVotedPins(voteMap);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPins();
    const interval = setInterval(fetchPins, 10000);
    return () => clearInterval(interval);
  }, [backendUrl, discordUser, getPolygonName]);

  // Programmatic pan-to-pin
  useEffect(() => {
    const handleMapFocus = (e) => {
      const { lat, lng } = e.detail;
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], 3, { duration: 0.7 });
      }
    };
    window.addEventListener("map:focus", handleMapFocus);
    return () => window.removeEventListener("map:focus", handleMapFocus);
  }, []);

  const [animatingPin, setAnimatingPin] = useState(null);
  const [markers, setMarkers] = useState(new Map());

  const highlightPin = useCallback((pin) => {
    setAnimatingPin(pin.id);
  }, []);

  // Watch for animatingPin changes
  useEffect(() => {
    if (animatingPin && markers.has(animatingPin)) {
      const marker = markers.get(animatingPin);
      const element = marker.getElement();
      element.style.transition = 'all .3s ease-in-out';
      element.style.filter = 'drop-shadow(0 0 15px gold) brightness(1.3)';

      setTimeout(() => {
        element.style.filter = 'none';
        setAnimatingPin(null);
      }, 1000);
    }
  }, [animatingPin, markers]);

  const handleSavePin = async () => {
    if (!newPinCoords || !newPinDesc) return;
    const newPin = {
      x: newPinCoords.lat,
      y: newPinCoords.lng,
      description: newPinDesc,
      category: newPinCategory || "Lore",
      name: newPinName || "Untitled",
      upvotes: 0,
      downvotes: 0,
    };
    try {
      const res = await fetch(`${backendUrl}/pins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPin),
      });
      const savedPin = await res.json();
      setPins((prev) => [...prev, savedPin]);
    } catch (err) {
      console.error(err);
    }
    setNewPinCoords(null);
    setNewPinDesc("");
    setNewPinName("");
    setNewPinCategory("Lore");
  };

  const votePin = async (pinId, type) => {
    if (!discordUser) {
      setShowLoginPopup(true);
      return;
    }

    const pin = pins.find((p) => p.id === pinId);
    if (!pin) return;

    const currentVote = votedPins[pinId];

    try {
      const payload = {
        pin_id: pinId,
        discord_username: discordUser.username,
        vote_type: type,
      };
      const res = await fetch(`${backendUrl}/pins/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Vote failed");

      const updated = await res.json();
      setPins((prev) =>
        prev.map((p) =>
          p.id === pinId ? { ...p, upvotes: updated.upvotes, downvotes: updated.downvotes } : p
        )
      );

      setVotedPins((prev) => {
        const newVotes = { ...prev };
        if (currentVote === type) delete newVotes[pinId];
        else newVotes[pinId] = type;
        return newVotes;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePolygonClick = useCallback((poly) => {
    if (selectedRegion === poly.name) return;
    setSelectedRegion(poly.name);
    if (mapRef.current) {
      const bounds = L.latLngBounds(poly.coords);
      mapRef.current.flyToBounds(bounds, { duration: 0.7 });
    }
  }, [selectedRegion]);

  // FIXED: handleReset now has stable dependencies
  const handleReset = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyToBounds(imageBounds, { duration: 0.7 });
    setSelectedRegion("");
    setSelectedCategories([...allCategories]);
  }, [allCategories, imageBounds]);

  // Polygon styling
  const getPolygonStyle = useCallback((poly) => {
    const isCurrentRegion = selectedRegion === poly.name;
    const isHovered = hoveredRegion === poly.name;

    if (zoomConditions.isZoomedIn) {
      if (isHovered && !isCurrentRegion) {
        return {
          color: theme.palette.primary.dark,
          weight: 3,
          fillOpacity: 0.15,
          fillColor: theme.palette.primary.dark,
          opacity: 0.3,
          className: "faded-glow-polygon",
        };
      } else {
        return {
          color: "transparent",
          weight: 1,
          fillOpacity: 0,
          fillColor: "transparent",
        };
      }
    } else {
      if (isHovered) {
        return {
          color: theme.palette.primary.dark,
          weight: 3,
          fillOpacity: 0.30,
          fillColor: theme.palette.grey[800],
          opacity: 0.12,
          className: "faded-glow-polygon",
        };
      } else {
        return {
          color: "transparent",
          weight: 1,
          fillOpacity: 0,
          fillColor: "transparent",
        };
      }
    }
  }, [selectedRegion, hoveredRegion, zoomConditions.isZoomedIn, theme]);

  // Filtered pins
  const filteredPins = useMemo(() => {
    return pins
      .filter((pin) => selectedCategories.includes(pin.category))
      .filter((pin) => !selectedRegion || isPinInPolygon(pin, polygons.find((p) => p.name === selectedRegion)?.coords || []))
      .filter((pin) => pin.upvotes >= minUpvotes)
      .sort((a, b) => b.upvotes - a.upvotes);
  }, [pins, selectedCategories, selectedRegion, minUpvotes, isPinInPolygon]);

// Add this to your Map component
const location = useLocation();
const navigate = useNavigate();

useEffect(() => {
  if (location.state) {
    const { region } = location.state;
    console.log('📍 Navigation state received - setting region:', region);
    
    // Simply set the selectedRegion once
    if (region && region !== selectedRegion) {
      setSelectedRegion(region);
    }
    
    // Clear the navigation state
    navigate(location.pathname, { replace: true, state: null });
  }
}, [location.state, navigate, location.pathname, selectedRegion]);
  return (
    <Box sx={{ pt: "70px", height: "calc(100vh - 70px)", width: "100%", overflow: 'hidden' }}>
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* Map area - Now expands fully when drawer is closed */}
        <Main drawerOpen={drawerOpen}>
          <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
            <MapContainer
              whenCreated={(map) => { mapRef.current = map; }}
              crs={L.CRS.Simple}
              bounds={imageBounds}
              maxBounds={paddedBounds}
              style={{ width: "100%", height: "100%" }}
              doubleClickZoom={false}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
              maxBoundsViscosity={0.5}
              minZoom={-1}
              maxZoom={10}
            >
              <ZoomTracker setZoomLevel={setZoomLevel} setIsZooming={setIsZooming} setIsResetting={setIsResetting} />
              <ZoomOutOnRightClick setSelectedRegion={setSelectedRegion} imageBounds={imageBounds} setIsResetting={setIsResetting}/>
              <DrawerAwareRecentering drawerOpen={drawerOpen} imageBounds={imageBounds} />
              <div style={{ position: "absolute", inset: 0, background: "#167C8B" }} />
              <ImageOverlay url="/map.jpg" bounds={imageBounds} />
              <ZoomToRegionInternal polygons={polygons} selectedRegion={selectedRegion} imageBounds={imageBounds} />
              <AddPinOnClick setNewPinCoords={setNewPinCoords} />

              {/* Polygons */}
              {polygons.map((poly, idx) => (
                <Polygon
                  key={idx}
                  positions={poly.coords}
                  pathOptions={getPolygonStyle(poly)}
                  eventHandlers={{
                    mouseover: () => {
                      if (!zoomConditions.isZoomedIn || selectedRegion !== poly.name) setHoveredRegion(poly.name);
                    },
                    mouseout: () => {
                      if (!zoomConditions.isZoomedIn || selectedRegion !== poly.name) setHoveredRegion(null);
                    },
                    click: () => handlePolygonClick(poly),
                  }}
                />
              ))}

              {/* Pins */}
              {shouldRenderPins &&
                filteredPins.map((pin) => (
                  <Marker
                    key={pin.id}
                    position={[pin.x, pin.y]}
                    icon={markerIcons[pin.category] || markerIcons.Lore}
                    eventHandlers={{
                      add: (e) => {
                        setMarkers(prev => new Map(prev).set(pin.id, e.target));
                      },
                      remove: (e) => {
                        setMarkers(prev => {
                          const newMarkers = new Map(prev);
                          newMarkers.delete(pin.id);
                          return newMarkers;
                        });
                      }
                    }}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 220 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>{pin.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{pin.category}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>{pin.description}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant={votedPins[pin.id] === "up" ? "contained" : "outlined"}
                            color="success"
                            size="small"
                            onClick={() => votePin(pin.id, "up")}
                          >
                            👍 {pin.upvotes}
                          </Button>
                          <Button
                            variant={votedPins[pin.id] === "down" ? "contained" : "outlined"}
                            color="error"
                            size="small"
                            onClick={() => votePin(pin.id, "down")}
                          >
                            👎 {pin.downvotes}
                          </Button>
                        </Stack>
                      </Box>
                    </Popup>
                  </Marker>
                ))}
              {/* New pin creation popup */}
              {newPinCoords && (
                <Marker position={newPinCoords}>
                  <Popup className="custom-popup"> {/* Add this className */}
                    <PinForm
                      description={newPinDesc}
                      setDescription={setNewPinDesc}
                      name={newPinName}
                      setName={setNewPinName}
                      category={newPinCategory}
                      setCategory={setNewPinCategory}
                      categories={allCategories}
                      onSave={handleSavePin}
                      onCancel={() => setNewPinCoords(null)}
                    />
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Floating controls - Adjusts position based on drawer */}
            <Box sx={{ 
              position: "absolute", 
              top: 12, 
              right: drawerOpen ? 12 : 362,
              zIndex: 1200,
              transition: 'right 0.2s ease-in-out'
            }}>
              <MapInfoPanel
                zoomLevel={zoomLevel}
                zoomConditions={zoomConditions}
                selectedRegion={selectedRegion}
                hoveredRegion={hoveredRegion}
                mapInfoOpen={mapInfoOpen}
                setMapInfoOpen={setMapInfoOpen}
                theme={theme}
              />
            </Box>

            <Box sx={{ position: "absolute", top: 120, left: 12, zIndex: 1200 }}>
              <FilterPanel
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                polygons={polygons}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                allCategories={allCategories}
                minUpvotes={minUpvotes}
                setMinUpvotes={setMinUpvotes}
                pins={pins}
                handleReset={handleReset}
              />
            </Box>
          </Box>
        </Main>

        {/* Right Panel as Drawer */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? 350 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 350,
              boxSizing: 'border-box',
              mt: '70px',
              height: 'calc(100vh - 70px)',
              boxShadow: 3,
            },
          }}
        >
          <Box sx={{ p: 2, overflowY: "auto", height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {zoomConditions.isZoomedOut ? "Map Overview" : zoomConditions.isZoomedIn ? "Area Pins" : "Map"}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setDrawerOpen(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Map statistics & region list when fully zoomed out */}
            {zoomConditions.isZoomedOut && <MapStatistics pins={pins} polygons={polygons} />}
            {zoomConditions.isZoomedOut && <RegionList polygons={polygons} pinCounts={pinCounts} onRegionClick={handlePolygonClick} />}

            {/* Pins listing when zoomed in */}
            {(shouldRenderPins) && (
              <Box sx={{ mt: 1 }}>
                {filteredPins.length === 0 ? (
                  <Typography>No pins in this area</Typography>
                ) : (
                  filteredPins.map((pin) => (
                    <Paper key={pin.id} sx={{ p: 1, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        {pin.name} <Typography component="span" sx={{ color: theme.palette.text.secondary }}>({pin.category})</Typography>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{pin.description}</Typography>
                      <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>Zone: {getPolygonName(pin) || "N/A"}</Typography>

                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant={votedPins[pin.id] === "up" ? "contained" : "outlined"}
                          color="success"
                          size="small"
                          onClick={() => votePin(pin.id, "up")}
                        >
                          👍 {pin.upvotes}
                        </Button>
                        <Button
                          variant={votedPins[pin.id] === "down" ? "contained" : "outlined"}
                          color="error"
                          size="small"
                          onClick={() => votePin(pin.id, "down")}
                        >
                          👎 {pin.downvotes}
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => {
                            console.log('🖱️ Button clicked for pin:', pin.id);
                            highlightPin(pin);
                          }} 
                          sx={{ ml: "auto" }}
                          variant="outlined"
                          color="primary"
                          startIcon={<Typography>📍</Typography>}
                        >
                          Locate
                        </Button>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Drawer toggle button when closed */}
        {!drawerOpen && (
          <Button
            variant="contained"
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1200,
              minWidth: 'auto',
              px: 1,
            }}
          >
            ›
          </Button>
        )}
      </Box>

      {/* Login dialog */}
      <Dialog open={showLoginPopup} onClose={() => setShowLoginPopup(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>You must be logged in with Discord to vote.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginPopup(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
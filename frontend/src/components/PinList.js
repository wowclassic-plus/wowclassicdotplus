import React, { useEffect, useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Collapse,
  List,
  ListItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  LocationOn,
  ThumbUp,
  ThumbDown,
} from "@mui/icons-material";
import polygons from "./polygons";
import { UserContext } from "./UserContext";

let sessionId = sessionStorage.getItem("session_id");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("session_id", sessionId);
}

// Category color map
const CATEGORY_COLORS = {
  lore: "#3b82f6",
  quest: "#22c55e",
  raid: "#ef4444",
  dungeon: "#eab308",
  other: "#8b5cf6",
};

function PinsList({ backendUrl }) {
  const theme = useTheme();
  const { user: discordUser } = useContext(UserContext);
  const [pins, setPins] = useState([]);
  const [filters, setFilters] = useState({ description: "", categories: [], polygon: "" });
  const [votedPins, setVotedPins] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const navigate = useNavigate();

  const getPolygonName = (pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  };

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`${backendUrl}/pins/`);
        const data = await res.json();

        const enriched = data.map((pin) => ({
          ...pin,
          polygon: getPolygonName(pin),
          upvotes: pin.upvotes || 0,
          downvotes: pin.downvotes || 0,
        }));
        setPins(enriched);

        const voterId = discordUser?.username || sessionId;
        const voteRes = await fetch(`${backendUrl}/pins/votes/${voterId}`);
        const votes = await voteRes.json();
        const voteMap = {};
        votes.forEach((v) => (voteMap[v.pin_id] = v.vote_type));
        setVotedPins(voteMap);
      } catch (err) {
        console.error("Failed to load pins or votes:", err);
      }
    };

    fetchPins();
    const interval = setInterval(fetchPins, 5000);
    return () => clearInterval(interval);
  }, [backendUrl, discordUser]);

  const goToMap = (pin) => navigate("/map", { 
    state: { 
      lat: pin.x, 
      lng: pin.y, 
      pinId: pin.id,
      region: pin.polygon // The region name from getPolygonName
    } 
  });

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
        discord_username: discordUser?.username,
        session_id: !discordUser ? sessionId : undefined,
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
      console.error("Failed to vote:", err);
    }
  };

  const categories = useMemo(
    () => [...new Set(pins.map((p) => p.category).filter(Boolean))],
    [pins]
  );

  const handleCategoryChange = (cat) => {
    setFilters((prev) => {
      const updated = prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  const toggleCategoryExpanded = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredPins = useMemo(() => {
    return pins
      .filter((pin) => {
        const desc = (pin.description || "").toLowerCase();
        const cat = (pin.category || "").toLowerCase();
        const poly = (pin.polygon || "").toLowerCase();

        const matchesDesc = desc.includes(filters.description.toLowerCase());
        const matchesCat =
          filters.categories.length === 0 ||
          filters.categories.map((c) => c.toLowerCase()).includes(cat);
        const matchesPoly =
          !filters.polygon || poly === filters.polygon.toLowerCase();

        return matchesDesc && matchesCat && matchesPoly;
      })
      .sort((a, b) => b.upvotes - a.upvotes);
  }, [pins, filters]);

  // Group pins by category
  const pinsByCategory = useMemo(() => {
    const grouped = {};
    filteredPins.forEach(pin => {
      const category = pin.category || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(pin);
    });
    return grouped;
  }, [filteredPins]);

  // Auto-expand categories if only one exists
  useEffect(() => {
    const categoryKeys = Object.keys(pinsByCategory);
    if (categoryKeys.length === 1) {
      setExpandedCategories({ [categoryKeys[0]]: true });
    }
  }, [pinsByCategory]);

  return (
    <Box sx={{ 
      maxWidth: "1200px", 
      margin: "80px auto", 
      padding: 3,
      minHeight: "100vh"
    }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        All Pins
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          <TextField
            placeholder="Search description..."
            value={filters.description}
            onChange={(e) => setFilters({ ...filters, description: e.target.value })}
            fullWidth
            size="small"
          />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Categories
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {categories.map((cat) => (
                <FormControlLabel
                  key={cat}
                  control={
                    <Checkbox
                      checked={filters.categories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      size="small"
                    />
                  }
                  label={cat}
                />
              ))}
            </Stack>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Zone</InputLabel>
            <Select
              value={filters.polygon}
              onChange={(e) => setFilters({ ...filters, polygon: e.target.value })}
              label="Zone"
            >
              <MenuItem value="">All Zones</MenuItem>
              {polygons.map((poly) => (
                <MenuItem key={poly.name} value={poly.name}>
                  {poly.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Pins by Category */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {filteredPins.length} Pins Found
        </Typography>
      </Box>

      {Object.entries(pinsByCategory).map(([category, categoryPins]) => {
        const isExpanded = expandedCategories[category];
        const catColor = CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.other;

        return (
          <Paper key={category} sx={{ mb: 2 }}>
            {/* Category Header */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: catColor,
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => toggleCategoryExpanded(category)}
            >
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {category} 
                <Chip 
                  label={categoryPins.length} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: theme.palette.common.white }}
                />
              </Typography>
              <IconButton sx={{ color: "white" }} size="small">
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            {/* Category Pins */}
            <Collapse in={isExpanded}>
              <List sx={{ py: 0 }}>
                {categoryPins.map((pin) => (
                  <ListItem key={pin.id} divider sx={{ py: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      {/* Pin Header */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {pin.name}
                        </Typography>
                        <Chip 
                          label={pin.polygon || "Unassigned"} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {pin.description}
                      </Typography>

                      {/* Actions */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {/* Voting */}
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant={votedPins[pin.id] === "up" ? "contained" : "outlined"}
                            color="success"
                            startIcon={<ThumbUp />}
                            onClick={() => votePin(pin.id, "up")}
                          >
                            {pin.upvotes}
                          </Button>
                          <Button
                            size="small"
                            variant={votedPins[pin.id] === "down" ? "contained" : "outlined"}
                            color="error"
                            startIcon={<ThumbDown />}
                            onClick={() => votePin(pin.id, "down")}
                          >
                            {pin.downvotes}
                          </Button>
                        </Stack>

                        {/* View on Map */}
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<LocationOn />}
                          onClick={() => goToMap(pin)}
                        >
                          View on Map
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>
        );
      })}

      {filteredPins.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No pins found matching your filters
          </Typography>
        </Paper>
      )}

      {/* Login Dialog */}
      <Dialog open={showLoginPopup} onClose={() => setShowLoginPopup(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>
            You must be logged in with Discord to vote.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginPopup(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PinsList;
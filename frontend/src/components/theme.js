// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb", // Blue 600
      light: "#3b82f6",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#dc2626", // Red 600
      light: "#ef4444",
      dark: "#b91c1c",
    },
    background: {
      default: "#000000", // True black
      paper: "#1a1a1a",   // Near black
    },
    text: {
      primary: "#ffffff", // Pure white
      secondary: "#e5e5e5", // Light gray
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // prevents all uppercase
        },
      },
    },
    },
});

export default theme;

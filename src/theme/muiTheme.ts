import { createTheme } from "@mui/material/styles";

/** Alinhado a `tailwind.config.js` (primary / accent). */
export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2E7D32", dark: "#1B5E20", light: "#E8F5E9" },
    secondary: { main: "#1976D2", light: "#E3F2FD" },
  },
  typography: {
    fontFamily: '"Inter", "Public Sans", system-ui, sans-serif',
  },
  shape: { borderRadius: 12 },
});

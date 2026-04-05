import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { recoverStaleSyncing } from "@/features/diagnoses/services/syncService";
import { muiTheme } from "@/theme/muiTheme";
import App from "./App";
import "./index.css";

void recoverStaleSyncing();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>
);

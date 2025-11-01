/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025 Market Maker Zw

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React from "react";

// Material Dashboard 2 React contexts
import { MaterialUIControllerProvider, useMaterialUIController } from "context";

// App Data Context Provider
import { AppDataProvider } from "context/AppDataContext";
import { NotificationsProvider } from "context/NotificationsContext";

// Portal Router - Routes between User and Admin portals
import PortalRouter from "PortalRouter";
import ChunkErrorBoundary from "components/ChunkErrorBoundary";

// Theme providers and themes
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";

function ThemeController({ children }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <MaterialUIControllerProvider>
      <ThemeController>
        <AppDataProvider>
          <NotificationsProvider>
            <ChunkErrorBoundary>
              <PortalRouter />
            </ChunkErrorBoundary>
          </NotificationsProvider>
        </AppDataProvider>
      </ThemeController>
    </MaterialUIControllerProvider>
  );
}

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
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from '@mui/material/styles';
import theme from 'assets/theme';
// initialize socket client in browser only (dynamically required so missing dependency won't break build)
if (typeof window !== 'undefined') {
  try {
    // eslint-disable-next-line global-require
    const socketService = require('./services/socket').default;
    if (socketService && socketService.connectSocket) {
      const url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
      socketService.connectSocket(url);
    }
  } catch (e) {
    // ignore non-critical socket failures
    // console.debug('socket init failed', e && e.message);
  }
}

// Development-only: preload certain dynamic chunks (components + MUI hooks)
// This warms the module graph so CRA/HMR is less likely to fail with ChunkLoadError
// when lazy-loaded admin routes request these modules. Safe to skip in production.
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Fire-and-forget preload; failures are non-fatal.
    Promise.all([
      import('components/EnhancedTable'),
      import('@mui/material/useMediaQuery'),
    ]).catch(() => {});
  } catch (err) {
    // ignore preload errors
  }
}

const container = document.getElementById("app");
const root = createRoot(container);
const queryClient = new QueryClient({ defaultOptions: { queries: { refetchInterval: 1000 * 60 * 5, refetchOnWindowFocus: false } } });

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);

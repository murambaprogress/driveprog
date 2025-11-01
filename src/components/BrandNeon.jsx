import React from 'react';
import Box from '@mui/material/Box';

export default function BrandNeon({ children, color = '#10b981' }) {
  // Create a neon outline around text using WebKit text-stroke where available
  // and multiple text-shadow layers as a cross-browser fallback.
  const neonText = {
    display: 'inline-block',
    position: 'relative',
    padding: '0 4px',
    fontWeight: 900,
    // Keep original fill color on children; the stroke uses the neon color
    WebkitTextStroke: `0.9px ${color}`,
    // fallback outline via four-directional shadows plus glow layers
    textShadow: [
      // hard outline shadows (simulate stroke on non-webkit)
      `-1px -1px 0 ${color}`,
      `1px -1px 0 ${color}`,
      `-1px 1px 0 ${color}`,
      `1px 1px 0 ${color}`,
      // soft glow layers
      `0 0 6px ${color}66`,
      `0 0 12px ${color}44`
    ].join(', '),
    // ensure the neon sits visually above background effects
    zIndex: 2
  };

  return (
    <Box component="span" sx={neonText}>
      {children}
    </Box>
  );
}

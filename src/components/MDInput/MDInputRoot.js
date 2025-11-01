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

// @mui material components
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

export default styled(TextField)(({ theme, ownerState }) => {
  const { palette, functions, typography } = theme;
  const { error, success, disabled } = ownerState || {};
  const { grey, white, info, error: colorError, success: colorSuccess, text } = palette;
  const { pxToRem } = functions;

  // base styles shared across inputs (corporate standard)
  const base = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: white?.main || '#fff',
      borderRadius: 8,
      transition: 'all 0.18s ease-in-out',
      boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
      fontSize: typography?.fontSize || '14px',
      '& fieldset': {
        borderColor: grey?.[300] || '#d1d5db',
        borderWidth: 1,
        transition: 'all 0.18s ease-in-out',
      },
      '&:hover fieldset': {
        borderColor: grey?.[400] || '#9ca3af',
      },
      '&.Mui-focused fieldset': {
        borderColor: info?.main || '#3b82f6',
        borderWidth: 2,
        boxShadow: '0 0 0 4px rgba(59,130,246,0.08)',
      },
      '&.Mui-disabled': {
        backgroundColor: grey?.[100] || '#f3f4f6',
        '& fieldset': { borderColor: grey?.[200] || '#e5e7eb' },
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px 16px',
      fontSize: '14px',
      color: text?.primary || '#111827',
      lineHeight: 1.4,
      '&::placeholder': { color: grey?.[400] || '#9ca3af', opacity: 1 },
    },
    '& .MuiFormHelperText-root': {
      fontSize: pxToRem(12),
      marginTop: 6,
      marginLeft: 0,
    },
  };

  const errorStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: colorError?.main || '#ef4444' },
      '&.Mui-focused fieldset': {
        borderColor: colorError?.main || '#ef4444',
        boxShadow: '0 0 0 4px rgba(239,68,68,0.08)',
      },
    },
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23F44335' viewBox='0 0 12 12'%3E%3Ccircle cx='6' cy='6' r='4.5'/%3E%3Cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3E%3Ccircle cx='6' cy='8.2' r='.6' fill='%23F44335' stroke='none'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${pxToRem(12)} center`,
    backgroundSize: `${pxToRem(16)} ${pxToRem(16)}`,
  };

  const successStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: colorSuccess?.main || '#10b981' },
      '&.Mui-focused fieldset': {
        borderColor: colorSuccess?.main || '#10b981',
        boxShadow: '0 0 0 4px rgba(16,185,129,0.08)',
      },
    },
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 8'%3E%3Cpath fill='%234CAF50' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${pxToRem(12)} center`,
    backgroundSize: `${pxToRem(16)} ${pxToRem(16)}`,
  };

  return {
    ...base,
    pointerEvents: disabled ? 'none' : 'auto',
    ...(error ? errorStyles : {}),
    ...(success ? successStyles : {}),
  };
});

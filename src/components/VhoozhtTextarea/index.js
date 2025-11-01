/**
 * DriveCash Unified Textarea Component
 * 
 * This component provides consistent styling for all textarea inputs in the DriveCash Dashboard
 */

import { forwardRef } from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

// Enhanced Corporate Textarea with consistent DriveCash design standards
const StyledTextarea = styled(TextField)(({ theme, error, success }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    fontSize: '14px',
    fontWeight: 400,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '& fieldset': {
      borderColor: error ? '#ef4444' : success ? '#10b981' : '#d1d5db',
      borderWidth: '1px',
      transition: 'all 0.2s ease-in-out',
    },
    '&:hover fieldset': {
      borderColor: error ? '#ef4444' : success ? '#10b981' : '#6366f1',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-focused fieldset': {
      borderColor: error ? '#ef4444' : success ? '#10b981' : '#4338ca',
      borderWidth: '2px',
      boxShadow: error 
        ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
        : success 
          ? '0 0 0 3px rgba(16, 185, 129, 0.1)'
          : '0 0 0 3px rgba(99, 102, 241, 0.1)',
    },
    '&.Mui-disabled': {
      backgroundColor: '#f9fafb',
      '& fieldset': {
        borderColor: '#e5e7eb',
      },
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 400,
    color: '#374151',
    lineHeight: '1.6',
    fontFamily: 'inherit',
    resize: 'vertical',
    '&::placeholder': {
      color: '#9ca3af',
      opacity: 1,
      fontStyle: 'normal',
    },
    '&:disabled': {
      color: '#9ca3af',
      WebkitTextFillColor: '#9ca3af',
    },
  },
  '& .MuiInputLabel-root': {
    display: 'none', // Hide floating labels to match consistent design
  },
  '& .MuiFormHelperText-root': {
    fontSize: '12px',
    fontWeight: 400,
    marginTop: '6px',
    marginLeft: '0px',
    lineHeight: '1.4',
    '&.Mui-error': {
      color: '#ef4444',
    },
    '&.success': {
      color: '#10b981',
    },
  },
}));

const VhoozhtTextarea = forwardRef(({
  label,
  required,
  error,
  success,
  helperText,
  rows = 4,
  maxRows,
  minRows,
  sx,
  showLabel = true,
  labelProps,
  containerProps,
  ...rest
}, ref) => {
  return (
    <MDBox {...containerProps}>
      {showLabel && label && (
        <MDTypography 
          variant="body2" 
          fontWeight="medium" 
          color="dark" 
          mb={0.75}
          sx={{ 
            fontSize: '14px', 
            color: '#374151',
            fontWeight: 500,
            letterSpacing: '0.025em'
          }}
          {...labelProps}
        >
          {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </MDTypography>
      )}
      <StyledTextarea
        ref={ref}
        error={error}
        success={success}
        helperText={helperText}
        variant="outlined"
        fullWidth
        multiline
        rows={rows}
        maxRows={maxRows}
        minRows={minRows}
        sx={{
          ...sx,
        }}
        {...rest}
      />
    </MDBox>
  );
});

// Setting default values for the props
VhoozhtTextarea.defaultProps = {
  error: false,
  success: false,
  required: false,
  rows: 4,
  showLabel: true,
  labelProps: {},
  containerProps: {},
};

// Typechecking props
VhoozhtTextarea.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  maxRows: PropTypes.number,
  minRows: PropTypes.number,
  showLabel: PropTypes.bool,
  sx: PropTypes.object,
  labelProps: PropTypes.object,
  containerProps: PropTypes.object,
};

VhoozhtTextarea.displayName = "VhoozhtTextarea";

export default VhoozhtTextarea;

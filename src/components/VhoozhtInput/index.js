/**
 * DriveCash Unified Input Component
 *
 * This component provides consistent styling across all form inputs in the DriveCash Dashboard
 */
import { forwardRef } from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

// Enhanced Corporate TextField with consistent DriveCash design standards
const StyledTextField = styled(TextField)(({ theme, error, success, size = 'small' }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    fontSize: '14px',
    fontWeight: 400,
  minHeight: size === 'small' ? '40px' : size === 'large' ? '56px' : '48px',
    height: size === 'small' ? '40px' : size === 'large' ? '56px' : '48px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
    padding: size === 'small' ? '8px 12px' : size === 'large' ? '16px 20px' : '12px 16px',
    fontSize: size === 'small' ? '13px' : '14px',
    fontWeight: 400,
    color: '#374151',
    lineHeight: '1.5',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
    '&.Mui-focused': {
      color: error ? '#ef4444' : success ? '#10b981' : '#4338ca',
    },
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

const VhoozhtInput = forwardRef(({
  label,
  required,
  error,
  success,
  helperText,
  sx,
  size = 'small',
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
      <StyledTextField
        ref={ref}
        error={error}
        success={success}
        size={size}
        helperText={helperText}
        variant="outlined"
        fullWidth
        sx={{
          ...sx,
        }}
        {...rest}
      />
    </MDBox>
  );
});

// Setting default values for the props
VhoozhtInput.defaultProps = {
  error: false,
  success: false,
  required: false,
  size: 'small',
  showLabel: true,
  labelProps: {},
  containerProps: {},
};

// Typechecking props
VhoozhtInput.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
  sx: PropTypes.object,
  labelProps: PropTypes.object,
  containerProps: PropTypes.object,
};

VhoozhtInput.displayName = "VhoozhtInput";

export default VhoozhtInput;

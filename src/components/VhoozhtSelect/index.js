/**
 * DriveCash Unified Select Component
 * 
 * This component provides consistent styling for all select/dropdown inputs in the DriveCash Dashboard
 */

import { forwardRef } from "react";
import PropTypes from "prop-types";
import { FormControl, Select, MenuItem, FormHelperText } from "@mui/material";
import { styled } from "@mui/material/styles";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

// Enhanced Corporate Select with consistent DriveCash design standards
const StyledSelect = styled(Select)(({ theme, error, success, size = 'small' }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 400,
  minHeight: size === 'small' ? '40px' : size === 'large' ? '56px' : '48px',
  height: size === 'small' ? '40px' : size === 'large' ? '56px' : '48px',
  transition: 'all 0.2s ease-in-out',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: error ? '#ef4444' : success ? '#10b981' : '#d1d5db',
    borderWidth: '1px',
    transition: 'all 0.2s ease-in-out',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: error ? '#ef4444' : success ? '#10b981' : '#6366f1',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
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
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#e5e7eb',
    },
  },
  '& .MuiSelect-select': {
    padding: size === 'small' ? '8px 12px' : size === 'large' ? '16px 20px' : '12px 16px',
    fontSize: size === 'small' ? '13px' : '14px',
    fontWeight: 400,
    color: '#374151',
    lineHeight: '1.5',
    '&:focus': {
      backgroundColor: 'transparent',
    },
    '&.Mui-disabled': {
      color: '#9ca3af',
      WebkitTextFillColor: '#9ca3af',
    },
  },
  '& .MuiSelect-icon': {
    color: '#6b7280',
    right: size === 'small' ? '8px' : '12px',
    fontSize: size === 'small' ? '20px' : '22px',
    transition: 'all 0.2s ease-in-out',
  },
  '&.Mui-focused .MuiSelect-icon': {
    color: '#4338ca',
    transform: 'rotate(180deg)',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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

// Enhanced Menu Paper styling for dropdown options
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 400,
  color: '#374151',
  padding: '10px 16px',
  transition: 'all 0.15s ease-in-out',
  borderRadius: '4px',
  margin: '2px 8px',
  '&:hover': {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    color: '#4338ca',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: '#4338ca',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.16)',
    },
  },
  '&.Mui-disabled': {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
}));

const VhoozhtSelect = forwardRef(({
  label,
  required,
  error,
  success,
  helperText,
  options,
  placeholder,
  sx,
  size = 'small',
  showLabel = true,
  labelProps,
  containerProps,
  MenuProps,
  ...rest
}, ref) => {
  const menuProps = {
    PaperProps: {
      sx: {
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        marginTop: '4px',
        maxHeight: '300px',
      },
    },
    ...MenuProps,
  };

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
      <StyledFormControl fullWidth error={error}>
        <StyledSelect
          ref={ref}
          error={error}
          success={success}
          size={size}
          displayEmpty
          MenuProps={menuProps}
          sx={{
            ...sx,
          }}
          {...rest}
        >
          {placeholder && (
            <StyledMenuItem value="" disabled>
              <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{placeholder}</span>
            </StyledMenuItem>
          )}
          {options?.map((option, index) => (
            <StyledMenuItem 
              key={typeof option === 'object' ? option.value : option} 
              value={typeof option === 'object' ? option.value : option}
            >
              {typeof option === 'object' ? option.label : option}
            </StyledMenuItem>
          ))}
        </StyledSelect>
        {helperText && (
          <FormHelperText className={success ? 'success' : ''}>
            {helperText}
          </FormHelperText>
        )}
      </StyledFormControl>
    </MDBox>
  );
});

// Setting default values for the props
VhoozhtSelect.defaultProps = {
  error: false,
  success: false,
  required: false,
  size: 'small',
  showLabel: true,
  options: [],
  labelProps: {},
  containerProps: {},
  MenuProps: {},
};

// Typechecking props
VhoozhtSelect.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      }),
    ])
  ),
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
  sx: PropTypes.object,
  labelProps: PropTypes.object,
  containerProps: PropTypes.object,
  MenuProps: PropTypes.object,
};

VhoozhtSelect.displayName = "VhoozhtSelect";

export default VhoozhtSelect;

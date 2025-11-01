import React from 'react';
import { Card, Grid, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { formatters } from 'utils/dataFormatters';

// Styled Card with consistent spacing and responsive behavior
const StyledCard = styled(Card)(({ theme, elevation = 1 }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: elevation === 'none' ? 'none' : theme.shadows[elevation],
  border: `1px solid ${theme.palette.grey[200]}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease-in-out',
  
  '&:hover': {
    boxShadow: elevation !== 'none' ? theme.shadows[Math.min(elevation + 2, 24)] : 'none',
  },
  
  // Responsive padding
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

// Enhanced responsive grid container
const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  gap: theme.spacing(3),
  
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  },
  
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.5),
  },
}));

// Data display component with proper formatting
const DataDisplay = styled(MDBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
  
  '&:last-child': {
    borderBottom: 'none',
  },
  
  // Responsive adjustments
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(0.5),
  },
}));

// Action buttons container with proper spacing
const ActionContainer = styled(MDBox)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginTop: 'auto',
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.grey[100]}`,
  
  // Responsive button layout
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  
  '& .MuiButton-root, & .MDButton-root': {
    flex: 1,
    minHeight: '40px',
    
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

// Enhanced Card Component
function EnhancedCard({
  children,
  title,
  subtitle,
  actions,
  elevation = 1,
  responsive = true,
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledCard elevation={elevation} {...props}>
      {/* Header Section */}
      {(title || subtitle) && (
        <MDBox mb={title && subtitle ? 2 : 1}>
          {title && (
            <MDTypography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="medium"
              color="dark"
              mb={subtitle ? 1 : 0}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </MDTypography>
          )}
          {subtitle && (
            <MDTypography
              variant={isMobile ? "caption" : "body2"}
              color="text"
              opacity={0.7}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {subtitle}
            </MDTypography>
          )}
        </MDBox>
      )}

      {/* Content Section */}
      <MDBox flex={1}>
        {children}
      </MDBox>

      {/* Actions Section */}
      {actions && (
        <ActionContainer>
          {actions}
        </ActionContainer>
      )}
    </StyledCard>
  );
}

// Data Card Component for displaying key-value pairs
function DataCard({
  title,
  data = {},
  actions,
  elevation = 1,
  formatters = {},
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatValue = (key, value) => {
    if (formatters[key]) {
      return formatters[key](value);
    }
    
    // Default formatters
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('balance')) {
        return `$${value.toLocaleString()}`;
      }
      if (key.toLowerCase().includes('rate')) {
        return `${value}%`;
      }
    }
    
    if (value instanceof Date) {
  return formatters.date(value);
    }
    
    return value;
  };

  return (
    <EnhancedCard
      title={title}
      actions={actions}
      elevation={elevation}
      {...props}
    >
      {Object.entries(data).map(([key, value], index) => (
        <DataDisplay key={key}>
          <MDTypography
            variant="button"
            fontWeight="medium"
            color="text"
            textTransform="capitalize"
            sx={{ minWidth: isMobile ? 'auto' : '120px' }}
          >
            {key.replace(/([A-Z])/g, ' $1').trim()}:
          </MDTypography>
          <MDTypography
            variant="body2"
            fontWeight="regular"
            color="dark"
            textAlign={isMobile ? 'left' : 'right'}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: isMobile ? '100%' : '60%',
            }}
            title={String(formatValue(key, value))}
          >
            {formatValue(key, value)}
          </MDTypography>
        </DataDisplay>
      ))}
    </EnhancedCard>
  );
}

// Statistics Card Component
function StatsCard({
  icon,
  title,
  value,
  change,
  color = "primary",
  elevation = 1,
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <EnhancedCard elevation={elevation} {...props}>
      <MDBox display="flex" alignItems="center" spacing={2}>
        {icon && (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            width={isMobile ? 48 : 56}
            height={isMobile ? 48 : 56}
            borderRadius="lg"
            bgcolor={`${color}.main`}
            color="white"
            mr={2}
          >
            {icon}
          </MDBox>
        )}
        
        <MDBox flex={1}>
          <MDTypography
            variant={isMobile ? "caption" : "body2"}
            color="text"
            opacity={0.7}
            fontWeight="regular"
            mb={0.5}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </MDTypography>
          
          <MDTypography
            variant={isMobile ? "h5" : "h4"}
            fontWeight="medium"
            color="dark"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </MDTypography>
          
          {change && (
            <MDTypography
              variant="caption"
              color={change.startsWith('+') ? 'success' : change.startsWith('-') ? 'error' : 'text'}
              fontWeight="medium"
              mt={0.5}
            >
              {change}
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    </EnhancedCard>
  );
}

export { EnhancedCard, DataCard, StatsCard, ResponsiveGrid, ActionContainer, DataDisplay };
export default EnhancedCard;

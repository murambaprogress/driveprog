/**
 * Responsive Container Component
 * Provides consistent max-width and padding across all screen sizes
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@mui/material';

const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'lg',
  disableGutters = false,
  sx = {} 
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 3 },
        ...sx
      }}
    >
      {children}
    </Container>
  );
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  disableGutters: PropTypes.bool,
  sx: PropTypes.object
};

export default ResponsiveContainer;

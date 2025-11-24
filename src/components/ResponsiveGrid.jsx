/**
 * Responsive Grid Component for DriveCash
 * Automatically adjusts columns based on screen size
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';

const ResponsiveGrid = ({ children, spacing = 3, xs = 12, sm = 6, md = 4, lg = 3, xl = 3 }) => {
  return (
    <Grid container spacing={spacing}>
      {React.Children.map(children, (child, index) => (
        <Grid
          item
          xs={xs}
          sm={sm}
          md={md}
          lg={lg}
          xl={xl}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number
};

export default ResponsiveGrid;

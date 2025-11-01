import React from 'react';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

export default function GlobalFooter() {
  return (
    <MDBox component="footer" py={2} mt={4} sx={{ textAlign: 'center' }}>
      <MDTypography variant="caption" color="text">Market.Maker.Softwares©2025 All Rights Reserved.</MDTypography>
    </MDBox>
  );
}

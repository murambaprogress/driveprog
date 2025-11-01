import React from 'react';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

export default function StepCardHeader({ title = '', subtitle = '', stepIndex = 1, totalSteps = 4, color = '#16a085' }) {
  return (
    <MDBox pt={3} px={3} display="flex" alignItems="center" justifyContent="space-between">
      <div>
        <MDTypography variant="h5" fontWeight="medium" color="dark">{title}</MDTypography>
        <MDTypography variant="body2" color="text">{subtitle}</MDTypography>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>{stepIndex}</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Step {stepIndex} of {totalSteps}</div>
        </div>
      </div>
    </MDBox>
  );
}

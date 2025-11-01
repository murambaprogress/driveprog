import React from "react";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";

function SystemHealthCard({ serverPerf = 98, dbStatus = "Online" }) {
  const perf = Math.min(100, Math.max(0, serverPerf));

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <MDBox>
            <MDTypography variant="h6">System Health Monitor</MDTypography>
            <MDTypography variant="caption" color="text">Real-time system status</MDTypography>
          </MDBox>
          <MDBox display="flex" alignItems="center">
            <Icon color={dbStatus === "Online" ? "success" : "warning"} sx={{ fontSize: 28 }}>
              {dbStatus === "Online" ? "cloud_done" : "cloud_off"}
            </Icon>
          </MDBox>
        </MDBox>

        <MDBox mt={2} mb={1}>
          <MDTypography variant="button" fontWeight="regular">Server Performance</MDTypography>
          <MDBox display="flex" alignItems="center" justifyContent="space-between" mt={1}>
            <MDBox sx={{ width: '70%' }}>
              <LinearProgress variant="determinate" value={perf} />
            </MDBox>
            <MDBox sx={{ ml: 2 }}>
              <MDTypography variant="button" fontWeight="bold">{perf}%</MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        <MDBox mt={2}>
          <MDTypography variant="button" fontWeight="regular">Database Status</MDTypography>
          <MDBox mt={0.5} display="flex" alignItems="center" gap={1}>
            <MDBox>
              <MDTypography variant="body2" color={dbStatus === "Online" ? "success" : "error"}>
                {dbStatus}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default SystemHealthCard;

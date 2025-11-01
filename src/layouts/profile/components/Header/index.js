/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025 Market Maker Zw

Coded by Market Maker Softwares

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Profile page components
import ImageUploadDialog from "../ImageUploadDialog";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";

// Data

function Header({ children, onTabChange, profile }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [wallpaperImage, setWallpaperImage] = useState(backgroundImage);
  const [profileUploadOpen, setProfileUploadOpen] = useState(false);
  const [wallpaperUploadOpen, setWallpaperUploadOpen] = useState(false);

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  // Handle profile image change
  const handleProfileImageChange = (newImageUrl) => {
    setProfileImage(newImageUrl);
  };

  // Handle wallpaper image change
  const handleWallpaperImageChange = (newImageUrl) => {
    setWallpaperImage(newImageUrl);
  };

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${wallpaperImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      >
        {/* Wallpaper upload button */}
        <MDBox
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
        >
          <Tooltip title="Change Wallpaper" placement="left">
            <IconButton
              onClick={() => setWallpaperUploadOpen(true)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <Icon sx={{ color: 'white' }}>landscape</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      </MDBox>
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDBox position="relative" display="inline-block">
              <MDAvatar src={profileImage} alt="profile-image" size="xl" shadow="sm" />
              <Tooltip title="Change Profile Picture" placement="top">
                <IconButton
                  onClick={() => setProfileUploadOpen(true)}
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <Icon fontSize="small">camera_alt</Icon>
                </IconButton>
              </Tooltip>
            </MDBox>
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {profile?.user?.full_name || `${profile?.user?.first_name} ${profile?.user?.last_name}`.trim() || 'N/A'}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                DriveCash Customer - drivecash--{profile?.user?.id || 'N/A'}
              </MDTypography>
              <MDTypography variant="caption" color="text" fontWeight="regular" display="block">
                {profile?.employment?.position || 'N/A'} at {profile?.employment?.employer || 'N/A'}
              </MDTypography>
              <MDTypography variant="caption" color="text" fontWeight="regular" display="block">
                Active Loan: ${profile?.loan_summary?.active_loans_balance?.toLocaleString() || '0'} balance
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
            <AppBar position="static">
              <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleSetTabValue}>
                <Tab
                  label="Profile"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      person
                    </Icon>
                  }
                />
                <Tab
                  label="Loan Details"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      account_balance
                    </Icon>
                  }
                />
                <Tab
                  label="Documents"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      folder
                    </Icon>
                  }
                />
              </Tabs>
            </AppBar>
          </Grid>
        </Grid>
        {children}
      </Card>
      
      {/* Image Upload Dialogs */}
      <ImageUploadDialog
        open={profileUploadOpen}
        onClose={() => setProfileUploadOpen(false)}
        currentImage={profileImage}
        onImageChange={handleProfileImageChange}
        title="Update Profile Picture"
        type="Profile Picture"
      />
      
      <ImageUploadDialog
        open={wallpaperUploadOpen}
        onClose={() => setWallpaperUploadOpen(false)}
        currentImage={wallpaperImage}
        onImageChange={handleWallpaperImageChange}
        title="Update Wallpaper"
        type="Wallpaper"
      />
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
  onTabChange: null,
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
  onTabChange: PropTypes.func,
  profile: PropTypes.shape({
    user: PropTypes.object,
    personal_info: PropTypes.object,
    address: PropTypes.object,
    employment: PropTypes.object,
    banking: PropTypes.object,
    vehicle: PropTypes.object,
    loan_summary: PropTypes.object,
    latest_application: PropTypes.object,
  }),
};

export default Header;

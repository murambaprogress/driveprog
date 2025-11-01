/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025

Coded by Panashe C jeche

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import { VhoozhtInput } from "components/VhoozhtForms";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// User context for role-based navigation
import { useUserData } from "context/AppDataContext";
import { useNotifications } from "context/NotificationsContext";
// derive display names from routeNames.js to avoid circular dependency
import routeNames from "../../../routeNames";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();
  
  // Get user context for role-based navigation
  const { user } = useUserData();
  const userRole = user?.profile?.role || 'user';
  
  // Get notifications context
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const currentSegment = route[route.length - 1] || "dashboard";
  const title = routeNames[currentSegment] || currentSegment;

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // Handle settings navigation based on user role
  const handleSettingsClick = () => {
    if (userRole === 'admin') {
      navigate('/admin/settings');
    } else {
      // For regular users, open the theme configurator
      handleConfiguratorOpen();
    }
  };

  // Render the notifications menu with dynamic content
  const renderNotificationsMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2, maxHeight: 400, width: 320 }}
    >
      {notifications.slice(0, 5).map((notification) => (
        <NotificationItem
          key={notification.id}
          icon={<Icon color={notification.read ? "inherit" : "primary"}>notifications</Icon>}
          title="New Notification"
          description={notification.message}
          onClick={() => markAsRead(notification.id)}
        />
      ))}
      {notifications.length === 0 && (
        <NotificationItem 
          icon={<Icon>info</Icon>} 
          title="No new notifications" 
          description="All caught up!"
        />
      )}
    </Menu>
  );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const isAdminRoute = route.includes("admin");
  const isUserDashboard = route[0] === "dashboard";

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          {!isAdminRoute && !isUserDashboard && <Breadcrumbs icon="home" title={title} route={route} light={light} />}
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox pr={1}>
              <VhoozhtInput placeholder="Search here" />
            </MDBox>
            <MDBox color={light ? "white" : "inherit"}>
              <Link to="/profile">
                <IconButton 
                  sx={navbarIconButton} 
                  size="small" 
                  disableRipple
                  title="Profile"
                >
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Link>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleSettingsClick}
                title={userRole === 'admin' ? 'System Settings' : 'Theme Settings'}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>
              <Badge badgeContent={unreadCount} color="error" max={9}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}
                  title={`Notifications (${unreadCount} unread)`}
                >
                  <Icon sx={iconsStyle}>notifications</Icon>
                </IconButton>
              </Badge>
              {renderNotificationsMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;

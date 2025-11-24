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

import { useEffect } from "react";

// react-router-dom components
import { useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

function DashboardLayout({ children, noPaddingTop }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: { xs: 2, sm: 2, md: 3 }, // Responsive padding
        position: "relative",
        minHeight: "100vh",

        // Mobile devices - no margin
        [breakpoints.only("xs")]: {
          marginLeft: 0,
          paddingTop: pxToRem(64), // Space for mobile navbar
        },

        // Tablets - small margin
        [breakpoints.only("sm")]: {
          marginLeft: 0,
          paddingTop: pxToRem(64),
        },

        // Medium screens - conditional margin
        [breakpoints.only("md")]: {
          marginLeft: miniSidenav ? pxToRem(80) : pxToRem(250),
          transition: transitions.create(["margin-left"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },

        // Large screens - conditional margin
        [breakpoints.only("lg")]: {
          marginLeft: miniSidenav ? pxToRem(100) : pxToRem(260),
          transition: transitions.create(["margin-left"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },

        // Extra large screens - full margin
        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      {children}
    </MDBox>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  noPaddingTop: PropTypes.bool,
};

DashboardLayout.defaultProps = {
  noPaddingTop: false,
};

export default DashboardLayout;

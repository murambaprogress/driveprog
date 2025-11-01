/**
 * Shared Layout Wrapper to prevent navbar duplication
 * This ensures the navbar icons appear only once across all pages
 */

import React from "react";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function SharedDashboardLayout({ children, showNavbar = true, ...navbarProps }) {
  return (
    <>
      {showNavbar && <DashboardNavbar {...navbarProps} />}
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  );
}

SharedDashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showNavbar: PropTypes.bool,
};

export default SharedDashboardLayout;

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

import { forwardRef } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// custom styles for the NotificationItem
import menuItem from "examples/Items/NotificationItem/styles";

const NotificationItem = forwardRef(({ icon, title, description, onClick, ...rest }, ref) => (
  <MenuItem {...rest} ref={ref} sx={(theme) => menuItem(theme)} onClick={onClick}>
    <MDBox component={Link} py={0.5} display="flex" alignItems="center" lineHeight={1}>
      <MDTypography variant="body1" color="secondary" lineHeight={0.75}>
        {icon}
      </MDTypography>
      <MDBox sx={{ ml: 1 }}>
        <MDTypography variant="button" fontWeight="regular">
          {title}
        </MDTypography>
        {description && (
          <MDTypography variant="caption" color="text" display="block" sx={{ mt: 0.25 }}>
            {description}
          </MDTypography>
        )}
      </MDBox>
    </MDBox>
  </MenuItem>
));

// Typechecking props for the NotificationItem
NotificationItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClick: PropTypes.func,
};

export default NotificationItem;

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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React contexts
import { useMaterialUIController } from "context";

function DataTableHeadCell({ width, children, sorted, align, ...rest }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const justify = align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";

  return (
    <MDBox
      component="th"
      width={width}
      py={1.5}
      px={3}
      sx={({ palette: { light }, borders: { borderWidth } }) => ({
        borderBottom: `${borderWidth[1]} solid ${light.main}`,
        minHeight: '56px',
        verticalAlign: 'middle',
      })}
    >
      <MDBox
        {...rest}
        position="relative"
        textAlign={align}
        color={darkMode ? "white" : "secondary"}
        opacity={0.9}
        display="flex"
        alignItems="center"
        minHeight="48px"
        justifyContent={justify}
        sx={({ typography: { size, fontWeightBold } }) => ({
          fontSize: size.xxs,
          fontWeight: fontWeightBold,
          textTransform: "uppercase",
        })}
      >
        {children}
        {sorted && (
          <MDBox
            component="button"
            type="button"
            onClick={rest.onClick}
            aria-sort={sorted === 'asce' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
            sx={({ typography: { size } }) => ({
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              marginLeft: align === 'right' ? 0 : 2,
              marginRight: align === 'right' ? 2 : 0,
              borderRadius: 6,
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(16,24,40,0.03)',
              },
              fontSize: size.md,
            })}
          >
            <MDBox mr={0.25} color={sorted === 'asce' ? 'text' : 'secondary'} sx={{ opacity: sorted === 'asce' ? 1 : 0.5 }}>
              <Icon sx={{ fontSize: 22 }}>arrow_drop_up</Icon>
            </MDBox>
            <MDBox color={sorted === 'desc' ? 'text' : 'secondary'} sx={{ opacity: sorted === 'desc' ? 1 : 0.5 }}>
              <Icon sx={{ fontSize: 22 }}>arrow_drop_down</Icon>
            </MDBox>
          </MDBox>
        )}
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of DataTableHeadCell
DataTableHeadCell.defaultProps = {
  width: "auto",
  sorted: "none",
  align: "left",
};

// Typechecking props for the DataTableHeadCell
DataTableHeadCell.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node.isRequired,
  sorted: PropTypes.oneOf([false, "none", "asce", "desc"]),
  align: PropTypes.oneOf(["left", "right", "center"]),
};

export default DataTableHeadCell;

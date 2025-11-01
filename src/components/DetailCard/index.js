import React from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function DetailCard({ title, details, emptyMessage }) {
  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="bold" mb={2}>
          {title}
        </MDTypography>
        <Divider />
        <MDBox mt={2}>
          {details && details.length > 0 ? (
            details.map((item, index) => (
              <MDBox key={index} display="flex" justifyContent="space-between" mb={1.5}>
                <MDTypography variant="body2" color="text">{item.label}:</MDTypography>
                {item.link ? (
                  <MDTypography
                    component="a"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    fontWeight="medium"
                    color="info"
                  >
                    {item.value}
                  </MDTypography>
                ) : (
                  <MDTypography variant="body2" fontWeight="medium" color={item.color || "text"}>
                    {item.value}
                  </MDTypography>
                )}
              </MDBox>
            ))
          ) : (
            <MDTypography variant="body2" color="text" opacity={0.7}>
              {emptyMessage || "No details available"}
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

DetailCard.defaultProps = {
  emptyMessage: "No details available",
};

DetailCard.propTypes = {
  title: PropTypes.string.isRequired,
  details: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      color: PropTypes.string,
    })
  ),
  emptyMessage: PropTypes.string,
};

export default DetailCard;
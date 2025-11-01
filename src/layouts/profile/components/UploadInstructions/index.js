/**
=========================================================
* Upload Instructions Component - Profile Section
=========================================================
*/

import PropTypes from "prop-types";

// Material Dashboard 2 React components  
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";

function UploadInstructions({ show }) {
  if (!show) return null;

  return (
    <MDBox mb={3}>
      <MDAlert color="info" dismissible>
        <MDTypography variant="h6" color="white">
          📸 Upload Your Images
        </MDTypography>
        <MDTypography variant="body2" color="white" mt={1}>
          • Click the <strong>camera icon</strong> on your profile picture to upload a new photo
        </MDTypography>
        <MDTypography variant="body2" color="white">
          • Click the <strong>landscape icon</strong> in the top-right corner to change your wallpaper
        </MDTypography>
        <MDTypography variant="body2" color="white">
          • Supports drag & drop • Max file size: 5MB • JPG, PNG, GIF formats
        </MDTypography>
      </MDAlert>
    </MDBox>
  );
}

UploadInstructions.propTypes = {
  show: PropTypes.bool,
};

UploadInstructions.defaultProps = {
  show: true,
};

export default UploadInstructions;

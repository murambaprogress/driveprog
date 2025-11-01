/**
=========================================================
* Material Dashboard 2 React - Profile Image Upload Component
=========================================================
*/

import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

function ImageUploadDialog({ open, onClose, currentImage, onImageChange, title, type }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSave = () => {
    if (selectedFile && onImageChange) {
      onImageChange(previewUrl);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImage);
    setDragOver(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDTypography variant="h5">{title}</MDTypography>
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Icon>close</Icon>
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <MDBox p={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MDTypography variant="h6" gutterBottom>
                Current {type}
              </MDTypography>
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="200px"
                borderRadius="lg"
                border="1px solid"
                borderColor="grey.300"
              >
                {type === 'Profile Picture' ? (
                  <MDAvatar src={currentImage} alt="current" size="xxl" />
                ) : (
                  <MDBox
                    component="img"
                    src={currentImage}
                    alt="current wallpaper"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: 'lg',
                    }}
                  />
                )}
              </MDBox>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <MDTypography variant="h6" gutterBottom>
                New {type}
              </MDTypography>
              <MDBox
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="200px"
                border={`2px dashed ${dragOver ? '#1976d2' : '#ccc'}`}
                borderRadius="lg"
                p={2}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: dragOver ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById(`file-input-${type}`).click()}
              >
                {previewUrl && previewUrl !== currentImage ? (
                  <>
                    {type === 'Profile Picture' ? (
                      <MDAvatar src={previewUrl} alt="preview" size="xxl" />
                    ) : (
                      <MDBox
                        component="img"
                        src={previewUrl}
                        alt="preview"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '180px',
                          objectFit: 'cover',
                          borderRadius: 'lg',
                        }}
                      />
                    )}
                    <MDTypography variant="caption" color="success" mt={1}>
                      Ready to save!
                    </MDTypography>
                  </>
                ) : (
                  <>
                    <Icon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }}>
                      {type === 'Profile Picture' ? 'person' : 'landscape'}
                    </Icon>
                    <MDTypography variant="body2" color="text" textAlign="center">
                      Drag & drop or click to select
                    </MDTypography>
                    <MDTypography variant="caption" color="text" textAlign="center">
                      Max file size: 5MB
                    </MDTypography>
                  </>
                )}
              </MDBox>
              
              <input
                id={`file-input-${type}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Grid>
          </Grid>
        </MDBox>
      </DialogContent>
      
      <DialogActions>
        <MDButton variant="outlined" color="secondary" onClick={handleClose}>
          Cancel
        </MDButton>
        <MDButton 
          variant="gradient" 
          color="info" 
          onClick={handleSave}
          disabled={!selectedFile}
        >
          Save {type}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

// PropTypes
ImageUploadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentImage: PropTypes.string.isRequired,
  onImageChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default ImageUploadDialog;

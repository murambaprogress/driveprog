import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import { useFormContext } from "../context/FormContext";
import CameraCapture from "../components/CameraCapture";

// Professional Photo Upload Component
function PhotoUploadCard({ title, subtitle, name, onFileUpload, isRequired = false, uploadedFiles, accept = "image/*", capture = "environment" }) {
  const fileInputRef = React.useRef(null);
  const cameraInputRef = React.useRef(null);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  
  const isUploaded = uploadedFiles[name] && uploadedFiles[name].length > 0;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileUpload(name, files);
    }
  };

  const handleCameraCapture = () => {
    // Open the WebRTC camera dialog
    setCameraDialogOpen(true);
  };

  const handleCameraClose = () => {
    setCameraDialogOpen(false);
  };

  const handleCameraCapturingComplete = (files) => {
    // Handle captured photo
    onFileUpload(name, files);
  };

  const handleAttachFile = () => {
    if (fileInputRef.current) {
      // Reset the input so the same file can be selected again
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0' }}>
      <MDBox p={3} flex="1" display="flex" flexDirection="column">
        <MDBox mb={2}>
          <MDTypography variant="body1" fontWeight="bold" color="dark" mb={1}>
            {title}
            {isRequired && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
          </MDTypography>
        </MDBox>

        {/* Action Buttons */}
        <MDBox display="flex" gap={2} mb={2}>
          <MDButton 
            variant="contained" 
            color="info"
            size="small"
            onClick={handleCameraCapture}
            sx={{
              backgroundColor: '#16a085',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
              px: 3,
              py: 1.5,
              minWidth: '100px',
              boxShadow: '0 2px 8px rgba(22, 160, 133, 0.25)',
              '&:hover': {
                backgroundColor: '#138d75',
                boxShadow: '0 4px 12px rgba(22, 160, 133, 0.35)',
              }
            }}
          >
            Capture
          </MDButton>
          <MDButton 
            variant="outlined" 
            color="info"
            size="small"
            onClick={handleAttachFile}
            sx={{
              borderColor: '#16a085',
              color: '#16a085',
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
              px: 3,
              py: 1.5,
              minWidth: '100px',
              '&:hover': {
                borderColor: '#138d75',
                color: '#138d75',
                backgroundColor: 'rgba(22, 160, 133, 0.04)',
              }
            }}
          >
            Attach File
          </MDButton>
        </MDBox>

        {/* Hidden file inputs */}
        {/* Camera input - used only for photo capture */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          multiple={false}
        />
        {/* File browser input - used for file/gallery selection */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          style={{ display: 'none' }}
          multiple={name.includes('damage')}
        />

        {/* Upload Status or Preview */}
        {isUploaded ? (
          <MDBox 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            minHeight="80px"
            borderRadius="8px"
            sx={{ backgroundColor: '#e8f5f1', border: '2px dashed #16a085' }}
          >
            <MDBox textAlign="center">
              <CheckCircleIcon sx={{ fontSize: 32, color: '#16a085', mb: 1 }} />
              <MDTypography variant="caption" sx={{ color: '#138d75', fontWeight: 500 }}>
                {uploadedFiles[name]?.length} file(s) uploaded
              </MDTypography>
            </MDBox>
          </MDBox>
        ) : (
          <MDBox 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            minHeight="80px"
            borderRadius="8px"
            sx={{ backgroundColor: '#f8f9fa', border: '2px dashed #d1d5db' }}
          >
            <MDBox textAlign="center">
              <CloudUploadIcon sx={{ fontSize: 32, color: '#9ca3af', mb: 1 }} />
              <MDTypography variant="caption" color="text">
                No file selected
              </MDTypography>
            </MDBox>
          </MDBox>
        )}
        
        {/* Camera Capture Dialog */}
        <CameraCapture
          open={cameraDialogOpen}
          onClose={handleCameraClose}
          onCapture={handleCameraCapturingComplete}
          title={`Capture ${title}`}
        />
      </MDBox>
    </Card>
  );
}

export default function Photos() {
  const navigate = useNavigate();
  const { formData, update, setStepCompletion } = useFormContext();
  const [uploadedFiles, setUploadedFiles] = useState(formData.photos || {});

  const handleFileUpload = (fieldName, files) => {
    const updatedFiles = { ...uploadedFiles, [fieldName]: files };
    setUploadedFiles(updatedFiles);
    update({ photos: updatedFiles });
  };

  const onSubmit = () => {
    // Validate required uploads
    const requiredUploads = [
      "govIdFront",
      "govIdBack", 
      "title",
      "backOfTitle",
      "vinFromTitle",
      "vinFromDash",
      "vinFromSticker",
      "odometer"
    ];
    
    const missingUploads = requiredUploads.filter(
      (field) => !uploadedFiles[field] || uploadedFiles[field].length === 0
    );

    if (missingUploads.length > 0) {
      alert(`Please upload the following required documents: ${missingUploads.join(", ")}`);
      return;
    }

  if (formData.id) setStepCompletion({ loanId: formData.id, step: 'photos', completed: true });
  navigate(`/loan/apply/${formData.id}/review`);
  };

  // persist uploadedFiles into form context whenever changed
  useEffect(() => {
    if (formData.id) update({ photos: uploadedFiles });
  }, [uploadedFiles]);

  // Calculate completion percentage
  const requiredFields = [
    "govIdFront", "govIdBack", "title", "backOfTitle",
    "vinFromTitle", "vinFromDash", "vinFromSticker", "odometer"
  ];
  const completedRequired = requiredFields.filter(field => uploadedFiles[field]?.length > 0).length;
  const completionPercentage = Math.round((completedRequired / requiredFields.length) * 100);

  return (
    <MDBox>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <MDBox pt={4} px={4}>
              <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
                Document & Photo Upload
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>
                Please upload all required documents and photos to complete your loan application
              </MDTypography>
              
              {/* Progress Indicator */}
              <MDBox mb={4} p={3} sx={{ backgroundColor: '#e8f5f1', borderRadius: '12px', border: '1px solid rgba(22, 160, 133, 0.2)' }}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDTypography variant="h6" fontWeight="medium" color="dark">
                    Upload Progress
                  </MDTypography>
                  <MDTypography variant="h6" fontWeight="bold" sx={{ color: completionPercentage === 100 ? '#16a085' : '#138d75' }}>
                    {completionPercentage}%
                  </MDTypography>
                </MDBox>
                <Box sx={{ width: '100%', backgroundColor: '#d1d5db', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${completionPercentage}%`,
                      backgroundColor: completionPercentage === 100 ? '#16a085' : '#138d75',
                      height: '100%',
                      borderRadius: '8px',
                      transition: 'width 0.3s ease',
                      boxShadow: completionPercentage === 100 ? '0 0 8px rgba(22, 160, 133, 0.4)' : 'none'
                    }}
                  />
                </Box>
                <MDTypography variant="caption" color="text" mt={1} display="block">
                  {completedRequired} of {requiredFields.length} required documents uploaded
                </MDTypography>
              </MDBox>
            </MDBox>
            
            <MDBox px={4} pb={4}>
              {/* Government ID Section */}
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  Government Identification
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Government ID - Front"
                      subtitle="Clear photo of the front side"
                      name="govIdFront"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                      accept="image/*,.pdf"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Government ID - Back"
                      subtitle="Clear photo of the back side"
                      name="govIdBack"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                      accept="image/*,.pdf"
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Vehicle Title Section */}
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  Vehicle Title Documentation
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Vehicle Title - Front"
                      subtitle="Clear photo of the title front"
                      name="title"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                      accept="image/*,.pdf"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Vehicle Title - Back"
                      subtitle="Clear photo of the title back"
                      name="backOfTitle"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                      accept="image/*,.pdf"
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* VIN Verification Section */}
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  VIN Number Verification
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="VIN from Title"
                      subtitle="VIN number visible on title"
                      name="vinFromTitle"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="VIN from Dashboard"
                      subtitle="VIN visible on dashboard"
                      name="vinFromDash"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="VIN from Door Sticker"
                      subtitle="VIN on door frame sticker"
                      name="vinFromSticker"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Vehicle Condition Section */}
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  Vehicle Condition Documentation
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Odometer Reading"
                      subtitle="Clear photo of current mileage"
                      name="odometer"
                      onFileUpload={handleFileUpload}
                      isRequired={true}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Borrower Photo"
                      subtitle="Photo of loan applicant"
                      name="borrower"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                      capture="user"
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Vehicle Exterior Section */}
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  Vehicle Exterior Photos
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Front of Vehicle"
                      subtitle="Complete front view"
                      name="frontOfCar"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Back of Vehicle"
                      subtitle="Complete rear view"
                      name="backOfCar"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Driver Side"
                      subtitle="Complete driver side view"
                      name="driverSideOfCar"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Passenger Side"
                      subtitle="Complete passenger side view"
                      name="passengerSideOfCar"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Vehicle Interior Section */}
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  Vehicle Interior Photos
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="Driver Side Interior"
                      subtitle="Interior from driver side"
                      name="insideDriverSide"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="Passenger Interior"
                      subtitle="Interior from passenger side"
                      name="insidePassengerSide"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="Back Interior"
                      subtitle="Interior rear area view"
                      name="insideBack"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="Driver Seats"
                      subtitle="Front driver seats detail"
                      name="insideInteriorDriverSideSeats"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="Passenger Seats"
                      subtitle="Front passenger seats detail"
                      name="insideInteriorPassengerSideSeats"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhotoUploadCard
                      title="Back Seats"
                      subtitle="Rear seats detail view"
                      name="insideInteriorBackSeats"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Additional Documentation Section */}
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  Additional Documentation
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Vehicle Series/Model"
                      subtitle="Badge or emblem showing series"
                      name="seriesOfVehicle"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Damage Documentation Section */}
              <MDBox mb={6}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={3}>
                  Damage Documentation (If Applicable)
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Front Damage"
                      subtitle="Any damages on front of vehicle"
                      name="damagesOnTheFront"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Rear Damage"
                      subtitle="Any damages on back of vehicle"
                      name="damagesOnTheBack"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Driver Side Damage"
                      subtitle="Any damages on driver side"
                      name="damagesOnTheDriverSide"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PhotoUploadCard
                      title="Passenger Side Damage"
                      subtitle="Any damages on passenger side"
                      name="damagesOnThePassengerSide"
                      onFileUpload={handleFileUpload}
                      uploadedFiles={uploadedFiles}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Navigation Buttons */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate(`/loan/apply/${formData.id}/condition`)}
                  sx={{
                    borderColor: '#16a085',
                    color: '#16a085',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#138d75',
                      color: '#138d75',
                      backgroundColor: 'rgba(22, 160, 133, 0.04)',
                    },
                  }}
                >
                  Back to Vehicle Condition
                </MDButton>
                <MDButton
                  onClick={onSubmit}
                  variant="gradient"
                  color="info"
                  size="large"
                  disabled={completionPercentage < 100}
                  sx={{
                    backgroundColor: completionPercentage === 100 ? '#16a085' : '#6b7280',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: completionPercentage === 100 ? '0 4px 12px rgba(22, 160, 133, 0.3)' : 'none',
                    '&:hover': {
                      backgroundColor: completionPercentage === 100 ? '#138d75' : '#6b7280',
                      boxShadow: completionPercentage === 100 ? '0 6px 16px rgba(22, 160, 133, 0.4)' : 'none',
                    },
                    '&:disabled': {
                      backgroundColor: '#d1d5db',
                      color: '#9ca3af',
                    }
                  }}
                >
                  {completionPercentage === 100 ? 'Submit Application' : `Complete Upload (${completionPercentage}%)`}
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

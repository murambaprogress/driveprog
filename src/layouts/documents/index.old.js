import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Documents() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Mock document data based on loan application process - expanded with more documents
  const documents = [
    {
      id: 1,
      name: "Loan Agreement",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "1/20/2024",
      status: "approved",
      statusColor: "success"
    },
    {
      id: 2,
      name: "Vehicle Title",
      type: "PDF",
      size: "1.8 MB",
      uploadDate: "1/20/2024",
      status: "approved",
      statusColor: "success"
    },
    {
      id: 3,
      name: "Insurance Certificate",
      type: "PDF",
      size: "1.2 MB",
      uploadDate: "1/22/2024",
      status: "pending",
      statusColor: "warning"
    },
    {
      id: 4,
      name: "Income Verification",
      type: "PDF",
      size: "950 KB",
      uploadDate: "1/25/2024",
      status: "approved",
      statusColor: "success"
    },
    {
      id: 5,
      name: "Driver License Photo",
      type: "JPG",
      size: "1.5 MB",
      uploadDate: "1/18/2024",
      status: "approved",
      statusColor: "success"
    },
    {
      id: 6,
      name: "Bank Statement",
      type: "PDF",
      size: "3.1 MB",
      uploadDate: "1/19/2024",
      status: "approved",
      statusColor: "success"
    },
    {
      id: 7,
      name: "Vehicle Photos - Front",
      type: "JPG",
      size: "2.2 MB",
      uploadDate: "1/21/2024",
      status: "approved",
      statusColor: "success"
    },
    {
      id: 8,
      name: "Vehicle Photos - Side",
      type: "JPG",
      size: "2.0 MB",
      uploadDate: "1/21/2024",
      status: "approved",
      statusColor: "success"
    },
    {
      id: 9,
      name: "Proof of Residence",
      type: "PDF",
      size: "1.1 MB",
      uploadDate: "1/23/2024",
      status: "approved",
      statusColor: "success"
    }
  ];

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadClose = () => {
    setUploadDialogOpen(false);
  };

  const getDocumentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'description';
    }
  };

  const getIconColor = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'error';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'info';
      default:
        return 'dark';
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Header Section */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <MDBox>
            <MDTypography variant="h3" fontWeight="medium" color="dark">
              Documents
            </MDTypography>
            <MDTypography variant="body1" color="text">
              Manage your loan documents and upload new files
            </MDTypography>
          </MDBox>
          <MDButton 
            variant="gradient" 
            color="info" 
            size="large"
            onClick={handleUploadClick}
          >
            <Icon sx={{ mr: 1 }}>upload</Icon>
            Upload Document
          </MDButton>
        </MDBox>

        {/* Your Documents Section */}
        <MDBox mb={3}>
          <MDTypography variant="h5" fontWeight="medium" mb={4}>
            Your Documents
          </MDTypography>

          {/* Documents Grid */}
          <Grid container spacing={3}>
            {documents.map((doc) => (
              <Grid item xs={12} md={6} lg={4} key={doc.id}>
                <Card 
                  sx={{ 
                    height: "100%",
                    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3
                    }
                  }}
                >
                  <MDBox p={3}>
                    {/* Document Icon and Status */}
                    <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Icon 
                        fontSize="large" 
                        color={getIconColor(doc.type)} 
                        sx={{ fontSize: "3rem !important" }}
                      >
                        {getDocumentIcon(doc.type)}
                      </Icon>
                      <MDBadge 
                        badgeContent={doc.status} 
                        color={doc.statusColor} 
                        variant="gradient" 
                        size="sm" 
                      />
                    </MDBox>

                    {/* Document Title */}
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>
                      {doc.name}
                    </MDTypography>

                    {/* Document Details */}
                    <MDTypography variant="caption" color="text" display="block" mb={1}>
                      {doc.type} • {doc.size}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block" mb={3}>
                      Uploaded: {doc.uploadDate}
                    </MDTypography>

                    {/* Action Buttons */}
                    <MDBox display="flex" gap={1}>
                      <MDButton 
                        variant="outlined" 
                        color="dark" 
                        size="small" 
                        sx={{ flex: 1 }}
                      >
                        <Icon sx={{ fontSize: "16px !important", mr: 0.5 }}>visibility</Icon>
                        View
                      </MDButton>
                      <MDButton 
                        variant="gradient" 
                        color="info" 
                        size="small" 
                        sx={{ flex: 1 }}
                      >
                        <Icon sx={{ fontSize: "16px !important", mr: 0.5 }}>download</Icon>
                        Download
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        </MDBox>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <MDTypography variant="h4" fontWeight="medium">
              Upload Document
            </MDTypography>
          </DialogTitle>
          <DialogContent>
            <MDBox textAlign="center" py={3}>
              <Icon sx={{ fontSize: "4rem !important", color: "info.main", mb: 2 }}>
                cloud_upload
              </Icon>
              <MDTypography variant="h6" mb={2}>
                Drag and drop files here, or click to select files
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>
                Supported formats: PDF, JPG, PNG (Max size: 5MB)
              </MDTypography>
              <MDButton variant="outlined" color="info" size="large">
                <Icon sx={{ mr: 1 }}>folder_open</Icon>
                Choose Files
              </MDButton>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleUploadClose} color="secondary">
              Cancel
            </MDButton>
            <MDButton variant="gradient" color="info">
              Upload
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Documents;

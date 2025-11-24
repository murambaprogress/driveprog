import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtTextarea, VhoozhtSelect } from "components/VhoozhtForms";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import Divider from "@mui/material/Divider";

// Image Modal for full-size viewing
const ImageModal = ({ open, onClose, imageSrc, title }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">{title}</MDTypography>
          <IconButton onClick={onClose} size="small">
            <Icon>close</Icon>
          </IconButton>
        </MDBox>
      </DialogTitle>
      <DialogContent>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <img
            src={imageSrc}
            alt={title}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        </MDBox>
      </DialogContent>
    </Dialog>
  );
}

// Tab Panel Component
const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <MDBox py={3}>{children}</MDBox>}
    </div>
  );
}

const LoanReviewModal = ({ open, onClose, loan, onApprove, onDecline, onQuery }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [action, setAction] = useState(""); // 'approve', 'decline', 'query'
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ src: "", title: "" });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleImageClick = (src, title) => {
    setSelectedImage({ src, title });
    setImageModalOpen(true);
  };

  const handleAction = async () => {
    if (action === "approve") {
      await onApprove(loan.id, {
        approvedAmount: approvedAmount || loanData.amount,
        approvalNotes: notes,
      });
    } else if (action === "decline") {
      if (!reason.trim()) {
        alert("Please provide a reason for declining");
        return;
      }
      await onDecline(loan.id, { reason });
    } else if (action === "query") {
      if (!notes.trim()) {
        alert("Please provide a query message");
        return;
      }
      await onQuery(loan.id, { notes: notes });
    }
    
    // Reset form
    setAction("");
    setReason("");
    setNotes("");
    setApprovedAmount("");
    onClose();
  };

  if (!loan) return null;
  
  // Handle normalized loan data - if loan has 'raw' property, use that for full data
  // Otherwise use loan directly (for user-side data)
  const loanData = loan.raw || loan;
  
  // Debug logging
  console.log('[LoanReviewModal] Received loan:', loan);
  console.log('[LoanReviewModal] Using loanData:', loanData);
  console.log('[LoanReviewModal] Documents in loanData:', loanData.documents);
  console.log('[LoanReviewModal] Photo fields:', {
    photo_vin_sticker_url: loanData.photo_vin_sticker_url,
    photo_odometer_url: loanData.photo_odometer_url,
    photo_borrower_url: loanData.photo_borrower_url,
  });

  const getStatusColor = (status) => {
    const colors = {
      approved: "success",
      rejected: "error",
      pending: "warning",
      under_review: "info",
      draft: "secondary",
    };
    return colors[status] || "primary";
  };

  // Collect all documents - both file fields and document objects
  const photos = [];
  
  // Add photo fields using the new _url fields for full paths
  const photoFields = [
    { field: "photo_vin_sticker_url", baseField: "photo_vin_sticker", title: "VIN Sticker" },
    { field: "photo_odometer_url", baseField: "photo_odometer", title: "Odometer Reading" },
    { field: "photo_borrower_url", baseField: "photo_borrower", title: "Borrower Photo/ID" },
    { field: "photo_front_car_url", baseField: "photo_front_car", title: "Vehicle Front View" },
    { field: "photo_vin_url", baseField: "photo_vin", title: "VIN Plate" },
    { field: "photo_license_url", baseField: "photo_license", title: "Driver's License" },
    { field: "photo_insurance_url", baseField: "photo_insurance", title: "Insurance Card" },
  ];
  
  photoFields.forEach(({ field, baseField, title }) => {
    // Try URL field first, fallback to base field
    const src = loanData[field] || loanData[baseField];
    if (src) {
      photos.push({
        id: `${loan.id}_${baseField}`,
        title,
        src,
        field: baseField,
        type: 'photo_field'
      });
    }
  });
  
  // Add documents from documents array
  if (loanData.documents && Array.isArray(loanData.documents)) {
    loanData.documents.forEach(doc => {
      // Handle both absolute and relative URLs
      let fileUrl = doc.file || doc.url;
      if (fileUrl && !fileUrl.startsWith('http')) {
        // Prepend backend URL for relative paths
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        const baseUrl = backendUrl.replace('/api', ''); // Remove /api suffix
        fileUrl = `${baseUrl}${fileUrl}`;
      }
      
      photos.push({
        id: doc.id,
        title: doc.title || doc.document_type,
        src: fileUrl,
        field: doc.document_type,
        type: 'document',
        description: doc.description,
        uploaded_at: doc.uploaded_at,
        is_analyzed: doc.is_analyzed
      });
    });
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h5">Loan Application Review</MDTypography>
              <MDTypography variant="caption" color="text">
                Application ID: {loanData.applicationId || loanData.application_id || loan.id}
              </MDTypography>
            </MDBox>
            <Chip
              label={loanData.status}
              color={getStatusColor(loanData.status)}
              size="small"
              sx={{ textTransform: "capitalize" }}
            />
          </MDBox>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Application Details" />
              <Tab label="Submitted Photos" />
              <Tab label="AI Analysis" />
              <Tab label="Actions" />
            </Tabs>
          </Box>

          {/* Tab 1: Application Details */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: "100%" }}>
                  <MDTypography variant="h6" mb={2}>
                    Personal Information
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Name:
                      </MDTypography>
                      <MDTypography variant="button">
                        {loanData.borrowerName || loanData.full_name || `${loanData.first_name || ""} ${loanData.last_name || ""}`.trim() || "N/A"}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Email:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.email || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Phone:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.phone || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        DOB:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.dob || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        SSN:
                      </MDTypography>
                      <MDTypography variant="button">
                        {loanData.social_security ? "***-**-" + loanData.social_security.slice(-4) : "N/A"}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        ID Type:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.identification_type || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        ID Number:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.identification_no || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Bank Name:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.banks_name || "N/A"}</MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: "100%" }}>
                  <MDTypography variant="h6" mb={2}>
                    Loan Details
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Amount Requested:
                      </MDTypography>
                      <MDTypography variant="button" color="success">
                        ${Number(loanData.amount || 0).toLocaleString()}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Term:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.term} months</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Interest Rate:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.interestRate || 0}%</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Application Date:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.applicationDate || loanData.created_at}</MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: "100%" }}>
                  <MDTypography variant="h6" mb={2}>
                    Vehicle Information
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Make/Model:
                      </MDTypography>
                      <MDTypography variant="button">
                        {loanData.vehicle_make || loanData.vehicleMake} {loanData.vehicle_model || loanData.vehicleModel}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Year:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.vehicle_year || loanData.vehicleYear}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        VIN:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.vehicle_vin || loanData.vehicleVin}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Mileage:
                      </MDTypography>
                      <MDTypography variant="button">
                        {Number(loanData.vehicle_mileage || loanData.vehicleMileage || 0).toLocaleString()} mi
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Estimated Value:
                      </MDTypography>
                      <MDTypography variant="button" color="info">
                        ${Number(loanData.applicant_estimated_value || 0).toLocaleString()}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: "100%" }}>
                  <MDTypography variant="h6" mb={2}>
                    Financial Information
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Employment Status:
                      </MDTypography>
                      <MDTypography variant="button" sx={{ textTransform: "capitalize" }}>
                        {loanData.employment_status || "N/A"}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Monthly Income:
                      </MDTypography>
                      <MDTypography variant="button">
                        {loanData.gross_monthly_income ? `$${Number(loanData.gross_monthly_income).toLocaleString()}` : "N/A"}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Pay Frequency:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.pay_frequency || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Credit Score:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.credit_score || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Active Bankruptcy:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.active_bankruptcy || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Direct Deposit:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.direct_deposit || "N/A"}</MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Address Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: "100%" }}>
                  <MDTypography variant="h6" mb={2}>
                    Address Information
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        Street:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.street || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        City:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.city || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        State:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.state || "N/A"}</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" fontWeight="medium">
                        ZIP Code:
                      </MDTypography>
                      <MDTypography variant="button">{loanData.zip_code || "N/A"}</MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Co-Applicant Information (if available) */}
              {(loanData.co_applicant_first_name || loanData.co_applicant_name) && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: "100%" }}>
                    <MDTypography variant="h6" mb={2}>
                      Co-Applicant Information
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1}>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="button" fontWeight="medium">
                          Name:
                        </MDTypography>
                        <MDTypography variant="button">
                          {loanData.co_applicant_name || `${loanData.co_applicant_first_name || ""} ${loanData.co_applicant_last_name || ""}`.trim() || "N/A"}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="button" fontWeight="medium">
                          Email:
                        </MDTypography>
                        <MDTypography variant="button">{loanData.co_applicant_email || "N/A"}</MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="button" fontWeight="medium">
                          Phone:
                        </MDTypography>
                        <MDTypography variant="button">{loanData.co_applicant_phone || "N/A"}</MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="button" fontWeight="medium">
                          SSN:
                        </MDTypography>
                        <MDTypography variant="button">
                          {loanData.co_applicant_ssn ? "***-**-" + loanData.co_applicant_ssn.slice(-4) : "N/A"}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
              )}

            {/* Additional Dynamic Fields */}
            {loanData.additional_data && Object.keys(loanData.additional_data).length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <MDTypography variant="h6" mb={2}>
                    Additional Information
                  </MDTypography>
                  <Grid container spacing={2}>
                    {Object.entries(loanData.additional_data).map(([key, value]) => {
                      const displayKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                      const capitalizedKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
                      
                      return (
                        <Grid item xs={12} md={6} key={key}>
                          <MDBox display="flex" justifyContent="space-between">
                            <MDTypography variant="button" fontWeight="medium">
                              {capitalizedKey}:
                            </MDTypography>
                            <MDTypography variant="button">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value) || "N/A"}
                            </MDTypography>
                          </MDBox>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Card>
              </Grid>
            )}
            </Grid>
          </TabPanel>

          {/* Tab 2: Submitted Photos */}
          <TabPanel value={activeTab} index={1}>
            <MDBox mb={2}>
              <MDTypography variant="h6" mb={1}>
                Uploaded Photos & Documents
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Total files: {photos.length} | Click any image to view full size
              </MDTypography>
            </MDBox>
            
            {photos.length > 0 ? (
              <Grid container spacing={2}>
                {photos.map((photo, index) => (
                  <Grid item xs={12} sm={6} md={4} key={photo.id || index}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        border: "2px solid transparent",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: 4,
                          borderColor: "primary.main",
                        },
                      }}
                      onClick={() => handleImageClick(photo.src, photo.title)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={photo.src}
                        alt={photo.title}
                        sx={{ 
                          objectFit: "cover",
                          backgroundColor: "#f5f5f5"
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <MDBox p={2}>
                        <MDTypography variant="button" fontWeight="medium" display="block" mb={0.5}>
                          {photo.title}
                        </MDTypography>
                        
                        <Chip
                          label={photo.type === 'document' ? 'Document' : 'Photo'}
                          size="small"
                          color={photo.type === 'document' ? 'info' : 'primary'}
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                        
                        {photo.type === 'document' && (
                          <>
                            {photo.description && (
                              <MDTypography variant="caption" color="text" display="block" mt={1}>
                                {photo.description}
                              </MDTypography>
                            )}
                            {photo.uploaded_at && (
                              <MDTypography variant="caption" color="text" display="block" mt={0.5}>
                                📅 {new Date(photo.uploaded_at).toLocaleDateString()}
                              </MDTypography>
                            )}
                            {photo.is_analyzed && (
                              <Chip
                                label="✓ AI Analyzed"
                                size="small"
                                color="success"
                                sx={{ mt: 0.5, fontSize: '0.7rem', height: '20px' }}
                              />
                            )}
                          </>
                        )}
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <MDBox textAlign="center" py={5}>
                <Icon fontSize="large" color="disabled">
                  image_not_supported
                </Icon>
                <MDTypography variant="h6" color="text" mt={2}>
                  No photos or documents submitted
                </MDTypography>
                <MDTypography variant="body2" color="text" mt={1}>
                  The applicant has not uploaded any photos or documents yet.
                </MDTypography>
              </MDBox>
            )}
          </TabPanel>

          {/* Tab 3: AI Analysis */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              {/* Vehicle Valuation Analysis */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <MDTypography variant="h6" mb={2}>
                    AI Vehicle Valuation & Risk Assessment
                  </MDTypography>
                  {loanData.ai_estimated_value || loanData.ai_analysis_data ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <MDBox display="flex" justifyContent="space-between" mb={1}>
                          <MDTypography variant="button" fontWeight="medium">
                            AI Estimated Value:
                          </MDTypography>
                          <MDTypography variant="button" color="success">
                            ${Number(loanData.ai_estimated_value || 0).toLocaleString()}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDBox display="flex" justifyContent="space-between" mb={1}>
                          <MDTypography variant="button" fontWeight="medium">
                            Applicant Estimate:
                          </MDTypography>
                          <MDTypography variant="button">
                            ${Number(loanData.applicant_estimated_value || 0).toLocaleString()}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDBox display="flex" justifyContent="space-between" mb={1}>
                          <MDTypography variant="button" fontWeight="medium">
                            Loan Amount:
                          </MDTypography>
                          <MDTypography variant="button">
                            ${Number(loanData.amount || 0).toLocaleString()}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="button" fontWeight="medium" mb={1} display="block">
                          Risk Assessment:
                        </MDTypography>
                        <Chip
                          label={loanData.ai_risk_assessment || "N/A"}
                          color={
                            loanData.ai_risk_assessment === "low"
                              ? "success"
                              : loanData.ai_risk_assessment === "high" || loanData.ai_risk_assessment === "very_high"
                              ? "error"
                              : "warning"
                          }
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="button" fontWeight="medium" mb={1} display="block">
                          AI Approval Suggestion:
                        </MDTypography>
                        <Chip
                          label={loanData.ai_approval_suggestion || "N/A"}
                          color={
                            loanData.ai_approval_suggestion === "approve"
                              ? "success"
                              : loanData.ai_approval_suggestion === "reject"
                              ? "error"
                              : "warning"
                          }
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MDTypography variant="button" fontWeight="medium" mb={1} display="block">
                          AI Recommendation:
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {loanData.ai_recommendation || "No recommendation available"}
                        </MDTypography>
                      </Grid>
                      {loanData.ai_analysis_timestamp && (
                        <Grid item xs={12}>
                          <MDTypography variant="caption" color="text">
                            Analysis performed: {new Date(loanData.ai_analysis_timestamp).toLocaleString()}
                          </MDTypography>
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <MDBox textAlign="center" py={3}>
                      <Icon fontSize="large" color="disabled">
                        psychology_alt
                      </Icon>
                      <MDTypography variant="body2" color="text" mt={2}>
                        AI analysis not yet available
                      </MDTypography>
                    </MDBox>
                  )}
                </Card>
              </Grid>

              {/* Detailed AI Analysis Data */}
              {loanData.ai_analysis_data && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3 }}>
                    <MDTypography variant="h6" mb={2}>
                      Detailed Analysis Results
                    </MDTypography>
                    <MDBox sx={{ maxHeight: '300px', overflow: 'auto', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                      <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {JSON.stringify(loanData.ai_analysis_data, null, 2)}
                      </pre>
                    </MDBox>
                  </Card>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Tab 4: Actions */}
          <TabPanel value={activeTab} index={3}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={3}>
                Review Actions
              </MDTypography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <VhoozhtSelect
                    label="Select Action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    options={[
                      { value: "", label: "-- Choose an action --" },
                      { value: "approve", label: "Approve Application" },
                      { value: "decline", label: "Decline Application" },
                      { value: "query", label: "Raise Query" },
                    ]}
                    fullWidth
                  />
                </Grid>

                {action === "approve" && (
                  <>
                    <Grid item xs={12} md={6}>
                      <VhoozhtInput
                        label="Approved Amount ($)"
                        type="number"
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        placeholder={`Requested: $${loanData.amount}`}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <VhoozhtTextarea
                        label="Approval Notes (Optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Enter any notes for the borrower..."
                        fullWidth
                      />
                    </Grid>
                  </>
                )}

                {action === "decline" && (
                  <Grid item xs={12}>
                    <VhoozhtTextarea
                      label="Reason for Declining *"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      placeholder="Please provide a clear reason for declining this application..."
                      fullWidth
                      required
                    />
                  </Grid>
                )}

                {action === "query" && (
                  <Grid item xs={12}>
                    <VhoozhtTextarea
                      label="Query Message *"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="E.g., 'The photos submitted are not clear. Please upload clearer images of the VIN and odometer.'"
                      fullWidth
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </Card>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <MDButton onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </MDButton>
          {action && (
            <MDButton onClick={handleAction} variant="gradient" color={
              action === "approve" ? "success" : action === "decline" ? "error" : "warning"
            }>
              {action === "approve" ? "Approve Application" :
               action === "decline" ? "Decline Application" :
               "Send Query"}
            </MDButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Image Viewer Modal */}
      <ImageModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={selectedImage.src}
        title={selectedImage.title}
      />
    </>
  );
};

export default LoanReviewModal;


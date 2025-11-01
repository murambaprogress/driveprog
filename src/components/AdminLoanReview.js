import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Grid, 
  Tabs, 
  Tab, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
  Alert
} from '@mui/material';
import { ExpandMore, Visibility, Download, CheckCircle, Warning, Error } from '@mui/icons-material';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import MDTypography from '../../components/MDTypography';
import MDBadge from '../../components/MDBasge';

function AdminLoanReview({ applicationId }) {
  const [applicationData, setApplicationData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationData();
  }, [applicationId]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      // Fetch complete application data
      const response = await fetch(`/api/loans/applications/${applicationId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplicationData(data);
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionStatus = (section) => {
    if (!applicationData) return 'incomplete';
    
    switch (section) {
      case 'personal':
        return applicationData.personal_info ? 'complete' : 'incomplete';
      case 'income':
        return applicationData.financial_profile ? 'complete' : 'incomplete';
      case 'vehicle':
        return applicationData.vehicle_info ? 'complete' : 'incomplete';
      case 'documents':
        return applicationData.documents && applicationData.documents.length > 0 ? 'complete' : 'incomplete';
      default:
        return 'incomplete';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'success';
      case 'partial': return 'warning';
      case 'incomplete': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle color="success" />;
      case 'partial': return <Warning color="warning" />;
      case 'incomplete': return <Error color="error" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <MDBox p={3} textAlign="center">
        <MDTypography variant="h6">Loading application data...</MDTypography>
      </MDBox>
    );
  }

  if (!applicationData) {
    return (
      <Alert severity="error">
        Failed to load application data. Please try again.
      </Alert>
    );
  }

  return (
    <MDBox>
      {/* Application Overview */}
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <MDTypography variant="h4" fontWeight="bold" color="dark">
                Loan Application Review
              </MDTypography>
              <MDTypography variant="body1" color="text">
                Application ID: {applicationData.application_id}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Submitted: {new Date(applicationData.created_at).toLocaleString()}
              </MDTypography>
              {applicationData.personal_info && (
                <MDTypography variant="body2" color="text">
                  Applicant: {applicationData.personal_info.first_name} {applicationData.personal_info.last_name}
                </MDTypography>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <MDBox textAlign="right">
                <Chip 
                  label={applicationData.status.toUpperCase()} 
                  color={getStatusColor(applicationData.status)}
                  sx={{ mb: 1 }}
                />
                <br />
                <MDTypography variant="h6" color="dark">
                  ${applicationData.amount?.toLocaleString()} 
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {applicationData.term} months
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>

          {/* Completion Status */}
          <MDBox mt={3}>
            <Grid container spacing={2}>
              {['personal', 'income', 'vehicle', 'documents'].map((section) => {
                const status = getCompletionStatus(section);
                return (
                  <Grid item xs={6} md={3} key={section}>
                    <MDBox 
                      p={2} 
                      textAlign="center"
                      sx={{ 
                        backgroundColor: status === 'complete' ? 'success.50' : 'grey.100',
                        borderRadius: 1 
                      }}
                    >
                      {getStatusIcon(status)}
                      <MDTypography variant="subtitle2" color="dark" textTransform="capitalize">
                        {section}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        {status}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                );
              })}
            </Grid>
          </MDBox>
        </MDBox>
      </Card>

      {/* Detailed Review Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            aria-label="application review tabs"
          >
            <Tab label="Personal Information" />
            <Tab label="Income & Employment" />
            <Tab label="Vehicle Information" />
            <Tab label="Documents & Photos" />
            <Tab label="AI Analysis" />
            <Tab label="Raw Data" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <MDBox p={3}>
          {/* Personal Information Tab */}
          {activeTab === 0 && applicationData.personal_info && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" color="dark" mb={2}>Basic Information</MDTypography>
                <MDBox>
                  <InfoRow label="Full Name" value={`${applicationData.personal_info.first_name} ${applicationData.personal_info.last_name}`} />
                  <InfoRow label="Email" value={applicationData.personal_info.email} />
                  <InfoRow label="Phone" value={applicationData.personal_info.phone} />
                  <InfoRow label="Date of Birth" value={applicationData.personal_info.dob} />
                  <InfoRow label="SSN" value={applicationData.personal_info.social_security ? `***-**-${applicationData.personal_info.social_security.slice(-4)}` : 'Not provided'} />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" color="dark" mb={2}>Address</MDTypography>
                {applicationData.address && (
                  <MDBox>
                    <InfoRow label="Street" value={applicationData.address.street} />
                    <InfoRow label="City" value={applicationData.address.city} />
                    <InfoRow label="State" value={applicationData.address.state} />
                    <InfoRow label="ZIP Code" value={applicationData.address.zip_code} />
                  </MDBox>
                )}
                
                {applicationData.identification_info && (
                  <>
                    <MDTypography variant="h6" color="dark" mb={2} mt={3}>Identification</MDTypography>
                    <InfoRow label="ID Type" value={applicationData.identification_info.identification_type} />
                    <InfoRow label="ID Number" value={applicationData.identification_info.identification_no} />
                    <InfoRow label="Issuing Agency" value={applicationData.identification_info.id_issuing_agency} />
                  </>
                )}
              </Grid>
            </Grid>
          )}

          {/* Income & Employment Tab */}
          {activeTab === 1 && applicationData.financial_profile && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" color="dark" mb={2}>Employment</MDTypography>
                <InfoRow label="Status" value={applicationData.financial_profile.employment_status} />
                <InfoRow label="Length" value={`${applicationData.financial_profile.employment_length} years`} />
                <InfoRow label="Employer" value={applicationData.financial_profile.income_source} />
                <InfoRow label="Military Status" value={applicationData.financial_profile.military_status || 'Not specified'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" color="dark" mb={2}>Income</MDTypography>
                <InfoRow label="Annual Income" value={`$${applicationData.financial_profile.income?.toLocaleString()}`} />
                <InfoRow label="Monthly Income" value={`$${applicationData.financial_profile.gross_monthly_income?.toLocaleString()}`} />
                <InfoRow label="Pay Frequency" value={applicationData.financial_profile.pay_frequency} />
                <InfoRow label="Next Pay Date" value={applicationData.financial_profile.next_pay_date} />
                <InfoRow label="Direct Deposit" value={applicationData.financial_profile.direct_deposit} />
                <InfoRow label="Active Bankruptcy" value={applicationData.financial_profile.active_bankruptcy} />
              </Grid>
            </Grid>
          )}

          {/* Vehicle Information Tab */}
          {activeTab === 2 && applicationData.vehicle_info && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" color="dark" mb={2}>Vehicle Details</MDTypography>
                <InfoRow label="Make" value={applicationData.vehicle_info.make} />
                <InfoRow label="Model" value={applicationData.vehicle_info.model} />
                <InfoRow label="Year" value={applicationData.vehicle_info.year} />
                <InfoRow label="Color" value={applicationData.vehicle_info.color} />
                <InfoRow label="Mileage" value={applicationData.vehicle_info.mileage?.toLocaleString()} />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" color="dark" mb={2}>Registration</MDTypography>
                <InfoRow label="VIN" value={applicationData.vehicle_info.vin} />
                <InfoRow label="License Plate" value={applicationData.vehicle_info.license_plate} />
                <InfoRow label="Registration State" value={applicationData.vehicle_info.registration_state} />
              </Grid>
            </Grid>
          )}

          {/* Documents & Photos Tab */}
          {activeTab === 3 && (
            <MDBox>
              <MDTypography variant="h6" color="dark" mb={3}>
                Uploaded Documents & Photos ({applicationData.documents?.length || 0})
              </MDTypography>
              
              {applicationData.documents && applicationData.documents.length > 0 ? (
                <Grid container spacing={2}>
                  {applicationData.documents.map((doc, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <MDBox p={2}>
                          {doc.file && doc.file.toLowerCase().includes('image') ? (
                            <MDBox
                              component="img"
                              src={doc.file}
                              alt={doc.title}
                              sx={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 1,
                                cursor: 'pointer'
                              }}
                              onClick={() => setPreviewImage(doc)}
                            />
                          ) : (
                            <MDBox
                              sx={{
                                width: '100%',
                                height: 150,
                                backgroundColor: 'grey.200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1
                              }}
                            >
                              <MDTypography variant="h6" color="text">
                                📄 {doc.document_type.toUpperCase()}
                              </MDTypography>
                            </MDBox>
                          )}
                          
                          <MDBox mt={2}>
                            <MDTypography variant="subtitle2" color="dark">
                              {doc.title}
                            </MDTypography>
                            <MDTypography variant="caption" color="text">
                              Type: {doc.document_type}<br />
                              Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                            </MDTypography>
                            
                            <MDBox mt={1} display="flex" gap={1}>
                              <MDButton size="small" color="info" onClick={() => setPreviewImage(doc)}>
                                <Visibility fontSize="small" /> View
                              </MDButton>
                              <MDButton size="small" color="success">
                                <Download fontSize="small" /> Download
                              </MDButton>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="warning">
                  No documents have been uploaded for this application.
                </Alert>
              )}
            </MDBox>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 4 && (
            <MDBox>
              <MDTypography variant="h6" color="dark" mb={3}>AI Analysis Results</MDTypography>
              
              {applicationData.ai_recommendation ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <MDBox p={2}>
                        <MDTypography variant="subtitle1" color="dark" mb={2}>Risk Assessment</MDTypography>
                        <Chip 
                          label={applicationData.ai_risk_assessment?.toUpperCase() || 'NOT ANALYZED'} 
                          color={getStatusColor(applicationData.ai_risk_assessment)} 
                          sx={{ mb: 2 }}
                        />
                        <MDTypography variant="body2" color="text">
                          {applicationData.ai_recommendation}
                        </MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <MDBox p={2}>
                        <MDTypography variant="subtitle1" color="dark" mb={2}>Approval Suggestion</MDTypography>
                        <Chip 
                          label={applicationData.ai_approval_suggestion?.toUpperCase() || 'PENDING'} 
                          color={getStatusColor(applicationData.ai_approval_suggestion)} 
                          sx={{ mb: 2 }}
                        />
                        {applicationData.ai_analysis_timestamp && (
                          <MDTypography variant="caption" color="text">
                            Analyzed: {new Date(applicationData.ai_analysis_timestamp).toLocaleString()}
                          </MDTypography>
                        )}
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  AI analysis has not been performed on this application yet.
                  <MDButton variant="contained" color="primary" sx={{ mt: 2 }}>
                    Run AI Analysis
                  </MDButton>
                </Alert>
              )}
            </MDBox>
          )}

          {/* Raw Data Tab */}
          {activeTab === 5 && (
            <MDBox>
              <MDTypography variant="h6" color="dark" mb={3}>Raw Form Data & Metadata</MDTypography>
              
              {applicationData.raw_form_data && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <MDTypography variant="subtitle1">Form Data</MDTypography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '1rem', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '0.875rem'
                    }}>
                      {JSON.stringify(applicationData.raw_form_data, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}

              <MDBox mt={2}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <MDTypography variant="subtitle1">Complete Application Data</MDTypography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '1rem', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '0.875rem'
                    }}>
                      {JSON.stringify(applicationData, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog 
        open={!!previewImage} 
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
      >
        {previewImage && (
          <>
            <DialogContent>
              <MDBox textAlign="center">
                <img
                  src={previewImage.file}
                  alt={previewImage.title}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
                <MDBox mt={2}>
                  <MDTypography variant="h6">{previewImage.title}</MDTypography>
                  <MDTypography variant="body2" color="text">
                    Type: {previewImage.document_type} • 
                    Uploaded: {new Date(previewImage.uploaded_at).toLocaleString()}
                  </MDTypography>
                  {previewImage.description && (
                    <MDTypography variant="body2" color="text" mt={1}>
                      {previewImage.description}
                    </MDTypography>
                  )}
                </MDBox>
              </MDBox>
            </DialogContent>
            <DialogActions>
              <MDButton onClick={() => setPreviewImage(null)}>Close</MDButton>
              <MDButton color="success">Download</MDButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MDBox>
  );
}

// Helper component for displaying info rows
function InfoRow({ label, value }) {
  return (
    <MDBox display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
      <MDTypography variant="body2" color="text" fontWeight="medium">
        {label}:
      </MDTypography>
      <MDTypography variant="body2" color="dark">
        {value || 'Not provided'}
      </MDTypography>
    </MDBox>
  );
}

export default AdminLoanReview;
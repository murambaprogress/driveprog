import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Grid,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MDBox from '../../components/MDBox';
import MDTypography from '../../components/MDTypography';
import MDButton from '../../components/MDButton';
import { getLoanApplication } from '../api/loans';
import DetailCard from '../../components/DetailCard';
import SharedDashboardLayout from "components/SharedDashboardLayout";

const LoanApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const data = await getLoanApplication(id);
        console.log('[LoanApplicationDetails] Fetched application data:', data);
        console.log('[LoanApplicationDetails] Documents in application:', data?.documents);
        setApplication(data);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load loan application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'warning',
      under_review: 'info',
      approved: 'success',
      rejected: 'error',
      withdrawn: 'default',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SharedDashboardLayout>
        <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </MDBox>
      </SharedDashboardLayout>
    );
  }

  if (error) {
    return (
      <SharedDashboardLayout>
        <MDBox p={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h5" color="error" mb={2}>
                {error}
              </MDTypography>
              <MDButton onClick={() => navigate('/loans')} variant="gradient" color="info">
                Back to My Loans
              </MDButton>
            </MDBox>
          </Card>
        </MDBox>
      </SharedDashboardLayout>
    );
  }

  if (!application) {
    return (
      <SharedDashboardLayout>
        <MDBox p={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h5" mb={2}>
                Application not found
              </MDTypography>
              <MDButton onClick={() => navigate('/loans')} variant="gradient" color="info">
                Back to My Loans
              </MDButton>
            </MDBox>
          </Card>
        </MDBox>
      </SharedDashboardLayout>
    );
  }

  const loanInfo = [
    { label: 'Application ID', value: application.application_id?.toString().slice(0, 8) + '...' },
    { label: 'Loan Amount', value: formatCurrency(application.amount) },
    { label: 'Term', value: (application.term || 36) + ' months' },
    { label: 'Created', value: formatDate(application.created_at) },
    application.submitted_at && { label: 'Submitted', value: formatDate(application.submitted_at) },
    application.approved_amount && { label: 'Approved Amount', value: formatCurrency(application.approved_amount), color: 'success' },
  ].filter(Boolean);

  const personalInfo = [
    { label: 'Name', value: application.first_name && application.last_name ? `${application.first_name} ${application.last_name}` : 'N/A' },
    { label: 'Email', value: application.email || 'N/A' },
    { label: 'Phone', value: application.phone || 'N/A' },
    { label: 'DOB', value: application.dob ? new Date(application.dob).toLocaleDateString() : 'N/A' },
    { label: 'SSN', value: application.social_security || 'N/A' },
    { label: 'ID Type', value: application.identification_type || 'N/A' },
    { label: 'ID Number', value: application.identification_no || 'N/A' },
    { label: 'Bank Name', value: application.banks_name || 'N/A' },
  ].filter(Boolean);

  const financialInfo = [
    { label: 'Employment Status', value: application.employment_status || 'N/A' },
    { label: 'Monthly Income', value: application.gross_monthly_income ? formatCurrency(application.gross_monthly_income) : 'N/A' },
    { label: 'Pay Frequency', value: application.pay_frequency || 'N/A' },
    { label: 'Credit Score', value: application.credit_score || 'N/A' },
    { label: 'Active Bankruptcy', value: application.active_bankruptcy || 'N/A' },
    { label: 'Direct Deposit', value: application.direct_deposit || 'N/A' },
  ].filter(Boolean);

  const addressInfo = [
    { label: 'Street', value: application.street || 'N/A' },
    { label: 'City', value: application.city || 'N/A' },
    { label: 'State', value: application.state || 'N/A' },
    { label: 'ZIP Code', value: application.zip_code || 'N/A' },
  ].filter(Boolean);

  const vehicleInfo = [
    { label: 'Make & Model', value: application.vehicle_make && application.vehicle_model ? `${application.vehicle_make} ${application.vehicle_model}` : 'N/A' },
    { label: 'Year', value: application.vehicle_year || 'N/A' },
    { label: 'VIN', value: application.vehicle_vin || 'N/A' },
    { label: 'Mileage', value: application.vehicle_mileage ? `${application.vehicle_mileage.toLocaleString()} miles` : 'N/A' },
    { label: 'Color', value: application.vehicle_color || 'N/A' },
    { label: 'License Plate', value: application.license_plate || 'N/A' },
  ].filter(Boolean);

  console.log('[LoanApplicationDetails] Application object:', application);
  console.log('[LoanApplicationDetails] Documents:', application?.documents);
  
  const photoInfo = application?.documents?.map(doc => {
    console.log('[LoanApplicationDetails] Processing document:', doc);
    
    // Handle both absolute and relative URLs
    let fileUrl = doc.file || doc.url;
    if (fileUrl && !fileUrl.startsWith('http')) {
      // Prepend backend URL for relative paths
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const baseUrl = backendUrl.replace('/api', ''); // Remove /api suffix
      fileUrl = `${baseUrl}${fileUrl}`;
    }
    
    console.log('[LoanApplicationDetails] Document file URL:', fileUrl);
    
    return {
      label: doc.title || doc.document_type?.replace(/_/g, ' ') || 'Document',
      value: 'View',
      link: fileUrl,
    };
  }) || [];
  
  console.log('[LoanApplicationDetails] PhotoInfo array:', photoInfo);

  return (
    <SharedDashboardLayout>
      <MDBox p={3}>
        {/* Header */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDButton
              onClick={() => navigate('/loans')}
              variant="outlined"
              color="dark"
              iconOnly
              circular
            >
              <ArrowBackIcon />
            </MDButton>
            <MDTypography variant="h3" fontWeight="bold">
              Loan Application Details
            </MDTypography>
          </MDBox>
          <Chip
            label={application.status?.replace('_', ' ').toUpperCase()}
            color={getStatusColor(application.status)}
            size="medium"
          />
        </MDBox>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="loan application details tabs" centered>
                  <Tab label="Loan" />
                  <Tab label="Personal" />
                  <Tab label="Financial" />
                  <Tab label="Address" />
                  <Tab label="Vehicle" />
                  <Tab label="Photos" />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <DetailCard title="Loan Information" details={loanInfo} />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <DetailCard title="Personal Information" details={personalInfo} />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <DetailCard title="Financial Information" details={financialInfo} />
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                <DetailCard title="Address Information" details={addressInfo} />
              </TabPanel>
              <TabPanel value={tabValue} index={4}>
                <DetailCard title="Vehicle Information" details={vehicleInfo} />
              </TabPanel>
              <TabPanel value={tabValue} index={5}>
                <DetailCard title="Uploaded Photos" details={photoInfo} emptyMessage="No photos submitted" />
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </SharedDashboardLayout>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default LoanApplicationDetails;

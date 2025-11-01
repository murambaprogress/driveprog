import React from 'react';
import { Dialog, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useFormContext } from '../context/FormContext';
import { formatters } from "utils/dataFormatters";

const Submit = ({ open, onClose, loanId, loanStatus }) => {
  const { clearFormData } = useFormContext();

  const handleGoToPortal = () => {
    clearFormData();
    onClose();
    // Navigate to portal or dashboard
    window.location.href = '/dashboard';
  };

  const handleUnsubmitAndEdit = async () => {
    try {
      await LoanApplicationService.unsubmitApplication(loanId);
      clearFormData(); // Clear local form data to re-fetch from backend
      onClose();
      window.location.href = `/loan/apply/${loanId}/step-1`; // Redirect to first step for editing
    } catch (error) {
      console.error('Error unsubmitting application:', error);
      // Optionally show an error message to the user
    }
  };

  const canUnsubmit = loanStatus === 'pending' || loanStatus === 'query';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          padding: 4,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center'
        }
      }}
    >
      <MDBox display="flex" flexDirection="column" alignItems="center" py={2}>
        {/* Success Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            backgroundColor: '#e8f5e8',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50' }} />
        </Box>

        {/* Title */}
        <MDTypography variant="h4" fontWeight="bold" color="dark" mb={2}>
          Application Submitted!
        </MDTypography>

        {/* Subtitle */}
        <MDTypography variant="body1" color="text" mb={1} textAlign="center">
          Thank you for submitting your loan application.
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={4} textAlign="center">
          We will review your application and get back to you within 24-48 hours with a decision.
        </MDTypography>

        {/* Application Details */}
        <Box
          sx={{
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: 3,
            width: '100%',
            mb: 4
          }}
        >
          <MDTypography variant="body2" color="text" mb={1}>
            Application Reference Number:
          </MDTypography>
          <MDTypography variant="h6" fontWeight="bold" color="info" mb={2}>
            #LA-{Date.now().toString().slice(-6)}
          </MDTypography>
          
          <MDTypography variant="body2" color="text" mb={1}>
            Submitted Date:
          </MDTypography>
          <MDTypography variant="body1" fontWeight="medium" color="dark">
            {formatters.datetime(new Date())}
          </MDTypography>
        </Box>

        {/* Next Steps */}
        <Box
          sx={{
            backgroundColor: '#e8f4fd',
            borderRadius: '12px',
            padding: 3,
            width: '100%',
            mb: 4
          }}
        >
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={2}>
            Next Steps:
          </MDTypography>
          <MDBox textAlign="left">
            <MDTypography variant="body2" color="text" mb={1}>
              • You will receive a confirmation email shortly
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={1}>
              • Our loan specialists will review your application
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={1}>
              • We may contact you for additional documentation
            </MDTypography>
            <MDTypography variant="body2" color="text">
              • Final decision will be communicated within 2 business days
            </MDTypography>
          </MDBox>
        </Box>

        {/* Action Button */}
        <MDButton
          variant="gradient"
          color="info"
          fullWidth
          onClick={handleGoToPortal}
          sx={{
            backgroundColor: '#16a085',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 8px 24px rgba(22, 160, 133, 0.3)',
            '&:hover': {
              backgroundColor: '#138d75',
              boxShadow: '0 12px 32px rgba(22, 160, 133, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Go to Portal
        </MDButton>

        {canUnsubmit && (
          <MDButton
            variant="outlined"
            color="info"
            fullWidth
            onClick={handleUnsubmitAndEdit}
            sx={{
              mt: 2,
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#16a085',
              color: '#16a085',
              '&:hover': {
                backgroundColor: 'rgba(22, 160, 133, 0.1)',
                borderColor: '#138d75',
                color: '#138d75',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Unsubmit and Edit Application
          </MDButton>
        )}

        {/* Support Information */}
        <MDBox mt={3} textAlign="center">
          <MDTypography variant="caption" color="text">
            Questions? Contact us at{' '}
            <span style={{ color: '#16a085', fontWeight: 600 }}>
              support@loanportal.com
            </span>
            {' '}or call{' '}
            <span style={{ color: '#16a085', fontWeight: 600 }}>
              1-800-LOAN-NOW
            </span>
          </MDTypography>
        </MDBox>
      </MDBox>
    </Dialog>
  );
};

export default Submit;

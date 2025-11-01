import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

import MDBox from '../../components/MDBox';
import MDTypography from '../../components/MDTypography';
import MDButton from '../../components/MDButton';
import { VhoozhtSelect } from '../../components/VhoozhtForms';
import { 
  fetchMyApplications, 
  deleteLoanApplication, 
  withdrawLoanApplication,
  resubmitLoanApplication,
  resolveQueryLoanApplication
} from '../api/loans';
import { debugLoanData } from '../../utils/loanDataValidator';

export default function MyLoans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [selectedQueryApp, setSelectedQueryApp] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  // Filter applications based on selected status
  const filteredApplications = applications.filter((app) => {
    if (!filterStatus || filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchMyApplications();
      const apps = data.applications || [];
      
      // Validate data in development mode
      if (process.env.NODE_ENV === 'development' && apps.length > 0) {
        console.log('📊 Validating loan data from API...');
        apps.forEach(app => debugLoanData(app, 'myLoans'));
      }
      
      setApplications(apps);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      console.error('Error loading applications:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Please sign in to view your loan applications.');
      } else {
        setError('Failed to load loan applications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'warning',
      query: 'info',
      approved: 'success',
      rejected: 'error',
      withdrawn: 'default',
    };
    return colors[status] || 'default';
  };

  const formatStatusLabel = (status) => {
    if (status === 'query') {
      return 'UNDER REVIEW';
    }
    return status?.replace('_', ' ').toUpperCase() || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleViewApplication = (applicationId) => {
    navigate(`/loan/application/${applicationId}`);
  };

  const handleEditApplication = (applicationId) => {
    navigate(`/loan/apply/${applicationId}/step-1`);
  };

  const handleCancelApplication = async (app) => {
    // For drafts, we delete; for pending, we withdraw
    const actionText = app.status === 'draft' ? 'delete' : 'cancel';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this application?`)) {
      return;
    }

    try {
      if (app.status === 'draft') {
        await deleteLoanApplication(app.id);
      } else if (app.status === 'pending') {
        await withdrawLoanApplication(app.id);
      }
      
      alert(`Application ${actionText === 'delete' ? 'deleted' : 'cancelled'} successfully`);
      loadApplications(); // Reload to update list
    } catch (err) {
      console.error(`Error ${actionText}ing application:`, err);
      alert(`Failed to ${actionText} application. Please try again.`);
    }
  };

  const handleResubmitApplication = async (app) => {
    if (!window.confirm('Resubmit this application? This will reset it to pending status.')) {
      return;
    }

    try {
      await resubmitLoanApplication(app.application_id);
      alert('Application resubmitted successfully');
      loadApplications(); // Reload to get updated status
    } catch (err) {
      console.error('Error resubmitting application:', err);
      alert(err.response?.data?.error || 'Failed to resubmit application. Please try again.');
    }
  };

  const handleViewQuery = (app) => {
    setSelectedQueryApp(app);
    setQueryDialogOpen(true);
  };

  const handleCloseQueryDialog = () => {
    setQueryDialogOpen(false);
    setSelectedQueryApp(null);
  };

  const handleEditFromQuery = () => {
    if (selectedQueryApp) {
      handleCloseQueryDialog();
      handleEditApplication(selectedQueryApp.id || selectedQueryApp.application_id);
    }
  };

  const handleResolveQuery = async (app) => {
    if (!window.confirm('Have you made the necessary changes to your application? Clicking OK will resubmit it for admin review.')) {
      return;
    }

    try {
      await resolveQueryLoanApplication(app.id);
      alert('Query resolved! Your application has been resubmitted for review.');
      loadApplications(); // Reload to get updated status
    } catch (err) {
      console.error('Error resolving query:', err);
      alert(err.response?.data?.error || 'Failed to resolve query. Please try again.');
    }
  };

  const handleStartNewApplication = () => {
    // Generate a temporary ID for the new loan
    const tempLoanId = `new-${Date.now()}`;
    
    // Navigate directly to step 1
    // The LoanApp component will handle creating the actual loan when it loads
    navigate(`/loan/apply/${tempLoanId}/step-1`);
  };

  if (loading) {
    return (
      <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </MDBox>
    );
  }

  if (error) {
    return (
      <MDBox p={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5" color="error" mb={2}>
              {error}
            </MDTypography>
            <MDButton onClick={loadApplications} variant="gradient" color="info">
              Retry
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
    );
  }

  return (
    <MDBox p={3}>
      {/* Header */}
      <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h3" fontWeight="bold">
          My Loan Applications
        </MDTypography>
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleStartNewApplication}
        >
          + New Application
        </MDButton>
      </MDBox>

      {/* Status filter (dropdown) - restored to previous UX */}
      {summary && (
        <Grid container spacing={3} mb={3} alignItems="center">
          <Grid item>
            <VhoozhtSelect
              size="small"
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 220 }}
              options={[
                { value: 'all', label: `All (${summary.total})` },
                { value: 'draft', label: `Draft (${summary.draft})` },
                { value: 'pending', label: `Pending (${summary.pending})` },
                { value: 'query', label: `Under Review (${summary.query || summary.under_review || 0})` },
                { value: 'approved', label: `Approved (${summary.approved})` },
                { value: 'rejected', label: `Rejected (${summary.rejected})` }
              ]}
            />
          </Grid>
        </Grid>
      )}

      {/* Applications Table */}
      <Card>
        <MDBox p={3}>
          {filteredApplications.length === 0 ? (
            <MDBox textAlign="center" py={4}>
              <MDTypography variant="h5" color="text" mb={2}>
                No loan applications found
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>
                Start your first loan application now!
              </MDTypography>
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleStartNewApplication}
              >
                Apply for Loan
              </MDButton>
            </MDBox>
          ) : (
            <TableContainer sx={{
              '& .MuiTableCell-root': {
                whiteSpace: 'nowrap',
              },
              '& .MuiTableCell-root > *': {
                display: 'inline !important',
                width: 'auto !important',
              },
              '& .MuiTableCell-root .MuiBox-root': {
                display: 'inline-flex !important',
                width: 'auto !important',
              },
            }}>
              <Table sx={{ tableLayout: 'auto', width: '100%' }}>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id || app.application_id} hover>
                      <TableCell align="left">
                        <MDTypography variant="caption" fontWeight="medium">
                          {app.application_id?.toString().slice(0, 8)}...
                        </MDTypography>
                      </TableCell>
                      <TableCell align="left">
                        <MDTypography variant="caption">
                          {formatCurrency(app.amount)}
                        </MDTypography>
                      </TableCell>
                      <TableCell align="left">
                        <MDTypography variant="caption">
                          {app.vehicle_make && app.vehicle_model
                            ? `${app.vehicle_make} ${app.vehicle_model} ${app.vehicle_year || ''}`
                            : 'N/A'}
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={formatStatusLabel(app.status)}
                          color={getStatusColor(app.status)}
                          size="small"
                          onClick={app.status === 'query' ? () => handleViewQuery(app) : undefined}
                          icon={app.status === 'query' ? <InfoIcon /> : undefined}
                          sx={app.status === 'query' ? { cursor: 'pointer', '&:hover': { opacity: 0.8 } } : {}}
                        />
                      </TableCell>
                      <TableCell align="left">
                        <MDTypography variant="caption">
                          {formatDate(app.created_at)}
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDBox display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewApplication(app.id || app.application_id)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {app.status === 'draft' && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleEditApplication(app.id || app.application_id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleCancelApplication(app)}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {app.status === 'pending' && (
                            <Tooltip title="Cancel Application">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelApplication(app)}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {app.status === 'query' && (
                            <>
                              <Tooltip title="Edit Application">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleEditApplication(app.id || app.application_id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Resolve Query & Resubmit">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleResolveQuery(app)}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {app.status === 'rejected' && (
                            <>
                              <Tooltip title="Edit & Resubmit">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleEditApplication(app.id || app.application_id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Resubmit">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleResubmitApplication(app)}
                                >
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </MDBox>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MDBox>
      </Card>

      {/* Query Details Dialog */}
      <Dialog 
        open={queryDialogOpen} 
        onClose={handleCloseQueryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDBox display="flex" alignItems="center" gap={1}>
            <InfoIcon color="info" />
            <MDTypography variant="h5" fontWeight="bold">
              Additional Information Required
            </MDTypography>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox mb={2}>
            <MDTypography variant="body2" color="text" mb={1}>
              <strong>Application ID:</strong> {selectedQueryApp?.application_id?.toString().slice(0, 8)}...
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={1}>
              <strong>Loan Amount:</strong> {formatCurrency(selectedQueryApp?.amount)}
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={2}>
              <strong>Vehicle:</strong> {selectedQueryApp?.vehicle_make && selectedQueryApp?.vehicle_model
                ? `${selectedQueryApp.vehicle_make} ${selectedQueryApp.vehicle_model} ${selectedQueryApp.vehicle_year || ''}`
                : 'N/A'}
            </MDTypography>
          </MDBox>

          <MDBox 
            p={2} 
            bgcolor="grey.100" 
            borderRadius="8px"
            border="1px solid"
            borderColor="grey.300"
          >
            <MDTypography variant="button" fontWeight="bold" color="info" mb={1} display="block">
              Admin Query:
            </MDTypography>
            <MDTypography variant="body2" color="text" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedQueryApp?.query_notes?.note || 'We need additional information to process your application. Please review and update your application details.'}
            </MDTypography>
            {selectedQueryApp?.query_notes?.created_at && (
              <MDTypography variant="caption" color="text" mt={1} display="block">
                Raised on: {formatDate(selectedQueryApp.query_notes.created_at)}
              </MDTypography>
            )}
          </MDBox>

          <MDBox mt={2} p={2} bgcolor="info.main" sx={{ opacity: 0.1 }} borderRadius="8px">
            <MDTypography variant="body2" color="dark" fontWeight="medium">
              📝 Please edit your application to address the query, then click "Resolve & Resubmit" to send it back for review.
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseQueryDialog} color="secondary">
            Close
          </MDButton>
          <MDButton 
            onClick={handleEditFromQuery} 
            variant="gradient" 
            color="info"
            startIcon={<EditIcon />}
          >
            Edit Application
          </MDButton>
          <MDButton 
            onClick={() => {
              handleCloseQueryDialog();
              handleResolveQuery(selectedQueryApp);
            }} 
            variant="gradient" 
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Resolve & Resubmit
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

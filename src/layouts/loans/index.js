import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
// DriveCash unified form components
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import { formatters } from "utils/dataFormatters";
import SharedDashboardLayout from "components/SharedDashboardLayout";
import Footer from "examples/Footer";

import MyLoans from "loanApp/pages/MyLoans";

// Professional Loan Card Component - PRECISION ALIGNED
function LoanCard({ loan, onViewDetails, onMakePayment }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'completed': return '#2196f3';
      case 'overdue': return '#f44336';
      case 'rejected': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const calculateProgress = () => {
    if (loan.status === 'completed') return 100;
    if (loan.remainingBalance && loan.amount) {
      return ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
    }
    return 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Use central formatters for date display
  const formatDate = (date) => formatters.date(date);

  return (
    <Card
      sx={{
        p: 3,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(getStatusColor(loan.status), 0.3)}`,
        },
        background: `linear-gradient(135deg, ${alpha(getStatusColor(loan.status), 0.08)} 0%, ${alpha(getStatusColor(loan.status), 0.03)} 100%)`,
        border: `1px solid ${alpha(getStatusColor(loan.status), 0.2)}`,
      }}
    >
      <MDBox display="flex" gap={2} alignItems="flex-start">
        <Avatar sx={{ bgcolor: getStatusColor(loan.status), width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon fontSize="medium" sx={{ color: 'white' }}>account_balance</Icon>
        </Avatar>

        <MDBox flex={1}>
          <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <MDBox>
              <MDTypography variant="h6" fontWeight="bold" color="text">
                {formatCurrency(loan.amount)}
              </MDTypography>
              <MDTypography variant="caption" color="text" opacity={0.7}>
                Applied: {loan.appliedDate ? formatDate(loan.appliedDate) : 'N/A'} • ID: {loan.id}
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                {loan.type}
              </MDTypography>
            </MDBox>

            <Chip
              label={loan.status.toUpperCase()}
              size="small"
              sx={{ bgcolor: getStatusColor(loan.status), color: '#fff', fontSize: '0.75rem' }}
            />
          </MDBox>

          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <MDBox>
              <MDTypography variant="caption" color="text" opacity={0.7}>
                Monthly: {formatCurrency(loan.monthlyPayment)}
              </MDTypography>
              <MDTypography variant="caption" color="text" opacity={0.7} display="block">
                Remaining: {formatCurrency(loan.remainingBalance)}
              </MDTypography>
            </MDBox>

            <MDBox textAlign="right">
              <MDTypography variant="caption" color="text" opacity={0.7}>
                Rate: {loan.interestRate}% APR
              </MDTypography>
              <MDTypography variant="caption" color="text" opacity={0.7} display="block">
                Due: {loan.nextDueDate ? formatDate(loan.nextDueDate) : 'N/A'}
              </MDTypography>
            </MDBox>
          </MDBox>

          {loan.status !== 'pending' && loan.status !== 'rejected' && (
            <MDBox mt={2}>
              <MDBox display="flex" justifyContent="space-between" mb={1}>
                <MDTypography variant="caption" fontWeight="medium">
                  Loan Progress
                </MDTypography>
                <MDTypography variant="caption" fontWeight="bold">
                  {calculateProgress().toFixed(1)}% Complete
                </MDTypography>
              </MDBox>
              <LinearProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(getStatusColor(loan.status), 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(loan.status),
                    borderRadius: 3,
                  }
                }}
              />
            </MDBox>
          )}

          <MDBox display="flex" gap={1} mt={2}>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={(e) => { e.stopPropagation(); onViewDetails(loan); }}
              startIcon={<Icon>visibility</Icon>}
            >
              Details
            </MDButton>

            {loan.status === 'active' && (
              <MDButton
                variant="gradient"
                color="success"
                size="small"
                onClick={(e) => { e.stopPropagation(); onMakePayment(loan); }}
                startIcon={<Icon>payment</Icon>}
              >
                Pay Now
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Loan Details Dialog Component
function LoanDetailsDialog({ loan, open, onClose }) {
  if (!loan) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const paymentHistory = [
    { date: '2025-08-15', amount: 850, status: 'completed', method: 'Bank Transfer' },
    { date: '2025-07-15', amount: 850, status: 'completed', method: 'Credit Card' },
    { date: '2025-06-15', amount: 850, status: 'completed', method: 'Bank Transfer' },
    { date: '2025-05-15', amount: 850, status: 'completed', method: 'Bank Transfer' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDBox display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
              <Icon>account_balance</Icon>
            </Avatar>
            <MDBox>
              <MDTypography variant="h5" fontWeight="bold">
                {loan.type} Details
              </MDTypography>
              <MDTypography variant="caption" color="text">
                ID: {loan.id} • Applied: {formatters.date(loan.appliedDate)}
              </MDTypography>
            </MDBox>
          </MDBox>
          <IconButton onClick={onClose}>
            <Icon>close</Icon>
          </IconButton>
        </MDBox>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Loan Summary */}
          <Grid item xs={12}>
            <Card sx={{ p: 3, mb: 3 }}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                Loan Summary
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MDTypography variant="body2" color="text" opacity={0.8}>Original Amount:</MDTypography>
                  <MDTypography variant="h6" fontWeight="bold">{formatCurrency(loan.amount)}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="body2" color="text" opacity={0.8}>Remaining Balance:</MDTypography>
                  <MDTypography variant="h6" fontWeight="bold" color={loan.remainingBalance > 0 ? "error" : "success"}>
                    {formatCurrency(loan.remainingBalance)}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="body2" color="text" opacity={0.8}>Monthly Extension:</MDTypography>
                  <MDTypography variant="h6" fontWeight="bold">{formatCurrency(loan.monthlyPayment)}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="body2" color="text" opacity={0.8}>Interest Rate:</MDTypography>
                  <MDTypography variant="h6" fontWeight="bold">{loan.interestRate}% APR</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="body2" color="text" opacity={0.8}>Loan Term:</MDTypography>
                  <MDTypography variant="h6" fontWeight="bold">{loan.term} months</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="body2" color="text" opacity={0.8}>Next Payment:</MDTypography>
                  <MDTypography variant="h6" fontWeight="bold">
                    {loan.nextDueDate ? formatters.date(loan.nextDueDate) : 'N/A'}
                  </MDTypography>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Payment History */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                Payment History
              </MDTypography>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table sx={{ '& td, & th': { verticalAlign: 'middle' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell><MDTypography variant="caption" fontWeight="bold">Date</MDTypography></TableCell>
                      <TableCell><MDTypography variant="caption" fontWeight="bold">Amount</MDTypography></TableCell>
                      <TableCell><MDTypography variant="caption" fontWeight="bold">Method</MDTypography></TableCell>
                      <TableCell><MDTypography variant="caption" fontWeight="bold">Status</MDTypography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistory.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <MDBox minHeight="48px" display="flex" alignItems="center">
                            <MDTypography variant="body2">{formatters.date(payment.date)}</MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell>
                          <MDBox minHeight="48px" display="flex" alignItems="center">
                            <MDTypography variant="body2">{formatCurrency(payment.amount)}</MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell>
                          <MDBox minHeight="48px" display="flex" alignItems="center">
                            <MDTypography variant="body2">{payment.method}</MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell>
                          <MDBox minHeight="48px" display="flex" alignItems="center">
                            <Chip
                              label={payment.status}
                              color="success"
                              size="small"
                            />
                          </MDBox>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Loans Dashboard Component
function LoansDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Mock enhanced loan data - cleared for production
    const mockLoans = [];

    setTimeout(() => {
      setLoans(mockLoans);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setDetailsDialogOpen(true);
  };

  const handleMakePayment = (loan) => {
    navigate('/payments', { state: { loanId: loan.id } });
  };

  // Filter loans based on selected filter
  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  // Memoize tab components to prevent unnecessary remounting
  const MyLoansTab = React.useMemo(() => <MyLoans />, []);

  return (
    <SharedDashboardLayout>
      <MDBox py={3} display="flex" flexDirection="column" alignItems="center" width="100%">
        {/* Header */}
        <MDBox mb={4} textAlign="center" width="100%">
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={1} align="center">
            Loan Management 💳
          </MDTypography>
          <MDTypography variant="body1" color="text" opacity={0.7} align="center">
            Manage your loans, track payments, and apply for new financing.
          </MDTypography>
        </MDBox>
        
        <MDBox width="100%" maxWidth={900} mx="auto">
          {MyLoansTab}
        </MDBox>
      </MDBox>
      
      {/* Loan Details Dialog */}
      <LoanDetailsDialog
        loan={selectedLoan}
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
      />
      
      <Footer />
  </SharedDashboardLayout>
  );
}

function UnifiedLoans() {
  return <LoansDashboard />;
}

export default UnifiedLoans;

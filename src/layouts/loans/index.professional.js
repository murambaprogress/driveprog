import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
// import TextField from "@mui/material/TextField"; // Replaced with VhoozhtInput
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { formatters } from "utils/dataFormatters";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import LoanApplication from "layouts/loanApply";
import MyLoans from "loanApp/pages/MyLoans";

// Professional Loan Card Component
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
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
  return formatters.date(date);
  };

  return (
    <Card
      sx={{
        p: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(getStatusColor(loan.status), 0.3)}`,
        },
        background: `linear-gradient(135deg, ${alpha(getStatusColor(loan.status), 0.08)} 0%, ${alpha(getStatusColor(loan.status), 0.03)} 100%)`,
        border: `1px solid ${alpha(getStatusColor(loan.status), 0.2)}`,
      }}
    >
      {/* Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <MDBox display="flex" alignItems="center">
          <Avatar
            sx={{
              bgcolor: getStatusColor(loan.status),
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            <Icon fontSize="large" sx={{ color: 'white' }}>account_balance</Icon>
          </Avatar>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" color="text">
              {loan.type}
            </MDTypography>
            <MDTypography variant="caption" color="text" opacity={0.7}>
              Loan ID: {loan.id}
            </MDTypography>
            <MDBox display="flex" alignItems="center" mt={0.5}>
              <Chip 
                label={loan.status.toUpperCase()} 
                sx={{
                  bgcolor: getStatusColor(loan.status),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
                size="small"
              />
            </MDBox>
          </MDBox>
        </MDBox>
        
        <MDBox textAlign="right">
          <MDTypography variant="h4" fontWeight="bold" color="text">
            {formatCurrency(loan.amount)}
          </MDTypography>
          <MDTypography variant="caption" color="text" opacity={0.7}>
            Original Amount
          </MDTypography>
        </MDBox>
      </MDBox>

      <Divider sx={{ mb: 3 }} />

      {/* Loan Details Grid */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6}>
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="medium" opacity={0.8}>
              Monthly Extension
            </MDTypography>
            <MDTypography variant="h6" fontWeight="bold" color="text">
              {formatCurrency(loan.monthlyPayment)}
            </MDTypography>
          </MDBox>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="medium" opacity={0.8}>
              Remaining Balance
            </MDTypography>
            <MDTypography variant="h6" fontWeight="bold" color={loan.remainingBalance > 0 ? "error" : "success"}>
              {formatCurrency(loan.remainingBalance)}
            </MDTypography>
          </MDBox>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="medium" opacity={0.8}>
              Interest Rate
            </MDTypography>
            <MDTypography variant="h6" fontWeight="bold" color="text">
              {loan.interestRate}% APR
            </MDTypography>
          </MDBox>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <MDBox>
            <MDTypography variant="caption" color="text" fontWeight="medium" opacity={0.8}>
              Next Payment Due
            </MDTypography>
            <MDTypography variant="h6" fontWeight="bold" color={loan.status === 'overdue' ? "error" : "text"}>
              {loan.nextDueDate ? formatDate(loan.nextDueDate) : 'N/A'}
            </MDTypography>
          </MDBox>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      {loan.status !== 'pending' && loan.status !== 'rejected' && (
        <MDBox mb={3}>
          <MDBox display="flex" justifyContent="space-between" mb={1}>
            <MDTypography variant="body2" fontWeight="medium">
              Loan Progress
            </MDTypography>
            <MDTypography variant="body2" fontWeight="bold">
              {calculateProgress().toFixed(1)}% Complete
            </MDTypography>
          </MDBox>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(getStatusColor(loan.status), 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(loan.status),
                borderRadius: 4,
              }
            }}
          />
        </MDBox>
      )}

      {/* Action Buttons */}
      <MDBox display="flex" gap={2} mt={3}>
        <MDButton
          variant="outlined"
          color="primary"
          fullWidth
          onClick={() => onViewDetails(loan)}
          startIcon={<Icon>visibility</Icon>}
          sx={{ px: 3, py: 1.5 }}
        >
          View Details
        </MDButton>
        
        {loan.status === 'active' && (
          <MDButton
            variant="gradient"
            color="success"
            fullWidth
            onClick={() => onMakePayment(loan)}
            startIcon={<Icon>payment</Icon>}
            sx={{ px: 3, py: 1.5 }}
          >
            Make Payment
          </MDButton>
        )}
        
        {loan.status === 'pending' && (
          <MDButton
            variant="outlined"
            color="warning"
            fullWidth
            disabled
            startIcon={<Icon>hourglass_empty</Icon>}
            sx={{ px: 3, py: 1.5 }}
          >
            Under Review
          </MDButton>
        )}
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
                <Table>
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
                        <TableCell>{formatters.date(payment.date)}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color="success"
                            size="small"
                          />
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
  const [activeTab, setActiveTab] = useState(0);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock enhanced loan data
    const mockLoans = [
      {
        id: "LN001",
        amount: 25000,
        type: "Personal Loan",
        status: "active",
        monthlyPayment: 850,
        remainingBalance: 18500,
        nextDueDate: "2025-09-15",
        interestRate: 8.5,
        term: 36,
        appliedDate: "2024-12-15"
      },
      {
        id: "LN002",
        amount: 50000,
        type: "Business Loan",
        status: "pending",
        monthlyPayment: 0,
        remainingBalance: 50000,
        nextDueDate: null,
        interestRate: 12.5,
        term: 60,
        appliedDate: "2025-08-20"
      },
      {
        id: "LN003",
        amount: 15000,
        type: "Auto Loan",
        status: "completed",
        monthlyPayment: 0,
        remainingBalance: 0,
        nextDueDate: null,
        interestRate: 6.9,
        term: 48,
        appliedDate: "2023-06-10"
      },
    ];

    setTimeout(() => {
      setLoans(mockLoans);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setDetailsDialogOpen(true);
  };

  const handleMakePayment = (loan) => {
    navigate('/payments', { state: { loanId: loan.id } });
  };

  // Memoize tab components to prevent unnecessary remounting
  const MyLoansTab = React.useMemo(() => <MyLoans />, []);

  const ApplyForLoanTab = React.useMemo(() => (
    <MDBox>
      <LoanApplication />
    </MDBox>
  ), []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
            Loan Management 💳
          </MDTypography>
          <MDTypography variant="body1" color="text" opacity={0.7}>
            Manage your loans, track payments, and apply for new financing.
          </MDTypography>
        </MDBox>

        {/* Tabs */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
                minHeight: 64,
              }
            }}
          >
            <Tab 
              label="My Loans" 
              icon={<Icon>account_balance</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label="Apply for Loan" 
              icon={<Icon>add_circle</Icon>} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {activeTab === 0 && MyLoansTab}
        {activeTab === 1 && ApplyForLoanTab}
      </MDBox>
      
      {/* Loan Details Dialog */}
      <LoanDetailsDialog
        loan={selectedLoan}
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
      />
      
      <Footer />
    </DashboardLayout>
  );
}

function UnifiedLoans() {
  return <LoansDashboard />;
}

export default UnifiedLoans;

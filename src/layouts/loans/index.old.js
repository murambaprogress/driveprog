import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";

// Date/Time Formatters
import { formatCurrency, formatters } from "../../utils/dataFormatters";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import LoanApplication from "layouts/loanApply";

// Unified Loan Dashboard Component
function LoansDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - replace with actual API call
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
        interestRate: 12.0,
        term: 60,
        appliedDate: "2025-08-28"
      }
    ];
    
    setTimeout(() => {
      setLoans(mockLoans);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'active': '#4caf50',
      'pending': '#ff9800',
      'approved': '#2196f3',
      'rejected': '#f44336',
      'completed': '#9c27b0'
    };
    return colors[status] || '#757575';
  };

  const LoanCard = ({ loan }) => (
    <Card sx={{ 
      p: 3, 
      transition: 'all 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-2px)', 
        boxShadow: 6 
      },
      border: `2px solid ${alpha(getStatusColor(loan.status), 0.2)}`,
    }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <MDBox display="flex" alignItems="center">
          <Avatar
            sx={{
              bgcolor: getStatusColor(loan.status),
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            <Icon fontSize="medium">account_balance</Icon>
          </Avatar>
          <MDBox>
            <MDTypography variant="h6" fontWeight="bold">
              {loan.type}
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.8}>
              Loan ID: {loan.id}
            </MDTypography>
          </MDBox>
        </MDBox>
        
        <Chip
          label={loan.status}
          sx={{
            bgcolor: alpha(getStatusColor(loan.status), 0.1),
            color: getStatusColor(loan.status),
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}
        />
      </MDBox>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Loan Amount
          </MDTypography>
          <MDTypography variant="h6" fontWeight="bold" color="text">
            ${loan.amount.toLocaleString()}
          </MDTypography>
        </Grid>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            {loan.status === 'active' ? 'Remaining Balance' : 'Applied Amount'}
          </MDTypography>
          <MDTypography variant="h6" fontWeight="bold" color="text">
            ${loan.remainingBalance.toLocaleString()}
          </MDTypography>
        </Grid>
      </Grid>

      {loan.status === 'active' && (
        <>
          <MDBox mb={2}>
            <MDTypography variant="caption" color="text" opacity={0.8} mb={1}>
              Loan Progress
            </MDTypography>
            <LinearProgress
              variant="determinate"
              value={((loan.amount - loan.remainingBalance) / loan.amount) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(getStatusColor(loan.status), 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getStatusColor(loan.status),
                },
              }}
            />
          </MDBox>
          
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <MDTypography variant="caption" color="text" opacity={0.8}>
                Monthly Payment
              </MDTypography>
              <MDTypography variant="body1" fontWeight="medium">
                ${loan.monthlyPayment.toLocaleString()}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="caption" color="text" opacity={0.8}>
                Next Due Date
              </MDTypography>
              <MDTypography variant="body1" fontWeight="medium">
                {formatters.date(loan.nextDueDate)}
              </MDTypography>
            </Grid>
          </Grid>
        </>
      )}

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Interest Rate
          </MDTypography>
          <MDTypography variant="body1" fontWeight="medium">
            {loan.interestRate}%
          </MDTypography>
        </Grid>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Term
          </MDTypography>
          <MDTypography variant="body1" fontWeight="medium">
            {loan.term} months
          </MDTypography>
        </Grid>
      </Grid>

      <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <MDTypography variant="caption" color="text" opacity={0.6}>
          Applied: {formatters.date(loan.appliedDate)}
        </MDTypography>
        
        <MDBox display="flex" gap={1}>
          <MDButton 
            variant="outlined" 
            size="small" 
            color="info"
            onClick={() => navigate(`/loans/${loan.id}`)}
          >
            View Details
          </MDButton>
          {loan.status === 'active' && (
            <MDButton 
              variant="contained" 
              size="small" 
              color="success"
              onClick={() => navigate(`/payments?loanId=${loan.id}`)}
            >
              Make Payment
            </MDButton>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );

  const QuickActions = () => (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, textAlign: 'center', '&:hover': { transform: 'translateY(-2px)' } }}>
          <Avatar sx={{ bgcolor: '#2196f3', width: 60, height: 60, mx: 'auto', mb: 2 }}>
            <Icon fontSize="large">add_circle</Icon>
          </Avatar>
          <MDTypography variant="h6" mb={1}>Apply for New Loan</MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.8} mb={2}>
            Start a new loan application process
          </MDTypography>
          <MDButton 
            variant="contained" 
            color="info" 
            fullWidth
            onClick={() => setActiveTab(1)}
          >
            Apply Now
          </MDButton>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, textAlign: 'center', '&:hover': { transform: 'translateY(-2px)' } }}>
          <Avatar sx={{ bgcolor: '#4caf50', width: 60, height: 60, mx: 'auto', mb: 2 }}>
            <Icon fontSize="large">calculate</Icon>
          </Avatar>
          <MDTypography variant="h6" mb={1}>Loan Calculator</MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.8} mb={2}>
            Calculate loan payments and terms
          </MDTypography>
          <MDButton 
            variant="contained" 
            color="success" 
            fullWidth
            onClick={() => navigate('/calculator')}
          >
            Calculate
          </MDButton>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, textAlign: 'center', '&:hover': { transform: 'translateY(-2px)' } }}>
          <Avatar sx={{ bgcolor: '#ff9800', width: 60, height: 60, mx: 'auto', mb: 2 }}>
            <Icon fontSize="large">payment</Icon>
          </Avatar>
          <MDTypography variant="h6" mb={1}>Payment History</MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.8} mb={2}>
            View all your payment records
          </MDTypography>
          <MDButton 
            variant="contained" 
            color="warning" 
            fullWidth
            onClick={() => navigate('/payments')}
          >
            View History
          </MDButton>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <>
      <MDBox mb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold" color="text">
              Loans Management
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.8}>
              Manage your loans, applications, and payment history
            </MDTypography>
          </MDBox>
        </MDBox>

        {activeTab === 0 && (
          <>
            <QuickActions />
            
            {/* Loan Summary Stats */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <MDTypography variant="h4" fontWeight="bold" color="info">
                    {loans.length}
                  </MDTypography>
                  <MDTypography variant="caption">Total Loans</MDTypography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <MDTypography variant="h4" fontWeight="bold" color="success">
                    {loans.filter(l => l.status === 'active').length}
                  </MDTypography>
                  <MDTypography variant="caption">Active Loans</MDTypography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <MDTypography variant="h4" fontWeight="bold" color="warning">
                    {loans.filter(l => l.status === 'pending').length}
                  </MDTypography>
                  <MDTypography variant="caption">Pending Applications</MDTypography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <MDTypography variant="h4" fontWeight="bold" color="text">
                    ${loans.reduce((sum, loan) => sum + (loan.status === 'active' ? loan.monthlyPayment : 0), 0).toLocaleString()}
                  </MDTypography>
                  <MDTypography variant="caption">Monthly Payments</MDTypography>
                </Card>
              </Grid>
            </Grid>

            {/* Loans List */}
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={3}>Your Loans</MDTypography>
              {loading ? (
                <LinearProgress />
              ) : loans.length > 0 ? (
                <Grid container spacing={3}>
                  {loans.map((loan) => (
                    <Grid item xs={12} lg={6} key={loan.id}>
                      <LoanCard loan={loan} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <MDBox textAlign="center" py={4}>
                  <Icon fontSize="large" sx={{ color: 'text.secondary', mb: 2 }}>
                    account_balance
                  </Icon>
                  <MDTypography variant="h6" color="text" opacity={0.6} mb={1}>
                    No loans found
                  </MDTypography>
                  <MDTypography variant="body2" color="text" opacity={0.4} mb={2}>
                    Start by applying for your first loan
                  </MDTypography>
                  <MDButton variant="contained" onClick={() => setActiveTab(1)}>
                    Apply for Loan
                  </MDButton>
                </MDBox>
              )}
            </Card>
          </>
        )}
      </MDBox>
    </>
  );
}

function UnifiedLoans() {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
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
        
        {activeTab === 0 && <LoansDashboard />}
        {activeTab === 1 && <LoanApplication />}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UnifiedLoans;

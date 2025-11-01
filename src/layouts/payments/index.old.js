import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";

// Date/Time Formatters
import { formatCurrency, formatters } from "../../utils/dataFormatters";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function UnifiedPayments() {
  const [activeTab, setActiveTab] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock payment data
    const mockPayments = [];
    
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#4caf50',
      'pending': '#ff9800',
      'failed': '#f44336',
      'processing': '#2196f3'
    };
    return colors[status] || '#757575';
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const PaymentCard = ({ payment }) => (
    <Card sx={{ 
      p: 3, 
      transition: 'all 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-2px)', 
        boxShadow: 6 
      },
      border: `2px solid ${alpha(getStatusColor(payment.status), 0.2)}`,
    }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <MDBox display="flex" alignItems="center">
          <Avatar
            sx={{
              bgcolor: getStatusColor(payment.status),
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            <Icon fontSize="medium">payment</Icon>
          </Avatar>
          <MDBox>
            <MDTypography variant="h6" fontWeight="bold">
              ${payment.amount.toLocaleString()}
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.8}>
              {payment.type} - {payment.id}
            </MDTypography>
          </MDBox>
        </MDBox>
        
        <Chip
          label={payment.status}
          sx={{
            bgcolor: alpha(getStatusColor(payment.status), 0.1),
            color: getStatusColor(payment.status),
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}
        />
      </MDBox>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Loan ID
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            {payment.loanId}
          </MDTypography>
        </Grid>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Payment Date
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            {formatters.date(payment.date)}
          </MDTypography>
        </Grid>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Payment Method
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            {payment.method}
          </MDTypography>
        </Grid>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Reference
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            {payment.reference}
          </MDTypography>
        </Grid>
      </Grid>

      <MDBox display="flex" justifyContent="flex-end" mt={2}>
        <MDButton variant="outlined" size="small" color="info">
          View Receipt
        </MDButton>
      </MDBox>
    </Card>
  );

  const PaymentHistory = () => (
    <>
      {/* Filter Controls */}
      <Card sx={{ p: 3, mb: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6" fontWeight="medium">
            Payment History
          </MDTypography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Payments</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
            </Select>
          </FormControl>
        </MDBox>
      </Card>

      {/* Payment Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <MDTypography variant="h4" fontWeight="bold" color="info">
              {payments.length}
            </MDTypography>
            <MDTypography variant="caption">Total Payments</MDTypography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <MDTypography variant="h4" fontWeight="bold" color="success">
              ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </MDTypography>
            <MDTypography variant="caption">Completed Payments</MDTypography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <MDTypography variant="h4" fontWeight="bold" color="warning">
              {payments.filter(p => p.status === 'pending').length}
            </MDTypography>
            <MDTypography variant="caption">Pending Payments</MDTypography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <MDTypography variant="h4" fontWeight="bold" color="text">
              ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </MDTypography>
            <MDTypography variant="caption">Total Amount</MDTypography>
          </Card>
        </Grid>
      </Grid>

      {/* Payments List */}
      {loading ? (
        <LinearProgress />
      ) : filteredPayments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredPayments.map((payment) => (
            <Grid item xs={12} md={6} lg={4} key={payment.id}>
              <PaymentCard payment={payment} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Icon fontSize="large" sx={{ color: 'text.secondary', mb: 2 }}>
            payment
          </Icon>
          <MDTypography variant="h6" color="text" opacity={0.6} mb={1}>
            No payments found
          </MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.4}>
            {filter === 'all' ? 'You haven\'t made any payments yet' : `No ${filter} payments found`}
          </MDTypography>
        </Card>
      )}
    </>
  );

  const MakePayment = () => (
    <Card sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <MDTypography variant="h5" fontWeight="bold" mb={3}>
        Make a Payment
      </MDTypography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Select Loan</InputLabel>
            <Select label="Select Loan">
              <MenuItem value="LN001">Personal Loan - LN001</MenuItem>
              <MenuItem value="LN002">Business Loan - LN002</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Payment Amount"
            type="number"
            fullWidth
            placeholder="Enter amount"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select label="Payment Method">
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="credit_card">Credit Card</MenuItem>
              <MenuItem value="debit_card">Debit Card</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Payment Note (Optional)"
            multiline
            rows={3}
            fullWidth
            placeholder="Add a note for this payment"
          />
        </Grid>
        
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="flex-end" gap={2}>
            <MDButton variant="outlined">
              Cancel
            </MDButton>
            <MDButton variant="contained" color="success">
              Process Payment
            </MDButton>
          </MDBox>
        </Grid>
      </Grid>
    </Card>
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" color="text">
            Payments Management
          </MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.8}>
            View payment history and make new payments
          </MDTypography>
        </MDBox>

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
              label="Payment History" 
              icon={<Icon>history</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label="Make Payment" 
              icon={<Icon>payment</Icon>} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {activeTab === 0 && <PaymentHistory />}
        {activeTab === 1 && <MakePayment />}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UnifiedPayments;

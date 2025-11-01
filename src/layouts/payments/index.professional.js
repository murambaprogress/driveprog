import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms";
// import Select from "@mui/material/Select"; // Replaced with VhoozhtSelect
// import MenuItem from "@mui/material/MenuItem"; // Replaced with VhoozhtSelect options
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
// import InputLabel from "@mui/material/InputLabel"; // Replaced with VhoozhtSelect
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { alpha } from "@mui/material/styles";
import { EnhancedCard, DataCard, ResponsiveGrid } from "components/EnhancedCard";
import EnhancedTable from "components/EnhancedTable";
import { formatters } from "utils/dataFormatters";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Professional Payment Card Component
function PaymentCard({ payment, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'failed': return '#f44336';
      case 'cancelled': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getPaymentIcon = (type) => {
    switch (type) {
  case 'Monthly Extension': return 'schedule';
      case 'Principal Payment': return 'trending_down';
      case 'Late Fee': return 'warning';
      case 'Interest Payment': return 'percent';
      default: return 'payment';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
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
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${alpha(getStatusColor(payment.status), 0.25)}`,
        },
        background: `linear-gradient(135deg, ${alpha(getStatusColor(payment.status), 0.08)} 0%, ${alpha(getStatusColor(payment.status), 0.03)} 100%)`,
        border: `1px solid ${alpha(getStatusColor(payment.status), 0.2)}`,
      }}
      onClick={() => onViewDetails(payment)}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
        <MDBox display="flex" alignItems="center" flex={1}>
          <Avatar
            sx={{
              bgcolor: getStatusColor(payment.status),
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            <Icon fontSize="medium" sx={{ color: 'white' }}>{getPaymentIcon(payment.type)}</Icon>
          </Avatar>
          
          <MDBox flex={1}>
            <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <MDBox>
                <MDTypography variant="h6" fontWeight="bold" color="text">
                  {formatCurrency(payment.amount)}
                </MDTypography>
                <MDTypography variant="body2" color="text" opacity={0.7}>
                  {payment.type === 'Monthly Payment' ? 'Monthly Extension' : payment.type}
                </MDTypography>
              </MDBox>
              
              <Chip 
                label={payment.status.toUpperCase()} 
                sx={{
                  bgcolor: getStatusColor(payment.status),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
                size="small"
              />
            </MDBox>
            
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <MDBox>
                <MDTypography variant="caption" color="text" opacity={0.7}>
                  Loan: {payment.loanId}
                </MDTypography>
                <MDTypography variant="caption" color="text" opacity={0.7} display="block">
                  Method: {payment.method}
                </MDTypography>
              </MDBox>
              
              <MDBox textAlign="right">
                <MDTypography variant="caption" color="text" opacity={0.7}>
                  {formatters.date(payment.date)}
                </MDTypography>
                <MDTypography variant="caption" color="text" opacity={0.7} display="block">
                  Ref: {payment.reference}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Payment Details Dialog Component
function PaymentDetailsDialog({ payment, open, onClose }) {
  if (!payment) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
            <Icon>receipt</Icon>
          </Avatar>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">
              Payment Details
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Transaction ID: {payment.reference}
            </MDTypography>
          </MDBox>
        </MDBox>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text" opacity={0.8}>Amount</MDTypography>
                  <MDTypography variant="h5" fontWeight="bold">{formatCurrency(payment.amount)}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text" opacity={0.8}>Status</MDTypography>
                  <Chip 
                    label={payment.status.toUpperCase()} 
                    color={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text" opacity={0.8}>Payment Type</MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">{payment.type}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text" opacity={0.8}>Payment Method</MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">{payment.method}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text" opacity={0.8}>Date</MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">
                    {formatters.datetime(payment.date)}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text" opacity={0.8}>Loan ID</MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">{payment.loanId}</MDTypography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <MDButton variant="outlined" color="primary" onClick={onClose} sx={{ px: 3, py: 1.5 }}>
          Close
        </MDButton>
        <MDButton variant="gradient" color="success" startIcon={<Icon>download</Icon>} sx={{ px: 3, py: 1.5 }}>
          Download Receipt
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

// Make Payment Form Component
function MakePaymentForm({ selectedLoanId }) {
  const [formData, setFormData] = useState({
    loanId: selectedLoanId || '',
    amount: '',
    paymentType: 'monthly',
    paymentMethod: 'bank_transfer',
    accountNumber: '',
    routingNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [availableLoans] = useState([
    { id: 'LN001', type: 'Personal Loan', monthlyPayment: 850, balance: 18500 },
    { id: 'LN002', type: 'Business Loan', monthlyPayment: 1200, balance: 50000 },
  ]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPayment = () => {
    // Validation
    if (!formData.loanId || !formData.amount) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    // Mock payment processing
    setSnackbar({ open: true, message: 'Payment submitted successfully! Processing may take 1-2 business days.', severity: 'success' });
    
    // Reset form
    setFormData({
      loanId: '',
      amount: '',
      paymentType: 'monthly',
      paymentMethod: 'bank_transfer',
      accountNumber: '',
      routingNumber: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  };

  const selectedLoan = availableLoans.find(loan => loan.id === formData.loanId);

  return (
    <MDBox>
      <Grid container spacing={3}>
        {/* Payment Form */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4 }}>
            <MDTypography variant="h5" fontWeight="bold" mb={3}>
              Make a Payment
            </MDTypography>
            
            <Grid container spacing={3}>
              {/* Loan Selection */}
              <Grid item xs={12}>
                <VhoozhtSelect
                  fullWidth
                  label="Select Loan"
                  value={formData.loanId}
                  onChange={(e) => handleInputChange('loanId', e.target.value)}
                  options={availableLoans.map(loan => ({
                    value: loan.id,
                    label: `${loan.id} - ${loan.type} (Balance: ${formatCurrency(loan.balance)})`
                  }))}
                />
              </Grid>

              {/* Payment Type */}
              <Grid item xs={12} sm={6}>
                <VhoozhtSelect
                  fullWidth
                  label="Payment Type"
                  value={formData.paymentType}
                  onChange={(e) => handleInputChange('paymentType', e.target.value)}
                  options={[
                    { value: "monthly", label: "Monthly Extension" },
                    { value: "principal", label: "Principal Payment" },
                    { value: "full", label: "Full Payment" },
                    { value: "custom", label: "Custom Amount" }
                  ]}
                />
              </Grid>

              {/* Payment Amount */}
              <Grid item xs={12} sm={6}>
                <VhoozhtInput
                  fullWidth
                  label="Payment Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder={selectedLoan && formData.paymentType === 'monthly' ? 
                    formatCurrency(selectedLoan.monthlyPayment) : '0.00'}
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>

              {/* Payment Method */}
              <Grid item xs={12}>
                <VhoozhtSelect
                  fullWidth
                  label="Payment Method"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  options={[
                    { value: "bank_transfer", label: "Bank Transfer" },
                    { value: "credit_card", label: "Credit Card" },
                    { value: "debit_card", label: "Debit Card" },
                    { value: "ach", label: "ACH Transfer" }
                  ]}
                />
              </Grid>

              {/* Payment Method Specific Fields */}
              {(formData.paymentMethod === 'bank_transfer' || formData.paymentMethod === 'ach') && (
                <>
                  <Grid item xs={12} sm={6}>
                    <VhoozhtInput
                      fullWidth
                      label="Account Number"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <VhoozhtInput
                      fullWidth
                      label="Routing Number"
                      value={formData.routingNumber}
                      onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                    />
                  </Grid>
                </>
              )}

              {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
                <>
                  <Grid item xs={12}>
                    <VhoozhtInput
                      fullWidth
                      label="Card Number"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <VhoozhtInput
                      fullWidth
                      label="Expiry Date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <VhoozhtInput
                      fullWidth
                      label="CVV"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      placeholder="123"
                    />
                  </Grid>
                </>
              )}

              {/* Payment Date */}
              <Grid item xs={12} sm={6}>
                <VhoozhtInput
                  fullWidth
                  label="Payment Date"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <MDBox mt={4} display="flex" justifyContent="flex-end" gap={2}>
              <MDButton variant="outlined" color="primary" sx={{ px: 3, py: 1.5 }}>
                Save as Draft
              </MDButton>
              <MDButton 
                variant="gradient" 
                color="success"
                onClick={handleSubmitPayment}
                startIcon={<Icon>payment</Icon>}
                sx={{ px: 3, py: 1.5 }}
              >
                Submit Payment
              </MDButton>
            </MDBox>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 24 }}>
            <MDTypography variant="h6" fontWeight="bold" mb={3}>
              Payment Summary
            </MDTypography>
            
            {selectedLoan ? (
              <MDBox>
                <MDBox display="flex" justifyContent="space-between" mb={2}>
                  <MDTypography variant="body2" color="text">Loan:</MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">{selectedLoan.id}</MDTypography>
                </MDBox>
                
                <MDBox display="flex" justifyContent="space-between" mb={2}>
                  <MDTypography variant="body2" color="text">Type:</MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">{selectedLoan.type}</MDTypography>
                </MDBox>
                
                <MDBox display="flex" justifyContent="space-between" mb={2}>
                  <MDTypography variant="body2" color="text">Current Balance:</MDTypography>
                  <MDTypography variant="body2" fontWeight="medium" color="error">
                    {formatCurrency(selectedLoan.balance)}
                  </MDTypography>
                </MDBox>

                <Divider sx={{ my: 2 }} />
                
                <MDBox display="flex" justifyContent="space-between" mb={2}>
                  <MDTypography variant="body1" fontWeight="bold">Payment Amount:</MDTypography>
                  <MDTypography variant="h6" fontWeight="bold" color="success">
                    {formData.amount ? formatCurrency(parseFloat(formData.amount)) : '$0.00'}
                  </MDTypography>
                </MDBox>
                
                {formData.amount && (
                  <MDBox display="flex" justifyContent="space-between" mb={2}>
                    <MDTypography variant="body2" color="text">New Balance:</MDTypography>
                    <MDTypography variant="body2" fontWeight="medium">
                      {formatCurrency(selectedLoan.balance - parseFloat(formData.amount))}
                    </MDTypography>
                  </MDBox>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  Payment will be processed within 1-2 business days. You'll receive a confirmation email once completed.
                </Alert>
              </MDBox>
            ) : (
              <MDBox textAlign="center" py={4}>
                <Icon sx={{ fontSize: 48, color: '#9e9e9e', mb: 2 }}>account_balance</Icon>
                <MDTypography variant="body2" color="text" opacity={0.7}>
                  Select a loan to see payment details
                </MDTypography>
              </MDBox>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MDBox>
  );
}

function UnifiedPayments() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.loanId ? 1 : 0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    // Mock enhanced payment data
    const mockPayments = [];

    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const PaymentHistoryTab = () => (
    <MDBox>
      {/* Filter Controls */}
      <Card sx={{ p: 3, mb: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6" fontWeight="bold">
            Payment History
          </MDTypography>
          <VhoozhtSelect
            label="Filter by Status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
            options={[
              { value: "all", label: "All Payments" },
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" }
            ]}
          />
        </MDBox>
      </Card>

      {loading ? (
        <MDBox textAlign="center" py={6}>
          <MDTypography variant="h6">Loading payment history...</MDTypography>
        </MDBox>
      ) : filteredPayments.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Icon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }}>payment</Icon>
          <MDTypography variant="h5" fontWeight="bold" mb={1}>
            No Payments Found
          </MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.7} mb={3}>
            {filter === 'all' ? 
              "You haven't made any payments yet." : 
              `No ${filter} payments found.`}
          </MDTypography>
          <MDButton
            variant="gradient"
            color="primary"
            onClick={() => setActiveTab(1)}
            startIcon={<Icon>add</Icon>}
            sx={{ px: 3, py: 1.5 }}
          >
            Make a Payment
          </MDButton>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredPayments.map((payment) => (
            <Grid item xs={12} key={payment.id}>
              <PaymentCard
                payment={payment}
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </MDBox>
  );

  const MakePaymentTab = () => (
    <MakePaymentForm selectedLoanId={location.state?.loanId} />
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
            Payment Management 💳
          </MDTypography>
          <MDTypography variant="body1" color="text" opacity={0.7}>
            View your payment history and make secure payments for your loans.
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
        
        {activeTab === 0 && <PaymentHistoryTab />}
        {activeTab === 1 && <MakePaymentTab />}
      </MDBox>
      
      {/* Payment Details Dialog */}
      <PaymentDetailsDialog
        payment={selectedPayment}
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
      />
      
      <Footer />
    </DashboardLayout>
  );
}

export default UnifiedPayments;

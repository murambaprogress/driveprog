import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
// import Select from "@mui/material/Select"; // Replaced with VhoozhtSelect
// import MenuItem from "@mui/material/MenuItem"; // Replaced with VhoozhtSelect options
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
// import InputLabel from "@mui/material/InputLabel"; // Replaced with VhoozhtSelect labels
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
// DriveCash unified form components
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import { formatters } from "utils/dataFormatters";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Payment Status Colors
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return '#4caf50';
    case 'pending': return '#ff9800';
    case 'failed': return '#f44336';
    case 'refunded': return '#9c27b0';
    default: return '#9e9e9e';
  }
};

// Mock payment data - cleared for production
const mockPayments = [];

function Payments() {
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState(mockPayments);
  const [makePaymentDialog, setMakePaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    loanAccount: '',
    notes: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  // Handle payment submission
  const handleMakePayment = () => {
    if (!paymentData.amount || !paymentData.paymentMethod || !paymentData.loanAccount) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    // Simulate payment processing
    const newPayment = {
      id: payments.length + 1,
      amount: parseFloat(paymentData.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      method: paymentData.paymentMethod,
      reference: `PAY${String(Date.now()).slice(-6)}`,
      loanId: paymentData.loanAccount,
      description: paymentData.notes || 'Manual Payment'
    };

    setPayments([newPayment, ...payments]);
    setMakePaymentDialog(false);
    setPaymentData({ amount: '', paymentMethod: '', loanAccount: '', notes: '' });
    
    setNotification({
      open: true,
      message: 'Payment submitted successfully!',
      severity: 'success'
    });
  };

  // Filter payments based on tab
  const filteredPayments = payments.filter(payment => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return payment.status === 'completed';
    if (tabValue === 2) return payment.status === 'pending';
    if (tabValue === 3) return payment.status === 'failed';
    return true;
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox>
          <Grid container spacing={3}>
            {/* Payment Summary Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2}>
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                      <Icon>payments</Icon>
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold">
                        ${formatters.currency(payments.reduce((sum, p) => sum + p.amount, 0))}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Total Payments
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2}>
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                      <Icon>schedule</Icon>
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold">
                        {payments.filter(p => p.status === 'pending').length}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Pending Payments
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2}>
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
                      <Icon>calendar_today</Icon>
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold">
                        15th
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Next Due Date
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2}>
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                      <Icon>account_balance_wallet</Icon>
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold">
                        $450.00
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Monthly Extension
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Main Payments Section */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="medium" color="text">
                        Payment History
                      </MDTypography>
                      <MDTypography variant="button" fontWeight="regular" color="text" opacity={0.7}>
                        View and manage your payments
                      </MDTypography>
                    </MDBox>
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={() => setMakePaymentDialog(true)}
                      startIcon={<Icon>add</Icon>}
                    >
                      Make Payment
                    </MDButton>
                  </MDBox>

                  {/* Payment Tabs */}
                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                    <Tab label={`All (${payments.length})`} />
                    <Tab label={`Completed (${payments.filter(p => p.status === 'completed').length})`} />
                    <Tab label={`Pending (${payments.filter(p => p.status === 'pending').length})`} />
                    <Tab label={`Failed (${payments.filter(p => p.status === 'failed').length})`} />
                  </Tabs>

                  {/* Payments Table */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table sx={{ '& td, & th': { verticalAlign: 'middle' } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Method</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Reference</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow key={payment.id} hover>
                            <TableCell>
                              <MDBox minHeight="48px" display="flex" alignItems="center">
                                <MDTypography variant="body2">{formatters.date(payment.date)}</MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <MDBox minHeight="48px" display="flex" alignItems="center">
                                <MDTypography variant="h6" fontWeight="bold">
                                  ${formatters.currency(payment.amount)}
                                </MDTypography>
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
                                  label={payment.status.toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: getStatusColor(payment.status),
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <MDBox minHeight="48px" display="flex" alignItems="center">
                                <MDTypography variant="body2">{payment.reference}</MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <MDBox minHeight="48px" display="flex" alignItems="center">
                                <MDTypography variant="body2">{payment.description}</MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell align="right">
                              <MDBox minHeight="48px" display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                <MDButton size="small" color="info" variant="text">
                                  <Icon fontSize="small">visibility</Icon>
                                </MDButton>
                                <MDButton size="small" color="info" variant="text">
                                  <Icon fontSize="small">download</Icon>
                                </MDButton>
                              </MDBox>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {filteredPayments.length === 0 && (
                    <MDBox textAlign="center" py={6}>
                      <Icon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}>payment</Icon>
                      <MDTypography variant="h6" color="text" opacity={0.6}>
                        No payments found
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* Make Payment Dialog */}
      <Dialog open={makePaymentDialog} onClose={() => setMakePaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make a Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <VhoozhtInput
                fullWidth
                label="Payment Amount *"
                type="number"
                value={paymentData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="450.00"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <VhoozhtSelect
                fullWidth
                label="Loan Account *"
                value={paymentData.loanAccount}
                onChange={(e) => handleInputChange('loanAccount', e.target.value)}
                options={[
                  { value: 'LOAN001', label: 'Vehicle Loan - LOAN001' },
                  { value: 'LOAN002', label: 'Personal Loan - LOAN002' },
                  { value: 'LOAN003', label: 'Refinance Loan - LOAN003' }
                ]}
              />
            </Grid>

            <Grid item xs={12}>
              <VhoozhtSelect
                fullWidth
                label="Payment Method *"
                value={paymentData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                options={[
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Debit Card', label: 'Debit Card' },
                  { value: 'ACH Transfer', label: 'ACH Transfer' }
                ]}
              />
            </Grid>

            <Grid item xs={12}>
              <VhoozhtTextarea
                fullWidth
                label="Payment Notes (Optional)"
                rows={3}
                value={paymentData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this payment..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton color="secondary" onClick={() => setMakePaymentDialog(false)}>
            Cancel
          </MDButton>
          <MDButton color="success" onClick={handleMakePayment}>
            Submit Payment
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}

export default Payments;

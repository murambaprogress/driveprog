import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import EnhancedTable from "components/EnhancedTable";
import { EnhancedCard } from "components/EnhancedCard";
import { formatters, tableConfigs } from "utils/dataFormatters";
import adminDataService from "../../services/adminDataService";

// Import glowing icons CSS
import "../../assets/css/glowing-icons.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
// import TextField from "@mui/material/TextField"; // Replaced with VhoozhtInput
import Checkbox from "@mui/material/Checkbox";
// import Select from "@mui/material/Select"; // Replaced with VhoozhtSelect
// import MenuItem from "@mui/material/MenuItem"; // Replaced with VhoozhtSelect options
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
// Table components replaced by EnhancedTable
import Pagination from "@mui/material/Pagination";
import { alpha } from "@mui/material/styles";
import StatisticsCard from "components/Cards/StatisticsCard";

// Payment Details Modal
function PaymentDetailsModal({ open, onClose, payment, onRefund, onCancel }) {
  if (!payment) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Payment Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Payment ID</MDTypography>
            <MDTypography variant="body2">{payment.id}</MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Loan ID</MDTypography>
            <MDTypography variant="body2">{payment.loanId}</MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Borrower</MDTypography>
            <MDTypography variant="body2">{payment.borrowerName}</MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Amount</MDTypography>
            <MDTypography variant="h6">${payment.amount.toLocaleString()}</MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Payment Date</MDTypography>
            <MDTypography variant="body2">
              {formatters.date(payment.paymentDate)}
            </MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Status</MDTypography>
            <Chip 
              label={payment.status} 
              color={payment.status === 'completed' ? 'success' : payment.status === 'failed' ? 'error' : 'warning'}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Type</MDTypography>
            <MDTypography variant="body2">{payment.type}</MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="caption" color="text">Method</MDTypography>
            <MDTypography variant="body2">{payment.method}</MDTypography>
          </Grid>
          {payment.description && (
            <Grid item xs={12}>
              <MDTypography variant="caption" color="text">Description</MDTypography>
              <MDTypography variant="body2">{payment.description}</MDTypography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {payment.status === 'completed' && (
          <MDButton variant="outlined" color="warning" onClick={() => onRefund(payment)}>
            Process Refund
          </MDButton>
        )}
        {payment.status === 'pending' && (
          <MDButton variant="outlined" color="error" onClick={() => onCancel(payment)}>
            Cancel Payment
          </MDButton>
        )}
        <MDButton variant="contained" onClick={onClose}>Close</MDButton>
      </DialogActions>
    </Dialog>
  );
}

// Bulk Payment Operations Modal
function BulkPaymentOperationsModal({ open, onClose, selectedPayments, onBulkAction }) {
  const [operation, setOperation] = useState("");

  const handleBulkAction = () => {
    const paymentIds = selectedPayments.map(p => p.id);
    
    switch (operation) {
      case 'refund':
        const completedPayments = selectedPayments.filter(p => p.status === 'completed');
        if (completedPayments.length === 0) {
          alert('No completed payments selected for refund.');
          return;
        }
        if (window.confirm(`Are you sure you want to refund ${completedPayments.length} payments?`)) {
          onBulkAction('refund', completedPayments.map(p => p.id));
        }
        break;
      case 'cancel':
        const pendingPayments = selectedPayments.filter(p => p.status === 'pending');
        if (pendingPayments.length === 0) {
          alert('No pending payments selected for cancellation.');
          return;
        }
        if (window.confirm(`Are you sure you want to cancel ${pendingPayments.length} payments?`)) {
          onBulkAction('cancel', pendingPayments.map(p => p.id));
        }
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${paymentIds.length} payment records? This action cannot be undone.`)) {
          onBulkAction('delete', paymentIds);
        }
        break;
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Payment Operations ({selectedPayments.length} payments selected)</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <VhoozhtSelect
              fullWidth
              label="Operation"
              value={operation}
              onChange={e => setOperation(e.target.value)}
              options={[
                { value: 'refund', label: 'Process Refunds (Completed only)' },
                { value: 'cancel', label: 'Cancel Payments (Pending only)' },
                { value: 'delete', label: 'Delete Records' }
              ]}
            />
          </Grid>
          
          <Grid item xs={12}>
            <MDTypography variant="caption" color="text">
              {operation === 'refund' && `${selectedPayments.filter(p => p.status === 'completed').length} completed payments can be refunded.`}
              {operation === 'cancel' && `${selectedPayments.filter(p => p.status === 'pending').length} pending payments can be cancelled.`}
              {operation === 'delete' && `All ${selectedPayments.length} payment records will be deleted.`}
            </MDTypography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" onClick={onClose}>Cancel</MDButton>
        <MDButton variant="contained" onClick={handleBulkAction} disabled={!operation}>
          Apply
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [amountMinFilter, setAmountMinFilter] = useState("");
  const [amountMaxFilter, setAmountMaxFilter] = useState("");
  
  // Pagination and sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("paymentDate");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Selection and modals
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  
  // Notifications
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Fetch data with filters
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        pageSize,
        search,
        status: statusFilter,
        type: typeFilter,
        method: methodFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        amountMin: amountMinFilter ? parseFloat(amountMinFilter) : undefined,
        amountMax: amountMaxFilter ? parseFloat(amountMaxFilter) : undefined,
        sortBy,
        sortOrder,
      };

      const result = adminDataService.getPayments(filters);
      setPayments(result.items);
      setTotal(result.total);
    } catch (error) {
      showNotification("Error loading payments", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, typeFilter, methodFilter, dateFromFilter, dateToFilter, amountMinFilter, amountMaxFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedPayments(checked ? [...payments] : []);
  };

  const handleSelectPayment = (payment, checked) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, payment]);
    } else {
      setSelectedPayments(selectedPayments.filter(p => p.id !== payment.id));
      setSelectAll(false);
    }
  };

  // Payment operations
  const handleRefundPayment = async (payment) => {
    try {
      const result = adminDataService.refundPayments([payment.id]);
      if (result.refundedCount > 0) {
        showNotification("Payment refunded successfully");
        setDetailsModalOpen(false);
        fetchPayments();
      }
    } catch (error) {
      showNotification("Error processing refund", "error");
    }
  };

  const handleCancelPayment = async (payment) => {
    try {
      const result = adminDataService.cancelPayments([payment.id]);
      if (result.cancelledCount > 0) {
        showNotification("Payment cancelled successfully");
        setDetailsModalOpen(false);
        fetchPayments();
      }
    } catch (error) {
      showNotification("Error cancelling payment", "error");
    }
  };

  const handleBulkAction = async (actionType, paymentIds) => {
    try {
      let result;
      
      switch (actionType) {
        case 'refund':
          result = adminDataService.refundPayments(paymentIds);
          showNotification(`${result.refundedCount} payments refunded`);
          break;
        case 'cancel':
          result = adminDataService.cancelPayments(paymentIds);
          showNotification(`${result.cancelledCount} payments cancelled`);
          break;
        case 'delete':
          result = adminDataService.bulkDeletePayments(paymentIds);
          showNotification(`${result.deletedCount} payment records deleted`);
          break;
      }
      
      setSelectedPayments([]);
      setSelectAll(false);
      fetchPayments();
    } catch (error) {
      showNotification("Error performing bulk operation", "error");
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const filteredPayments = selectedPayments.length ? selectedPayments : payments;
    adminDataService.exportCSV('payments', filteredPayments);
    showNotification(`Exported ${filteredPayments.length} payments to CSV`);
  };

  const handleExportJSON = () => {
    adminDataService.exportData('payments');
    showNotification("Payments data exported to JSON");
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setMethodFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setAmountMinFilter("");
    setAmountMaxFilter("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'refunded': return 'info';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'loan_payment': return 'primary';
      case 'fee': return 'warning';
      case 'refund': return 'info';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      {/* Dashboard Cards */}
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="secondary"
              icon="payment"
              title="Total Payments"
              count={total.toString()}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="secondary"
              icon="check_circle"
              title="Completed"
              count={payments.filter(p => p.status === 'completed').length.toString()}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="warning"
              icon="schedule"
              title="Pending"
              count={payments.filter(p => p.status === 'pending').length.toString()}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="secondary"
              icon="account_balance_wallet"
              title="Total Revenue"
              count={`$${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}`}
            />
          </Grid>
        </Grid>
      </MDBox>

      <Card>
      {/* Header */}
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" color="secondary">
              Payments Management
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Total: {total} payments | Selected: {selectedPayments.length}
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1}>
            <MDButton variant="outlined" onClick={handleExportCSV} disabled={!payments.length}>
              Export CSV
            </MDButton>
            <MDButton variant="outlined" onClick={handleExportJSON}>
              Export JSON
            </MDButton>
            {selectedPayments.length > 0 && (
              <MDButton variant="contained" color="warning" onClick={() => setBulkModalOpen(true)}>
                Bulk Actions ({selectedPayments.length})
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
      </Card>

      {/* Filters - centered container with uniform small controls */}
      <Card sx={{ p: 3, mb: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDTypography variant="h6" fontWeight="medium" color="secondary">
              Filters & Search
            </MDTypography>
            <VhoozhtInput
              placeholder="Search payments..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              sx={{ width: 250 }}
              size="small"
            />
          </MDBox>
        </MDBox>

        {/* Centered Filters Layout */}
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={9}>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={2} sx={{ display: 'flex' }}>
                <VhoozhtSelect
                  fullWidth
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'refunded', label: 'Refunded' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex' }}>
                <VhoozhtSelect
                  fullWidth
                  size="small"
                  label="Type"
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'loan_payment', label: 'Loan Payment' },
                    { value: 'fee', label: 'Fee' },
                    { value: 'refund', label: 'Refund' }
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex' }}>
                <VhoozhtSelect
                  fullWidth
                  size="small"
                  label="Method"
                  value={methodFilter}
                  onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
                  sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'card', label: 'Card' },
                    { value: 'check', label: 'Check' },
                    { value: 'cash', label: 'Cash' }
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex' }}>
                <VhoozhtInput
                  label="Date From"
                  type="date"
                  fullWidth
                  size="small"
                  value={dateFromFilter}
                  onChange={(e) => { setDateFromFilter(e.target.value); setPage(1); }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
                />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex' }}>
                <VhoozhtInput
                  label="Date To"
                  type="date"
                  fullWidth
                  size="small"
                  value={dateToFilter}
                  onChange={(e) => { setDateToFilter(e.target.value); setPage(1); }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
                />
              </Grid>
              <Grid item xs={12} md={1} sx={{ display: 'flex' }}>
                <VhoozhtInput
                  label="Min $"
                  type="number"
                  fullWidth
                  size="small"
                  value={amountMinFilter}
                  onChange={(e) => { setAmountMinFilter(e.target.value); setPage(1); }}
                  sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
                />
              </Grid>
              <Grid item xs={12} md={1} sx={{ display: 'flex' }}>
                <VhoozhtInput
                  label="Max $"
                  type="number"
                  fullWidth
                  size="small"
                  value={amountMaxFilter}
                  onChange={(e) => { setAmountMaxFilter(e.target.value); setPage(1); }}
                  sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDButton variant="outlined" onClick={clearFilters} size="small">
            Clear Filters
          </MDButton>
          <MDBox display="flex" alignItems="center" gap={1}>
            <MDTypography variant="caption">Sort by:</MDTypography>
            <VhoozhtSelect
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
              options={[
                { value: 'paymentDate', label: 'Payment Date' },
                { value: 'amount', label: 'Amount' },
                { value: 'status', label: 'Status' },
                { value: 'type', label: 'Type' },
                { value: 'borrowerName', label: 'Borrower' }
              ]}
            />
            <VhoozhtSelect
              size="small"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              sx={{ '& .MuiInputBase-root': { minHeight: 40 } }}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' }
              ]}
            />
          </MDBox>
        </MDBox>
      </Card>

      {/* Data Table */}
      <Card>
      {/* Enhanced Payments Table */}
      <EnhancedTable
        columns={[
          { 
            id: 'id', 
            label: 'Payment ID', 
            width: 120, 
            minWidth: 120, 
            align: 'left',
            format: (v) => (
              <MDBox className="payment-id" minHeight="48px" display="flex" alignItems="center">
                <MDTypography variant="body2" fontWeight="medium">
                  {v}
                </MDTypography>
              </MDBox>
            )
          },
          { 
            id: 'borrowerName', 
            label: 'Borrower', 
            width: 200, 
            minWidth: 150, 
            align: 'left',
            format: (v) => (
              <MDBox className="payment-borrower" minHeight="48px" display="flex" alignItems="center">
                <MDTypography variant="body2">
                  {v}
                </MDTypography>
              </MDBox>
            )
          },
          { 
            id: 'amount', 
            label: 'Amount', 
            width: 140, 
            align: 'right', 
            format: (v) => (
              <MDBox className="payment-amount" minHeight="48px" display="flex" alignItems="center" justifyContent="flex-end">
                <MDTypography variant="body2" fontWeight="medium" color="success">
                  {formatters.currency(v || 0)}
                </MDTypography>
              </MDBox>
            )
          },
          { 
            id: 'type', 
            label: 'Type', 
            width: 120, 
            align: 'center', 
            format: (v) => (
              <MDBox className="payment-type" minHeight="48px" display="flex" alignItems="center" justifyContent="center">
                <Chip label={v} color={getTypeColor(v)} size="small" />
              </MDBox>
            )
          },
          { 
            id: 'method', 
            label: 'Method', 
            width: 140, 
            align: 'left',
            format: (v) => (
              <MDBox className="payment-method" minHeight="48px" display="flex" alignItems="center">
                <MDTypography variant="body2">
                  {v}
                </MDTypography>
              </MDBox>
            )
          },
          { 
            id: 'status', 
            label: 'Status', 
            width: 120, 
            align: 'center', 
            format: (v) => (
              <MDBox className="payment-status status-chip" minHeight="48px" display="flex" alignItems="center" justifyContent="center">
                <Chip label={v} color={getStatusColor(v)} size="small" />
              </MDBox>
            )
          },
          { 
            id: 'paymentDate', 
            label: 'Date', 
            width: 140, 
            align: 'center', 
            format: (v) => {
              const d = v ? new Date(v) : null;
              return (
                <MDBox className="payment-date" minHeight="48px" display="flex" alignItems="center" justifyContent="center">
                  <MDTypography variant="body2">
                    {d && !isNaN(d.getTime()) ? formatters.date(d) : '—'}
                  </MDTypography>
                </MDBox>
              );
            }
          },
          {
            id: 'actions',
            label: 'Actions',
            width: 150,
            align: 'center',
            format: (_v, row) => (
              <MDBox className="payment-actions" minHeight="48px" display="flex" alignItems="center" justifyContent="center" gap={1}>
                <IconButton
                  size="small"
                  onClick={() => { setViewingPayment(row); setDetailsModalOpen(true); }}
                >
                  <Icon fontSize="small">visibility</Icon>
                </IconButton>
                {row.status === 'completed' && (
                  <IconButton size="small" color="warning" onClick={() => handleRefundPayment(row)}>
                    <Icon fontSize="small">undo</Icon>
                  </IconButton>
                )}
                {row.status === 'pending' && (
                  <IconButton size="small" color="error" onClick={() => handleCancelPayment(row)}>
                    <Icon fontSize="small">cancel</Icon>
                  </IconButton>
                )}
              </MDBox>
            ),
          },
        ]}
        data={payments}
        selectedItems={selectedPayments}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectPayment}
        showCheckbox={true}
        stickyHeader={false}
        maxHeight="65vh"
      />

      {/* Pagination */}
      <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
        <MDBox display="flex" alignItems="center" gap={2}>
          <MDTypography variant="caption">Page size:</MDTypography>
          <VhoozhtSelect
            size="small"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            options={[
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 25, label: '25' },
              { value: 50, label: '50' }
            ]}
          />
        </MDBox>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
        />
      </MDBox>

      {/* Modals */}
      <PaymentDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        payment={viewingPayment}
        onRefund={handleRefundPayment}
        onCancel={handleCancelPayment}
      />

      <BulkPaymentOperationsModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedPayments={selectedPayments}
        onBulkAction={handleBulkAction}
      />

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
      </Card>
    </DashboardLayout>
  );
}

export default AdminPayments;

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import EnhancedTable from "components/EnhancedTable";
import { formatters } from "utils/dataFormatters";
import {
  fetchAdminLoans,
  fetchAdminLoanDetails,
  approveAdminLoan,
  rejectAdminLoan,
  raiseAdminLoanQuery,
  formatStatusLabel,
  getActionPermissions,
} from "../../services/adminLoansApi";

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
// import InputLabel from "@mui/material/InputLabel"; // Replaced with VhoozhtSelect labels
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Pagination from "@mui/material/Pagination";
import { alpha } from "@mui/material/styles";
import StatisticsCard from "components/Cards/StatisticsCard";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LoanReviewModal from "components/admin/LoanReviewModal";

const mapLoanForExport = (loan) => ({
  id: loan.id,
  applicationId: loan.applicationId,
  borrowerName: loan.borrowerName,
  email: loan.email,
  phone: loan.phone,
  amount: loan.amount,
  interestRate: loan.interestRate,
  term: loan.term,
  status: formatStatusLabel(loan.status),
  applicationDate: loan.applicationDate,
});

const exportLoansToCsv = (filename, loans) => {
  if (!loans.length) {
    return;
  }

  const rows = loans.map(mapLoanForExport);
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];

  rows.forEach((row) => {
    const values = headers.map((header) => {
      const raw = row[header];
      if (raw === null || raw === undefined) {
        return "";
      }
      const value = String(raw).replace(/"/g, '""');
      return `"${value}"`;
    });
    lines.push(values.join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const exportLoansToJson = (filename, loans) => {
  const rows = loans.map(mapLoanForExport);
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Loan Edit Modal
function LoanEditModal({ open, onClose, loan, onSave }) {
  const [form, setForm] = useState({
    amount: 0,
    interestRate: 0,
    term: 0,
    status: "",
    remainingBalance: 0,
    monthlyPayment: 0
  });

  useEffect(() => {
    if (loan) {
      setForm({
        amount: loan.amount || 0,
        interestRate: loan.interestRate || 0,
        term: loan.term || 0,
        status: loan.status || "",
        remainingBalance: loan.remainingBalance || 0,
        monthlyPayment: loan.monthlyPayment || 0,
      });
    }
  }, [loan]);

  if (!loan) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Loan: {loan.id}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Loan Amount ($)"
              fullWidth
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Interest Rate (%)"
              fullWidth
              type="number"
              step="0.01"
              value={form.interestRate}
              onChange={e => setForm(f => ({ ...f, interestRate: parseFloat(e.target.value) || 0 }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <VhoozhtInput
              label="Term (months)"
              fullWidth
              type="number"
              value={form.term}
              onChange={e => setForm(f => ({ ...f, term: parseInt(e.target.value) || 0 }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <VhoozhtSelect
              label="Status"
              fullWidth
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[
                'draft',
                'pending',
                'query',
                'approved',
                'rejected',
                'withdrawn',
              ].map((statusValue) => ({
                value: statusValue,
                label: formatStatusLabel(statusValue),
              }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" onClick={onClose}>Cancel</MDButton>
        <MDButton variant="contained" onClick={() => onSave({ ...loan, ...form })}>Save Changes</MDButton>
      </DialogActions>
    </Dialog>
  );
}

// Bulk Loan Operations Modal
function BulkLoanOperationsModal({ open, onClose, selectedLoans, onBulkAction }) {
  const [operation, setOperation] = useState("approve");
  const [notes, setNotes] = useState("");

  const handleBulkAction = () => {
    const loanIds = selectedLoans.map((loan) => loan.id);

    switch (operation) {
      case "approve":
        onBulkAction("approve", loanIds, { notes });
        break;
      case "reject":
        onBulkAction("deny", loanIds, { reason: notes });
        break;
      case "flag":
        onBulkAction("flag", loanIds, { notes });
        break;
      default:
        break;
    }

    setNotes("");
    setOperation("approve");
    onClose();
  };

  const handleClose = () => {
    setNotes("");
    setOperation("approve");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Loan Actions ({selectedLoans.length} loans)</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <VhoozhtSelect
              label="Action"
              fullWidth
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              options={[
                { value: "approve", label: "Approve" },
                { value: "reject", label: "Reject" },
                { value: "flag", label: "Flag for Review" },
              ]}
            />
          </Grid>

          <Grid item xs={12}>
            <VhoozhtTextarea
              label="Notes"
              fullWidth
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional message shared with applicants"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" onClick={handleClose}>
          Cancel
        </MDButton>
        <MDButton
          variant="contained"
          onClick={handleBulkAction}
          disabled={selectedLoans.length === 0}
        >
          Apply
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

function AdminLoans() {
  const [allLoans, setAllLoans] = useState([]);
  const [loans, setLoans] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [amountMinFilter, setAmountMinFilter] = useState("");
  const [amountMaxFilter, setAmountMaxFilter] = useState("");
  
  // Pagination and sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("applicationDate");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Selection and modals
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [reviewLoan, setReviewLoan] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuLoan, setActionMenuLoan] = useState(null);
  
  // Notifications
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const showNotification = useCallback((message, severity = "success") => {
    setNotification({ open: true, message, severity });
  }, []);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedLoans = await fetchAdminLoans();
      setAllLoans(fetchedLoans);
      setSelectedLoans([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error loading loans", error);
      showNotification("Error loading loans", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const filteredLoans = useMemo(() => {
    let items = [...allLoans];

    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter((loan) => {
        const fields = [
          loan.id,
          loan.applicationId,
          loan.borrowerName,
          loan.email,
          loan.phone,
          loan.status,
        ];
        return fields.some((field) =>
          field && field.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    if (statusFilter) {
      items = items.filter((loan) => loan.status === statusFilter);
    }

    const parseDate = (value) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const fromDate = parseDate(dateFromFilter);
    const toDate = parseDate(dateToFilter);

    if (fromDate) {
      items = items.filter((loan) => {
        const loanDate = parseDate(loan.applicationDate);
        return loanDate ? loanDate >= fromDate : false;
      });
    }

    if (toDate) {
      items = items.filter((loan) => {
        const loanDate = parseDate(loan.applicationDate);
        return loanDate ? loanDate <= toDate : false;
      });
    }

    const minAmount = amountMinFilter ? Number(amountMinFilter) : null;
    const maxAmount = amountMaxFilter ? Number(amountMaxFilter) : null;

    if (minAmount !== null && !Number.isNaN(minAmount)) {
      items = items.filter((loan) => (loan.amount || 0) >= minAmount);
    }

    if (maxAmount !== null && !Number.isNaN(maxAmount)) {
      items = items.filter((loan) => (loan.amount || 0) <= maxAmount);
    }

    const getSortValue = (loan) => {
      switch (sortBy) {
        case "applicationDate":
          return parseDate(loan.applicationDate)?.getTime() || 0;
        case "amount":
          return loan.amount ?? 0;
        case "interestRate":
          return loan.interestRate ?? 0;
        case "term":
          return loan.term ?? 0;
        case "status":
          return loan.status || "";
        default:
          return loan[sortBy];
      }
    };

    items.sort((a, b) => {
      const valueA = getSortValue(a);
      const valueB = getSortValue(b);

      if (typeof valueA === "string" || typeof valueB === "string") {
        const comparison = String(valueA || "").localeCompare(String(valueB || ""));
        return sortOrder === "asc" ? comparison : -comparison;
      }

      const numericA = Number(valueA) || 0;
      const numericB = Number(valueB) || 0;
      const diff = numericA - numericB;
      return sortOrder === "asc" ? diff : -diff;
    });

    return items;
  }, [
    allLoans,
    search,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    amountMinFilter,
    amountMaxFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    const totalCount = filteredLoans.length;
    const totalPagesCount = Math.max(1, Math.ceil(totalCount / pageSize));

    if (page > totalPagesCount) {
      setPage(totalPagesCount);
      return;
    }

    const start = (page - 1) * pageSize;
    const paginated = filteredLoans.slice(start, start + pageSize);
    setLoans(paginated);
    setTotal(totalCount);
  }, [filteredLoans, page, pageSize]);

  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedLoans(
      checked
        ? loans.filter((loan) => ['pending', 'query'].includes(loan.status))
        : []
    );
  };

  const handleSelectLoan = (loan, checked) => {
    if (checked) {
      setSelectedLoans([...selectedLoans, loan]);
    } else {
      setSelectedLoans(selectedLoans.filter(l => l.id !== loan.id));
      setSelectAll(false);
    }
  };

  // CRUD operations
  const handleSaveLoan = () => {
    showNotification("Editing loans is not supported yet", "info");
    setEditModalOpen(false);
  };

  const findLoanById = useCallback(
    (loanId) => allLoans.find((loan) => String(loan.id) === String(loanId)),
    [allLoans]
  );

  const refreshAndNotify = useCallback(
    (message, severity = "success") => {
      showNotification(message, severity);
      loadLoans();
    },
    [loadLoans, showNotification]
  );

  const handleOpenReview = async (loan) => {
    try {
      console.log('[handleOpenReview] Fetching full details for loan:', loan.id);
      // Fetch full loan details including documents
      const fullLoanData = await fetchAdminLoanDetails(loan.id);
      console.log('[handleOpenReview] Received full loan data:', fullLoanData);
      
      // Create a normalized loan object with full data
      setReviewLoan({
        ...loan,
        raw: fullLoanData // Store full API response in raw field
      });
      setReviewModalOpen(true);
    } catch (error) {
      console.error('[handleOpenReview] Error fetching loan details:', error);
      showNotification('Failed to load loan details', 'error');
    }
  };

  const handleBulkAction = async (actionType, loanIds, params = {}) => {
    if (!loanIds.length) {
      showNotification("No loans selected", "warning");
      return;
    }

    // Check permissions for all selected loans
    const eligibleLoans = [];
    const ineligibleLoans = [];
    
    loanIds.forEach(loanId => {
      const loanData = findLoanById(loanId);
      const permissions = getActionPermissions(loanData?.status);
      
      let canPerformAction = false;
      switch (actionType) {
        case 'approve':
          canPerformAction = permissions.canApprove;
          break;
        case 'deny':
          canPerformAction = permissions.canReject;
          break;
        case 'flag':
          canPerformAction = permissions.canQuery;
          break;
      }
      
      if (canPerformAction) {
        eligibleLoans.push(loanId);
      } else {
        ineligibleLoans.push({ id: loanId, status: loanData?.status, message: permissions.statusMessage });
      }
    });
    
    if (ineligibleLoans.length > 0) {
      const ineligibleMessage = `${ineligibleLoans.length} loan(s) cannot be processed due to their status`;
      showNotification(ineligibleMessage, "warning");
    }
    
    if (eligibleLoans.length === 0) {
      showNotification("No eligible loans to process", "warning");
      return;
    }

    try {
      switch (actionType) {
        case 'approve':
          await Promise.all(
            eligibleLoans.map((loanId) =>
              approveAdminLoan(loanId, {
                approvedAmount: params.approvedAmount ?? findLoanById(loanId)?.amount ?? 0,
                approvalNotes: params.notes,
              })
            )
          );
          refreshAndNotify(`${eligibleLoans.length} loan(s) approved`);
          break;
        case 'deny':
          await Promise.all(
            eligibleLoans.map((loanId) =>
              rejectAdminLoan(loanId, { reason: params.reason })
            )
          );
          refreshAndNotify(`${eligibleLoans.length} loan(s) rejected`);
          break;
        case 'flag':
          await Promise.all(
            eligibleLoans.map((loanId) =>
              raiseAdminLoanQuery(loanId, { message: params.notes })
            )
          );
          refreshAndNotify(`${eligibleLoans.length} loan(s) flagged for review`);
          break;
        default:
          showNotification("Bulk action not supported", "warning");
      }
    } catch (error) {
      console.error(`Error performing bulk ${actionType}`, error);
      const errorMessage = error.message || `Error performing bulk ${actionType}`;
      showNotification(errorMessage, "error");
    }
  };

  // Individual loan actions
  const handleApproveLoan = async (loanId, notes = "") => {
    try {
      const loanData = findLoanById(loanId);
      const permissions = getActionPermissions(loanData?.status);
      
      if (!permissions.canApprove) {
        showNotification(permissions.statusMessage, "warning");
        return;
      }
      
      await approveAdminLoan(loanId, { approvedAmount: loanData?.amount, approvalNotes: notes });
      refreshAndNotify("Loan approved successfully");
    } catch (error) {
      console.error("Error approving loan", error);
      const errorMessage = error.message || "Error approving loan";
      showNotification(errorMessage, "error");
    }
  };

  const handleDenyLoan = async (loanId, reason = "") => {
    try {
      const loanData = findLoanById(loanId);
      const permissions = getActionPermissions(loanData?.status);
      
      if (!permissions.canReject) {
        showNotification(permissions.statusMessage, "warning");
        return;
      }
      
      await rejectAdminLoan(loanId, { reason });
      refreshAndNotify("Loan rejected");
    } catch (error) {
      console.error("Error rejecting loan", error);
      const errorMessage = error.message || "Error rejecting loan";
      showNotification(errorMessage, "error");
    }
  };

  const handleRaiseQuery = async (loanId, message = "") => {
    try {
      const loanData = findLoanById(loanId);
      const permissions = getActionPermissions(loanData?.status);
      
      if (!permissions.canQuery) {
        showNotification(permissions.statusMessage, "warning");
        return;
      }
      
      await raiseAdminLoanQuery(loanId, { message });
      refreshAndNotify("Loan flagged for review");
    } catch (error) {
      console.error("Error flagging loan", error);
      const errorMessage = error.message || "Error flagging loan";
      showNotification(errorMessage, "error");
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const targeted = selectedLoans.length ? selectedLoans : filteredLoans;
    exportLoansToCsv('drivecash_loans.csv', targeted);
    showNotification(`Exported ${targeted.length} loans to CSV`);
  };

  const handleExportJSON = () => {
    const targeted = selectedLoans.length ? selectedLoans : filteredLoans;
    exportLoansToJson('drivecash_loans.json', targeted);
    showNotification(`Exported ${targeted.length} loans to JSON`);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setAmountMinFilter("");
    setAmountMaxFilter("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
      case 'denied':
        return 'error';
      case 'pending':
        return 'warning';
      case 'query':
        return 'info';
      case 'withdrawn':
        return 'secondary';
      case 'draft':
        return 'default';
      default:
        return 'primary';
    }
  };

  const summary = useMemo(() => {
    const dataset = filteredLoans;
    const totalLoans = dataset.length;
    const approvedCount = dataset.filter((loan) => loan.status === 'approved').length;
    const pendingCount = dataset.filter((loan) => loan.status === 'pending').length;
    const queryCount = dataset.filter((loan) => loan.status === 'query').length;
    const rejectedCount = dataset.filter((loan) => loan.status === 'rejected' || loan.status === 'denied').length;
    const totalAmount = dataset.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0);

    return {
      totalLoans,
      approvedCount,
      pendingCount,
      queryCount,
      rejectedCount,
      totalAmount,
    };
  }, [filteredLoans]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      {/* Dashboard Cards */}
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="success"
              icon="account_balance"
              title="Loan Applications"
              count={summary.totalLoans.toString()}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="success"
              icon="trending_up"
              title="Approved Loans"
              count={summary.approvedCount.toString()}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="warning"
              icon="hourglass_empty"
              title="Pending Decisions"
              count={(summary.pendingCount + summary.queryCount).toString()}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="info"
              icon="help_outline"
              title="Flagged Queries"
              count={summary.queryCount.toString()}
            />
          </Grid>
        </Grid>
      </MDBox>

      <Card>
      {/* Header */}
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" color="success">
                          count={(summary.pendingCount + summary.queryCount).toString()}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Total: {total} loans | Selected: {selectedLoans.length}
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1}>
              <MDButton variant="outlined" onClick={handleExportCSV} disabled={!filteredLoans.length}>
              Export CSV
            </MDButton>
            <MDButton variant="outlined" onClick={handleExportJSON}>
              Export JSON
            </MDButton>
            {selectedLoans.length > 0 && (
              <MDButton variant="contained" color="warning" onClick={() => setBulkModalOpen(true)}>
                Bulk Actions ({selectedLoans.length})
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
      </Card>

      {/* Filters */}
      <Card sx={{ p: 3, mb: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDTypography variant="h6" fontWeight="medium" color="success">
              Filters & Search
            </MDTypography>
            <VhoozhtInput
              placeholder="Search loans..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              sx={{ width: 250 }}
              size="small"
            />
          </MDBox>
        </MDBox>

        {/* Filters */}
        <Grid container spacing={2} justifyContent="center" mb={2}>
          <Grid item xs={12} md={10}>
            <MDBox display="flex" justifyContent="center">
              <Grid container spacing={2} sx={{ maxWidth: 920 }} justifyContent="center">
                <Grid item xs={12} md={2.4}>
                  <VhoozhtSelect
                    label="Status"
                    fullWidth
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    options={['', 'draft', 'pending', 'query', 'approved', 'rejected', 'withdrawn'].map((statusValue) => ({
                      value: statusValue,
                      label: statusValue ? formatStatusLabel(statusValue) : 'All',
                    }))}
                    sx={{ '& .MuiInputBase-root': { height: 40 } }}
                  />
                </Grid>

                <Grid item xs={12} md={2.2}>
                  <VhoozhtInput
                    label="Date From"
                    type="date"
                    fullWidth
                    value={dateFromFilter}
                    onChange={(e) => { setDateFromFilter(e.target.value); setPage(1); }}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiInputBase-root': { height: 40 } }}
                  />
                </Grid>

                <Grid item xs={12} md={2.2}>
                  <VhoozhtInput
                    label="Date To"
                    type="date"
                    fullWidth
                    value={dateToFilter}
                    onChange={(e) => { setDateToFilter(e.target.value); setPage(1); }}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiInputBase-root': { height: 40 } }}
                  />
                </Grid>

                <Grid item xs={12} md={2.1}>
                  <VhoozhtInput
                    label="Min Amount"
                    type="number"
                    fullWidth
                    value={amountMinFilter}
                    onChange={(e) => { setAmountMinFilter(e.target.value); setPage(1); }}
                    sx={{ '& .MuiInputBase-root': { height: 40 } }}
                  />
                </Grid>

                <Grid item xs={12} md={2.1}>
                  <VhoozhtInput
                    label="Max Amount"
                    type="number"
                    fullWidth
                    value={amountMaxFilter}
                    onChange={(e) => { setAmountMaxFilter(e.target.value); setPage(1); }}
                    sx={{ '& .MuiInputBase-root': { height: 40 } }}
                  />
                </Grid>
              </Grid>
            </MDBox>
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
              options={[
                { value: 'applicationDate', label: 'Application Date' },
                { value: 'amount', label: 'Amount' },
                { value: 'interestRate', label: 'Interest Rate' },
                { value: 'term', label: 'Term' },
                { value: 'status', label: 'Status' }
              ]}
            />
            <VhoozhtSelect
              size="small"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' }
              ]}
            />
          </MDBox>
        </MDBox>
      </Card>

      {/* Data Table */}
      <Card sx={{ overflow: 'hidden' }}>
        <EnhancedTable
          columns={[
            {
              id: 'id',
              label: 'Loan ID',
              minWidth: 80,
              align: 'left',
              format: (value) => (
                <MDTypography variant="caption" fontWeight="medium" noWrap>
                  {value}
                </MDTypography>
              ),
            },
            {
              id: 'borrowerName',
              label: 'Borrower',
              minWidth: 140,
              align: 'left',
              format: (value) => (
                <MDTypography variant="body2" noWrap title={value}>
                  {value}
                </MDTypography>
              ),
            },
            {
              id: 'amount',
              label: 'Amount',
              minWidth: 100,
              align: 'right',
              format: (value) => (
                <MDTypography variant="body2" fontWeight="medium" color="success" noWrap>
                  {formatters.currency(value)}
                </MDTypography>
              ),
            },
            {
              id: 'interestRate',
              label: 'Rate',
              minWidth: 70,
              align: 'center',
              format: (value) => (
                <MDTypography variant="body2" fontWeight="medium" noWrap>
                  {formatters.percentage(value)}
                </MDTypography>
              ),
            },
            {
              id: 'term',
              label: 'Term',
              minWidth: 80,
              align: 'center',
              format: (value) => (
                <MDTypography variant="body2" noWrap>
                  {value} mo
                </MDTypography>
              ),
            },
            {
              id: 'status',
              label: 'Status',
              minWidth: 110,
              align: 'center',
              format: (value) => (
                <Chip label={formatStatusLabel(value)} color={getStatusColor(value)} size="small" />
              ),
            },
            {
              id: 'applicationDate',
              label: 'Applied',
              minWidth: 90,
              align: 'center',
              format: (value) => (
                <MDTypography variant="body2" noWrap>
                  {formatters.date(value)}
                </MDTypography>
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              minWidth: 150,
              align: 'center',
              format: (value, row) => (
                <>
                  {/* Dropdown Menu Button */}
                  <Tooltip title="Actions Menu">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setActionMenuAnchor(e.currentTarget);
                        setActionMenuLoan(row);
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha('#1976d2', 0.08),
                        '&:hover': { bgcolor: alpha('#1976d2', 0.15) }
                      }}
                    >
                      <Icon fontSize="small">more_vert</Icon>
                    </IconButton>
                  </Tooltip>

                  {/* Quick Review Button */}
                  <Tooltip title="Review Application">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenReview(row)}
                      sx={{
                        width: 32,
                        height: 32,
                        ml: 0.5,
                        bgcolor: alpha('#2196f3', 0.08),
                        '&:hover': { bgcolor: alpha('#2196f3', 0.15) }
                      }}
                    >
                      <Icon fontSize="small">visibility</Icon>
                    </IconButton>
                  </Tooltip>

                  {/* Quick Approve for pending/query */}
                  {(row.status === 'pending' || row.status === 'query') && (
                    <Tooltip title="Quick Approve">
                      <IconButton
                        size="small"
                        onClick={() => handleApproveLoan(row.id)}
                        sx={{
                          width: 32,
                          height: 32,
                          ml: 0.5,
                          color: '#4caf50',
                          '&:hover': { bgcolor: alpha('#4caf50', 0.1) }
                        }}
                      >
                        <Icon fontSize="small">check_circle</Icon>
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Quick Decline for pending/query */}
                  {(row.status === 'pending' || row.status === 'query') && (
                    <Tooltip title="Quick Decline">
                      <IconButton
                        size="small"
                        onClick={() => handleDenyLoan(row.id, "Quick decline")}
                        sx={{
                          width: 32,
                          height: 32,
                          ml: 0.5,
                          color: '#f44336',
                          '&:hover': { bgcolor: alpha('#f44336', 0.1) }
                        }}
                      >
                        <Icon fontSize="small">cancel</Icon>
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              ),
            },
          ]}
          data={loans}
          selectedItems={selectedLoans}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectLoan}
          showCheckbox
          stickyHeader={false}
          maxHeight="70vh"
        />

        {/* Action Dropdown Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => setActionMenuAnchor(null)}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          <MenuItem
            onClick={() => {
              handleOpenReview(actionMenuLoan);
              setActionMenuAnchor(null);
            }}
          >
            <Icon sx={{ mr: 1 }}>visibility</Icon>
            Review Application
          </MenuItem>
          <MenuItem
            onClick={() => {
              setEditing(actionMenuLoan);
              setEditModalOpen(true);
              setActionMenuAnchor(null);
            }}
          >
            <Icon sx={{ mr: 1 }}>edit</Icon>
            Edit Details
          </MenuItem>
          {actionMenuLoan && (actionMenuLoan.status === 'pending' || actionMenuLoan.status === 'query') && (
            <>
              <MenuItem
                onClick={() => {
                  handleApproveLoan(actionMenuLoan.id);
                  setActionMenuAnchor(null);
                }}
                sx={{ color: '#4caf50' }}
              >
                <Icon sx={{ mr: 1 }}>check_circle</Icon>
                Approve
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDenyLoan(actionMenuLoan.id);
                  setActionMenuAnchor(null);
                }}
                sx={{ color: '#f44336' }}
              >
                <Icon sx={{ mr: 1 }}>cancel</Icon>
                Decline
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleRaiseQuery(actionMenuLoan.id);
                  setActionMenuAnchor(null);
                }}
                sx={{ color: '#ff9800' }}
              >
                <Icon sx={{ mr: 1 }}>help_outline</Icon>
                Raise Query
              </MenuItem>
            </>
          )}
        </Menu>

        <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDTypography variant="caption">Page size:</MDTypography>
            <VhoozhtSelect
              size="small"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
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
      </Card>

      {/* Modals */}
      <LoanEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        loan={editing}
        onSave={handleSaveLoan}
      />

      <BulkLoanOperationsModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedLoans={selectedLoans}
        onBulkAction={handleBulkAction}
      />

      <LoanReviewModal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewLoan(null);
        }}
        loan={reviewLoan}
        onApprove={handleApproveLoan}
        onDecline={handleDenyLoan}
        onQuery={handleRaiseQuery}
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
    </DashboardLayout>
  );
}

export default AdminLoans;

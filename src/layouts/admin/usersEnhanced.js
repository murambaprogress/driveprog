import React, { useEffect, useState, useCallback } from "react";
import SharedDashboardLayout from "components/SharedDashboardLayout";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import EnhancedTable from "components/EnhancedTable";
import { formatters } from "utils/dataFormatters";
import adminUserService from "../../services/adminUserService";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Import glowing icons CSS
import "../../assets/css/glowing-icons.css";
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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha } from "@mui/material/styles";

import StatisticsCard from "components/Cards/StatisticsCard";

// Enhanced User Profile Card Component
function UserProfileCard({ user, onEdit, onQuickAction }) {
  const getStatusColor = (status) => {
    const colors = {
      'active': '#4caf50',
      'suspended': '#f44336',
      'pending': '#ff9800',
      'verified': '#2196f3'
    };
    return colors[status] || '#757575';
  };

  const getCreditScoreColor = (score) => {
    if (score >= 750) return '#4caf50';
    if (score >= 650) return '#ff9800';
    return '#f44336';
  };

  return (
    <Card sx={{
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: 280,
      maxHeight: 320,
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 6
      },
      border: `2px solid ${alpha(getStatusColor(user.status), 0.2)}`,
    }}>
      <MDBox display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <MDBox display="flex" alignItems="center" flex={1} minWidth={0}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: getStatusColor(user.status),
                border: '2px solid white'
              }} />
            }
          >
            <Avatar
              sx={{
                bgcolor: getStatusColor(user.status),
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                mr: 2,
                flexShrink: 0
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
          <MDBox flex={1} minWidth={0}>
            <MDTypography variant="h6" fontWeight="bold" color="text" noWrap>
              {user.name}
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.8} noWrap>
              {user.email}
            </MDTypography>
            <MDTypography variant="caption" color="text" opacity={0.6}>
              ID: {user.id}
            </MDTypography>
          </MDBox>
        </MDBox>
        
        <Chip
          label={user.status}
          size="small"
          sx={{
            bgcolor: alpha(getStatusColor(user.status), 0.1),
            color: getStatusColor(user.status),
            fontWeight: 'bold',
            textTransform: 'capitalize',
            ml: 1,
            flexShrink: 0
          }}
        />
      </MDBox>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Credit Score
          </MDTypography>
          <MDBox display="flex" alignItems="center">
            <MDTypography 
              variant="h6" 
              fontWeight="bold" 
              sx={{ color: getCreditScoreColor(user.creditScore) }}
            >
              {user.creditScore}
            </MDTypography>
            <LinearProgress
              variant="determinate"
              value={(user.creditScore / 850) * 100}
              sx={{
                ml: 1,
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(getCreditScoreColor(user.creditScore), 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getCreditScoreColor(user.creditScore),
                },
              }}
            />
          </MDBox>
        </Grid>
        <Grid item xs={6}>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Total Borrowed
          </MDTypography>
          <MDTypography variant="h6" fontWeight="bold" color="text">
            ${(user.totalBorrowed || 0).toLocaleString()}
          </MDTypography>
        </Grid>
      </Grid>

      <MDBox display="flex" alignItems="center" justifyContent="space-between" mt={2}>
        <MDBox>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            Member since
          </MDTypography>
            <MDTypography variant="body2" color="text">
            {formatters.date(user.createdDate)}
            </MDTypography>
        </MDBox>
        
        <MDBox display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => onEdit(user)}
              sx={{ 
                bgcolor: alpha('#2196f3', 0.1), 
                color: '#fff',
                '&:hover': { bgcolor: alpha('#2196f3', 0.2) }
              }}
            >
              <Icon fontSize="small" sx={{ color: '#fff' }}>visibility</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick Actions">
            <IconButton 
              size="small"
              onClick={() => onQuickAction(user)}
              sx={{ 
                bgcolor: alpha('#4caf50', 0.1), 
                color: '#fff',
                '&:hover': { bgcolor: alpha('#4caf50', 0.2) }
              }}
            >
              <Icon fontSize="small" sx={{ color: '#fff' }}>settings</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Enhanced User Edit Modal
function UserEditModal({ open, onClose, user, onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    creditScore: 0,
    totalBorrowed: 0,
    accountBalance: 0
  });

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || "",
        creditScore: user.creditScore || 0,
        totalBorrowed: user.totalBorrowed || 0,
        accountBalance: user.accountBalance || 0,
      });
    }
  }, [user]);

  if (!user) return null;

  const tabs = ['Basic Info', 'Financial', 'Activity'];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: '#2196f3' }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <MDBox>
            <MDTypography variant="h6">Edit User: {user.name}</MDTypography>
            <MDTypography variant="caption" color="text">
              ID: {user.id} • Status: {user.status}
            </MDTypography>
          </MDBox>
        </MDBox>
      </DialogTitle>
      
      <DialogContent>
        <MDBox sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <MDBox display="flex" gap={2}>
            {tabs.map((tab, index) => (
              <MDButton
                key={index}
                variant={activeTab === index ? "contained" : "text"}
                size="small"
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </MDButton>
            ))}
          </MDBox>
        </MDBox>

        {activeTab === 0 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <VhoozhtInput
                label="Full Name"
                fullWidth
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <VhoozhtInput
                label="Email"
                fullWidth
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <VhoozhtInput
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <VhoozhtSelect
                label="Status"
                fullWidth
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Verified' }
                ]}
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <VhoozhtInput
                label="Credit Score"
                fullWidth
                type="number"
                value={form.creditScore}
                onChange={e => setForm(f => ({ ...f, creditScore: parseInt(e.target.value) || 0 }))}
                inputProps={{ min: 300, max: 850 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <VhoozhtInput
                label="Total Borrowed ($)"
                fullWidth
                type="number"
                value={form.totalBorrowed}
                onChange={e => setForm(f => ({ ...f, totalBorrowed: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <VhoozhtInput
                label="Account Balance ($)"
                fullWidth
                type="number"
                value={form.accountBalance}
                onChange={e => setForm(f => ({ ...f, accountBalance: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <MDBox sx={{ mt: 2 }}>
            <MDTypography variant="h6" mb={2}>Recent Activity</MDTypography>
            <MDBox display="flex" flexDirection="column" gap={1}>
              <MDBox p={2} sx={{ bgcolor: alpha('#2196f3', 0.05), borderRadius: 2 }}>
                <MDTypography variant="body2" fontWeight="bold">Last Login</MDTypography>
                <MDTypography variant="caption" color="text">
                  {new Date(user.createdDate).toLocaleString()}
                </MDTypography>
              </MDBox>
              <MDBox p={2} sx={{ bgcolor: alpha('#4caf50', 0.05), borderRadius: 2 }}>
                <MDTypography variant="body2" fontWeight="bold">Account Created</MDTypography>
                <MDTypography variant="caption" color="text">
                  {new Date(user.createdDate).toLocaleString()}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <MDButton variant="outlined" onClick={onClose}>Cancel</MDButton>
        <MDButton variant="contained" onClick={() => onSave({ ...user, ...form })}>
          Save Changes
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

// Bulk Operations Modal (keeping the existing one but enhanced)
function BulkOperationsModal({ open, onClose, selectedUsers, onBulkAction }) {
  const [operation, setOperation] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [creditScoreAdjustment, setCreditScoreAdjustment] = useState(0);

  const handleBulkAction = () => {
    const userIds = selectedUsers.map(u => u.id);
    
    switch (operation) {
      case 'updateStatus':
        if (newStatus) {
          onBulkAction('status', userIds, { status: newStatus });
        }
        break;
      case 'adjustCredit':
        if (creditScoreAdjustment !== 0) {
          onBulkAction('creditScore', userIds, { creditScoreAdjustment });
        }
        break;
      case 'suspend':
        onBulkAction('status', userIds, { status: 'suspended' });
        break;
      case 'activate':
        onBulkAction('status', userIds, { status: 'active' });
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${userIds.length} users? This action cannot be undone.`)) {
          onBulkAction('delete', userIds);
        }
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDBox display="flex" alignItems="center">
          <Icon sx={{ mr: 1, color: '#ff9800' }}>group_work</Icon>
          Bulk Operations ({selectedUsers.length} users selected)
        </MDBox>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <VhoozhtSelect
              fullWidth
              size="small"
              label="Operation"
              value={operation}
              onChange={e => setOperation(e.target.value)}
              options={[
                { value: 'updateStatus', label: 'Update Status' },
                { value: 'adjustCredit', label: 'Adjust Credit Score' },
                { value: 'suspend', label: 'Suspend All' },
                { value: 'activate', label: 'Activate All' },
                { value: 'delete', label: 'Delete All' }
              ]}
              sx={{ '& .MuiInputBase-root': { height: 40 } }}
            />
          </Grid>
          
          {operation === 'updateStatus' && (
            <Grid item xs={12}>
              <VhoozhtSelect
                fullWidth
                size="small"
                label="New Status"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Verified' }
                ]}
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
              />
            </Grid>
          )}
          
          {operation === 'adjustCredit' && (
            <Grid item xs={12}>
              <VhoozhtInput
                fullWidth
                size="small"
                label="Credit Score Adjustment"
                type="number"
                value={creditScoreAdjustment}
                onChange={e => setCreditScoreAdjustment(parseInt(e.target.value) || 0)}
                helperText="Positive number to increase, negative to decrease"
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" onClick={onClose}>Cancel</MDButton>
        <MDButton 
          variant="contained" 
          onClick={handleBulkAction}
          color={operation === 'delete' ? 'error' : 'info'}
        >
          Apply
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    newUsersLast30Days: 0
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
  
  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [amountMinFilter, setAmountMinFilter] = useState("");
  const [amountMaxFilter, setAmountMaxFilter] = useState("");
  
  // Pagination and sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Adjusted for card view
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Selection and modals
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  
  // Notifications
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Fetch data with filters
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminUserService.fetchUsers({
        page,
        pageSize,
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      
      setUsers(result.users || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error("Error loading users:", error);
      showNotification("Error loading users", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, sortBy, sortOrder]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await adminUserService.getUserStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [fetchUsers, fetchStatistics]);

  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedUsers(checked ? [...users] : []);
  };

  const handleSelectUser = (user, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
      setSelectAll(false);
    }
  };

  // CRUD operations
  const handleSaveUser = async (updatedUser) => {
    try {
      const result = await adminUserService.updateUser(updatedUser.id, updatedUser);
      if (result) {
        showNotification("User updated successfully");
        setEditModalOpen(false);
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification("Error updating user", "error");
    }
  };

  const handleQuickAction = async (user) => {
    const action = window.prompt(
      `Quick Actions for ${user.name}:\n` +
      `1 - Activate\n` +
      `2 - Suspend\n` +
      `3 - Verify\n` +
      `4 - Edit\n` +
      `5 - Delete\n\n` +
      `Enter action number:`
    );

    try {
      switch (action) {
        case '1':
          await adminUserService.activateUser(user.id);
          showNotification(`${user.name} activated`);
          break;
        case '2':
          await adminUserService.suspendUser(user.id);
          showNotification(`${user.name} suspended`);
          break;
        case '3':
          await adminUserService.verifyUser(user.id);
          showNotification(`${user.name} verified`);
          break;
        case '4':
          setEditing(user);
          setEditModalOpen(true);
          return;
        case '5':
          if (window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
            await adminUserService.deleteUser(user.id);
            showNotification(`${user.name} deleted`);
          }
          break;
        default:
          return;
      }
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      console.error("Error performing quick action:", error);
      showNotification("Error performing action", "error");
    }
  };

  const handleBulkAction = async (actionType, userIds, params = {}) => {
    try {
      let result;
      const ids = userIds.map(u => typeof u === 'object' ? u.id : u);
      
      switch (actionType) {
        case 'status':
          result = await adminUserService.bulkUpdateUsers(ids, { status: params.status });
          showNotification(`${result.updatedCount || ids.length} users updated`);
          break;
        case 'creditScore':
          // Credit score adjustment is not in backend yet - skip for now
          showNotification("Credit score adjustment not implemented yet", "warning");
          break;
        case 'delete':
          result = await adminUserService.bulkDeleteUsers(ids);
          showNotification(`${result.deletedCount || ids.length} users deleted`);
          break;
        default:
          break;
      }
      
      setSelectedUsers([]);
      setSelectAll(false);
      fetchUsers();
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      showNotification("Error performing bulk operation", "error");
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const filteredUsers = selectedUsers.length ? selectedUsers : users;
    // TODO: Implement CSV export
    const csvContent = [
      ['ID', 'Name', 'Email', 'Status', 'Created Date'].join(','),
      ...filteredUsers.map(u => [u.id, u.name, u.email, u.status, u.createdDate].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString()}.csv`;
    a.click();
    showNotification(`Exported ${filteredUsers.length} users to CSV`);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString()}.json`;
    a.click();
    showNotification("Users data exported to JSON");
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
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      case 'verified': return 'info';
      default: return 'default';
    }
  };

  return (
    <SharedDashboardLayout>
      <MDBox sx={{ maxWidth: '100%', width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <MDBox mb={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="text">
                Users Management
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.8}>
                Manage all user accounts, permissions, and financial profiles
              </MDTypography>
            </MDBox>

          </MDBox>

          {/* Stats Bar (dashboard-style cards) */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6} lg={3}>
              <StatisticsCard
                color="info"
                icon="groups"
                title="Total Users"
                count={statistics.total.toString()}
                percentage={{ 
                  color: 'info', 
                  label: ''
                }}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <StatisticsCard
                color="success"
                icon="person_check"
                title="Active Users"
                count={statistics.active.toString()}
                percentage={{ 
                  color: 'success', 
                  label: ''
                }}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <StatisticsCard
                color="warning"
                icon="pending_actions"
                title="Pending Verification"
                count={statistics.pending.toString()}
                percentage={{ 
                  color: 'warning', 
                  label: ''
                }}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <StatisticsCard
                color="error"
                icon="block"
                title="Suspended Users"
                count={statistics.suspended.toString()}
                percentage={{ 
                  color: 'error', 
                  label: ''
                }}
              />
            </Grid>
          </Grid>

          {/* Filters */}
          <Card sx={{ p: 3, mb: 3 }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
              <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <MDTypography variant="h6" fontWeight="medium">
                  Filters & Search
                </MDTypography>
                <VhoozhtInput
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  sx={{ width: { xs: '100%', sm: 250 } }}
                  size="small"
                />
              </MDBox>
              <MDBox display="flex" gap={1} flexWrap="wrap">
                <MDButton variant="outlined" onClick={handleExportCSV} disabled={!users.length} size="small">
                  Export CSV
                </MDButton>
                <MDButton variant="outlined" onClick={handleExportJSON} size="small">
                  Export JSON
                </MDButton>
                {selectedUsers.length > 0 && (
                  <MDButton variant="contained" color="warning" onClick={() => setBulkModalOpen(true)} size="small">
                    Bulk Actions ({selectedUsers.length})
                  </MDButton>
                )}
              </MDBox>
            </MDBox>
            
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              <Grid item xs={12}>
                <MDBox display="flex" justifyContent="center">
                  <Grid container spacing={2} sx={{ maxWidth: 1000 }} justifyContent="center">
                    <Grid item xs={12} sm={6} md={2.4}>
                      <VhoozhtSelect
                        fullWidth
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        options={[
                          { value: '', label: 'All Statuses' },
                          { value: 'active', label: 'Active' },
                          { value: 'suspended', label: 'Suspended' },
                          { value: 'pending', label: 'Pending' },
                          { value: 'verified', label: 'Verified' }
                        ]}
                        sx={{ '& .MuiInputBase-root': { height: 40 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                      <VhoozhtInput
                        label="Date From"
                        type="date"
                        fullWidth
                        size="small"
                        value={dateFromFilter}
                        onChange={(e) => { setDateFromFilter(e.target.value); setPage(1); }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiInputBase-root': { height: 40 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                      <VhoozhtInput
                        label="Date To"
                        type="date"
                        fullWidth
                        size="small"
                        value={dateToFilter}
                        onChange={(e) => { setDateToFilter(e.target.value); setPage(1); }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiInputBase-root': { height: 40 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                      <VhoozhtInput
                        label="Min Amount"
                        type="number"
                        fullWidth
                        size="small"
                        value={amountMinFilter}
                        onChange={(e) => { setAmountMinFilter(e.target.value); setPage(1); }}
                        sx={{ '& .MuiInputBase-root': { height: 40 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                      <VhoozhtInput
                        label="Max Amount"
                        type="number"
                        fullWidth
                        size="small"
                        value={amountMaxFilter}
                        onChange={(e) => { setAmountMaxFilter(e.target.value); setPage(1); }}
                        sx={{ '& .MuiInputBase-root': { height: 40 } }}
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Grid>
            </Grid>

            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={2}>
              <MDButton variant="text" onClick={clearFilters} size="small">
                Clear All Filters
              </MDButton>
              <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <MDTypography variant="caption">Sort by:</MDTypography>
                <VhoozhtSelect
                  size="small"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'name', label: 'Name' },
                    { value: 'email', label: 'Email' },
                    { value: 'createdDate', label: 'Date Created' },
                    { value: 'totalBorrowed', label: 'Total Borrowed' },
                    { value: 'creditScore', label: 'Credit Score' }
                  ]}
                  showLabel={false}
                />
                <VhoozhtSelect
                  size="small"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  options={[
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' }
                  ]}
                  showLabel={false}
                />
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>

        {/* Loading State */}
        {loading && (
          <MDBox display="flex" justifyContent="center" my={4}>
            <LinearProgress sx={{ width: '50%' }} />
          </MDBox>
        )}

        {/* Content Area */}
        {!loading && (
          <>
            {/* Enhanced Table View */}
            <EnhancedTable
                columns={[
                  {
                    id: 'name',
                    label: 'Name',
                    width: 200,
                    minWidth: 150,
                    align: 'left',
                    format: (value, row) => (
                      <MDBox display="flex" alignItems="center" className="user-info" minHeight="48px">
                        <Avatar sx={{ mr: 2, bgcolor: '#2196f3', width: 32, height: 32, flexShrink: 0 }}>
                          {row.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <MDBox className="user-details">
                          <MDTypography variant="button" fontWeight="medium" noWrap lineHeight="1.2">
                            {row.name}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block" noWrap lineHeight="1.2">
                            ID: {row.id}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    ),
                  },
                  {
                    id: 'email',
                    label: 'Email',
                    width: 250,
                    minWidth: 200,
                    align: 'left',
                    format: (value) => (
                      <MDBox display="flex" alignItems="center" minHeight="48px">
                        <MDTypography variant="body2" noWrap title={value}>
                          {value}
                        </MDTypography>
                      </MDBox>
                    ),
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    width: 120,
                    align: 'center',
                    format: (value) => (
                      <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="48px">
                        <Chip
                          label={value}
                          color={getStatusColor(value)}
                          size="small"
                          className="status-chip"
                        />
                      </MDBox>
                    ),
                  },
                  {
                    id: 'creditScore',
                    label: 'Credit Score',
                    width: 120,
                    align: 'center',
                    format: (value) => (
                      <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="48px">
                        <MDTypography variant="button" fontWeight="medium">
                          {value}
                        </MDTypography>
                      </MDBox>
                    ),
                  },
                  {
                    id: 'totalBorrowed',
                    label: 'Total Borrowed',
                    width: 140,
                    align: 'right',
                    format: (value) => (
                      <MDBox display="flex" alignItems="center" justifyContent="flex-end" minHeight="48px">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatters.currency(value || 0)}
                        </MDTypography>
                      </MDBox>
                    ),
                  },
                  {
                    id: 'createdDate',
                    label: 'Created',
                    width: 130,
                    align: 'center',
                    format: (value) => (
                      <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="48px">
                        <MDTypography variant="body2">
                          {formatters.date(value)}
                        </MDTypography>
                      </MDBox>
                    ),
                  },
                  {
                    id: 'actions',
                    label: 'Actions',
                    width: 120,
                    align: 'center',
                    format: (value, row) => (
                      <MDBox display="flex" justifyContent="center" alignItems="center" gap={1} minHeight="48px">
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => { setEditing(row); setEditModalOpen(true); }}
                            sx={{ 
                              width: 32, 
                              height: 32,
                              '&:hover': { bgcolor: alpha('#2196f3', 0.1) }
                            }}
                          >
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                        </Tooltip>
                      </MDBox>
                    ),
                  },
                ]}
                data={users}
                selectedItems={selectedUsers}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectUser}
                showCheckbox={true}
                stickyHeader={false}
                maxHeight="70vh"
              />

            {/* Pagination */}
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={4}>
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDTypography variant="caption">Page size:</MDTypography>
                <VhoozhtSelect
                  size="small"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  options={[
                    { value: 6, label: '6' },
                    { value: 12, label: '12' },
                    { value: 24, label: '24' },
                    { value: 48, label: '48' }
                  ]}
                  showLabel={false}
                />
                <MDTypography variant="caption">
                  Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total}
                </MDTypography>
              </MDBox>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </MDBox>
          </>
        )}

        {/* Modals */}
        <UserEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={editing}
          onSave={handleSaveUser}
        />

        <BulkOperationsModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          selectedUsers={selectedUsers}
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
      </MDBox>
    </SharedDashboardLayout>
  );
}

export default AdminUsers;

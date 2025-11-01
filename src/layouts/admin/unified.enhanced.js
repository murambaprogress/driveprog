import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import { formatters } from "utils/dataFormatters";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Import existing enhanced components
import AdminUsersEnhanced from "./usersEnhanced";
import AdminLoansEnhanced from "./loansEnhanced";
import AdminPaymentsEnhanced from "./paymentsEnhanced";
import AdminSettings from "./settings";

import adminDataService from "../../services/adminDataService";

// Modern Analytics Card Component
function AnalyticsCard({ title, value, change, icon, color, subtitle, trend = [], loading = false }) {
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        borderLeft: `4px solid ${color}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${color}30`,
        }
      }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
        <MDBox flex={1}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: color,
                width: 56,
                height: 56,
                mr: 2,
              }}
            >
              <Icon fontSize="large" sx={{ color: 'white' }}>{icon}</Icon>
            </Avatar>
            <MDBox>
              <MDTypography variant="h3" fontWeight="bold" color="text">
                {loading ? "..." : value}
              </MDTypography>
              {change && (
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color={change.startsWith('+') ? 'success' : change.startsWith('-') ? 'error' : 'info'}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Icon fontSize="small" sx={{ mr: 0.5 }}>
                    {change.startsWith('+') ? 'trending_up' : change.startsWith('-') ? 'trending_down' : 'trending_flat'}
                  </Icon>
                  {change}
                </MDTypography>
              )}
            </MDBox>
          </MDBox>
          
          <MDTypography variant="h6" fontWeight="medium" color="text" mb={0.5}>
            {title}
          </MDTypography>
          
          {subtitle && (
            <MDTypography variant="body2" color="text" opacity={0.7}>
              {subtitle}
            </MDTypography>
          )}

          {/* Mini trend chart */}
          {trend.length > 0 && (
            <MDBox mt={2}>
              <MDBox display="flex" alignItems="flex-end" gap={0.5}>
                {trend.slice(-12).map((point, index) => (
                  <MDBox
                    key={index}
                    width="8px"
                    height={`${Math.min(point / Math.max(...trend) * 40, 40)}px`}
                    sx={{
                      backgroundColor: color,
                      borderRadius: '2px 2px 0 0',
                      minHeight: '4px',
                      opacity: 0.7 + (index / trend.length) * 0.3
                    }}
                  />
                ))}
              </MDBox>
              <MDTypography variant="caption" color="text" opacity={0.6} mt={1}>
                Last 12 periods
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Document Verification Component
function DocumentVerificationPanel() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      userName: "John Doe",
      userId: "USR001",
      documentName: "Driver's License",
      category: "Identity Documents",
      uploadDate: "2025-09-01T14:30:00",
      status: "pending",
      size: "2.4 MB",
      type: "PDF",
      loanId: "LN001"
    },
    {
      id: 2,
      userName: "Jane Smith",
      userId: "USR002",
      documentName: "Bank Statement",
      category: "Financial Documents",
      uploadDate: "2025-09-01T16:45:00",
      status: "pending",
      size: "1.8 MB",
      type: "PDF",
      loanId: "LN002"
    },
    {
      id: 3,
      userName: "Mike Johnson",
      userId: "USR003",
      documentName: "Employment Letter",
      category: "Income Verification",
      uploadDate: "2025-09-02T09:15:00",
      status: "pending",
      size: "1.2 MB",
      type: "PDF",
      loanId: "LN003"
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationData, setVerificationData] = useState({
    status: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleVerifyDocument = (document) => {
    setSelectedDocument(document);
    setVerificationData({ status: '', notes: '' });
    setVerificationDialog(true);
  };

  const handleSubmitVerification = () => {
    if (!verificationData.status) {
      setSnackbar({ open: true, message: 'Please select a verification status', severity: 'error' });
      return;
    }

    // Update document status
    setDocuments(prev => prev.map(doc => 
      doc.id === selectedDocument.id 
        ? { 
            ...doc, 
            status: verificationData.status,
            verificationDate: new Date().toISOString(),
            adminNotes: verificationData.notes,
            verifiedBy: 'Admin'
          }
        : doc
    ));

    setSnackbar({ 
      open: true, 
      message: `Document ${verificationData.status} successfully`, 
      severity: verificationData.status === 'approved' ? 'success' : 'warning'
    });

    setVerificationDialog(false);
  };

  const formatDate = (date) => formatters.datetime(date);

  const pendingDocuments = documents.filter(doc => doc.status === 'pending');

  return (
    <MDBox>
      <Card sx={{ p: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">
              Document Verification Queue
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.7}>
              {pendingDocuments.length} documents waiting for verification
            </MDTypography>
          </MDBox>
          <Chip 
            label={`${pendingDocuments.length} Pending`}
            color="warning"
            sx={{ fontWeight: 'bold' }}
          />
        </MDBox>

        {pendingDocuments.length === 0 ? (
          <MDBox textAlign="center" py={6}>
            <Icon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }}>verified</Icon>
            <MDTypography variant="h6" fontWeight="bold" mb={1}>
              All Caught Up!
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.7}>
              No documents pending verification at this time.
            </MDTypography>
          </MDBox>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table sx={{ '& td, & th': { verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow>
                  <TableCell><MDTypography variant="caption" fontWeight="bold">User</MDTypography></TableCell>
                  <TableCell><MDTypography variant="caption" fontWeight="bold">Document</MDTypography></TableCell>
                  <TableCell><MDTypography variant="caption" fontWeight="bold">Category</MDTypography></TableCell>
                  <TableCell><MDTypography variant="caption" fontWeight="bold">Upload Date</MDTypography></TableCell>
                  <TableCell><MDTypography variant="caption" fontWeight="bold">Size</MDTypography></TableCell>
                  <TableCell><MDTypography variant="caption" fontWeight="bold">Actions</MDTypography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <MDBox className="doc-user" minHeight="48px" display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: '#2196f3', mr: 2, width: 32, height: 32 }}>
                          <MDTypography variant="caption" fontWeight="bold" sx={{ color: 'white' }}>
                            {document.userName.split(' ').map(n => n[0]).join('')}
                          </MDTypography>
                        </Avatar>
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {document.userName}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" opacity={0.7}>
                            ID: {document.userId}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </TableCell>
                    <TableCell>
                      <MDBox className="doc-name" minHeight="48px" display="flex" alignItems="center">
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {document.documentName}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" opacity={0.7}>
                            {document.type} • Loan: {document.loanId}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </TableCell>
                    <TableCell>
                      <MDBox className="doc-category" minHeight="48px" display="flex" alignItems="center">
                        <MDTypography variant="body2">
                          {document.category}
                        </MDTypography>
                      </MDBox>
                    </TableCell>
                    <TableCell>
                      <MDBox className="doc-date" minHeight="48px" display="flex" alignItems="center">
                        <MDTypography variant="body2">
                          {formatDate(document.uploadDate)}
                        </MDTypography>
                      </MDBox>
                    </TableCell>
                    <TableCell>
                      <MDBox className="doc-size" minHeight="48px" display="flex" alignItems="center">
                        <MDTypography variant="body2">
                          {document.size}
                        </MDTypography>
                      </MDBox>
                    </TableCell>
                    <TableCell>
                      <MDBox className="doc-actions" minHeight="48px" display="flex" alignItems="center" gap={1}>
                        <Tooltip title="View Document">
                          <IconButton size="small" sx={{ color: '#2196f3' }}>
                            <Icon fontSize="small">visibility</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small" sx={{ color: '#4caf50' }}>
                            <Icon fontSize="small">download</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Verify Document">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#ff9800' }}
                            onClick={() => handleVerifyDocument(document)}
                          >
                            <Icon fontSize="small">verified_user</Icon>
                          </IconButton>
                        </Tooltip>
                      </MDBox>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onClose={() => setVerificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <MDBox display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
              <Icon>verified_user</Icon>
            </Avatar>
            <MDBox>
              <MDTypography variant="h5" fontWeight="bold">
                Document Verification
              </MDTypography>
              <MDTypography variant="caption" color="text">
                {selectedDocument?.documentName} - {selectedDocument?.userName}
              </MDTypography>
            </MDBox>
          </MDBox>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <VhoozhtSelect
                fullWidth
                label="Verification Status"
                value={verificationData.status}
                onChange={(e) => setVerificationData(prev => ({ ...prev, status: e.target.value }))}
                options={[
                  {
                    value: "approved",
                    label: (
                      <MDBox display="flex" alignItems="center">
                        <Icon sx={{ color: '#4caf50', mr: 1 }}>check_circle</Icon>
                        Approved
                      </MDBox>
                    )
                  },
                  {
                    value: "rejected",
                    label: (
                      <MDBox display="flex" alignItems="center">
                        <Icon sx={{ color: '#f44336', mr: 1 }}>cancel</Icon>
                        Rejected
                      </MDBox>
                    )
                  },
                  {
                    value: "requires_action",
                    label: (
                      <MDBox display="flex" alignItems="center">
                        <Icon sx={{ color: '#ff9800', mr: 1 }}>warning</Icon>
                        Requires Action
                      </MDBox>
                    )
                  }
                ]}
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12}>
              <VhoozhtTextarea
                fullWidth
                label="Admin Notes"
                rows={4}
                value={verificationData.notes}
                onChange={(e) => setVerificationData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes for the user about this verification decision..."
                size="medium"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <MDButton variant="outlined" color="secondary" onClick={() => setVerificationDialog(false)}>
            Cancel
          </MDButton>
          <MDButton 
            variant="gradient" 
            color={verificationData.status === 'approved' ? 'success' : verificationData.status === 'rejected' ? 'error' : 'warning'}
            onClick={handleSubmitVerification}
            startIcon={<Icon>verified_user</Icon>}
          >
            Submit Verification
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

// Main Admin Dashboard Component
function UnifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        // Get data from admin service
        const users = adminDataService.getUsers();
        const loans = adminDataService.getLoans();
        const payments = adminDataService.getPayments();
        
        // Calculate enhanced metrics with trends
        const totalUsers = users.total;
        const activeUsers = users.items.filter(u => u.status === 'active').length;
        const newUsersThisMonth = users.items.filter(u => {
          const userDate = new Date(u.createdDate);
          const now = new Date();
          return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
        }).length;
        
        const totalLoans = loans.total;
        const pendingLoans = loans.items.filter(l => l.status === 'pending').length;
        const approvedLoans = loans.items.filter(l => l.status === 'approved').length;
        const totalLoanAmount = loans.items.reduce((sum, loan) => sum + loan.amount, 0);
        
        const totalRevenue = payments.items.reduce((sum, payment) => sum + payment.amount, 0);
        const monthlyRevenue = payments.items
          .filter(p => {
            const paymentDate = new Date(p.date);
            const now = new Date();
            return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, payment) => sum + payment.amount, 0);

        // Mock trend data for the last 12 periods
        const userTrend = [120, 135, 128, 156, 148, 167, 178, 189, 195, 203, 218, activeUsers];
        const loanTrend = [45, 52, 48, 61, 55, 67, 73, 78, 82, 89, 95, totalLoans];
        const revenueTrend = [8500, 9200, 8900, 10500, 9800, 11200, 12100, 12800, 13400, 14200, 15100, monthlyRevenue];

        setMetrics({
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          totalLoans,
          pendingLoans,
          approvedLoans,
          totalLoanAmount,
          totalRevenue,
          monthlyRevenue,
          userTrend,
          loanTrend,
          revenueTrend
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Dashboard Overview Tab
  const DashboardOverview = () => (
    <MDBox>
      {/* Enhanced Analytics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Total Users"
            value={metrics.totalUsers || "0"}
            change="+12.5%"
            icon="people"
            color="#2196f3"
            subtitle={`${metrics.activeUsers || 0} active users`}
            trend={metrics.userTrend || []}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Active Loans"
            value={metrics.totalLoans || "0"}
            change="+8.2%"
            icon="account_balance"
            color="#ff9800"
            subtitle={`${formatCurrency(metrics.totalLoanAmount || 0)} disbursed`}
            trend={metrics.loanTrend || []}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Monthly Revenue"
            value={formatCurrency(metrics.monthlyRevenue || 0)}
            change="+15.3%"
            icon="payments"
            color="#4caf50"
            subtitle="This month"
            trend={metrics.revenueTrend || []}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Approval Rate"
            value="94.2%"
            change="+2.1%"
            icon="trending_up"
            color="#9c27b0"
            subtitle="Loan approvals"
            trend={[89, 90, 91, 92, 93, 93, 94, 94]}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Document Verification Panel */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <DocumentVerificationPanel />
        </Grid>
      </Grid>

      {/* Quick Actions & Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, height: '400px' }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDTypography variant="h5" fontWeight="bold">
                Recent System Activity
              </MDTypography>
              <MDButton variant="outlined" color="info" size="small">
                View All
              </MDButton>
            </MDBox>
            
            <MDBox sx={{ height: '300px', overflowY: 'auto' }}>
              {[
                { type: 'user', title: 'New user registered: Sarah Wilson', time: '5 minutes ago', color: '#2196f3' },
                { type: 'loan', title: 'Loan application submitted: $15,000', time: '12 minutes ago', color: '#ff9800' },
                { type: 'document', title: 'Document uploaded for verification', time: '18 minutes ago', color: '#9c27b0' },
                { type: 'payment', title: 'Payment processed: $850', time: '25 minutes ago', color: '#4caf50' },
                { type: 'loan', title: 'Loan approved: $25,000', time: '32 minutes ago', color: '#4caf50' },
                { type: 'document', title: 'Document verification completed', time: '45 minutes ago', color: '#9c27b0' },
                { type: 'user', title: 'User profile updated: John Smith', time: '1 hour ago', color: '#2196f3' },
              ].map((activity, index) => (
                <MDBox
                  key={index}
                  display="flex"
                  alignItems="center"
                  py={2}
                  borderBottom={index < 6 ? "1px solid #f0f0f0" : "none"}
                >
                  <Avatar sx={{ bgcolor: activity.color, mr: 2, width: 40, height: 40 }}>
                    <Icon fontSize="small" sx={{ color: 'white' }}>
                      {activity.type === 'user' ? 'person' : 
                       activity.type === 'loan' ? 'account_balance' : 
                       activity.type === 'document' ? 'folder' : 'payment'}
                    </Icon>
                  </Avatar>
                  <MDBox flex={1}>
                    <MDTypography variant="body2" fontWeight="medium">
                      {activity.title}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" opacity={0.7}>
                      {activity.time}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              ))}
            </MDBox>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, height: '400px' }}>
            <MDTypography variant="h5" fontWeight="bold" mb={3}>
              Quick Actions
            </MDTypography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  startIcon={<Icon>person_add</Icon>}
                  sx={{ justifyContent: 'flex-start', py: 2 }}
                >
                  Add New User
                </MDButton>
              </Grid>
              
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="warning"
                  fullWidth
                  startIcon={<Icon>pending_actions</Icon>}
                  sx={{ justifyContent: 'flex-start', py: 2 }}
                  onClick={() => setActiveTab(2)}
                >
                  Review Pending Loans
                </MDButton>
              </Grid>
              
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="success"
                  fullWidth
                  startIcon={<Icon>verified_user</Icon>}
                  sx={{ justifyContent: 'flex-start', py: 2 }}
                >
                  Verify Documents
                </MDButton>
              </Grid>
              
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="error"
                  fullWidth
                  startIcon={<Icon>assessment</Icon>}
                  sx={{ justifyContent: 'flex-start', py: 2 }}
                >
                  Generate Reports
                </MDButton>
              </Grid>
            </Grid>

              {/* System health UI removed per request */}
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
            Admin Portal 🛡️
          </MDTypography>
          <MDTypography variant="body1" color="text" opacity={0.7}>
            Comprehensive administrative dashboard with modern analytics and user management.
          </MDTypography>
        </MDBox>

  {/* Tabs removed - navigation handled via sidebar/topbar */}
        
        {activeTab === 0 && <DashboardOverview />}
        {activeTab === 1 && <AdminUsersEnhanced />}
        {activeTab === 2 && <AdminLoansEnhanced />}
        {activeTab === 3 && <AdminPaymentsEnhanced />}
        {activeTab === 4 && <AdminSettings />}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UnifiedAdminDashboard;

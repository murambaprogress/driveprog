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

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import { formatters } from "utils/dataFormatters";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import StatisticsCard from "components/Cards/StatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import PieChart from "examples/Charts/PieChart";

// Import existing enhanced components
import AdminUsersEnhanced from "./usersEnhanced";
import AdminLoansEnhanced from "./loansEnhanced";
import AdminPaymentsEnhanced from "./paymentsEnhanced";
import AdminSettings from "./settings";

import adminDataService from "../../services/adminDataService";
import adminDashboardService from "../../services/adminDashboardService";
// import glowing icons CSS
import "../../assets/css/glowing-icons.css";



// Document Verification Component
function DocumentVerificationPanel() {
  const [documents, setDocuments] = useState([]);

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
                      <MDBox display="flex" alignItems="center">
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
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium">
                          {document.documentName}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" opacity={0.7}>
                          {document.type} • Loan: {document.loanId}
                        </MDTypography>
                      </MDBox>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="body2">
                        {document.category}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="body2">
                        {formatDate(document.uploadDate)}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="body2">
                        {document.size}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDBox display="flex" gap={1}>
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

  // Admin dashboard chart data
  const adminChartsData = {
    // User growth chart data
    userGrowthChart: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      datasets: { 
        label: "User Growth",
        data: [120, 135, 128, 156, 148, 167, 178, 189, 203]
      }
    },
    // Loan approval trends
    loanTrendsChart: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Approved",
          data: [28, 32, 35, 38],
          color: "success"
        },
        {
          label: "Pending", 
          data: [12, 18, 15, 22],
          color: "warning"
        },
        {
          label: "Rejected",
          data: [3, 5, 4, 6],
          color: "error"
        }
      ]
    },
    // Revenue distribution pie chart
    revenueChart: {
      labels: ["Loan Interest", "Processing Fees", "Late Fees", "Other"],
      datasets: [{
        data: [65, 25, 8, 2],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0']
      }]
    }
  };

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        // Get real data from admin dashboard API
        console.log('Fetching dashboard statistics from API...');
        const stats = await adminDashboardService.getDashboardStatistics();
        console.log('Dashboard statistics received:', stats);
        
        // Update admin charts data with real data
        adminChartsData.userGrowthChart.datasets.data = stats.charts.userGrowth;
        adminChartsData.loanTrendsChart.datasets[0].data = stats.charts.loanTrends.approved;
        adminChartsData.loanTrendsChart.datasets[1].data = stats.charts.loanTrends.pending;
        adminChartsData.loanTrendsChart.datasets[2].data = stats.charts.loanTrends.rejected;

        setMetrics({
          totalUsers: stats.users.total,
          activeUsers: stats.users.active,
          newUsersThisMonth: stats.users.newThisMonth,
          userGrowth: stats.users.growth,
          
          totalLoans: stats.loans.total,
          pendingLoans: stats.loans.pending,
          approvedLoans: stats.loans.approved,
          activeLoans: stats.loans.active,
          totalLoanAmount: stats.loans.totalAmount,
          loanGrowth: stats.loans.growth,
          approvalRate: stats.loans.approvalRate,
          
          totalRevenue: stats.revenue.total,
          monthlyRevenue: stats.revenue.monthly,
          revenueGrowth: stats.revenue.growth,
          totalPayments: stats.revenue.totalPayments,
          
          userTrend: stats.charts.userGrowth,
          loanTrend: stats.charts.loanTrends.approved,
          revenueTrend: stats.charts.loanTrends.approved.map((v, i) => v * 1200 + Math.random() * 500)
        });
        
        console.log('Metrics updated successfully');
      } catch (error) {
        console.error('Error loading metrics:', error);
        // Fallback to default values on error
        setMetrics({
          totalUsers: 0,
          activeUsers: 0,
          newUsersThisMonth: 0,
          userGrowth: 0,
          totalLoans: 0,
          pendingLoans: 0,
          approvedLoans: 0,
          activeLoans: 0,
          totalLoanAmount: 0,
          loanGrowth: 0,
          approvalRate: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          revenueGrowth: 0,
          totalPayments: 0,
          userTrend: [],
          loanTrend: [],
          revenueTrend: []
        });
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

  // Admin Dashboard Overview Tab (Enhanced to match user dashboard)
  const DashboardOverview = () => (
    <MDBox>
      {/* Dashboard Header with Refresh */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDBox>
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={0.5}>
            Admin Dashboard Overview
          </MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.7}>
            Real-time system metrics and analytics
          </MDTypography>
        </MDBox>
        <Tooltip title="Refresh Dashboard Data">
          <IconButton 
            onClick={() => {
              setLoading(true);
              window.location.reload();
            }}
            sx={{
              bgcolor: 'info.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'info.dark',
                transform: 'rotate(180deg)',
                transition: 'all 0.5s ease'
              }
            }}
          >
            <Icon>refresh</Icon>
          </IconButton>
        </Tooltip>
      </MDBox>

      {/* Loading State */}
      {loading && (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px" mb={4}>
          <MDBox textAlign="center">
            <LinearProgress sx={{ width: 300, mb: 2 }} />
            <MDTypography variant="body2" color="text">
              Loading dashboard statistics...
            </MDTypography>
          </MDBox>
        </MDBox>
      )}

      {/* Admin Statistics Cards - Matching User Dashboard Style */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={3}>
          <StatisticsCard
            color="info"
            icon="people"
            title="Total Users"
            count={metrics.totalUsers?.toString() || "0"}
            percentage={{
              color: "success",
              label: metrics.userGrowth >= 0 ? `+${metrics.userGrowth}%` : `${metrics.userGrowth}%`,
            }}
            description={`${metrics.activeUsers || 0} active • ${metrics.newUsersThisMonth || 0} new this month`}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatisticsCard
            color="success"
            icon="account_balance"
            title="Active Loans"
            count={metrics.activeLoans?.toString() || "0"}
            percentage={{
              color: "success",
              label: metrics.loanGrowth >= 0 ? `+${metrics.loanGrowth}%` : `${metrics.loanGrowth}%`,
            }}
            description={`${metrics.pendingLoans || 0} pending • ${formatCurrency(metrics.totalLoanAmount || 0)} disbursed`}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatisticsCard
            color="primary"
            icon="payments"
            title="Monthly Revenue"
            count={formatCurrency(metrics.monthlyRevenue || 0)}
            percentage={{
              color: "success",
              label: metrics.revenueGrowth >= 0 ? `+${metrics.revenueGrowth}%` : `${metrics.revenueGrowth}%`,
            }}
            description={`${formatCurrency(metrics.totalRevenue || 0)} total revenue`}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatisticsCard
            color="dark"
            icon="trending_up"
            title="Approval Rate"
            count={`${metrics.approvalRate || 0}%`}
            percentage={{
              color: "success",
              label: metrics.approvalRate >= 90 ? "+2.1%" : metrics.approvalRate >= 80 ? "+0.5%" : "-1.2%",
            }}
            description={`${metrics.totalLoans || 0} total loan applications`}
          />
        </Grid>
      </Grid>

      {/* Admin Analytics Charts - Similar to User Dashboard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={3} sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <ReportsBarChart
              color="info"
              title="User Growth Analytics"
              description="Monthly user registration trends"
              date="Updated daily"
              chart={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
                datasets: { 
                  label: "New Users",
                  data: metrics.userTrend || [120, 135, 128, 156, 148, 167, 178, 189, 203]
                }
              }}
            />
          </MDBox>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={3} sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <PieChart
              color="success"
              title="Revenue Distribution"
              description="Revenue sources breakdown"
              date="Updated this month"
              chart={adminChartsData.revenueChart}
            />
          </MDBox>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={3} sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <ReportsLineChart
              color="warning"
              title="Loan Processing Trends"
              description="Weekly loan approval patterns"
              date="Updated weekly"
              chart={{
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: {
                  label: "Approved Loans",
                  data: metrics.loanTrend?.slice(0, 4) || [28, 32, 35, 38]
                }
              }}
            />
          </MDBox>
        </Grid>
      </Grid>

      {/* Document Verification Panel */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <DocumentVerificationPanel />
        </Grid>
      </Grid>

      {/* Bottom Section - Activity Overview & Admin Tools */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={8}>
          <Card sx={{ p: 3, height: '400px' }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDBox>
                <MDTypography variant="h6" fontWeight="bold">
                  Recent System Activity
                </MDTypography>
                <MDTypography variant="body2" color="text" opacity={0.7}>
                  Live admin activity feed
                </MDTypography>
              </MDBox>
              <MDButton variant="outlined" color="info" size="small">
                View All Activity
              </MDButton>
            </MDBox>
            
            <MDBox sx={{ height: '300px', overflowY: 'auto', pr: 1 }}>
              {[
                { type: 'user', title: `New user registered`, subtitle: 'User count now at ' + (metrics.totalUsers || 0), time: '5 minutes ago', color: '#2196f3', icon: 'person_add' },
                { type: 'loan', title: 'Loan application submitted', subtitle: '$15,000 requested', time: '12 minutes ago', color: '#ff9800', icon: 'account_balance' },
                { type: 'document', title: 'Document uploaded', subtitle: 'Awaiting verification', time: '18 minutes ago', color: '#9c27b0', icon: 'folder_open' },
                { type: 'payment', title: 'Payment processed', subtitle: '$850.00 received', time: '25 minutes ago', color: '#4caf50', icon: 'payments' },
                { type: 'loan', title: 'Loan approved', subtitle: '$25,000 disbursed', time: '32 minutes ago', color: '#4caf50', icon: 'check_circle' },
                { type: 'document', title: 'Document verified', subtitle: 'Verification completed', time: '45 minutes ago', color: '#9c27b0', icon: 'verified' },
                { type: 'user', title: 'User profile updated', subtitle: 'Profile modifications saved', time: '1 hour ago', color: '#2196f3', icon: 'edit' },
              ].map((activity, index) => (
                <MDBox
                  key={index}
                  display="flex"
                  alignItems="center"
                  py={2}
                  px={1}
                  borderRadius="8px"
                  mb={1}
                  sx={{
                    borderBottom: index < 6 ? "1px solid #f5f5f5" : "none",
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      transform: 'translateX(4px)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: activity.color, 
                    mr: 2, 
                    width: 44, 
                    height: 44,
                    boxShadow: `0 4px 12px ${activity.color}33`
                  }}>
                    <Icon fontSize="small" sx={{ color: 'white' }}>
                      {activity.icon}
                    </Icon>
                  </Avatar>
                  <MDBox flex={1}>
                    <MDTypography variant="body2" fontWeight="medium" mb={0.5}>
                      {activity.title}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" opacity={0.6} display="block">
                      {activity.subtitle}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" opacity={0.5} display="flex" alignItems="center" mt={0.5}>
                      <Icon sx={{ fontSize: 12, mr: 0.5 }}>schedule</Icon>
                      {activity.time}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              ))}
            </MDBox>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ p: 3, height: '400px' }}>
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                Admin Quick Actions
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Frequently used admin tools
              </MDTypography>
            </MDBox>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  startIcon={<Icon className="glow-icon-user glow-icon-active">person_add</Icon>}
                  onClick={() => setActiveTab(1)}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    py: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)'
                    }
                  }}
                >
                  Manage Users
                </MDButton>
              </Grid>
              
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="warning"
                  fullWidth
                  startIcon={<Icon className="glow-icon-loan glow-icon-pending">pending_actions</Icon>}
                  onClick={() => setActiveTab(2)}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    py: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 6px 20px rgba(255, 152, 0, 0.3)'
                    }
                  }}
                >
                  Review Pending Loans ({metrics.pendingLoans || 0})
                </MDButton>
              </Grid>
              
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="success"
                  fullWidth
                  startIcon={<Icon className="glow-icon-payment glow-icon-success">verified_user</Icon>}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    py: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)'
                    }
                  }}
                >
                  Verify Documents
                </MDButton>
              </Grid>
              
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="dark"
                  fullWidth
                  startIcon={<Icon>assessment</Icon>}
                  onClick={() => setActiveTab(3)}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    py: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                >
                  View Payments
                </MDButton>
              </Grid>
              
              <Grid item xs={12}>
                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  startIcon={<Icon>settings</Icon>}
                  onClick={() => setActiveTab(4)}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    py: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  Admin Settings
                </MDButton>
              </Grid>
            </Grid>

            {/* System Health Monitor removed per request */}
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );

  return (
    <DashboardLayout noPaddingTop>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Enhanced Admin Header - Matching User Dashboard */}
        <MDBox mb={4}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} lg={8}>
              <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
                Admin Dashboard
              </MDTypography>
              <MDTypography variant="body1" color="text" opacity={0.7}>
                Comprehensive platform administration with real-time analytics and user management capabilities.
              </MDTypography>
            </Grid>
            <Grid item xs={12} lg={4}>
              <MDBox display="flex" justifyContent={{ xs: "flex-start", lg: "flex-end" }} gap={2}>
                <MDButton
                  variant="gradient"
                  color="info"
                  startIcon={<Icon>add</Icon>}
                  size="small"
                >
                  Add User
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="dark"
                  startIcon={<Icon>download</Icon>}
                  size="small"
                >
                  Export Data
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
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

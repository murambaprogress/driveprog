import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import AdminUsersEnhanced from "./usersEnhanced";
import AdminLoansEnhanced from "./loansEnhanced";
import AdminPaymentsEnhanced from "./paymentsEnhanced";
import AdminSettings from "./settings";

import adminDataService from "../../services/adminDataService";

// Enhanced Metric Card Component
function MetricCard({ title, value, change, icon, color, onClick, subtitle, loading = false }) {
  return (
    <Card
      sx={{
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        } : {},
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        borderLeft: `4px solid ${color}`,
      }}
      onClick={onClick}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
        <MDBox flex={1}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
                mr: 2,
              }}
            >
              <Icon fontSize="medium">{icon}</Icon>
            </Avatar>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="text">
                {loading ? "..." : value}
              </MDTypography>
              {change && (
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  color={change.startsWith('+') ? 'success' : change.startsWith('-') ? 'error' : 'info'}
                >
                  {change}
                </MDTypography>
              )}
            </MDBox>
          </MDBox>
          
          <MDTypography variant="body2" fontWeight="medium" color="text" mb={0.5}>
            {title}
          </MDTypography>
          
          {subtitle && (
            <MDTypography variant="caption" color="text" opacity={0.7}>
              {subtitle}
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Quick Action Card Component
function QuickActionCard({ title, description, icon, color, onClick }) {
  return (
    <Card
      sx={{
        p: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        textAlign: 'center',
      }}
      onClick={onClick}
    >
      <Avatar
        sx={{
          bgcolor: color,
          width: 60,
          height: 60,
          mx: 'auto',
          mb: 2,
        }}
      >
        <Icon fontSize="large">{icon}</Icon>
      </Avatar>
      <MDTypography variant="h6" fontWeight="bold" mb={1}>
        {title}
      </MDTypography>
      <MDTypography variant="body2" color="text" opacity={0.8}>
        {description}
      </MDTypography>
    </Card>
  );
}

function UnifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        // Get data from admin service
        const users = adminDataService.getUsers();
        const loans = adminDataService.getLoans();
        const payments = adminDataService.getPayments();
        
        // Calculate metrics
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
        
        const totalPayments = payments.total;
        const pendingPayments = payments.items.filter(p => p.status === 'pending').length;
        const completedPayments = payments.items.filter(p => p.status === 'completed').length;
        
        const totalRevenue = payments.items
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);

        setMetrics({
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          totalLoans,
          pendingLoans,
          approvedLoans,
          totalPayments,
          pendingPayments,
          completedPayments,
          totalRevenue,
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

  const AdminOverview = () => (
    <MDBox>
      {/* Welcome Header */}
      <MDBox mb={4}>
        <MDTypography variant="h3" fontWeight="bold" color="text" mb={1}>
          Admin Portal
        </MDTypography>
        <MDTypography variant="h6" color="text" opacity={0.8}>
          Comprehensive system management and analytics
        </MDTypography>
      </MDBox>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers || 0}
            change={metrics.newUsersThisMonth ? `+${metrics.newUsersThisMonth} this month` : null}
            icon="people"
            color="#2196f3"
            onClick={() => setActiveTab(1)}
            subtitle={`${metrics.activeUsers || 0} active users`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Loan Applications"
            value={metrics.totalLoans || 0}
            change={metrics.pendingLoans ? `${metrics.pendingLoans} pending` : null}
            icon="account_balance"
            color="#ff9800"
            onClick={() => setActiveTab(2)}
            subtitle={`${metrics.approvedLoans || 0} approved`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Payments"
            value={metrics.totalPayments || 0}
            change={metrics.pendingPayments ? `${metrics.pendingPayments} pending` : null}
            icon="payment"
            color="#9c27b0"
            onClick={() => setActiveTab(3)}
            subtitle={`${metrics.completedPayments || 0} completed`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Revenue"
            value={`$${(metrics.totalRevenue || 0).toLocaleString()}`}
            change="+8.2% this month"
            icon="trending_up"
            color="#4caf50"
            subtitle="From completed payments"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ p: 3, mb: 4 }}>
        <MDTypography variant="h5" fontWeight="bold" mb={3}>
          Quick Actions
        </MDTypography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <QuickActionCard
              title="User Management"
              description="Manage user accounts, roles, and permissions"
              icon="people"
              color="#2196f3"
              onClick={() => setActiveTab(1)}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <QuickActionCard
              title="Loan Oversight"
              description="Review and approve loan applications"
              icon="account_balance"
              color="#ff9800"
              onClick={() => setActiveTab(2)}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <QuickActionCard
              title="Payment Processing"
              description="Monitor and manage payment transactions"
              icon="payment"
              color="#9c27b0"
              onClick={() => setActiveTab(3)}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <QuickActionCard
              title="System Settings"
              description="Configure system parameters and preferences"
              icon="settings"
              color="#607d8b"
              onClick={() => setActiveTab(4)}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Recent Activity */}
      <Card sx={{ p: 3 }}>
        <MDTypography variant="h5" fontWeight="bold" mb={3}>
          Recent System Activity
        </MDTypography>
        <MDBox display="flex" flexDirection="column" gap={2}>
          <MDBox display="flex" alignItems="center" p={2} sx={{ bgcolor: alpha('#2196f3', 0.05), borderRadius: 2 }}>
            <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32, mr: 2 }}>
              <Icon fontSize="small">person_add</Icon>
            </Avatar>
            <MDBox flex={1}>
              <MDTypography variant="body2" fontWeight="medium">
                New user registered: John Doe
              </MDTypography>
              <MDTypography variant="caption" color="text" opacity={0.7}>
                2 hours ago
              </MDTypography>
            </MDBox>
          </MDBox>
          
          <MDBox display="flex" alignItems="center" p={2} sx={{ bgcolor: alpha('#ff9800', 0.05), borderRadius: 2 }}>
            <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32, mr: 2 }}>
              <Icon fontSize="small">account_balance</Icon>
            </Avatar>
            <MDBox flex={1}>
              <MDTypography variant="body2" fontWeight="medium">
                Loan application submitted: $25,000
              </MDTypography>
              <MDTypography variant="caption" color="text" opacity={0.7}>
                4 hours ago
              </MDTypography>
            </MDBox>
          </MDBox>
          
          <MDBox display="flex" alignItems="center" p={2} sx={{ bgcolor: alpha('#4caf50', 0.05), borderRadius: 2 }}>
            <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32, mr: 2 }}>
              <Icon fontSize="small">payment</Icon>
            </Avatar>
            <MDBox flex={1}>
              <MDTypography variant="body2" fontWeight="medium">
                Payment processed: $850
              </MDTypography>
              <MDTypography variant="caption" color="text" opacity={0.7}>
                6 hours ago
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </MDBox>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
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
              }
            }}
          >
            <Tab 
              label="Dashboard" 
              icon={<Icon>dashboard</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label="Users" 
              icon={<Icon>people</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label="Loans" 
              icon={<Icon>account_balance</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label="Payments" 
              icon={<Icon>payment</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label="Settings" 
              icon={<Icon>settings</Icon>} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {activeTab === 0 && <AdminOverview />}
        {activeTab === 1 && (
          <MDBox>
            <AdminUsersEnhanced />
          </MDBox>
        )}
        {activeTab === 2 && (
          <MDBox>
            <AdminLoansEnhanced />
          </MDBox>
        )}
        {activeTab === 3 && (
          <MDBox>
            <AdminPaymentsEnhanced />
          </MDBox>
        )}
        {activeTab === 4 && (
          <MDBox>
            <AdminSettings />
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UnifiedAdminDashboard;

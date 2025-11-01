/**
 * Modern Unified User Dashboard
 * Consistent design patterns with admin dashboard
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { formatters } from "utils/dataFormatters";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Global Data Context
import { useDashboardData, useLoanData, useFinancialData, useUserData } from "context/AppDataContext";

// Enhanced Metric Card Component (consistent with admin dashboard)
function UserMetricCard({ title, value, change, icon, color, onClick, subtitle, progressValue, loading = false }) {
  return (
    <Card
      sx={{
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${color}30`,
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
              <Icon fontSize="medium" sx={{ color: 'white' }}>{icon}</Icon>
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
          
          {progressValue !== undefined && (
            <MDBox mt={2}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: `${color}20`,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`
                  }
                }}
              />
              <MDTypography variant="caption" color="text" mt={0.5} display="block">
                {progressValue}% of limit
              </MDTypography>
            </MDBox>
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
          boxShadow: `0 8px 32px ${color}25`,
        },
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
      }}
      onClick={onClick}
    >
      <MDBox display="flex" alignItems="center" mb={2}>
        <Avatar
          sx={{
            bgcolor: color,
            width: 40,
            height: 40,
            mr: 2,
          }}
        >
          <Icon fontSize="small" sx={{ color: 'white' }}>{icon}</Icon>
        </Avatar>
        <MDBox>
          <MDTypography variant="h6" fontWeight="bold">
            {title}
          </MDTypography>
          <MDTypography variant="caption" color="text" opacity={0.8}>
            {description}
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Get synchronized data from global context
  const { dashboard } = useDashboardData();
  const { loans } = useLoanData();
  const { payments, billing } = useFinancialData();
  const { user } = useUserData();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate progress values
  const creditUtilization = billing.currentBalance / (billing.creditLimit || 1) * 100;
  const loanPaymentProgress = ((billing.totalLoanAmount - billing.currentBalance) / billing.totalLoanAmount) * 100;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Welcome Section */}
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
            Welcome back, {user?.name || 'User'}! 👋
          </MDTypography>
          <MDTypography variant="body1" color="text" opacity={0.7}>
            Here's what's happening with your finances today.
          </MDTypography>
        </MDBox>

        {/* Financial Overview Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6} lg={3}>
            <UserMetricCard
              title="Current Balance"
              value={formatCurrency(billing.currentBalance)}
              change={billing.currentBalance > 0 ? "-2.5%" : "Paid Off"}
              icon="account_balance"
              color="#2196f3"
              subtitle={billing.currentBalance > 0 ? "Amount owed" : "Congratulations!"}
              progressValue={billing.currentBalance > 0 ? creditUtilization : 0}
              onClick={() => navigate("/payments")}
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <UserMetricCard
              title="Monthly Extension"
              value={formatCurrency(billing.monthlyPayment)}
              change={billing.nextDueDate ? "on time" : "no payment due"}
              icon="payments"
              color="#ff9800"
              subtitle={billing.nextDueDate 
                ? `Due ${formatters.date(billing.nextDueDate, { month: 'short', day: 'numeric' })}`
                : "All caught up"}
              onClick={() => navigate("/payments")}
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <UserMetricCard
              title="Credit Score"
              value={dashboard.creditScore || "750"}
              change="+15 points"
              icon="trending_up"
              color="#4caf50"
              subtitle="Excellent credit"
              progressValue={75}
              onClick={() => navigate("/profile")}
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <UserMetricCard
              title="Loan Progress"
              value={`${loanPaymentProgress.toFixed(1)}%`}
              change="On track"
              icon="timeline"
              color="#9c27b0"
              subtitle="Loan completion"
              progressValue={loanPaymentProgress}
              onClick={() => navigate("/loans")}
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" fontWeight="bold" mb={3}>
                Quick Actions
              </MDTypography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <QuickActionCard
                    title="Apply for Loan"
                    description="Get funds quickly"
                    icon="add"
                    color="#2196f3"
                    onClick={() => navigate("/loans")}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <QuickActionCard
                    title="Make Payment"
                    description="Pay your bills"
                    icon="payment"
                    color="#ff9800"
                    onClick={() => navigate("/payments")}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <QuickActionCard
                    title="View Documents"
                    description="Access your files"
                    icon="folder"
                    color="#4caf50"
                    onClick={() => navigate("/documents")}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <QuickActionCard
                    title="Loan Calculator"
                    description="Plan your loan"
                    icon="calculate"
                    color="#9c27b0"
                    onClick={() => navigate("/calculator")}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity & Loan Status */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3, height: '400px' }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDTypography variant="h5" fontWeight="bold">
                  Recent Activity
                </MDTypography>
                <MDButton variant="outlined" color="info" size="small" onClick={() => navigate("/payments")}>
                  View All
                </MDButton>
              </MDBox>
              
              <MDBox sx={{ height: '300px', overflowY: 'auto' }}>
                {[
                  { type: 'payment', title: 'Payment received', amount: '$850', time: '2 hours ago', status: 'completed' },
                  { type: 'loan', title: 'Loan application updated', amount: '$5,000', time: '1 day ago', status: 'pending' },
                  { type: 'document', title: 'Document uploaded', amount: 'ID Verification', time: '2 days ago', status: 'verified' },
                  { type: 'payment', title: 'Auto payment scheduled', amount: '$425', time: '3 days ago', status: 'scheduled' },
                  { type: 'loan', title: 'Loan approved', amount: '$10,000', time: '1 week ago', status: 'approved' }
                ].map((activity, index) => (
                  <MDBox
                    key={index}
                    display="flex"
                    alignItems="center"
                    py={2}
                    borderBottom={index < 4 ? "1px solid #f0f0f0" : "none"}
                  >
                    <Avatar sx={{ 
                      bgcolor: activity.type === 'payment' ? '#ff9800' : 
                               activity.type === 'loan' ? '#2196f3' : '#4caf50',
                      mr: 2,
                      width: 40,
                      height: 40
                    }}>
                      <Icon fontSize="small" sx={{ color: 'white' }}>
                        {activity.type === 'payment' ? 'payment' : 
                         activity.type === 'loan' ? 'account_balance' : 'folder'}
                      </Icon>
                    </Avatar>
                    <MDBox flex={1}>
                      <MDTypography variant="body2" fontWeight="medium">
                        {activity.title}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" opacity={0.7}>
                        {activity.amount} • {activity.time}
                      </MDTypography>
                    </MDBox>
                    <Chip 
                      label={activity.status} 
                      color={
                        activity.status === 'completed' || activity.status === 'approved' || activity.status === 'verified' ? 'success' :
                        activity.status === 'pending' ? 'warning' : 'info'
                      } 
                      size="small" 
                    />
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, height: '400px' }}>
              <MDTypography variant="h5" fontWeight="bold" mb={3}>
                Loan Status
              </MDTypography>
              
              <MDBox mb={3}>
                <MDTypography variant="body2" fontWeight="medium" mb={1}>
                  Current Loan
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold" color="text" mb={1}>
                  {formatCurrency(billing.totalLoanAmount)}
                </MDTypography>
                <LinearProgress
                  variant="determinate"
                  value={loanPaymentProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2196f3'
                    }
                  }}
                />
                <MDTypography variant="caption" color="text">
                  {loanPaymentProgress.toFixed(1)}% paid off
                </MDTypography>
              </MDBox>

              <Divider sx={{ my: 2 }} />

              <MDBox mb={3}>
                <MDBox display="flex" justifyContent="space-between" mb={1}>
                  <MDTypography variant="caption" color="text">Interest Rate</MDTypography>
                  <MDTypography variant="caption" fontWeight="medium">5.2%</MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" mb={1}>
                  <MDTypography variant="caption" color="text">Loan Term</MDTypography>
                  <MDTypography variant="caption" fontWeight="medium">24 months</MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" mb={1}>
                  <MDTypography variant="caption" color="text">Next Payment</MDTypography>
                  <MDTypography variant="caption" fontWeight="medium">
                    {billing.nextDueDate ? formatters.date(billing.nextDueDate) : 'N/A'}
                  </MDTypography>
                </MDBox>
              </MDBox>

              <Divider sx={{ my: 2 }} />

              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                onClick={() => navigate("/loans")}
              >
                Manage Loan
              </MDButton>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;

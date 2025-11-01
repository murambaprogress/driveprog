/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025 Market Maker Zw

Coded by Market Maker Softwares

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import { formatters } from "utils/dataFormatters";

// Material Dashboard 2 React example components
import SharedDashboardLayout from "components/SharedDashboardLayout";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ReportsPieChart from "examples/Charts/PieCharts/ReportsPieChart";
import StatisticsCard from "components/Cards/StatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Payments from "layouts/dashboard/components/Payments";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// Services
import userDashboardService from "services/userDashboardService";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import MDTypography from "components/MDTypography";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      total_applications: 0,
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
      query_count: 0,
      active_loans: 0,
      total_borrowed: 0,
      total_requested: 0,
      current_balance: 0,
      monthly_payment: 0,
      next_due_date: null,
      account_health: 'New Account',
    },
    charts: {
      applications_over_time: {
        labels: [],
        data: [],
      },
      status_distribution: {
        pending: 0,
        approved: 0,
        rejected: 0,
        query: 0,
      },
    },
    recent_activity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await userDashboardService.getDashboardStatistics();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SharedDashboardLayout>
        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress />
        </MDBox>
      </SharedDashboardLayout>
    );
  }

  if (error) {
    return (
      <SharedDashboardLayout>
        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
          <MDTypography variant="h6" color="error">{error}</MDTypography>
        </MDBox>
      </SharedDashboardLayout>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const charts = dashboardData?.charts || {};
  
  // Prepare chart data
  const applicationsChart = {
    labels: charts.applications_over_time?.labels || [],
    datasets: {
      label: "Applications",
      data: charts.applications_over_time?.data || [],
    },
  };

  const statusPieChart = {
    labels: ["Approved", "Pending", "Under Review", "Rejected"],
    datasets: [{
      data: [
        charts.status_distribution?.approved || 0,
        charts.status_distribution?.pending || 0,
        charts.status_distribution?.query || 0,
        charts.status_distribution?.rejected || 0,
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336']
    }]
  };

  return (
    <SharedDashboardLayout>
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="dark"
              icon="account_balance"
              title="Current Balance"
              count={formatCurrency(metrics.current_balance || 0)}
              percentage={{
                color: metrics.current_balance > 0 ? "error" : "success",
                label: metrics.current_balance > 0 ? `${metrics.active_loans} active loan balance` : "Paid Off - congratulations!",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              icon="payments"
              title="Monthly Payment"
              count={formatCurrency(metrics.monthly_payment || 0)}
              percentage={{
                color: "info",
                label: metrics.next_due_date ? `due ${formatDate(metrics.next_due_date)}` : "",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="success"
              icon="trending_up"
              title="Active Loans"
              count={metrics.active_loans?.toString() || '0'}
              percentage={{
                color: metrics.active_loans > 0 ? "success" : "warning",
                label: metrics.active_loans > 0 ? `${metrics.total_applications} total applications` : "",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatisticsCard
              color="primary"
              icon="account_balance_wallet"
              title="Total Borrowed"
              count={formatCurrency(metrics.total_borrowed || 0)}
              percentage={{
                color: "info",
                label: metrics.account_health || "",
              }}
            />
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: '100%' }}>
                <ReportsBarChart
                  color="info"
                  title="Applications Over Time"
                  description="Your loan applications by month"
                  date="Last 6 months"
                  chart={applicationsChart}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: '100%' }}>
                <ReportsPieChart
                  color="success"
                  title="Application Status"
                  description="Distribution of your applications"
                  date="Updated today"
                  data={statusPieChart}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: '100%' }}>
                <StatisticsCard
                  color="warning"
                  icon="pending_actions"
                  title="Pending Review"
                  count={metrics.pending_count?.toString() || '0'}
                  percentage={{
                    color: metrics.query_count > 0 ? "error" : "success",
                    label: metrics.query_count > 0 ? `${metrics.query_count} need action` : "all clear",
                  }}
                  description={metrics.query_count > 0 ? "queries raised" : "no queries"}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Payments />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </SharedDashboardLayout>
  );
}

export default Dashboard;

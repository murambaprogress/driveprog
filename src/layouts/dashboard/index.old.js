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

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ReportsPieChart from "examples/Charts/PieCharts/ReportsPieChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Payments from "layouts/dashboard/components/Payments";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// Global Data Context
import { useDashboardData, useLoanData, useFinancialData } from "context/AppDataContext";
import { formatCurrency, formatters } from "../../utils/dataFormatters";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  
  // Get synchronized data from global context
  const { dashboard } = useDashboardData();
  const { billing } = useFinancialData();

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="account_balance"
                title="Current Balance"
                count={formatCurrency(billing.currentBalance)}
                percentage={{
                  color: billing.currentBalance > 0 ? "error" : "success",
                  amount: billing.currentBalance > 0 ? "-2.5%" : "Paid Off",
                  label: billing.currentBalance > 0 ? "since last payment" : "congratulations!",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="payments"
                title="Monthly Payment"
                count={formatCurrency(billing.monthlyPayment)}
                percentage={{
                  color: "info",
                  amount: billing.nextDueDate ? "on time" : "no payment due",
                  label: billing.nextDueDate 
                    ? `due ${formatters.date(billing.nextDueDate, { month: 'short', day: 'numeric' })}`
                    : "all caught up",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="trending_up"
                title="Active Loans"
                count={dashboard.metrics.activeLoans.toString()}
                percentage={{
                  color: dashboard.metrics.activeLoans > 0 ? "success" : "warning",
                  amount: dashboard.metrics.activeLoans > 0 ? `${dashboard.metrics.totalLoans} total` : "apply now",
                  label: dashboard.metrics.activeLoans > 0 ? "loan accounts" : "get started",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="account_balance_wallet"
                title="Total Borrowed"
                count={formatCurrency(dashboard.metrics.totalBorrowed)}
                percentage={{
                  color: "info",
                  amount: dashboard.metrics.accountHealth,
                  label: "account status",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Total Loans"
                  description="Total number of loans approved"
                  date="Updated this month"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                  {/* Convert sales data into pie slices for loyalty distribution */}
                  <ReportsPieChart
                    color="success"
                    title="Loyalty Points"
                    description="Points earned for repaying loans on time"
                    date="Updated this month"
                    data={{
                      labels: sales.labels,
                      datasets: [{ data: sales.datasets.data, backgroundColor: ['#4caf50','#66bb6a','#81c784','#a5d6a7','#c8e6c9','#e8f5e9','#f1f8e9','#e8f5e9','#c8e6c9'] }]
                    }}
                  />
                </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Last Applied Loan"
                  description="The last date you applied for a loan"
                  date="Updated this month"
                  chart={tasks}
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
    </DashboardLayout>
  );
}

export default Dashboard;

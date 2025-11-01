import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Link } from "react-router-dom";
import Footer from "examples/Footer";
import MDSnackbar from "components/MDSnackbar";
import Icon from "@mui/material/Icon";
import { formatters } from "utils/dataFormatters";

// Sequential Apply Button and Context
import { FormProvider } from "../../loanApp/context/FormContext";
import SequentialApplyButton from "components/SequentialApplyButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function AllLoans() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "info" });

  const showSnackbar = (message, color = "success") => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => setSnackbar({ open: false, message: "", color: "info" }), 3000);
  };

  // Mock loans data
  const loans = [
    {
      id: "L001",
      type: "Auto Title Loan",
      originalAmount: 15000,
      currentBalance: 8500,
      monthlyPayment: 720,
      interestRate: 12.5,
      nextPaymentDate: "2024-12-20",
      status: "Current",
      vehicle: "2019 Ford F-150",
      startDate: "2024-01-20",
      termMonths: 24,
      remainingMonths: 18,
      hasQuery: false
    },
    {
      id: "L002",
      type: "Personal Loan",
      originalAmount: 5000,
      currentBalance: 0,
      monthlyPayment: 250,
      interestRate: 15.2,
      nextPaymentDate: null,
      status: "Paid Off",
      vehicle: null,
      startDate: "2023-06-15",
      termMonths: 24,
      remainingMonths: 0,
      hasQuery: false
    },
    {
      id: "L003",
      type: "Auto Title Loan",
      originalAmount: 8000,
      currentBalance: 6200,
      monthlyPayment: 380,
      interestRate: 14.8,
      nextPaymentDate: "2024-12-25",
      status: "Current",
      vehicle: "2018 Honda Civic",
      startDate: "2024-03-10",
      termMonths: 24,
      remainingMonths: 19,
      hasQuery: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "current":
        return "success";
      case "paid off":
        return "info";
      case "late":
        return "error";
      case "delinquent":
        return "warning";
      case "query":
        return "error"; // Red color for "Resolve Query"
      default:
        return "default";
    }
  };

  const totalCurrentBalance = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const totalMonthlyPayments = loans
    .filter((loan) => loan.status === "Current")
    .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const activeLoans = loans.filter((loan) => loan.status === "Current").length;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold" gutterBottom>
              All Loans
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Complete overview of all your loans
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1} flexWrap="wrap">
            <FormProvider>
              <SequentialApplyButton variant="gradient" color="success">
                Apply for New Loan
              </SequentialApplyButton>
            </FormProvider>
            <MDButton component={Link} to="/loan" variant="outlined" color="info">
              View Active Loan
            </MDButton>
          </MDBox>
        </MDBox>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h2" fontWeight="bold" color="info">
                  {activeLoans}
                </MDTypography>
                <MDTypography variant="h6" color="text">
                  Active Loans
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h2" fontWeight="bold" color="success">
                  ${totalCurrentBalance.toLocaleString()}
                </MDTypography>
                <MDTypography variant="h6" color="text">
                  Total Outstanding Balance
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h2" fontWeight="bold" color="warning">
                  ${totalMonthlyPayments.toLocaleString()}
                </MDTypography>
                <MDTypography variant="h6" color="text">
                  Monthly Extensions
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          {/* Loans Table */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Loan Details
                </MDTypography>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold">
                            Loan ID
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold">
                            Type
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold">
                            Vehicle/Purpose
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="bold">
                            Original Amount
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="bold">
                            Current Balance
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="bold">
                            Monthly Extension
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold">
                            Status
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold">
                            Next Payment
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold">
                            Actions
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>
                            <MDTypography variant="body2" fontWeight="medium">
                              {loan.id}
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="body2">{loan.type}</MDTypography>
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="body2">
                              {loan.vehicle || "Personal Use"}
                            </MDTypography>
                          </TableCell>
                          <TableCell align="right">
                            <MDTypography variant="body2">
                              ${loan.originalAmount.toLocaleString()}
                            </MDTypography>
                          </TableCell>
                          <TableCell align="right">
                            <MDTypography
                              variant="body2"
                              fontWeight="medium"
                              color={loan.currentBalance > 0 ? "info" : "success"}
                            >
                              ${loan.currentBalance.toLocaleString()}
                            </MDTypography>
                          </TableCell>
                          <TableCell align="right">
                            <MDTypography variant="body2">
                              {loan.status === "Current" ? `$${loan.monthlyPayment}` : "N/A"}
                            </MDTypography>
                          </TableCell>
                          <TableCell align="center">
                            {loan.hasQuery ? (
                              <Chip label="Resolve Query" color="error" size="small" />
                            ) : (
                              <Chip
                                label={loan.status}
                                color={getStatusColor(loan.status)}
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="body2">
                              {loan.nextPaymentDate ? formatters.date(loan.nextPaymentDate) : "N/A"}
                            </MDTypography>
                          </TableCell>
                          <TableCell align="center">
                            <MDBox display="flex" gap={1} justifyContent="center">
                              {loan.status === "Current" && (
                                <>
                                  <MDButton
                                    component={Link}
                                    to={`/loan`}
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                  >
                                    View
                                  </MDButton>
                                  <MDButton
                                    size="small"
                                    variant="gradient"
                                    color="success"
                                    onClick={() =>
                                      showSnackbar(
                                        `Payment of $${loan.monthlyPayment} processed for ${loan.id}`,
                                        "success"
                                      )
                                    }
                                  >
                                    Pay
                                  </MDButton>
                                </>
                              )}
                              {loan.status === "Paid Off" && (
                                <MDButton
                                  size="small"
                                  variant="text"
                                  color="dark"
                                  onClick={() =>
                                    showSnackbar("Certificate of loan satisfaction downloaded", "info")
                                  }
                                >
                                  Certificate
                                </MDButton>
                              )}
                            </MDBox>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>

          {/* Loan Performance Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Payment Performance
                </MDTypography>
                <MDBox mt={3}>
                  <MDBox display="flex" justifyContent="space-between" mb={2}>
                    <MDTypography variant="body2" color="text">
                      On-Time Payments
                    </MDTypography>
                    <MDTypography variant="body2" fontWeight="medium" color="success">
                      94%
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" mb={2}>
                    <MDTypography variant="body2" color="text">
                      Late Payments
                    </MDTypography>
                    <MDTypography variant="body2" fontWeight="medium" color="warning">
                      4%
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" mb={2}>
                    <MDTypography variant="body2" color="text">
                      Missed Payments
                    </MDTypography>
                    <MDTypography variant="body2" fontWeight="medium" color="error">
                      2%
                    </MDTypography>
                  </MDBox>
                  <MDBox mt={2}>
                    <MDTypography variant="caption" color="text">
                      Based on payment history from all loans
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Quick Actions
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1} mt={2}>
                  <MDButton
                    variant="outlined"
                    color="success"
                    onClick={() => showSnackbar("Payment scheduled for all active loans", "success")}
                    fullWidth
                  >
                    Make Payment on All Loans
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => showSnackbar("All loan statements downloaded", "success")}
                    fullWidth
                  >
                    Download All Statements
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      showSnackbar("Autopay enabled for all eligible loans", "success")
                    }
                    fullWidth
                  >
                    Setup Autopay for All
                  </MDButton>
                  <MDButton
                    variant="text"
                    color="dark"
                    onClick={() => showSnackbar("Customer service: 1-800-LOANS-NOW", "info")}
                    fullWidth
                  >
                    Contact Customer Service
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <Footer />
        <MDSnackbar
          color={snackbar.color}
          icon={<Icon>notifications</Icon>}
          title={snackbar.message || "Notification"}
          dateTime={formatters.time(new Date())}
          content={snackbar.message}
          close={() => setSnackbar({ open: false, message: "", color: "info" })}
          open={snackbar.open}
        />
      </MDBox>
    </DashboardLayout>
  );
}

export default AllLoans;

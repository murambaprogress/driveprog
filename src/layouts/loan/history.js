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

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function PaymentHistory() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "info" });

  const showSnackbar = (message, color = "success") => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => setSnackbar({ open: false, message: "", color: "info" }), 3000);
  };

  // Mock payment history data
  const paymentHistory = [
    {
      id: "PAY-2024-12",
      date: "2024-12-20",
      amount: 720,
      status: "Scheduled",
      method: "Auto-Pay",
      confirmation: "SCH-001",
      principal: 580,
      interest: 140,
      balance: 7780
    },
    {
      id: "PAY-2024-11",
      date: "2024-11-20",
      amount: 720,
      status: "Paid",
      method: "Auto-Pay",
      confirmation: "PAY-001",
      principal: 575,
      interest: 145,
      balance: 8360
    },
    {
      id: "PAY-2024-10",
      date: "2024-10-20",
      amount: 720,
      status: "Paid",
      method: "Online",
      confirmation: "PAY-002",
      principal: 570,
      interest: 150,
      balance: 8935
    },
    {
      id: "PAY-2024-09",
      date: "2024-09-20",
      amount: 720,
      status: "Paid",
      method: "Auto-Pay",
      confirmation: "PAY-003",
      principal: 565,
      interest: 155,
      balance: 9505
    },
    {
      id: "PAY-2024-08",
      date: "2024-08-20",
      amount: 850,
      status: "Paid",
      method: "Online",
      confirmation: "PAY-004",
      principal: 695,
      interest: 155,
      balance: 10070
    },
    {
      id: "PAY-2024-07",
      date: "2024-07-20",
      amount: 720,
      status: "Paid",
      method: "Auto-Pay",
      confirmation: "PAY-005",
      principal: 555,
      interest: 165,
      balance: 10765
    },
    {
      id: "PAY-2024-06",
      date: "2024-06-20",
      amount: 720,
      status: "Paid",
      method: "Auto-Pay",
      confirmation: "PAY-006",
      principal: 550,
      interest: 170,
      balance: 11320
    },
    {
      id: "PAY-2024-05",
      date: "2024-05-20",
      amount: 720,
      status: "Late",
      method: "Phone",
      confirmation: "PAY-007",
      principal: 545,
      interest: 175,
      balance: 11870,
      lateFee: 25
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "scheduled":
        return "info";
      case "late":
        return "error";
      case "processing":
        return "warning";
      default:
        return "default";
    }
  };

  const downloadPaymentHistory = () => {
    const content = `
PAYMENT HISTORY REPORT
====================================
Loan ID: L001
Generated: ${new Date().toISOString()}

${paymentHistory
  .map(
    (payment) => `
Date: ${payment.date}
Amount: $${payment.amount}
Status: ${payment.status}
Method: ${payment.method}
Principal: $${payment.principal}
Interest: $${payment.interest}
Remaining Balance: $${payment.balance}
Confirmation: ${payment.confirmation}
${payment.lateFee ? `Late Fee: $${payment.lateFee}` : ""}
---
`
  )
  .join("")}

For questions, call 1-800-LOANS-NOW
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-history-L001.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showSnackbar("Payment history downloaded", "success");
  };

  const downloadReceipt = (confirmation) => {
    const payment = paymentHistory.find((p) => p.confirmation === confirmation);
    if (!payment) return;

    const content = `
PAYMENT RECEIPT
====================================
Receipt ID: ${payment.confirmation}
Loan ID: L001
Payment Date: ${payment.date}

PAYMENT DETAILS:
Amount Paid: $${payment.amount}
Payment Method: ${payment.method}
Status: ${payment.status}
${payment.lateFee ? `Late Fee: $${payment.lateFee}` : ""}

LOAN BREAKDOWN:
Principal Applied: $${payment.principal}
Interest Applied: $${payment.interest}
Remaining Balance: $${payment.balance}

Thank you for your payment!
Questions? Call 1-800-LOANS-NOW
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.confirmation}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showSnackbar("Receipt downloaded", "success");
  };

  const printHistory = () => {
    showSnackbar("Preparing print view...", "info");
    setTimeout(() => window.print(), 500);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold" gutterBottom>
              Payment History
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Complete payment history for Loan L001
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1} flexWrap="wrap">
            <MDButton component={Link} to="/loan" variant="outlined" color="dark">
              Back to Loan Details
            </MDButton>
            <MDButton onClick={downloadPaymentHistory} variant="outlined" color="info">
              Download History
            </MDButton>
            <MDButton onClick={printHistory} variant="text" color="dark">
              Print
            </MDButton>
          </MDBox>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Payment Summary
                </MDTypography>
                <MDBox display="flex" justifyContent="space-around" mt={2} mb={3}>
                  <MDBox textAlign="center">
                    <MDTypography variant="h4" fontWeight="bold" color="success">
                      {paymentHistory.filter((p) => p.status === "Paid").length}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Payments Made
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="center">
                    <MDTypography variant="h4" fontWeight="bold" color="info">
                      $
                      {paymentHistory
                        .filter((p) => p.status === "Paid")
                        .reduce((sum, p) => sum + p.amount, 0)
                        .toLocaleString()}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Total Paid
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="center">
                    <MDTypography variant="h4" fontWeight="bold" color="warning">
                      {paymentHistory.filter((p) => p.status === "Late").length}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Late Payments
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="center">
                    <MDTypography variant="h4" fontWeight="bold" color="dark">
                      $
                      {paymentHistory
                        .reduce((sum, p) => sum + p.principal, 0)
                        .toLocaleString()}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Principal Paid
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Payment Details
                </MDTypography>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold">
                            Date
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="bold">
                            Amount
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold">
                            Status
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold">
                            Method
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="bold">
                            Principal
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="bold">
                            Interest
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="bold">
                            Balance
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
                      {paymentHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <MDTypography variant="body2">
                                {formatters.date(payment.date)}
                              </MDTypography>
                          </TableCell>
                          <TableCell align="right">
                            <MDTypography variant="body2" fontWeight="medium">
                              ${payment.amount}
                              {payment.lateFee && (
                                <span style={{ color: "#f44336", fontSize: "0.8em" }}>
                                  {" "}
                                  (+${payment.lateFee})
                                </span>
                              )}
                            </MDTypography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={payment.status}
                              color={getStatusColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="body2">{payment.method}</MDTypography>
                          </TableCell>
                          <TableCell align="right">
                            <MDTypography variant="body2">${payment.principal}</MDTypography>
                          </TableCell>
                          <TableCell align="right">
                            <MDTypography variant="body2">${payment.interest}</MDTypography>
                          </TableCell>
                          <TableCell align="right">
                            <MDTypography variant="body2">${payment.balance.toLocaleString()}</MDTypography>
                          </TableCell>
                          <TableCell align="center">
                            {payment.status === "Paid" && (
                              <MDButton
                                size="small"
                                variant="text"
                                color="dark"
                                onClick={() => downloadReceipt(payment.confirmation)}
                              >
                                Receipt
                              </MDButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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

export default PaymentHistory;

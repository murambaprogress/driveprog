import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms";
// import TextField from "@mui/material/TextField"; // Replaced with VhoozhtInput
// import Select from "@mui/material/Select"; // Replaced with VhoozhtSelect
// import MenuItem from "@mui/material/MenuItem"; // Replaced with VhoozhtSelect options
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
// import InputLabel from "@mui/material/InputLabel"; // Replaced with VhoozhtSelect
import Chip from "@mui/material/Chip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Link, useNavigate } from "react-router-dom";
import Footer from "examples/Footer";
import MDSnackbar from "components/MDSnackbar";
import Icon from "@mui/material/Icon";
import { formatters } from "utils/dataFormatters";

// Sequential Apply Button and Context
import { FormProvider } from "../../loanApp/context/FormContext";
import SequentialApplyButton from "components/SequentialApplyButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function Loan() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "info" });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [payoffDialog, setPayoffDialog] = useState(false);
  const [autopayDialog, setAutopayDialog] = useState(false);
  const [refinanceDialog, setRefinanceDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [autopaySettings, setAutopaySettings] = useState({
    enabled: false,
    amount: "minimum",
    date: "due_date",
    method: "bank",
  });

  // Mock loan data
  const loanData = {
    id: "L001",
    originalAmount: 15000,
    currentBalance: 8500,
    monthlyPayment: 720,
    interestRate: 12.5,
    term: 24,
    remainingTerm: 18,
    startDate: "2024-01-20",
    nextPaymentDue: "2024-12-20",
    status: "Current",
    vehicle: {
      year: 2019,
      make: "Ford",
      model: "F-150",
      vin: "1FTFW1ET5KFC12345",
      estimatedValue: 28000,
      loanToValue: 54,
    },
    paymentHistory: [
      {
        date: "2024-11-20",
        amount: 720,
        status: "Paid",
        method: "Auto-Pay",
        confirmation: "PAY-001",
      },
      {
        date: "2024-10-20",
        amount: 720,
        status: "Paid",
        method: "Online",
        confirmation: "PAY-002",
      },
      {
        date: "2024-09-20",
        amount: 720,
        status: "Paid",
        method: "Auto-Pay",
        confirmation: "PAY-003",
      },
      {
        date: "2024-08-20",
        amount: 720,
        status: "Paid",
        method: "Auto-Pay",
        confirmation: "PAY-004",
      },
      {
        date: "2024-07-20",
        amount: 850,
        status: "Paid",
        method: "Online",
        confirmation: "PAY-005",
      },
    ],
  };

  const showSnackbar = (message, color = "success") => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => setSnackbar({ open: false, message: "", color: "info" }), 3000);
  };

  const navigate = useNavigate();

  const managePaymentMethods = () => {
    // Enhanced payment method management
    navigate("/billing");
    showSnackbar("Opening payment method management...", "info");
  };

  const setupAutopay = () => {
    setAutopayDialog(true);
  };

  const handleAutopaySetup = () => {
    // Save autopay settings to localStorage for persistence
    localStorage.setItem("autopaySettings", JSON.stringify(autopaySettings));
    setAutopayDialog(false);
    showSnackbar(
      `Autopay ${autopaySettings.enabled ? "enabled" : "disabled"} successfully`,
      "success"
    );
  };

  const downloadStatement = (period = "2024-12") => {
  const content = `
LOAN STATEMENT - ${period}
====================================
Loan ID: ${loanData.id}
Account Holder: John Doe
Statement Period: ${period}

LOAN SUMMARY:
Original Loan Amount: $${loanData.originalAmount.toLocaleString()}
Current Balance: $${loanData.currentBalance.toLocaleString()}
Interest Rate: ${loanData.interestRate}% APR
Monthly Extension: $${loanData.monthlyPayment}
 Next Payment Due: ${formatters.date(loanData.nextPaymentDue)}

VEHICLE INFORMATION:
${loanData.vehicle.year} ${loanData.vehicle.make} ${loanData.vehicle.model}
VIN: ${loanData.vehicle.vin}
Estimated Value: $${loanData.vehicle.estimatedValue.toLocaleString()}

RECENT PAYMENTS:
${loanData.paymentHistory
  .slice(0, 3)
  .map((payment) => `${formatters.date(payment.date)} - $${payment.amount} - ${payment.status}`)
  .join("\n")}

Generated: ${new Date().toISOString()}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan-statement-${period}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showSnackbar("Statement downloaded successfully", "success");
  };

  const requestPayoffQuote = () => {
    setPayoffDialog(true);
  };

  const generatePayoffQuote = () => {
    const today = new Date();
    const payoffAmount = loanData.currentBalance + loanData.currentBalance * 0.01; // Add 1% for interest

  const content = `
PAYOFF QUOTE
====================================
Loan ID: ${loanData.id}
Quote Date: ${formatters.date(today)}
Good Through: ${formatters.date(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000))}

Current Balance: $${loanData.currentBalance.toLocaleString()}
Interest Through Today: $${(loanData.currentBalance * 0.01).toFixed(2)}
Total Payoff Amount: $${payoffAmount.toFixed(2)}

Note: This quote is valid for 10 days from the quote date.
Interest accrues daily, so the payoff amount will increase after the good-through date.

Contact us at 1-800-LOANS-NOW for questions.
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payoff-quote-${loanData.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    setPayoffDialog(false);
    showSnackbar("Payoff quote generated and downloaded", "success");
  };

  const printStatement = () => {
    showSnackbar("Preparing print view...", "info");
    setTimeout(() => window.print(), 500);
  };

  const makePayment = (amount = null) => {
    if (amount) {
      setPaymentAmount(amount.replace("$", ""));
    }
    setPaymentDialog(true);
  };

  const processPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showSnackbar("Please enter a valid payment amount", "error");
      return;
    }

    // Add payment to history (simulate)
    const newPayment = {
      date: new Date().toISOString().split("T")[0],
      amount: parseFloat(paymentAmount),
      status: "Processing",
      method: paymentMethod === "bank" ? "Bank Transfer" : "Credit Card",
      confirmation: `PAY-${Date.now()}`,
    };

    // Store in localStorage for persistence
    const existingPayments = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
    existingPayments.unshift(newPayment);
    localStorage.setItem("paymentHistory", JSON.stringify(existingPayments));

    setPaymentDialog(false);
    setPaymentAmount("");
    showSnackbar(
      `Payment of $${paymentAmount} submitted successfully! Confirmation: ${newPayment.confirmation}`,
      "success"
    );
  };

  const downloadReceipt = (receiptId = "receipt-0001") => {
  const content = `
PAYMENT RECEIPT
====================================
Receipt ID: ${receiptId}
Loan ID: ${loanData.id}
Date: ${formatters.date(new Date())}
Time: ${formatters.time(new Date())}

PAYMENT DETAILS:
Amount Paid: $720.00
Payment Method: Auto-Pay (Bank Transfer)
Account: ****1234
Status: PROCESSED

LOAN INFORMATION:
Remaining Balance: $${(loanData.currentBalance - 720).toLocaleString()}
Next Payment Due: ${formatters.date(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}

Thank you for your payment!
Questions? Call 1-800-LOANS-NOW
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receiptId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showSnackbar("Payment receipt downloaded", "success");
  };

  const refinanceLoan = () => {
    setRefinanceDialog(true);
  };

  const handleRefinance = () => {
    setRefinanceDialog(false);
    showSnackbar(
      "Refinance application submitted! You'll receive a decision within 24 hours.",
      "success"
    );
  };

  const requestLoanModification = () => {
    showSnackbar(
      "Loan modification request submitted. A specialist will contact you within 2 business days.",
      "info"
    );
  };

  const viewLoanDocuments = () => {
    showSnackbar("Redirecting to secure document portal...", "info");
    setTimeout(() => {
      // Simulate opening document portal
      showSnackbar(
        "Document portal opened. All loan documents are available for download.",
        "success"
      );
    }, 1500);
  };

  const reportLostTitle = () => {
    showSnackbar(
      "Title replacement request submitted. New title will be mailed within 7-10 business days.",
      "warning"
    );
  };

  const scheduleVehicleInspection = () => {
    showSnackbar(
      "Vehicle inspection scheduled for next Tuesday at 2 PM. Confirmation sent to your email.",
      "success"
    );
  };

  const handleQuickApply = (quickData) => {
    // Store quick application data and redirect directly to step 1 of the full application
    localStorage.setItem('quickApplicationData', JSON.stringify(quickData));
    // Navigate straight to the form so users see the same experience as the "Apply for a loan" button
    navigate('/loan/apply/step-1');
    showSnackbar("Starting your loan application with your information!", "success");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold" gutterBottom>
              My Loan Details
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Complete information about your current loan
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1} flexWrap="wrap">
            <FormProvider>
              <SequentialApplyButton variant="outlined" color="info">
                Apply for a loan
              </SequentialApplyButton>
            </FormProvider>
            <MDButton component={Link} to="/loans" variant="outlined" color="dark">
              View All Loans
            </MDButton>
            <MDButton variant="outlined" color="info" onClick={managePaymentMethods}>
              Manage Payment Methods
            </MDButton>
            <MDButton variant="outlined" color="info" onClick={setupAutopay}>
              Set up Autopay
            </MDButton>
            <MDButton variant="gradient" color="success" onClick={() => makePayment()}>
              Make Payment
            </MDButton>
          </MDBox>
        </MDBox>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                      Loan Summary
                    </MDTypography>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <MDBox>
                        <MDTypography variant="caption" color="text">
                          Loan ID
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold">
                          {loanData.id}
                        </MDTypography>
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="caption" color="text">
                          Original Amount
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold">
                          ${loanData.originalAmount.toLocaleString()}
                        </MDTypography>
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="caption" color="text">
                          Start Date
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold">
                          {formatters.date(loanData.startDate)}
                        </MDTypography>
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="caption" color="text">
                          Term
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold">
                          {loanData.term} months
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
                      Payment Information
                    </MDTypography>
                    <MDBox mt={2}>
                      <MDBox display="flex" justifyContent="space-between" py={1}>
                                      <MDTypography variant="body2" color="text">
                                        Monthly Extension
                        </MDTypography>
                        <MDTypography variant="body1" fontWeight="medium">
                          ${loanData.monthlyPayment}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" py={1}>
                        <MDTypography variant="body2" color="text">
                          Interest Rate
                        </MDTypography>
                        <MDTypography variant="body1" fontWeight="medium">
                          {loanData.interestRate}%
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" py={1}>
                        <MDTypography variant="body2" color="text">
                          Remaining Balance
                        </MDTypography>
                        <MDTypography variant="body1" fontWeight="medium" color="info">
                          ${loanData.currentBalance.toLocaleString()}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" py={1}>
                        <MDTypography variant="body2" color="text">
                          Next Payment Due
                        </MDTypography>
                        <MDTypography variant="body1" fontWeight="bold">
                          {formatters.date(loanData.nextPaymentDue)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" gap={1} mt={3} flexWrap="wrap">
                        <MDButton
                          variant="gradient"
                          color="success"
                          onClick={() => makePayment(`$${loanData.monthlyPayment}`)}
                        >
                          Make Payment
                        </MDButton>
                        <MDButton component={Link} to="/loan/history" variant="outlined" color="info">
                          View Payment History
                        </MDButton>
                        <MDButton
                          variant="text"
                          color="dark"
                          onClick={() => downloadReceipt("L001-20241220")}
                        >
                          Download Receipt
                        </MDButton>
                        <MDButton
                          variant="text"
                          color="dark"
                          onClick={() => downloadStatement("2024-12")}
                        >
                          Download Statement
                        </MDButton>
                        <MDButton variant="outlined" color="warning" onClick={requestPayoffQuote}>
                          Request Payoff Quote
                        </MDButton>
                        <MDButton variant="text" color="dark" onClick={printStatement}>
                          Print
                        </MDButton>
                        <MDButton variant="outlined" color="info" onClick={refinanceLoan}>
                          Refinance Loan
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                      Vehicle Details
                    </MDTypography>
                    <MDBox mt={2}>
                      <MDTypography variant="body1" fontWeight="medium">
                        {loanData.vehicle.year} {loanData.vehicle.make} {loanData.vehicle.model}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        VIN: {loanData.vehicle.vin}
                      </MDTypography>
                      <MDBox display="flex" justifyContent="space-between" mt={3}>
                        <MDBox>
                          <MDTypography variant="body2" color="text">
                            Estimated Value
                          </MDTypography>
                          <MDTypography variant="body1" fontWeight="medium">
                            ${loanData.vehicle.estimatedValue.toLocaleString()}
                          </MDTypography>
                        </MDBox>
                        <MDBox textAlign="right">
                          <MDTypography variant="body2" color="text">
                            Loan-to-Value Ratio
                          </MDTypography>
                          <MDTypography variant="body1" fontWeight="medium">
                            {loanData.vehicle.loanToValue}%
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                      <MDBox display="flex" gap={1} mt={3} flexWrap="wrap">
                        <MDButton variant="outlined" color="info" onClick={scheduleVehicleInspection}>
                          Schedule Inspection
                        </MDButton>
                        <MDButton variant="text" color="dark" onClick={reportLostTitle}>
                          Report Lost Title
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                      Additional Services
                    </MDTypography>
                    <MDBox display="flex" gap={1} flexWrap="wrap" mt={2}>
                      <MDButton variant="outlined" color="info" onClick={viewLoanDocuments}>
                        View Loan Documents
                      </MDButton>
                      <MDButton variant="outlined" color="warning" onClick={requestLoanModification}>
                        Request Loan Modification
                      </MDButton>
                      <MDButton
                        variant="text"
                        color="dark"
                        onClick={() => showSnackbar("Customer service: 1-800-LOANS-NOW", "info")}
                      >
                        Contact Support
                      </MDButton>
                      <MDButton
                        variant="text"
                        color="dark"
                        onClick={() => showSnackbar("Insurance information updated", "success")}
                      >
                        Update Insurance
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Sidebar removed: QuickApplySidebar removed from loan layout */}
        </Grid>

        {/* Payment Dialog */}
        <Dialog
          open={paymentDialog}
          onClose={() => setPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
              <VhoozhtInput
                label="Payment Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                type="number"
                fullWidth
                startAdornment="$"
              />
              <VhoozhtSelect
                label="Payment Method"
                fullWidth
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: "bank", label: "Bank Transfer" },
                  { value: "credit", label: "Credit Card" },
                  { value: "debit", label: "Debit Card" }
                ]}
              />
              <MDBox>
                <MDTypography variant="body2" color="text">
                  Quick amounts:
                </MDTypography>
                <MDBox display="flex" gap={1} mt={1}>
                  <Chip
                    label={`$${loanData.monthlyPayment}`}
                    onClick={() => setPaymentAmount(loanData.monthlyPayment.toString())}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`$${loanData.monthlyPayment * 2}`}
                    onClick={() => setPaymentAmount((loanData.monthlyPayment * 2).toString())}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Pay Off Loan"
                    onClick={() => setPaymentAmount(loanData.currentBalance.toString())}
                    color="success"
                    variant="outlined"
                  />
                </MDBox>
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setPaymentDialog(false)} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={processPayment} variant="gradient" color="success">
              Process Payment
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Payoff Dialog */}
        <Dialog open={payoffDialog} onClose={() => setPayoffDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Loan Payoff Quote</DialogTitle>
          <DialogContent>
            <MDBox p={2}>
              <MDTypography variant="h6" gutterBottom>
                Payoff Information for Loan {loanData.id}
              </MDTypography>
              <MDBox display="flex" justifyContent="space-between" py={1}>
                <MDTypography variant="body2">Current Balance:</MDTypography>
                <MDTypography variant="body1" fontWeight="medium">
                  ${loanData.currentBalance.toLocaleString()}
                </MDTypography>
              </MDBox>
              <MDBox display="flex" justifyContent="space-between" py={1}>
                <MDTypography variant="body2">Accrued Interest:</MDTypography>
                <MDTypography variant="body1" fontWeight="medium">
                  ${(loanData.currentBalance * 0.01).toFixed(2)}
                </MDTypography>
              </MDBox>
              <MDBox display="flex" justifyContent="space-between" py={1}>
                <MDTypography variant="body1" fontWeight="bold">
                  Total Payoff Amount:
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold" color="success">
                  ${(loanData.currentBalance + loanData.currentBalance * 0.01).toFixed(2)}
                </MDTypography>
              </MDBox>
              <MDBox mt={2}>
                <MDTypography variant="caption" color="text">
                  * This quote is valid for 10 days. Interest accrues daily.
                </MDTypography>
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setPayoffDialog(false)} color="dark">
              Close
            </MDButton>
            <MDButton onClick={generatePayoffQuote} variant="gradient" color="success">
              Download Quote
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Autopay Dialog */}
        <Dialog
          open={autopayDialog}
          onClose={() => setAutopayDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Setup Autopay</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
              <VhoozhtSelect
                label="Autopay Amount"
                fullWidth
                value={autopaySettings.amount}
                onChange={(e) =>
                  setAutopaySettings({ ...autopaySettings, amount: e.target.value })
                }
                options={[
                  { value: "minimum", label: `Minimum Payment ($${loanData.monthlyPayment})` },
                  { value: "custom", label: "Custom Amount" },
                  { value: "full", label: "Full Balance" }
                ]}
              />
              <VhoozhtSelect
                label="Payment Date"
                fullWidth
                value={autopaySettings.date}
                onChange={(e) => setAutopaySettings({ ...autopaySettings, date: e.target.value })}
                options={[
                  { value: "due_date", label: "Due Date" },
                  { value: "5_before", label: "5 Days Before Due Date" },
                  { value: "specific", label: "Specific Date Each Month" }
                ]}
              />
              <VhoozhtSelect
                label="Payment Method"
                fullWidth
                value={autopaySettings.method}
                onChange={(e) =>
                  setAutopaySettings({ ...autopaySettings, method: e.target.value })
                }
                options={[
                  { value: "bank", label: "Bank Transfer" },
                  { value: "credit", label: "Credit Card" }
                ]}
              />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setAutopayDialog(false)} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleAutopaySetup} variant="gradient" color="success">
              Enable Autopay
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Refinance Dialog */}
        <Dialog
          open={refinanceDialog}
          onClose={() => setRefinanceDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Loan Refinancing Options</DialogTitle>
          <DialogContent>
            <MDBox p={2}>
              <MDTypography variant="body1" gutterBottom>
                Based on your payment history and current market rates, you may qualify for:
              </MDTypography>
              <MDBox mt={3}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <MDTypography variant="h6" color="success" gutterBottom>
                    Lower Interest Rate Option
                  </MDTypography>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2">New Interest Rate:</MDTypography>
                    <MDTypography variant="body1" fontWeight="medium">
                      9.5% APR
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2">New Monthly Extension:</MDTypography>
                    <MDTypography variant="body1" fontWeight="medium">
                      $650
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2">Monthly Savings:</MDTypography>
                    <MDTypography variant="body1" fontWeight="bold" color="success">
                      $70
                    </MDTypography>
                  </MDBox>
                </Card>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <MDTypography variant="h6" color="info" gutterBottom>
                    Extended Term Option
                  </MDTypography>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2">New Term:</MDTypography>
                    <MDTypography variant="body1" fontWeight="medium">
                      36 months
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2">New Monthly Extension:</MDTypography>
                    <MDTypography variant="body1" fontWeight="medium">
                      $495
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2">Monthly Savings:</MDTypography>
                    <MDTypography variant="body1" fontWeight="bold" color="success">
                      $225
                    </MDTypography>
                  </MDBox>
                </Card>
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setRefinanceDialog(false)} color="dark">
              Not Now
            </MDButton>
            <MDButton onClick={handleRefinance} variant="gradient" color="info">
              Apply for Refinancing
            </MDButton>
          </DialogActions>
        </Dialog>

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

export default Loan;

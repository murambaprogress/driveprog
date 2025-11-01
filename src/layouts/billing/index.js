/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025 Market Maker Zw

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MasterCard from "examples/Cards/MasterCard";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";
import paymentsData from "layouts/dashboard/components/Payments/data/payments";

// Billing page components
import PaymentMethod from "layouts/billing/components/PaymentMethod";
import Invoices from "layouts/billing/components/Invoices";
import BillingInformation from "layouts/billing/components/BillingInformation";
import Transactions from "layouts/billing/components/Transactions";

function Billing() {
  // Get payment data
  const { rows } = paymentsData();
  // Helper: safely derive a lowercase method string from p.method which may be a string or a React node
  const getMethodText = (method) => {
    if (!method) return "";
    if (typeof method === "string") return method.toLowerCase();
    // If it's a React element, attempt to extract text children
    try {
      const children = method.props && method.props.children;
      if (!children) return "";
      // children may be an array like [<img />, <MDTypography>Label</MDTypography>]
      const text = Array.isArray(children)
        ? children
            .map((c) => (typeof c === "string" ? c : c?.props?.children || ""))
            .join(" ")
        : typeof children === "string"
        ? children
        : children?.props?.children || "";
      return String(text).toLowerCase();
    } catch (e) {
      return "";
    }
  };
  // Calculate total loan amount (sum of all payments)
  const totalLoanAmount = rows.reduce((sum, p) => sum + Number((p.amount || "").replace(/[^\d.]/g, "")), 0);
  // Calculate total paid with PayPal
  const totalPaypal = rows
    .filter((p) => getMethodText(p.method) === "paypal")
    .reduce((sum, p) => sum + Number((p.amount || "").replace(/[^\d.]/g, "")), 0);
  
  return (
    <DashboardLayout>
      <DashboardNavbar absolute isMini />
      <MDBox mt={8}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} xl={6}>
                  <MasterCard number={4562112245947852} holder="jack peterson" expires="11/22" />
                </Grid>
                <Grid item xs={12} md={6} xl={3}>
                  <DefaultInfoCard
                    icon="account_balance"
                    title="Loan Total Loan Amount"
                    description="Total principal borrowed across all loans"
                    value={`$${totalLoanAmount.toLocaleString()}`}
                  />
                </Grid>
                <Grid item xs={12} md={6} xl={3}>
                  <DefaultInfoCard
                    icon="paypal"
                    title="paypal Total Amount paid with paypal"
                    description="Total paid via PayPal for all loans"
                    value={`$${totalPaypal.toLocaleString()}`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <PaymentMethod />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Invoices />
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <BillingInformation payments={rows} />
            </Grid>
            <Grid item xs={12} md={5}>
              <Transactions />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;

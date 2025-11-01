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
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import Bill from "layouts/billing/components/Bill";
import { methodToString } from "../../../../utils/methodUtils";
import { formatters } from "../../../../utils/dataFormatters";

function BillingInformation({ payments = [] }) {
  return (
    <Card id="delete-account">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h6" fontWeight="medium">
          Payment History
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          {payments.map((p, idx) => (
            <Bill
              key={p.id || idx}
              name={p.id || "Payment"}
              company={`Method: ${methodToString(p.method) || "-"}`}
              email={`Payment Date: ${p.paymentDate ? formatters.date(p.paymentDate) : "-"}`}
              vat={p.amount || "-"}
              noGutter={idx === payments.length - 1}
            />
          ))}
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default BillingInformation;

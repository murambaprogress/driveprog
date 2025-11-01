import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import paymentsData from "./data/payments";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

function Payments() {
  const [menu, setMenu] = useState(null);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const navigate = useNavigate();
  // optional FormContext for creating a loan when initiating a payment flow
  let createLoanFn = null;
  let setActiveLoanFn = null;
  try {
    // lazy require to avoid circular imports in non-loan pages
  // eslint-disable-next-line global-require
  const ctx = require('../../../../loanApp/context/FormContext');
    if (ctx && ctx.useFormContext) {
      const { createLoan, setActiveLoan } = ctx.useFormContext();
      createLoanFn = createLoan;
      setActiveLoanFn = setActiveLoan;
    }
  } catch (e) {
    // ignore if FormContext isn't available in this route
  }

  const downloadReceipt = (id = "P-REC-001") => {
    const content = `Receipt ID: ${id}\nDate: ${new Date().toISOString()}\nAmount: $720\nPayment receipt.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem
        onClick={() => {
          closeMenu();
          if (createLoanFn) {
            const id = createLoanFn({});
            if (setActiveLoanFn) setActiveLoanFn(id);
            navigate(`/loan/apply/${id}/step-1`);
          } else {
            navigate("/loan/apply");
          }
        }}
      >
        Make Payment
      </MenuItem>
      <MenuItem
        onClick={() => {
          closeMenu();
          navigate("/loan/history");
        }}
      >
        View Payment History
      </MenuItem>
      <MenuItem
        onClick={() => {
          closeMenu();
          downloadReceipt();
        }}
      >
        Download Receipt
      </MenuItem>
    </Menu>
  );

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Payments
          </MDTypography>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>
      <MDBox>
        <DataTable
          table={paymentsData()}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}

export default Payments;

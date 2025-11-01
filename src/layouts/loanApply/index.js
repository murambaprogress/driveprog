import React from "react";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Loan Application component
import LoanApp from "loanApp/LoanApp";

function LoanApply() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <LoanApp />
      <Footer />
    </DashboardLayout>
  );
}

export default LoanApply;

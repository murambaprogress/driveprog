import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

// Logos
import masterCardLogo from "assets/images/logos/mastercard.png";
import visaLogo from "assets/images/logos/visa.png";

export default function data() {
  const columns = [
    { Header: "ID", accessor: "id", width: "10%", align: "center" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Amount", accessor: "amount", align: "center" },
    { Header: "Payment Method", accessor: "method", align: "center" },
    { Header: "Payment Date", accessor: "paymentDate", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const rows = [];

  return { columns, rows };
}

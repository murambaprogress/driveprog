import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

export default function data() {
  const columns = [
    { Header: "ID", accessor: "id", width: "10%", align: "left" },
    { Header: "Status", accessor: "status", align: "left" },
    { Header: "Amount", accessor: "amount", align: "center" },
    { Header: "Payment Method", accessor: "method", align: "center" },
    { Header: "Payment Date", accessor: "paymentDate", align: "center" },
    { Header: "Actions", accessor: "actions", align: "right" },
  ];

  const rows = [
    {
      id: "P-1001",
      status: (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="success" fontWeight="medium">
            On Time
          </MDTypography>
        </MDBox>
      ),
      amount: "$1,200",
      method: "bank",
      paymentDate: "2025-09-05",
      actions: "View",
    },
    {
      id: "P-1002",
      status: (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="error" fontWeight="medium">
            Past Due
          </MDTypography>
        </MDBox>
      ),
      amount: "$450",
      method: "paypal",
      paymentDate: "2025-08-01",
      actions: "Pay",
    },
    {
      id: "P-1003",
      status: (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="success" fontWeight="medium">
            On Time
          </MDTypography>
        </MDBox>
      ),
      amount: "$2,750",
      method: "Stripe",
      paymentDate: "2025-10-12",
      actions: "View",
    },
    {
      id: "P-1004",
      status: (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="success" fontWeight="medium">
            Paid
          </MDTypography>
        </MDBox>
      ),
      amount: "$6,300",
      method: "Cash",
      paymentDate: "2025-07-22",
      actions: "Receipt",
    },
    {
      id: "P-1005",
      status: (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="success" fontWeight="medium">
            On Time
          </MDTypography>
        </MDBox>
      ),
      amount: "$250",
      method: "Bitcoin",
      paymentDate: "2025-08-20",
      actions: "View",
    },
    {
      id: "P-1006",
      status: (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="error" fontWeight="medium">
            Failed
          </MDTypography>
        </MDBox>
      ),
      amount: "$900",
      method: "CRYPTO-CURRENCY",
      paymentDate: "2025-08-10",
      actions: "Retry",
    },
  ];

  return { columns, rows };
}

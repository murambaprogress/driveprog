import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

export default function data() {
  const columns = [
    { Header: "ID", accessor: "id", width: "10%", align: "left" },
    { Header: "Name", accessor: "name", align: "left" },
    { Header: "Email", accessor: "email", align: "center" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Actions", accessor: "actions", align: "right" },
  ];

  const rows = [];

  return { columns, rows };
}

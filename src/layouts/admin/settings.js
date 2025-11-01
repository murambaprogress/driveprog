import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import adminDataService from "../../services/adminDataService";
import Grid from "@mui/material/Grid";
// import TextField from "@mui/material/TextField"; // Replaced with VhoozhtInput
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
// import InputLabel from "@mui/material/InputLabel"; // Replaced with VhoozhtSelect labels
// import Select from "@mui/material/Select"; // Replaced with VhoozhtSelect
// import MenuItem from "@mui/material/MenuItem"; // Replaced with VhoozhtSelect options
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";

function AdminSettings() {
  const [settings, setSettings] = useState({
  systemName: "DriveCash Lending Platform",
    maxLoanAmount: 50000,
    minLoanAmount: 1000,
    defaultInterestRate: 12.5,
    maxLoanTerm: 60,
    minCreditScore: 600,
    autoApprovalThreshold: 750,
    enableNotifications: true,
    enableAuditLog: true,
    maintenanceMode: false,
    dataRetentionDays: 365,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    totalPayments: 0,
    systemUptime: '0 days',
    dataSize: '0 MB',
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  useEffect(() => {
    loadSystemStats();
    loadAuditLogs();
    // Load persisted admin settings into local state
    try {
      const persisted = adminDataService.getSettings();
      if (persisted) setSettings(prev => ({ ...prev, ...persisted }));
    } catch (e) {
      // ignore
    }
  }, []);

  const loadSystemStats = () => {
    try {
      const systemStats = adminDataService.getSystemStats();
      setStats(systemStats);
    } catch (error) {
      showNotification("Error loading system stats", "error");
    }
  };

  const loadAuditLogs = () => {
    try {
      const logs = adminDataService.getAuditLogs({ limit: 50 });
      setAuditLogs(logs);
    } catch (error) {
      showNotification("Error loading audit logs", "error");
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    try {
      // In a real app, this would save to backend
  adminDataService.setSettings(settings);
  showNotification("Settings saved successfully");
    } catch (error) {
      showNotification("Error saving settings", "error");
    }
  };

  const handleExportData = async () => {
    try {
      setExportProgress(0);
      
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Export all data
      setTimeout(() => {
        adminDataService.exportData('all');
        showNotification("Complete system data exported successfully");
        setExportProgress(0);
      }, 2000);
    } catch (error) {
      showNotification("Error exporting data", "error");
      setExportProgress(0);
    }
  };

  const handleImportData = async (file) => {
    if (!file) return;
    
    try {
      setImporting(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          adminDataService.importData(data, 'merge'); // merge with existing data
          showNotification(`Data imported successfully. ${data.users?.length || 0} users, ${data.loans?.length || 0} loans, ${data.payments?.length || 0} payments.`);
          setImportModalOpen(false);
          loadSystemStats(); // Refresh stats
        } catch (error) {
          showNotification("Error parsing import file", "error");
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      showNotification("Error importing data", "error");
      setImporting(false);
    }
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL system data? This action cannot be undone!")) {
      if (window.confirm("This will delete all users, loans, and payments. Type 'DELETE' to confirm:") && 
          window.prompt("Type DELETE to confirm:") === "DELETE") {
        try {
          adminDataService.clearAllData();
          showNotification("All system data cleared", "warning");
          loadSystemStats();
        } catch (error) {
          showNotification("Error clearing data", "error");
        }
      }
    }
  };

  const generateSampleData = () => {
    if (window.confirm("Generate sample data? This will add 50 users, 120 loans, and 200 payments.")) {
      try {
        adminDataService.generateSampleData();
        showNotification("Sample data generated successfully");
        loadSystemStats();
      } catch (error) {
        showNotification("Error generating sample data", "error");
      }
    }
  };

  const resetSystem = () => {
    if (window.confirm("Reset system to defaults? This will clear all data and reset settings.")) {
      if (window.prompt("Type RESET to confirm:") === "RESET") {
        try {
          adminDataService.clearAllData();
          localStorage.removeItem('adminSettings');
          setSettings({
            systemName: "DriveCash Lending Platform",
            maxLoanAmount: 50000,
            minLoanAmount: 1000,
            defaultInterestRate: 12.5,
            maxLoanTerm: 60,
            minCreditScore: 600,
            autoApprovalThreshold: 750,
            enableNotifications: true,
            enableAuditLog: true,
            maintenanceMode: false,
            dataRetentionDays: 365,
          });
          showNotification("System reset to defaults", "info");
          loadSystemStats();
        } catch (error) {
          showNotification("Error resetting system", "error");
        }
      }
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
      <Grid container spacing={3}>
        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" mb={2}>System Information</MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">Total Users</MDTypography>
                  <MDTypography variant="h4">{stats.totalUsers}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">Total Loans</MDTypography>
                  <MDTypography variant="h4">{stats.totalLoans}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">Total Payments</MDTypography>
                  <MDTypography variant="h4">{stats.totalPayments}</MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">Data Size</MDTypography>
                  <MDTypography variant="h6">{stats.dataSize}</MDTypography>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" mb={2}>Quick Actions</MDTypography>
              <MDBox display="flex" flexDirection="column" gap={2}>
                <MDButton 
                  variant="contained" 
                  color="info" 
                  onClick={() => setAuditModalOpen(true)}
                  startIcon={<Icon>history</Icon>}
                >
                  View Audit Logs
                </MDButton>
                <MDButton 
                  variant="contained" 
                  color="success" 
                  onClick={generateSampleData}
                  startIcon={<Icon>add</Icon>}
                >
                  Generate Sample Data
                </MDButton>
                <MDButton 
                  variant="outlined" 
                  color="warning" 
                  onClick={clearAllData}
                  startIcon={<Icon>delete_sweep</Icon>}
                >
                  Clear All Data
                </MDButton>
                <MDButton 
                  variant="outlined" 
                  color="error" 
                  onClick={resetSystem}
                  startIcon={<Icon>refresh</Icon>}
                >
                  Reset System
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={8}>
          <Card>
            <MDBox p={3}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDTypography variant="h6">System Settings</MDTypography>
                <MDButton variant="contained" onClick={saveSettings}>
                  Save Settings
                </MDButton>
              </MDBox>

              <Grid container spacing={3}>
                {/* Basic Settings */}
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" mb={2}>Basic Configuration</MDTypography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <VhoozhtInput
                    fullWidth
                    label="System Name"
                    value={settings.systemName}
                    onChange={(e) => handleSettingChange('systemName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <VhoozhtInput
                    fullWidth
                    label="Data Retention (days)"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                  />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Loan Settings */}
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" mb={2}>Loan Configuration</MDTypography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <VhoozhtInput
                    fullWidth
                    label="Maximum Loan Amount ($)"
                    type="number"
                    value={settings.maxLoanAmount}
                    onChange={(e) => handleSettingChange('maxLoanAmount', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <VhoozhtInput
                    fullWidth
                    label="Minimum Loan Amount ($)"
                    type="number"
                    value={settings.minLoanAmount}
                    onChange={(e) => handleSettingChange('minLoanAmount', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <VhoozhtInput
                    fullWidth
                    label="Default Interest Rate (%)"
                    type="number"
                    step="0.1"
                    value={settings.defaultInterestRate}
                    onChange={(e) => handleSettingChange('defaultInterestRate', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <VhoozhtInput
                    fullWidth
                    label="Maximum Term (months)"
                    type="number"
                    value={settings.maxLoanTerm}
                    onChange={(e) => handleSettingChange('maxLoanTerm', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <VhoozhtInput
                    fullWidth
                    label="Minimum Credit Score"
                    type="number"
                    value={settings.minCreditScore}
                    onChange={(e) => handleSettingChange('minCreditScore', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <VhoozhtInput
                    fullWidth
                    label="Auto-Approval Credit Score Threshold"
                    type="number"
                    value={settings.autoApprovalThreshold}
                    onChange={(e) => handleSettingChange('autoApprovalThreshold', parseInt(e.target.value))}
                    helperText="Loans for users with this credit score or higher will be auto-approved"
                  />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* System Toggles */}
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" mb={2}>System Controls</MDTypography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableNotifications}
                        onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                      />
                    }
                    label="Enable Notifications"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableAuditLog}
                        onChange={(e) => handleSettingChange('enableAuditLog', e.target.checked)}
                      />
                    }
                    label="Enable Audit Logging"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                        color="warning"
                      />
                    }
                    label="Maintenance Mode"
                  />
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </Grid>

  {/* Data Management */}
  <Grid item xs={12} md={4}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" mb={2}>Data Management</MDTypography>
              
              {exportProgress > 0 && (
                <MDBox mb={2}>
                  <MDTypography variant="caption">Exporting... {exportProgress}%</MDTypography>
                  <LinearProgress variant="determinate" value={exportProgress} />
                </MDBox>
              )}
              
              <MDBox display="flex" flexDirection="column" gap={2}>
                <MDButton
                  variant="contained"
                  color="info"
                  onClick={handleExportData}
                  disabled={exportProgress > 0}
                  startIcon={<Icon>download</Icon>}
                >
                  Export All Data
                </MDButton>
                
                <MDButton
                  variant="outlined"
                  color="success"
                  onClick={() => setImportModalOpen(true)}
                  startIcon={<Icon>upload</Icon>}
                >
                  Import Data
                </MDButton>
                
                <MDButton
                  variant="outlined"
                  onClick={() => adminDataService.exportCSV('all')}
                  startIcon={<Icon>table_chart</Icon>}
                >
                  Export CSV Reports
                </MDButton>
              </MDBox>

              <MDBox mt={3}>
                <MDTypography variant="subtitle2" mb={1}>Storage Usage</MDTypography>
                <MDTypography variant="caption" color="text">
                  Current: {stats.dataSize}
                </MDTypography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((stats.totalUsers + stats.totalLoans + stats.totalPayments) / 10, 100)} 
                  sx={{ mt: 1 }}
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

  {/* System Health Monitor removed per request */}
      </Grid>

      {/* Audit Logs Modal */}
      <Dialog open={auditModalOpen} onClose={() => setAuditModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Audit Logs</DialogTitle>
        <DialogContent>
          <List>
            {auditLogs.map((log, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={log.action}
                  secondary={`${log.user} - ${new Date(log.timestamp).toLocaleString()}`}
                />
                <ListItemSecondaryAction>
                  <Chip label={log.type} size="small" />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setAuditModalOpen(false)}>Close</MDButton>
        </DialogActions>
      </Dialog>

      {/* Import Data Modal */}
      <Dialog open={importModalOpen} onClose={() => setImportModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <MDBox p={2}>
            <MDTypography variant="body2" mb={2}>
              Select a JSON file to import. The data will be merged with existing records.
            </MDTypography>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleImportData(e.target.files[0])}
              style={{ display: 'none' }}
              id="import-file"
            />
            <label htmlFor="import-file">
              <MDButton
                variant="outlined"
                component="span"
                disabled={importing}
                startIcon={<Icon>upload_file</Icon>}
              >
                {importing ? 'Importing...' : 'Choose File'}
              </MDButton>
            </label>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setImportModalOpen(false)}>Cancel</MDButton>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
      </MDBox>
    </DashboardLayout>
  );
}

export default AdminSettings;

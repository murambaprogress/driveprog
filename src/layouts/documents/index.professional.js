import React, { useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms";
// import TextField from "@mui/material/TextField"; // Replaced with VhoozhtInput
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
// import InputLabel from "@mui/material/InputLabel"; // Replaced with VhoozhtSelect
// import Select from "@mui/material/Select"; // Replaced with VhoozhtSelect
// import MenuItem from "@mui/material/MenuItem"; // Replaced with VhoozhtSelect options
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import LinearProgress from "@mui/material/LinearProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { alpha } from "@mui/material/styles";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { formatters } from "utils/dataFormatters";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Document Card Component
function DocumentCard({ document, onView, onDownload, onDelete, onReupload }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      case 'expired': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getDocumentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      case 'xlsx':
      case 'xls': return 'grid_on';
      default: return 'insert_drive_file';
    }
  };

  const formatDate = (date) => formatters.date(date);

  return (
    <Card
      sx={{
        p: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${alpha(getStatusColor(document.status), 0.25)}`,
        },
        background: `linear-gradient(135deg, ${alpha(getStatusColor(document.status), 0.08)} 0%, ${alpha(getStatusColor(document.status), 0.03)} 100%)`,
        border: `1px solid ${alpha(getStatusColor(document.status), 0.2)}`,
      }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <MDBox display="flex" alignItems="center">
          <Avatar
            sx={{
              bgcolor: getStatusColor(document.status),
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            <Icon fontSize="medium" sx={{ color: 'white' }}>{getDocumentIcon(document.type)}</Icon>
          </Avatar>
          <MDBox>
            <MDTypography variant="h6" fontWeight="bold" color="text">
              {document.name}
            </MDTypography>
            <MDTypography variant="caption" color="text" opacity={0.7}>
              {document.type.toUpperCase()} • {document.size}
            </MDTypography>
          </MDBox>
        </MDBox>
        
        <Chip 
          label={document.status.toUpperCase()} 
          sx={{
            bgcolor: getStatusColor(document.status),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }}
          size="small"
        />
      </MDBox>

      <MDBox mb={2}>
        <MDTypography variant="caption" color="text" opacity={0.7} display="block">
          Uploaded: {formatDate(document.uploadDate)}
        </MDTypography>
        {document.verificationDate && (
          <MDTypography variant="caption" color="text" opacity={0.7} display="block">
            Verified: {formatDate(document.verificationDate)}
          </MDTypography>
        )}
        {document.category && (
          <MDTypography variant="caption" color="text" opacity={0.7} display="block">
            Category: {document.category}
          </MDTypography>
        )}
      </MDBox>

      {document.adminNotes && (
        <Alert severity={document.status === 'approved' ? 'success' : document.status === 'rejected' ? 'error' : 'info'} sx={{ mb: 2, fontSize: '0.875rem' }}>
          <strong>Admin Notes:</strong> {document.adminNotes}
        </Alert>
      )}

      <MDBox display="flex" gap={1} mt={2}>
        <Tooltip title="View Document">
          <IconButton size="small" onClick={() => onView(document)} sx={{ color: '#2196f3' }}>
            <Icon fontSize="small">visibility</Icon>
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Download">
          <IconButton size="small" onClick={() => onDownload(document)} sx={{ color: '#4caf50' }}>
            <Icon fontSize="small">download</Icon>
          </IconButton>
        </Tooltip>
        
        {document.status === 'rejected' && (
          <Tooltip title="Re-upload">
            <IconButton size="small" onClick={() => onReupload(document)} sx={{ color: '#ff9800' }}>
              <Icon fontSize="small">refresh</Icon>
            </IconButton>
          </Tooltip>
        )}
        
        {document.status === 'pending' && (
          <Tooltip title="Cancel Upload">
            <IconButton size="small" onClick={() => onDelete(document)} sx={{ color: '#f44336' }}>
              <Icon fontSize="small">delete</Icon>
            </IconButton>
          </Tooltip>
        )}
      </MDBox>
    </Card>
  );
}

// Document Upload Dialog
function DocumentUploadDialog({ open, onClose, onUpload }) {
  const [uploadData, setUploadData] = useState({
    name: '',
    category: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const documentCategories = [
    'Identity Documents',
    'Income Verification',
    'Bank Statements',
    'Property Documents',
    'Insurance Papers',
    'Tax Returns',
    'Employment Letters',
    'Other'
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, DOC, DOCX, JPG, PNG)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setUploadData(prev => ({
        ...prev,
        file: file,
        name: prev.name || file.name.replace(/\.[^/.]+$/, "")
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.category || !uploadData.name) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newDocument = {
        id: Date.now(),
        name: uploadData.name,
        type: uploadData.file.name.split('.').pop(),
        size: (uploadData.file.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString(),
        status: 'pending',
        category: uploadData.category,
        description: uploadData.description,
        fileName: uploadData.file.name
      };

      onUpload(newDocument);
      setUploading(false);
      setUploadData({ name: '', category: '', description: '', file: null });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
            <Icon>cloud_upload</Icon>
          </Avatar>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">
              Upload Document
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Upload documents for verification (Max 10MB)
            </MDTypography>
          </MDBox>
        </MDBox>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <VhoozhtInput
              fullWidth
              label="Document Name *"
              value={uploadData.name}
              onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Driver's License, Bank Statement"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select
                value={uploadData.category}
                label="Category *"
                onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
              >
                {documentCategories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <VhoozhtInput
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional notes about this document"
            />
          </Grid>
          
          <Grid item xs={12}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            
            <Card
              sx={{
                p: 3,
                border: '2px dashed #ccc',
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#2196f3',
                  bgcolor: alpha('#2196f3', 0.05)
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadData.file ? (
                <MDBox>
                  <Icon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }}>check_circle</Icon>
                  <MDTypography variant="h6" fontWeight="bold" mb={1}>
                    {uploadData.file.name}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    {(uploadData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </MDTypography>
                </MDBox>
              ) : (
                <MDBox>
                  <Icon sx={{ fontSize: 48, color: '#9e9e9e', mb: 1 }}>cloud_upload</Icon>
                  <MDTypography variant="h6" fontWeight="bold" mb={1}>
                    Click to Select File
                  </MDTypography>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </MDTypography>
                </MDBox>
              )}
            </Card>
          </Grid>
          
          {uploading && (
            <Grid item xs={12}>
              <MDBox>
                <MDTypography variant="body2" mb={1}>Uploading...</MDTypography>
                <LinearProgress />
              </MDBox>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <MDButton variant="outlined" color="secondary" onClick={onClose} disabled={uploading}>
          Cancel
        </MDButton>
        <MDButton 
          variant="gradient" 
          color="success" 
          onClick={handleUpload}
          disabled={uploading || !uploadData.file || !uploadData.category || !uploadData.name}
          startIcon={<Icon>cloud_upload</Icon>}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

function Documents() {
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Driver's License",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2025-01-20T10:00:00",
      verificationDate: "2025-01-21T14:30:00",
      status: "approved",
      category: "Identity Documents",
      adminNotes: "Document verified and approved. Clear image quality.",
      fileName: "drivers_license.pdf"
    },
    {
      id: 2,
      name: "Bank Statement - January",
      type: "PDF",
      size: "1.8 MB",
      uploadDate: "2025-01-20T11:15:00",
      verificationDate: "2025-01-22T09:45:00",
      status: "approved",
      category: "Bank Statements",
      adminNotes: "Bank statement verified. All information matches application.",
      fileName: "bank_statement_jan.pdf"
    },
    {
      id: 3,
      name: "Employment Letter",
      type: "PDF",
      size: "1.2 MB",
      uploadDate: "2025-01-22T16:20:00",
      status: "pending",
      category: "Employment Letters",
      fileName: "employment_letter.pdf"
    },
    {
      id: 4,
      name: "Tax Return 2024",
      type: "PDF",
      size: "3.1 MB",
      uploadDate: "2025-01-25T13:45:00",
      verificationDate: "2025-01-26T10:15:00",
      status: "rejected",
      category: "Tax Returns",
      adminNotes: "Document unclear. Please upload a higher quality scan with all pages visible.",
      fileName: "tax_return_2024.pdf"
    },
  ]);
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUpload = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
    setSnackbar({ 
      open: true, 
      message: 'Document uploaded successfully! It will be reviewed by our team within 2-3 business days.', 
      severity: 'success' 
    });
  };

  const handleView = (document) => {
    // Mock document view
    setSnackbar({ 
      open: true, 
      message: `Opening ${document.name}...`, 
      severity: 'info' 
    });
  };

  const handleDownload = (document) => {
    // Mock download
    setSnackbar({ 
      open: true, 
      message: `Downloading ${document.name}...`, 
      severity: 'info' 
    });
  };

  const handleDelete = (document) => {
    setDocuments(prev => prev.filter(doc => doc.id !== document.id));
    setSnackbar({ 
      open: true, 
      message: 'Document deleted successfully.', 
      severity: 'success' 
    });
  };

  const handleReupload = (document) => {
    setUploadDialogOpen(true);
  };

  const getDocumentsByStatus = (status) => {
    return documents.filter(doc => doc.status === status);
  };

  const DocumentsList = ({ documents, emptyMessage }) => (
    <MDBox>
      {documents.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Icon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }}>folder</Icon>
          <MDTypography variant="h5" fontWeight="bold" mb={1}>
            {emptyMessage}
          </MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.7} mb={3}>
            Upload documents to get started with verification.
          </MDTypography>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => setUploadDialogOpen(true)}
            startIcon={<Icon>cloud_upload</Icon>}
          >
            Upload Document
          </MDButton>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} md={6} key={document.id}>
              <DocumentCard
                document={document}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onReupload={handleReupload}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </MDBox>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
              Document Management 📄
            </MDTypography>
            <MDTypography variant="body1" color="text" opacity={0.7}>
              Upload and manage your documents for loan verification.
            </MDTypography>
          </MDBox>
          
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => setUploadDialogOpen(true)}
            startIcon={<Icon>cloud_upload</Icon>}
            sx={{ px: 3 }}
          >
            Upload Document
          </MDButton>
        </MDBox>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Icon fontSize="large" sx={{ color: 'white' }}>verified</Icon>
              </Avatar>
              <MDTypography variant="h4" fontWeight="bold" color="success">
                {getDocumentsByStatus('approved').length}
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Approved Documents
              </MDTypography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Icon fontSize="large" sx={{ color: 'white' }}>pending</Icon>
              </Avatar>
              <MDTypography variant="h4" fontWeight="bold" color="warning">
                {getDocumentsByStatus('pending').length}
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Under Review
              </MDTypography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Icon fontSize="large" sx={{ color: 'white' }}>cancel</Icon>
              </Avatar>
              <MDTypography variant="h4" fontWeight="bold" color="error">
                {getDocumentsByStatus('rejected').length}
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Rejected Documents
              </MDTypography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Icon fontSize="large" sx={{ color: 'white' }}>folder</Icon>
              </Avatar>
              <MDTypography variant="h4" fontWeight="bold" color="info">
                {documents.length}
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Total Documents
              </MDTypography>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
                minHeight: 64,
              }
            }}
          >
            <Tab 
              label={`All Documents (${documents.length})`}
              icon={<Icon>folder</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label={`Approved (${getDocumentsByStatus('approved').length})`}
              icon={<Icon>verified</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label={`Under Review (${getDocumentsByStatus('pending').length})`}
              icon={<Icon>pending</Icon>} 
              iconPosition="start"
            />
            <Tab 
              label={`Rejected (${getDocumentsByStatus('rejected').length})`}
              icon={<Icon>cancel</Icon>} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Content based on active tab */}
        {activeTab === 0 && (
          <DocumentsList 
            documents={documents} 
            emptyMessage="No Documents Found" 
          />
        )}
        {activeTab === 1 && (
          <DocumentsList 
            documents={getDocumentsByStatus('approved')} 
            emptyMessage="No Approved Documents" 
          />
        )}
        {activeTab === 2 && (
          <DocumentsList 
            documents={getDocumentsByStatus('pending')} 
            emptyMessage="No Documents Under Review" 
          />
        )}
        {activeTab === 3 && (
          <DocumentsList 
            documents={getDocumentsByStatus('rejected')} 
            emptyMessage="No Rejected Documents" 
          />
        )}
      </MDBox>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}

export default Documents;

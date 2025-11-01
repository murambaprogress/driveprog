import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MDButton from '../../components/MDButton';
import MDTypography from '../../components/MDTypography';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm', children }) {
  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <MDTypography variant="body2">{children}</MDTypography>
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" color="info" onClick={onClose}>Cancel</MDButton>
        <MDButton variant="gradient" color="error" onClick={() => { onConfirm(); onClose(); }}>Yes</MDButton>
      </DialogActions>
    </Dialog>
  );
}

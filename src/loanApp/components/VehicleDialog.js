import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { VhoozhtInput } from 'components/VhoozhtForms';
// import TextField from '@mui/material/TextField'; // Replaced with VhoozhtInput
import MDButton from '../../components/MDButton';

export default function VehicleDialog({ open, onClose, initial = {}, onSave }) {
  const [vin, setVin] = useState(initial.vin || '');
  const [make, setMake] = useState(initial.make || '');
  const [model, setModel] = useState(initial.model || '');
  const [year, setYear] = useState(initial.year || '');
  const [licensePlate, setLicensePlate] = useState(initial.licensePlate || '');
  const [registrationState, setRegistrationState] = useState(initial.registrationState || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setVin(initial.vin || '');
    setMake(initial.make || '');
    setModel(initial.model || '');
    setYear(initial.year || '');
    setLicensePlate(initial.licensePlate || '');
    setRegistrationState(initial.registrationState || '');
    setErrors({});
  }, [initial, open]);

  const validate = () => {
    const e = {};
    if (!vin || vin.trim().length < 3) e.vin = 'VIN is required';
    if (year && !/^[0-9]{4}$/.test(String(year))) e.year = 'Year should be 4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { 
      vin: vin.trim(), 
      make: make.trim(), 
      model: model.trim(), 
      year: year ? String(year) : '',
      licensePlate: licensePlate.trim(),
      registrationState: registrationState.trim()
    };
    onSave(payload);
    onClose();
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial.id ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
      <DialogContent>
        <VhoozhtInput
          autoFocus
          margin="dense"
          label="VIN"
          fullWidth
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          error={!!errors.vin}
          helperText={errors.vin}
        />
        <VhoozhtInput
          margin="dense"
          label="Make"
          fullWidth
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
        <VhoozhtInput
          margin="dense"
          label="Model"
          fullWidth
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <VhoozhtInput
          margin="dense"
          label="Year"
          fullWidth
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
          error={!!errors.year}
          helperText={errors.year}
        />
        <VhoozhtInput
          margin="dense"
          label="License Plate"
          fullWidth
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          placeholder="e.g., ABC1234"
        />
        <VhoozhtInput
          margin="dense"
          label="Registration State"
          fullWidth
          value={registrationState}
          onChange={(e) => setRegistrationState(e.target.value)}
          placeholder="e.g., California"
        />
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" color="info" onClick={onClose}>
          Cancel
        </MDButton>
        <MDButton variant="gradient" color="info" onClick={handleSave}>
          Save
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

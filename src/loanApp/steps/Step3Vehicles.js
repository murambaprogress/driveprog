import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import { useFormContext } from '../context/FormContext';
import VehicleDialog from '../components/VehicleDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Step3Vehicles() {
  const { loanId } = useParams();
  const { state, addVehicle, updateVehicle, removeVehicle, setStepCompletion } = useFormContext();
  const loan = state.loans && state.loans[loanId] ? state.loans[loanId] : null;
  const navigate = useNavigate();
  const [editing, setEditing] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  console.log('Step3Vehicles - Current loan:', loan);
  console.log('Step3Vehicles - Vehicles:', loan?.vehicles);

  if (!loan) return <MDBox>Loading...</MDBox>;

  const handleAdd = () => {
    setEditing({});
  };

  const handleEdit = (vehicle) => {
    setEditing(vehicle);
  };

  const handleSave = (payload) => {
    console.log('Step3Vehicles - Saving vehicle:', payload);
    if (editing && editing.id) {
      updateVehicle({ loanId, vehicleId: editing.id, patch: payload });
    } else {
      addVehicle({ loanId, vehicle: payload });
    }
    setStepCompletion({ loanId, step: 'vehicle', completed: true });
    console.log('Step3Vehicles - After save, vehicles:', state.loans[loanId]?.vehicles);
    setEditing(null);
  };

  const handleRemove = (id) => {
    setConfirmRemove(id);
  };

  const confirmRemoveNow = (id) => {
    removeVehicle({ loanId, vehicleId: id });
  };

  return (
    <MDBox>
      <h3>Vehicles</h3>
      <MDButton onClick={() => navigate(-1)}>Back</MDButton>
      <MDButton onClick={handleAdd}>Add Vehicle</MDButton>
      <div>
        {(loan.vehicles || []).map((v) => (
          <div key={v.id} style={{ border: '1px solid #eee', padding: 8, margin: 8 }}>
            <div>VIN: {v.vin}</div>
            <div>{v.year} {v.make} {v.model}</div>
            <MDButton onClick={() => handleEdit(v)}>Edit</MDButton>
            <MDButton onClick={() => handleRemove(v.id)}>Remove</MDButton>
          </div>
        ))}
      </div>
  <MDButton onClick={() => navigate(`/loan/apply/${loanId}/step-4`)}>Next</MDButton>

      <VehicleDialog open={!!editing} initial={editing || {}} onClose={() => setEditing(null)} onSave={handleSave} />
      <ConfirmDialog open={!!confirmRemove} onClose={() => setConfirmRemove(null)} onConfirm={() => confirmRemoveNow(confirmRemove)} title="Remove Vehicle">
        Are you sure you want to remove this vehicle?
      </ConfirmDialog>
    </MDBox>
  );
}

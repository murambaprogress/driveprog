import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';

export default function LoansDashboard() {
  const { state, createLoan, setActiveLoan, deleteLoan } = useFormContext();
  const loans = Object.values(state.loans || {});
  const navigate = useNavigate();

  const handleNew = () => {
  // createLoan returns the new loan id synchronously; use it to avoid reading state before update
  const id = createLoan({});
  setActiveLoan(id);
  navigate(`/loan/apply/${id}/step-1`);
  };

  const handleOpen = (id) => {
    setActiveLoan(id);
  navigate(`/loan/apply/${id}/step-1`);
  };

  const handleDelete = (id) => {
    deleteLoan(id);
  };

  return (
    <MDBox>
      <h2>Your Loans</h2>
      <MDButton onClick={handleNew}>Create New Loan</MDButton>
      <div style={{ marginTop: 16 }}>
        {loans.length === 0 && <div>No loans yet</div>}
        {loans.map((loan) => (
          <div key={loan.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 8 }}>
            <div>ID: {loan.id}</div>
            <div>Status: {loan.status}</div>
            <div>Vehicles: {loan.vehicles?.length || 0}</div>
            <MDButton onClick={() => handleOpen(loan.id)}>Open</MDButton>
            <MDButton onClick={() => { createLoan({ ...loan }); }}>Duplicate</MDButton>
            <MDButton onClick={() => handleDelete(loan.id)}>Delete</MDButton>
          </div>
        ))}
      </div>
    </MDBox>
  );
}

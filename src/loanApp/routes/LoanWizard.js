import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import Step1Personal from '../steps/Step1Personal';
import Step2Income from '../steps/Step2Income';
import Step3Vehicles from '../steps/Step3Vehicles';
import Step4Photos from '../steps/Step4Photos';
import Review from '../steps/Review';

function Guarded({ element: Element, requiredSteps = [], ...rest }) {
  const { state } = useFormContext();
  const { loanId } = useParams();
  const loan = state.loans[loanId];
  if (!loan) return <Navigate to="/loans" replace />;
  // ensure required steps are completed
  const ok = requiredSteps.every((s) => loan.stepCompletion && loan.stepCompletion[s]);
  if (!ok) {
    // Redirect to first incomplete step
    const order = ['personal','income','vehicle','condition','photos'];
    const firstIncomplete = order.findIndex((k) => !(loan.stepCompletion && loan.stepCompletion[k]));
    const target = firstIncomplete === -1 ? `/loan/apply/${loanId}/step-1` : `/loan/apply/${loanId}/step-${firstIncomplete+1}`;
    return <Navigate to={target} replace />;
  }
  return <Element />;
}

export default function LoanWizard() {
  return (
    <Routes>
      <Route path="/loan/apply/:loanId/step-1" element={<Step1Personal />} />
      <Route path="/loan/apply/:loanId/step-2" element={<Guarded element={Step2Income} requiredSteps={[ 'personal' ]} />} />
      <Route path="/loan/apply/:loanId/step-3" element={<Guarded element={Step3Vehicles} requiredSteps={[ 'personal','income' ]} />} />
      <Route path="/loan/apply/:loanId/step-4" element={<Guarded element={Step4Photos} requiredSteps={[ 'personal','income','vehicle' ]} />} />
      <Route path="/loan/apply/:loanId/review" element={<Guarded element={Review} requiredSteps={[ 'personal','income','vehicle','photos' ]} />} />
      <Route path="*" element={<Navigate to="/loan/apply" replace />} />
    </Routes>
  );
}

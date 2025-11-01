import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import MDInput from '../../components/MDInput';
import { useFormContext } from '../context/FormContext';

export default function Step1Personal() {
  const methods = useForm({ mode: 'onChange' });
  const { handleSubmit, register, formState, reset, watch } = methods;
  const { isValid } = formState;
  const { loanId } = useParams();
  const { state, updateLoanSection, setStepCompletion } = useFormContext();
  const navigate = useNavigate();

  useEffect(() => {
    const loan = state.loans[loanId];
    if (loan && loan.personal) {
      reset(loan.personal);
    }
  }, [loanId, state.loans, reset]);

  const onSubmit = (data) => {
    updateLoanSection({ loanId, section: 'personal', patch: data });
    setStepCompletion({ loanId, step: 'personal', completed: true });
  navigate(`/loan/apply/${loanId}/step-2`);
  };

  const onSaveDraft = () => {
    const snapshot = watch();
    updateLoanSection({ loanId, section: 'personal', patch: snapshot });
  };

  return (
    <FormProvider {...methods}>
      <MDBox component="form" onSubmit={handleSubmit(onSubmit)}>
        <h3>Personal Information</h3>
        <div>
          <label>Full name</label>
          <VhoozhtInput
            aria-label="fullName"
            fullWidth
            size="medium"
            {...register('fullName', { required: 'Full name required' })}
          />
        </div>
        <div>
          <label>Email</label>
          <VhoozhtInput
            aria-label="email"
            fullWidth
            size="medium"
            {...register('email', { required: 'Email required' })}
          />
        </div>
        <MDBox mt={2} display="flex" gap={2}>
          <MDButton type="button" onClick={() => navigate(-1)}>Back</MDButton>
          <MDButton type="button" onClick={onSaveDraft}>Save Draft</MDButton>
          <MDButton type="submit" disabled={!isValid} aria-disabled={!isValid}>{isValid ? 'Next' : 'Next (complete required fields)'}</MDButton>
        </MDBox>
      </MDBox>
    </FormProvider>
  );
}

import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Grid, Divider } from '@mui/material';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import MDInput from '../../components/MDInput';
import MDTypography from '../../components/MDTypography';
import MDSelect from '../../components/MDSelect';
import { useFormContext } from '../context/FormContext';
import LoanProgressTracker from '../components/LoanProgressTracker';

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' }
];

const PAY_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'semi-monthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' }
];

export default function Step2Income() {
  const methods = useForm({ 
    mode: 'onChange',
    defaultValues: {
      employmentStatus: 'employed',
      employerName: '',
      incomeSource: '',
      annualIncome: '',
      monthlyIncome: '',
      grossMonthlyIncome: '',
      yearsEmployed: '',
      payFrequency: 'monthly',
      nextPayDate: '',
      lastPayDate: '',
      directDeposit: 'Yes',
      activeBankruptcy: 'No',
      militaryStatus: 'None',
      creditScore: ''
    }
  });

  const { handleSubmit, register, formState, reset, watch, setValue } = methods;
  const { errors } = formState;
  const { loanId } = useParams();
  const { state, updateLoanSection, setStepCompletion } = useFormContext();
  const navigate = useNavigate();

  const employmentStatus = watch('employmentStatus');
  const annualIncome = watch('annualIncome');

  useEffect(() => {
    const loan = state.loans[loanId];
    if (loan && loan.income) reset(loan.income);
  }, [loanId, state.loans, reset]);

  // Auto-calculate monthly income from annual
  useEffect(() => {
    if (annualIncome && !isNaN(annualIncome)) {
      const monthly = (parseFloat(annualIncome) / 12).toFixed(2);
      setValue('monthlyIncome', monthly);
      setValue('grossMonthlyIncome', monthly);
    }
  }, [annualIncome, setValue]);

  const onSubmit = (data) => {
    updateLoanSection({ loanId, section: 'income', patch: data });
    setStepCompletion({ loanId, step: 'income', completed: true });
    navigate(`/loan/apply/${loanId}/step-3`);
  };

  return (
    <FormProvider {...methods}>
      <MDBox py={3}>
        <LoanProgressTracker currentStep="income" />

        <Card>
          <MDBox p={3}>
            <MDBox component="form" onSubmit={handleSubmit(onSubmit)}>
              <MDTypography variant="h4" fontWeight="bold" mb={1}>
                Income & Employment Information
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>
                Please provide your employment and income details
              </MDTypography>

              {/* Employment Information */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  💼 Employment Information
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDSelect
                      fullWidth
                      label="Employment Status *"
                      {...register('employmentStatus', { required: 'Employment status is required' })}
                      options={EMPLOYMENT_STATUS_OPTIONS}
                      error={!!errors.employmentStatus}
                      helperText={errors.employmentStatus?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Employer/Income Source *"
                      {...register('employerName', { required: 'Employer or income source is required' })}
                      error={!!errors.employerName}
                      helperText={errors.employerName?.message || "Enter your employer name or income source"}
                    />
                  </Grid>
                  {employmentStatus === 'employed' || employmentStatus === 'self-employed' ? (
                    <>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          fullWidth
                          type="number"
                          label="Years Employed"
                          {...register('yearsEmployed')}
                          helperText="How long have you been with this employer?"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDSelect
                          fullWidth
                          label="Pay Frequency"
                          {...register('payFrequency')}
                          options={PAY_FREQUENCY_OPTIONS}
                        />
                      </Grid>
                    </>
                  ) : null}
                </Grid>
              </MDBox>

              <Divider sx={{ my: 3 }} />

              {/* Income Information */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  💰 Income Information
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      type="number"
                      label="Annual Income *"
                      {...register('annualIncome', { 
                        required: 'Annual income is required',
                        min: { value: 0, message: 'Income must be positive' }
                      })}
                      error={!!errors.annualIncome}
                      helperText={errors.annualIncome?.message || "Your total yearly income"}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: '8px' }}>$</span>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      type="number"
                      label="Monthly Income *"
                      {...register('monthlyIncome', { 
                        required: 'Monthly income is required',
                        min: { value: 0, message: 'Income must be positive' }
                      })}
                      error={!!errors.monthlyIncome}
                      helperText={errors.monthlyIncome?.message || "Auto-calculated from annual income"}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: '8px' }}>$</span>,
                      }}
                    />
                  </Grid>
                  {employmentStatus === 'employed' || employmentStatus === 'self-employed' ? (
                    <>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          fullWidth
                          type="date"
                          label="Next Pay Date"
                          InputLabelProps={{ shrink: true }}
                          {...register('nextPayDate')}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          fullWidth
                          type="date"
                          label="Last Pay Date"
                          InputLabelProps={{ shrink: true }}
                          {...register('lastPayDate')}
                        />
                      </Grid>
                    </>
                  ) : null}
                </Grid>
              </MDBox>

              <Divider sx={{ my: 3 }} />

              {/* Additional Financial Information */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  📊 Additional Financial Information
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <MDInput
                      fullWidth
                      type="number"
                      label="Credit Score (Optional)"
                      {...register('creditScore')}
                      helperText="If known, enter your credit score"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDSelect
                      fullWidth
                      label="Active Bankruptcy"
                      {...register('activeBankruptcy')}
                      options={[
                        { value: 'No', label: 'No' },
                        { value: 'Yes', label: 'Yes' }
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDSelect
                      fullWidth
                      label="Direct Deposit Available"
                      {...register('directDeposit')}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Military Status (Optional)"
                      {...register('militaryStatus')}
                      helperText="e.g., Active Duty, Veteran, None"
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Navigation Buttons */}
              <MDBox mt={4} display="flex" justifyContent="space-between">
                <MDButton 
                  variant="outlined" 
                  color="dark" 
                  onClick={() => navigate(`/loan/apply/${loanId}/step-1`)}
                >
                  Back
                </MDButton>
                <MDButton 
                  type="submit" 
                  variant="gradient" 
                  color="info"
                >
                  Continue to Vehicle Information
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </FormProvider>
  );
}

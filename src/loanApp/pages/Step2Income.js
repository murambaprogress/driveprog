import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Grid, 
  Stepper, 
  Step, 
  StepLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
// DriveCash unified form components
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms";
import { useFormContext } from '../context/FormContext';

const Step2Income = ({ onNext, onBack }) => {
  const { formData, updateFormData, state, setStepCompletion } = useFormContext();
  const navigate = useNavigate();
  const params = useParams();
  const loanId = (state && state.activeLoanId) || params.loanId || null;
  const [showCoApplicantModal, setShowCoApplicantModal] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm({
    mode: 'onChange',
    defaultValues: {
      monthlyIncome: '',
      employmentStatus: '',
      employerName: '',
      employerPhone: '',
      jobTitle: '',
      yearsEmployed: '',
      additionalIncome: '',
      additionalIncomeSource: '',
      ...(formData.income || {})
    }
  });

  // Update form when formData changes (when navigating back to this step)
  useEffect(() => {
    if (formData?.income && Object.keys(formData.income).length > 0) {
      console.log('Resetting Step2 form with saved data:', formData.income);
      // Use Object.entries to set each field individually
      Object.entries(formData.income).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [loanId, setValue, formData?.income]); // Trigger when loanId changes

  const onSubmit = (data) => {
    updateFormData({ income: data });
    if (loanId) setStepCompletion({ loanId, step: 'income', completed: true });
    setShowCoApplicantModal(true);
  };

  // Autosave
  const values = typeof watch === 'function' ? watch() : {};
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (loanId) updateFormData({ income: values });
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [values]);

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else if (loanId) {
      navigate(`/loan/apply/${loanId}/step-1`);
    }
  };

  const handleCoApplicantChoice = (addCoApplicant) => {
    setShowCoApplicantModal(false);
    if (addCoApplicant) {
      // Navigate to co-applicant page
      if (typeof onNext === 'function') {
        onNext('co-applicant');
      } else if (loanId) {
        navigate(`/loan/apply/${loanId}/co-applicant`);
      }
    } else {
      // Skip co-applicant and go to vehicle step
      if (typeof onNext === 'function') {
        onNext();
      } else if (loanId) {
        navigate(`/loan/apply/${loanId}/vehicle`);
      }
    }
  };

  const steps = [
    'Personal Information',
    'Income Information',
    'Photos & Documents',
    'Review & Submit'
  ];

  return (
    <Card>
      <MDBox p={3}>
        <MDBox mb={4}>
          <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
            <Stepper activeStep={1} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: '#666',
                      fontSize: '0.875rem',
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: '#16a085',
                      fontWeight: 600,
                    },
                    '& .MuiStepIcon-root': {
                      color: '#e0e0e0',
                      '&.Mui-active': {
                        color: '#16a085',
                      },
                      '&.Mui-completed': {
                        color: '#16a085',
                      },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </MDBox>

      <MDBox component="form" role="form" onSubmit={handleSubmit(onSubmit)}>
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
            Income Information
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Please provide your employment and income details to continue with the loan application.
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {/* First Row - Employment Status */}
          <Grid item xs={12} md={6}>
            <VhoozhtSelect
              {...register('employmentStatus', { required: 'Employment status is required' })}
              label="Employment Status"
              placeholder="Select your employment status"
              size="small"
              error={!!errors.employmentStatus}
              helperText={errors.employmentStatus?.message}
              options={[
                { value: 'employed', label: 'Employed Full-time' },
                { value: 'part_time', label: 'Employed Part-time' },
                { value: 'self_employed', label: 'Self-employed' },
                { value: 'contract', label: 'Contract Worker' },
                { value: 'retired', label: 'Retired' },
                { value: 'student', label: 'Student' },
                { value: 'unemployed', label: 'Unemployed' }
              ]}
            />
          </Grid>

          {/* Second Row - Monthly Income and Pay Frequency */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Gross Monthly Income"
              {...register('grossMonthlyIncome', { required: 'Monthly income is required' })}
              placeholder="Enter your gross monthly income"
              error={!!errors.grossMonthlyIncome}
              helperText={errors.grossMonthlyIncome?.message}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtSelect
              {...register('payFrequency', { required: 'Pay frequency is required' })}
              label="Pay Frequency"
              placeholder="Select how often you get paid"
              size="small"
              error={!!errors.payFrequency}
              helperText={errors.payFrequency?.message}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'bi_weekly', label: 'Bi-weekly' },
                { value: 'semi_monthly', label: 'Semi-monthly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
            />
          </Grid>

          {/* Third Row - Current Employer and Job Title */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Current Employer
            </MDTypography>
            <VhoozhtInput
              {...register('currentEmployer', { required: 'Employer name is required' })}
              placeholder="Enter your employer name" error={!!errors.currentEmployer}
              helperText={errors.currentEmployer?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Job Title
            </MDTypography>
            <VhoozhtInput
              {...register('jobTitle', { required: 'Job title is required' })}
              placeholder="Enter your job title" error={!!errors.jobTitle}
              helperText={errors.jobTitle?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>

          {/* Fourth Row - Work Phone and Employment Duration */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Work Phone Number
            </MDTypography>
            <VhoozhtInput
              {...register('workPhone', { required: 'Work phone is required' })}
              placeholder="Enter work phone number" error={!!errors.workPhone}
              helperText={errors.workPhone?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Employment Start Date
            </MDTypography>
            <VhoozhtInput
              {...register('employmentStartDate', { required: 'Employment start date is required' })}
              type="date" error={!!errors.employmentStartDate}
              helperText={errors.employmentStartDate?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>

          {/* Fifth Row - Work Address and Monthly Expenses */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Work Address
            </MDTypography>
            <VhoozhtInput
              {...register('workAddress', { required: 'Work address is required' })}
              placeholder="Enter work address" error={!!errors.workAddress}
              helperText={errors.workAddress?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Monthly Expenses
            </MDTypography>
            <VhoozhtInput
              {...register('monthlyExpenses', { required: 'Monthly expenses is required' })}
              placeholder="Enter your monthly expenses" error={!!errors.monthlyExpenses}
              helperText={errors.monthlyExpenses?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>

          {/* Sixth Row - Next Pay Date and Last Pay Date */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Next Pay Date
            </MDTypography>
            <VhoozhtInput
              {...register('nextPayDate', { required: 'Next pay date is required' })}
              type="date" error={!!errors.nextPayDate}
              helperText={errors.nextPayDate?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Last Pay Date
            </MDTypography>
            <VhoozhtInput
              {...register('lastPayDate', { required: 'Last pay date is required' })}
              type="date" error={!!errors.lastPayDate}
              helperText={errors.lastPayDate?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#16a085',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#16a085',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                }
              }}
            />
          </Grid>

          {/* Seventh Row - Direct Deposit and Active Bankruptcy */}
          <Grid item xs={12} md={6}>
            <VhoozhtSelect
              {...register('directDeposit', { required: 'Direct deposit status is required' })}
              label="Do you have Direct Deposit?"
              placeholder="Select yes or no"
              size="small"
              error={!!errors.directDeposit}
              helperText={errors.directDeposit?.message}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtSelect
              {...register('activeBankruptcy', { required: 'Bankruptcy status is required' })}
              label="Are you in Active Bankruptcy?"
              placeholder="Select yes or no"
              size="small"
              error={!!errors.activeBankruptcy}
              helperText={errors.activeBankruptcy?.message}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ]}
            />
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        <MDBox display="flex" justifyContent="space-between" mt={4}>
          <MDButton color="dark"
            onClick={handleBack}
            sx={{
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Back to Personal Info
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            type="submit"
            sx={{
              backgroundColor: '#16a085',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)',
              '&:hover': {
                backgroundColor: '#138d75',
                boxShadow: '0 6px 16px rgba(22, 160, 133, 0.4)',
              },
              '&:focus': {
                outline: 'none',
              },
            }}
          >
            Continue to Documents
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Co-Applicant Modal */}
      <Dialog 
        open={showCoApplicantModal} 
        onClose={() => handleCoApplicantChoice(false)}
        maxWidth="sm" PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                backgroundColor: '#e8f5f3',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <GroupIcon sx={{ fontSize: 32, color: '#16a085' }} />
            </Box>
          </Box>
          <MDTypography variant="h5" fontWeight="bold" color="dark">
            Do you want to add a <span style={{ color: '#16a085' }}>Co-Applicant?</span>
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
          <MDTypography variant="body2" color="text" mb={3}>
            We'll be asking personal and income information about the co-applicant for loan application process.
          </MDTypography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3 }}>
          <MDBox display="flex" gap={2} width="100%">
            <MDButton color="dark" onClick={() => handleCoApplicantChoice(false)}
              sx={{
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              NO
            </MDButton>
            <MDButton
              variant="gradient"
              color="info" onClick={() => handleCoApplicantChoice(true)}
              sx={{
                backgroundColor: '#16a085',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)',
                '&:hover': {
                  backgroundColor: '#138d75',
                  boxShadow: '0 6px 16px rgba(22, 160, 133, 0.4)',
                },
              }}
            >
              YES
            </MDButton>
          </MDBox>
        </DialogActions>
      </Dialog>
      </MDBox>
    </Card>
  );
};

export default Step2Income;

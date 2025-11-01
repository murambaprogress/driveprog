import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Grid, 
  Stepper, 
  Step, 
  StepLabel,
  Paper,
  Card
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// DriveCash Form Components
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms"; // DriveCash form components

import { useFormContext } from '../context/FormContext';

const Step1Personal = ({ onNext }) => {
  const { formData, updateFormData, state, setStepCompletion } = useFormContext();
  const navigate = useNavigate();
  const params = useParams();
  const loanId = (state && state.activeLoanId) || params.loanId || null;
  
  console.log('Step1Personal - loanId:', loanId, 'activeLoanId:', state?.activeLoanId, 'params:', params);
  console.log('Step1Personal - formData:', formData, 'formData.personal:', formData?.personal);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    mode: 'onChange',
    defaultValues: {
      loanAmount: '',
      fullName: '',
      middleName: '',
      phoneNumber: '',
      ssn: '',
      email: '',
      dob: '',
      driverLicense: '',
      bankName: '',
      homeAddress: '',
      city: '',
      state: '',
      zipCode: '',
      monthlyIncome: '',
      ...(formData.personal || {})
    }
  });

  // Update form when formData changes (when navigating back to this step)
  useEffect(() => {
    console.log('Step1Personal useEffect triggered - formData.personal:', formData?.personal);
    if (formData?.personal && Object.keys(formData.personal).length > 0) {
      console.log('Populating form with saved data:', formData.personal);
      // Use Object.entries to set each field individually to avoid issues
      Object.entries(formData.personal).forEach(([key, value]) => {
        console.log(`Setting field ${key} =`, value);
        setValue(key, value, { shouldValidate: false, shouldDirty: false });
      });
    } else {
      console.log('No saved personal data found or empty object');
    }
  }, [loanId, setValue, formData?.personal]); // Trigger when loanId changes (when navigating to this step)

  // Prefill from quick apply if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem('quickApplicationData');
      if (raw) {
        const quick = JSON.parse(raw);
        // Map likely fields from QuickApplySidebar
        if (quick.fullName) setValue('fullName', quick.fullName);
        if (quick.phone) setValue('phoneNumber', quick.phone);
        if (quick.email) setValue('email', quick.email);
        if (quick.loanAmount) setValue('loanAmount', quick.loanAmount);
        if (quick.annualIncome) setValue('monthlyIncome', (quick.annualIncome / 12).toString());
        if (quick.vehicleYear) setValue('vehicleYear', quick.vehicleYear);
        if (quick.vehicleMake) setValue('vehicleMake', quick.vehicleMake);
        if (quick.vehicleModel) setValue('vehicleModel', quick.vehicleModel);
      }
    } catch (err) {
      // ignore parse errors
    }
  }, [setValue]);

  const onSubmit = (data) => {
    console.log('Step1Personal onSubmit - data:', data, 'loanId:', loanId);
    updateFormData({ personal: data });
    console.log('Setting step completion for loanId:', loanId);
    if (loanId) {
      setStepCompletion({ loanId, step: 'personal', completed: true });
      console.log('Step completion set for personal step');
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        // Prefer prop-based callback when provided (keeps component compatible),
        // otherwise navigate using router + active loan id.
        if (typeof onNext === 'function') {
          onNext();
        } else if (loanId) {
          navigate(`/loan/apply/${loanId}/step-2`);
        } else {
          // Fallback: go to landing if we somehow don't have a loan id
          navigate('/loan/apply');
        }
      }, 50);
    } else {
      console.warn('No loanId available for step completion');
      navigate('/loan/apply');
    }
  };

  // Autosave: watch form values and debounce updates to context
  const values = typeof watch === 'function' ? watch() : {};
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (loanId) updateFormData({ personal: values });
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [values]);

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
            <Stepper activeStep={0} alternativeLabel>
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
          {/* Focus heading for accessibility */}
          <h2 tabIndex={-1} ref={formHeadingRef => { if (formHeadingRef && !formHeadingRef.dataset.focused) { formHeadingRef.dataset.focused = true; formHeadingRef.focus(); } }} style={{ position: 'absolute', left: -9999, top: 'auto' }} aria-hidden="true">Personal Information Form</h2>
          <MDBox mb={4}>
            <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
              Personal Information
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Please provide your personal details to continue with the loan application.
            </MDTypography>
          </MDBox>

        <Grid container spacing={3}>
          {/* First Row - Loan Amount and Full Name */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Loan Amount Requested"
              placeholder="Enter loan amount"
              {...register('loanAmount', { 
                required: 'Loan amount is required',
                min: { value: 1, message: 'Loan amount must be at least $1' },
                max: { value: 25000, message: 'Loan amount cannot exceed $25,000' }
              })}
              error={!!errors.loanAmount}
              helperText={errors.loanAmount?.message}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Full Name"
              placeholder="Enter your full name"
              {...register('fullName', { required: 'Full name is required' })}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
          </Grid>

          {/* Second Row - Middle Name and Phone Number */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Middle Name"
              placeholder="Enter your middle name (optional)"
              {...register('middleName')}
              error={!!errors.middleName}
              helperText={errors.middleName?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Phone Number"
              placeholder="(555) 123-4567"
              {...register('phoneNumber', { required: 'Phone number is required' })}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
            />
          </Grid>

          {/* Third Row - Social Security and Email */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Social Security Number"
              placeholder="Enter your SSN"
              {...register('ssn', { required: 'SSN is required' })}
              error={!!errors.ssn}
              helperText={errors.ssn?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Email Address"
              placeholder="Enter your email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>

          {/* Fourth Row - Date of Birth and Driver's License */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Date of Birth"
              type="date"
              {...register('dob', { 
                required: 'Date of birth is required',
                validate: (value) => {
                  const dob = new Date(value);
                  const today = new Date();
                  const age = today.getFullYear() - dob.getFullYear();
                  const monthDiff = today.getMonth() - dob.getMonth();
                  const dayDiff = today.getDate() - dob.getDate();
                  
                  // Calculate exact age
                  const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
                    ? age - 1 
                    : age;
                  
                  return exactAge >= 18 || 'You must be at least 18 years old to apply';
                }
              })}
              error={!!errors.dob}
              helperText={errors.dob?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Driver's License Number"
              placeholder="Enter your driver license number"
              {...register('driverLicense', { required: 'Driver license number is required' })}
              error={!!errors.driverLicense}
              helperText={errors.driverLicense?.message}
            />
          </Grid>

          {/* Fifth Row - Bank Name and Home Street Address */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Bank Name"
              placeholder="Enter your bank name"
              {...register('bankName', { required: 'Bank name is required' })}
              error={!!errors.bankName}
              helperText={errors.bankName?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Home Street Address"
              placeholder="Enter your street address"
              {...register('homeAddress', { required: 'Home address is required' })}
              error={!!errors.homeAddress}
              helperText={errors.homeAddress?.message}
            />
          </Grid>

          {/* Sixth Row - City and State */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="City"
              placeholder="Enter your city"
              {...register('city', { required: 'City is required' })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtSelect
              label="State"
              placeholder="Select your state"
              size="small"
              options={[
                'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 
                'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
                'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
                'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
                'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
                'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
                'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
                'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
                'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
                'West Virginia', 'Wisconsin', 'Wyoming'
              ]}
              {...register('state', { required: 'State is required' })}
              error={!!errors.state}
              helperText={errors.state?.message}
            />
          </Grid>

          {/* Seventh Row - Zip Code and Monthly Income */}
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Zip Code"
              placeholder="Enter your zip code"
              {...register('zipCode', { required: 'Zip code is required' })}
              error={!!errors.zipCode}
              helperText={errors.zipCode?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <VhoozhtInput
              label="Monthly Income"
              placeholder="Enter your monthly income"
              {...register('monthlyIncome', { required: 'Monthly income is required' })}
              error={!!errors.monthlyIncome}
              helperText={errors.monthlyIncome?.message}
            />
          </Grid>
        </Grid>

        <MDBox display="flex" justifyContent="flex-end" mt={4}>
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
            Continue to Income Information
          </MDButton>
        </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
};

export default Step1Personal;

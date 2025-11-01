import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Grid, Divider, Alert } from '@mui/material';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import MDInput from '../../components/MDInput';
import MDTypography from '../../components/MDTypography';
import MDSelect from '../../components/MDSelect';
import { useFormContext } from '../context/FormContext';
import LoanProgressTracker from '../components/LoanProgressTracker';

const IDENTIFICATION_TYPES = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'state_id', label: 'State ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'military_id', label: 'Military ID' }
];

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function Step1Personal() {
  const methods = useForm({ 
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      socialSecurity: '',
      identificationType: 'drivers_license',
      identificationNumber: '',
      idIssuingState: '',
      
      // Address Information
      streetAddress: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      
      // Loan Details
      loanAmount: '',
      loanTerm: '36',
      loanPurpose: '',
      
      // Banking Information (optional)
      bankName: '',
      
      // Contact Preferences
      preferredContactMethod: 'email',
      textOptIn: false
    }
  });
  
  const { handleSubmit, register, formState, reset, watch, setValue } = methods;
  const { errors, isValid, dirtyFields } = formState;
  const { loanId } = useParams();
  const { state, updateLoanSection, setStepCompletion } = useFormContext();
  const navigate = useNavigate();
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Watch all form values for auto-save
  const watchedValues = watch();

  useEffect(() => {
    const loan = state.loans[loanId];
    if (loan && loan.personal) {
      reset(loan.personal);
    }
  }, [loanId, state.loans, reset]);

  // Auto-save functionality
  useEffect(() => {
    const hasChanges = Object.keys(dirtyFields).length > 0;
    if (hasChanges) {
      setAutoSaving(true);
      const timer = setTimeout(() => {
        updateLoanSection({ loanId, section: 'personal', patch: watchedValues });
        setLastSaved(new Date());
        setAutoSaving(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [watchedValues, dirtyFields, loanId, updateLoanSection]);

  const onSubmit = (data) => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'identificationType', 'identificationNumber', 'streetAddress', 'city', 'state', 'zipCode', 'loanAmount', 'loanTerm'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Format and save data
    const formattedData = {
      ...data,
      phone: data.phone.replace(/\D/g, ''), // Remove non-digits
      socialSecurity: data.socialSecurity ? data.socialSecurity.replace(/\D/g, '') : '', // Remove non-digits
      completedAt: new Date().toISOString(),
      ipAddress: 'client-side', // In real app, get from server
      userAgent: navigator.userAgent
    };

    updateLoanSection({ loanId, section: 'personal', patch: formattedData });
    setStepCompletion({ loanId, step: 'personal', completed: true });
    navigate(`/loan/apply/${loanId}/step-2`);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const formatSSN = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted);
  };

  const handleSSNChange = (e) => {
    const formatted = formatSSN(e.target.value);
    setValue('socialSecurity', formatted);
  };

  const loan = state.loans[loanId];
  const completionPercentage = loan && loan.personal ? 
    Math.round((Object.keys(loan.personal).filter(key => loan.personal[key]).length / 15) * 100) : 0;

  return (
    <FormProvider {...methods}>
      <MDBox py={3}>
        {/* Progress Tracker */}
        <LoanProgressTracker currentStep="personal" />

        <Card>
          <MDBox p={3}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDBox>
                <MDTypography variant="h4" fontWeight="bold" color="dark">
                  Personal Information
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={2}>
                  Please provide your personal details. All fields marked with * are required.
                </MDTypography>
              </MDBox>
              <MDBox textAlign="center">
                <MDTypography variant="h6" color="success">
                  {completionPercentage}% Complete
                </MDTypography>
                {autoSaving && (
                  <MDTypography variant="caption" color="info">
                    💾 Auto-saving...
                  </MDTypography>
                )}
                {lastSaved && !autoSaving && (
                  <MDTypography variant="caption" color="success">
                    ✓ Saved {lastSaved.toLocaleTimeString()}
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>

            <MDBox component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Basic Information */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  📋 Basic Information
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="First Name *"
                      {...register('firstName', { 
                        required: 'First name is required',
                        minLength: { value: 2, message: 'First name must be at least 2 characters' }
                      })}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Last Name *"
                      {...register('lastName', { 
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                      })}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      type="email"
                      label="Email Address *"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: { 
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                          message: 'Invalid email address' 
                        }
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Phone Number *"
                      placeholder="(555) 123-4567"
                      {...register('phone', { 
                        required: 'Phone number is required',
                        minLength: { value: 10, message: 'Phone number must be 10 digits' }
                      })}
                      onChange={handlePhoneChange}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      type="date"
                      label="Date of Birth *"
                      InputLabelProps={{ shrink: true }}
                      {...register('dateOfBirth', { 
                        required: 'Date of birth is required',
                        validate: value => {
                          const age = new Date().getFullYear() - new Date(value).getFullYear();
                          return age >= 18 || 'You must be at least 18 years old';
                        }
                      })}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Social Security Number (Optional)"
                      placeholder="123-45-6789"
                      {...register('socialSecurity')}
                      onChange={handleSSNChange}
                      helperText="Optional but helps with faster processing"
                    />
                  </Grid>
                </Grid>
              </MDBox>

              <Divider sx={{ my: 3 }} />

              {/* Identification */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  🆔 Identification
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <MDSelect
                      fullWidth
                      label="ID Type *"
                      {...register('identificationType', { required: 'ID Type is required' })}
                      options={IDENTIFICATION_TYPES}
                      error={!!errors.identificationType}
                      helperText={errors.identificationType?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDInput
                      fullWidth
                      label="ID Number *"
                      {...register('identificationNumber', { required: 'ID Number is required' })}
                      error={!!errors.identificationNumber}
                      helperText={errors.identificationNumber?.message || "Enter your ID number"}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDSelect
                      fullWidth
                      label="Issuing State"
                      {...register('idIssuingState')}
                      options={STATES.map(state => ({ value: state, label: state }))}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              <Divider sx={{ my: 3 }} />

              {/* Address Information */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  🏠 Address Information
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <MDInput
                      fullWidth
                      label="Street Address *"
                      {...register('streetAddress', { required: 'Street address is required' })}
                      error={!!errors.streetAddress}
                      helperText={errors.streetAddress?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      fullWidth
                      label="Address Line 2 (Optional)"
                      {...register('addressLine2')}
                      helperText="Apartment, suite, unit, etc."
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="City *"
                      {...register('city', { required: 'City is required' })}
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDSelect
                      fullWidth
                      label="State *"
                      {...register('state', { required: 'State is required' })}
                      options={STATES.map(state => ({ value: state, label: state }))}
                      error={!!errors.state}
                      helperText={errors.state?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      fullWidth
                      label="ZIP Code *"
                      {...register('zipCode', { 
                        required: 'ZIP code is required',
                        pattern: { value: /^\d{5}(-\d{4})?$/, message: 'Invalid ZIP code' }
                      })}
                      error={!!errors.zipCode}
                      helperText={errors.zipCode?.message}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              <Divider sx={{ my: 3 }} />

              {/* Loan Details */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  💰 Loan Details
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      type="number"
                      label="Loan Amount Requested *"
                      {...register('loanAmount', { 
                        required: 'Loan amount is required',
                        min: { value: 1000, message: 'Minimum loan amount is $1,000' },
                        max: { value: 100000, message: 'Maximum loan amount is $100,000' }
                      })}
                      error={!!errors.loanAmount}
                      helperText={errors.loanAmount?.message || "Enter amount between $1,000 - $100,000"}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: '8px' }}>$</span>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDSelect
                      fullWidth
                      label="Loan Term (Months) *"
                      {...register('loanTerm', { required: 'Loan term is required' })}
                      options={[
                        { value: '12', label: '12 months (1 year)' },
                        { value: '24', label: '24 months (2 years)' },
                        { value: '36', label: '36 months (3 years)' },
                        { value: '48', label: '48 months (4 years)' },
                        { value: '60', label: '60 months (5 years)' },
                        { value: '72', label: '72 months (6 years)' }
                      ]}
                      error={!!errors.loanTerm}
                      helperText={errors.loanTerm?.message || "Select loan repayment period"}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      fullWidth
                      multiline
                      rows={3}
                      label="Loan Purpose (Optional)"
                      {...register('loanPurpose')}
                      helperText="Brief description of how you plan to use the loan"
                    />
                  </Grid>
                </Grid>
              </MDBox>

              <Divider sx={{ my: 3 }} />

              {/* Additional Information */}
              <MDBox mb={4}>
                <MDTypography variant="h6" color="dark" mb={2}>
                  🏦 Additional Information
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Bank Name (Optional)"
                      {...register('bankName')}
                      helperText="Your primary bank for processing"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDSelect
                      fullWidth
                      label="Preferred Contact Method"
                      {...register('preferredContactMethod')}
                      options={[
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone' },
                        { value: 'text', label: 'Text Message' }
                      ]}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* Action Buttons */}
              <MDBox display="flex" justifyContent="space-between" mt={4}>
                <MDButton 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => navigate('/loans')}
                >
                  Save as Draft
                </MDButton>
                <MDButton 
                  type="submit" 
                  variant="gradient" 
                  color="success"
                  disabled={!isValid}
                >
                  Continue to Income Information →
                </MDButton>
              </MDBox>

              {/* Data Capture Summary */}
              <MDBox mt={3} p={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                <MDTypography variant="caption" color="text">
                  <strong>Data Captured:</strong> All form fields are automatically saved every second. 
                  Your progress is preserved and can be continued later. Required fields are marked with *.
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </FormProvider>
  );
}
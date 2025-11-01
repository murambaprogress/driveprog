import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// DriveCash unified form components
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms";

import { FormContext } from "../context/FormContext";
import DraftControls from '../components/DraftControls';

export default function CoApplicant() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({ mode: "onChange" });
  const { state, updateFormData } = useContext(FormContext);
  const navigate = useNavigate();
  const [coApplicantDialogOpen, setCoApplicantDialogOpen] = useState(false);
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  
  // Get the active loan ID
  const activeLoanId = state?.activeLoanId;
  const formData = state?.loans?.[activeLoanId] || {};

  // Watch all form fields to validate completion
  const watchedFields = watch();

  React.useEffect(() => {
    const subscription = watch((value) => {
      updateFormData({ coApplicant: { ...value, hasCoApplicant } });
    });
    return () => subscription.unsubscribe();
  }, [watch, hasCoApplicant, updateFormData]);

  const handleCoApplicantChoice = (choice) => {
    setHasCoApplicant(choice);
    setCoApplicantDialogOpen(false);
    
    if (choice) {
      setValue("hasCoApplicant", true);
    } else {
      // If no co-applicant, proceed to next step
      updateFormData({ coApplicant: { hasCoApplicant: false } });
      if (activeLoanId) {
        navigate(`/loan/apply/${activeLoanId}/vehicle`);
      }
    }
  };

  const onSubmit = (values) => {
    updateFormData({ coApplicant: { ...values, hasCoApplicant } });
    if (activeLoanId) {
      navigate(`/loan/apply/${activeLoanId}/vehicle`);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // Check if all required fields are filled (only if co-applicant is selected)
  const requiredFields = hasCoApplicant ? [
    "firstName", "lastName", "email", "ssn", "phone", "dob", "address", "city", "state", "zipCode", 
    "incomeSource", "grossMonthlyIncome"
  ] : [];
  
  const isFormComplete = !hasCoApplicant || requiredFields.every(field => {
    const value = watchedFields[field];
    return value && value.toString().trim() !== "";
  });

  React.useEffect(() => {
    // Auto-open dialog when component mounts
    if (!formData.coApplicant || formData.coApplicant.hasCoApplicant === undefined) {
      setCoApplicantDialogOpen(true);
    }
  }, [formData.coApplicant]);

  return (
    <MDBox>
      {/* Co-Applicant Choice Dialog */}
      <Dialog 
        open={coApplicantDialogOpen} 
        onClose={() => setCoApplicantDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogContent>
          <MDBox textAlign="center" py={3}>
            {/* Co-applicant Icon */}
            <MDBox 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              width={80} 
              height={80} 
              borderRadius="50%" 
              sx={{ backgroundColor: '#e3f2fd', mx: 'auto', mb: 3 }}
            >
              <Icon sx={{ fontSize: '2.5rem !important', color: '#16a085' }}>group_add</Icon>
            </MDBox>
            
            <MDTypography variant="h4" fontWeight="medium" mb={2}>
              Do you want to add a <span style={{ color: '#16a085' }}>Co-Applicant</span>?
            </MDTypography>
            
            <MDTypography variant="body1" color="text" mb={4}>
              We'll be asking personal and income information about the<br />
              this co-applicant for loan application process.
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <MDButton
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => handleCoApplicantChoice(false)}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            NO
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            size="large"
            onClick={() => handleCoApplicantChoice(true)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0b3b36 0%, #16a085 100%)',
            }}
          >
            YES
          </MDButton>
        </DialogActions>
      </Dialog>

      {hasCoApplicant ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <MDBox pt={4} px={4}>
                <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
                  Co-Applicant
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={4}>
                  Please provide co-applicant details for your loan application
                </MDTypography>
              </MDBox>
              
              <MDBox px={4} pb={4}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Personal Information Section */}
                  <MDBox mb={4}>
                    <MDTypography variant="h6" fontWeight="medium" mb={3}>
                      Personal Information
                    </MDTypography>
                    
                    <Grid container spacing={3}>
                      {/* First Row - First Name and Last Name */}
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="First Name"
                          {...register("firstName", { required: 'First name is required' })}
                          placeholder="Enter first name"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Last Name"
                          {...register("lastName", { required: 'Last name is required' })}
                          placeholder="Enter last name"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      </Grid>

                      {/* Second Row - Email and Phone */}
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Email Address"
                          {...register("email", { 
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          placeholder="Enter email address"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Phone Number"
                          {...register("phone", { required: 'Phone number is required' })}
                          placeholder="(555) 123-4567"
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                        />
                      </Grid>

                      {/* Third Row - SSN and Date of Birth */}
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Social Security Number"
                          {...register("ssn", { required: 'SSN is required' })}
                          placeholder="Enter SSN"
                          error={!!errors.ssn}
                          helperText={errors.ssn?.message}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Date of Birth"
                          type="date"
                          {...register("dob", { required: 'Date of birth is required' })}
                          error={!!errors.dob}
                          helperText={errors.dob?.message}
                        />
                      </Grid>

                      {/* Fourth Row - Address and City */}
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Home Street Address"
                          {...register("address", { required: 'Address is required' })}
                          placeholder="Enter street address"
                          error={!!errors.address}
                          helperText={errors.address?.message}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="City"
                          {...register("city", { required: 'City is required' })}
                          placeholder="Enter city"
                          error={!!errors.city}
                          helperText={errors.city?.message}
                        />
                      </Grid>

                      {/* Fifth Row - State and Zip Code */}
                      <Grid item xs={12} md={6}>
                        <VhoozhtSelect
                          label="State"
                          placeholder="Select state"
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
                          {...register("state", { required: 'State is required' })}
                          error={!!errors.state}
                          helperText={errors.state?.message}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Zip Code"
                          {...register("zipCode", { required: 'Zip code is required' })}
                          placeholder="Enter zip code"
                          error={!!errors.zipCode}
                          helperText={errors.zipCode?.message}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  {/* Income Information Section */}
                  <MDBox mb={4}>
                    <MDTypography variant="h6" fontWeight="medium" mb={3}>
                      Income Information
                    </MDTypography>
                    
                    <Grid container spacing={3}>
                      {/* First Row - Income Source and Monthly Income */}
                      <Grid item xs={12} md={6}>
                        <VhoozhtSelect
                          label="Income Source"
                          placeholder="Select employment type"
                          size="small"
                          options={[
                            { value: 'employed', label: 'Employed Full-time' },
                            { value: 'part_time', label: 'Employed Part-time' },
                            { value: 'self_employed', label: 'Self-employed' },
                            { value: 'contract', label: 'Contract Worker' },
                            { value: 'retired', label: 'Retired' },
                            { value: 'student', label: 'Student' },
                            { value: 'unemployed', label: 'Unemployed' }
                          ]}
                          {...register("incomeSource", { required: 'Income source is required' })}
                          error={!!errors.incomeSource}
                          helperText={errors.incomeSource?.message}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <VhoozhtInput
                          label="Gross Monthly Income"
                          {...register("grossMonthlyIncome", { required: 'Monthly income is required' })}
                          placeholder="Enter monthly income"
                          error={!!errors.grossMonthlyIncome}
                          helperText={errors.grossMonthlyIncome?.message}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  {/* Navigation Buttons with Draft Controls */}
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={4}>
                    <MDButton
                      color="dark"
                      onClick={goBack}
                      sx={{
                        padding: '12px 32px',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Back to Income Info
                    </MDButton>
                    <MDBox display="flex" gap={1} alignItems="center">
                      <DraftControls mergeValues={{ coApplicant: watchedFields }} />
                      <MDButton
                        type="submit"
                        variant="gradient"
                        color="info"
                        disabled={!isFormComplete || Object.keys(errors).length > 0}
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
                        Continue to Vehicle
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <MDBox p={4} textAlign="center">
                <MDTypography variant="h5" mb={2}>
                  No Co-Applicant Selected
                </MDTypography>
                <MDTypography variant="body1" color="text" mb={3}>
                  You chose to proceed without a co-applicant. You can continue to the next step.
                </MDTypography>
                <MDBox display="flex" justifyContent="center" gap={2} alignItems="center">
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => setCoApplicantDialogOpen(true)}
                  >
                    Add Co-Applicant
                  </MDButton>
                  <DraftControls mergeValues={{ coApplicant: {} }} />
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => {
                      if (activeLoanId) {
                        navigate(`/loan/apply/${activeLoanId}/vehicle`);
                      }
                    }}
                  >
                    Continue to Vehicle Information
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      )}
    </MDBox>
  );
}

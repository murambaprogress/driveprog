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
// DriveCash unified form components
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms";
import { useFormContext } from '../context/FormContext';

const Step3Vehicle = ({ onNext, onBack }) => {
  const { formData, updateFormData, state } = useFormContext();
  const navigate = useNavigate();
  const params = useParams();
  const loanId = (state && state.activeLoanId) || params.loanId || null;
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onChange',
    defaultValues: formData.vehicle || {}
  });

  const onSubmit = (data) => {
    updateFormData({ vehicle: data });
    if (loanId) setStepCompletion({ loanId, step: 'vehicle', completed: true });
    // Navigate to next step
    if (typeof onNext === 'function') {
      onNext();
    } else if (loanId) {
      navigate(`/loan/apply/${loanId}/photos`);
    }
  };

  // Autosave
  const values = typeof watch === 'function' ? watch() : {};
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (loanId) updateFormData({ vehicle: values });
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [values]);

  const steps = [
    'Personal Information',
    'Income Information', 
    'Vehicle Information',
    'Photos & Documents',
    'Review & Submit'
  ];

  return (
    <Card>
      <MDBox p={3}>
        <MDBox mb={4}>
          <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
            <Stepper activeStep={2} alternativeLabel>
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
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
            Vehicle Information
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Please provide details about the vehicle you want to finance.
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {/* First Row - Estimated Car Value and Insurance Type */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Estimated Car Value
            </MDTypography>
            <VhoozhtInput
              {...register('estimatedCarValue', { required: 'Estimated car value is required' })}
              placeholder="Enter estimated car value"
              variant="outlined"
              fullWidth
              error={!!errors.estimatedCarValue}
              helperText={errors.estimatedCarValue?.message}
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
            <VhoozhtSelect
              {...register('insuranceType', { required: 'Insurance type is required' })}
              label="Insurance Type"
              placeholder="Select your insurance coverage type"
              size="small"
              error={!!errors.insuranceType}
              helperText={errors.insuranceType?.message}
              options={[
                { value: 'full_coverage', label: 'Full Coverage' },
                { value: 'liability_only', label: 'Liability Only' }
              ]}
            />
          </Grid>

          {/* Second Row - Title Status and Original Title */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Title Status
            </MDTypography>
            <VhoozhtInput
              {...register('titleStatus', { required: 'Title status is required' })}
              placeholder="Enter title status"
              variant="outlined"
              fullWidth
              error={!!errors.titleStatus}
              helperText={errors.titleStatus?.message}
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
              Original Title
            </MDTypography>
            <VhoozhtInput
              {...register('originalTitle')}
              placeholder="Enter original title (optional)"
              variant="outlined"
              fullWidth
              error={!!errors.originalTitle}
              helperText={errors.originalTitle?.message}
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

          {/* Third Row - Title Issue Date and Title Number */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Title Issue Date
            </MDTypography>
            <VhoozhtInput
              {...register('titleIssueDate')}
              type="date"
              variant="outlined"
              fullWidth
              error={!!errors.titleIssueDate}
              helperText={errors.titleIssueDate?.message}
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
              Title Number
            </MDTypography>
            <VhoozhtInput
              {...register('titleNumber')}
              placeholder="Enter title number (optional)"
              variant="outlined"
              fullWidth
              error={!!errors.titleNumber}
              helperText={errors.titleNumber?.message}
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

          {/* Fourth Row - Vehicle Color and Plate/Tag State */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Vehicle Color
            </MDTypography>
            <VhoozhtInput
              {...register('vehicleColor', { required: 'Vehicle color is required' })}
              placeholder="Enter vehicle color"
              variant="outlined"
              fullWidth
              error={!!errors.vehicleColor}
              helperText={errors.vehicleColor?.message}
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
              Plate/Tag State
            </MDTypography>
            <VhoozhtInput
              {...register('plateTagState')}
              placeholder="Enter plate/tag state (optional)"
              variant="outlined"
              fullWidth
              error={!!errors.plateTagState}
              helperText={errors.plateTagState?.message}
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

          {/* Fifth Row - VIN and Confirm VIN */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              VIN Number
            </MDTypography>
            <VhoozhtInput
              {...register('vin', { required: 'VIN number is required' })}
              placeholder="Enter VIN number"
              variant="outlined"
              fullWidth
              error={!!errors.vin}
              helperText={errors.vin?.message}
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
              Confirm VIN Number
            </MDTypography>
            <VhoozhtInput
              {...register('confirmVin', { required: 'Please confirm VIN number' })}
              placeholder="Confirm VIN number"
              variant="outlined"
              fullWidth
              error={!!errors.confirmVin}
              helperText={errors.confirmVin?.message}
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

          {/* Sixth Row - License Plate and Registration State */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              License Plate
            </MDTypography>
            <VhoozhtInput
              {...register('licensePlate')}
              placeholder="Enter license plate"
              variant="outlined"
              fullWidth
              inputProps={{ style: { textTransform: 'uppercase' } }}
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
              Registration State
            </MDTypography>
            <VhoozhtInput
              {...register('registrationState')}
              placeholder="Enter registration state"
              variant="outlined"
              fullWidth
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

          {/* Seventh Row - Year and Make */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Year
            </MDTypography>
            <VhoozhtInput
              {...register('year', { required: 'Year is required' })}
              placeholder="Enter vehicle year"
              variant="outlined"
              fullWidth
              error={!!errors.year}
              helperText={errors.year?.message}
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
              Make
            </MDTypography>
            <VhoozhtInput
              {...register('make', { required: 'Make is required' })}
              placeholder="Enter vehicle make"
              variant="outlined"
              fullWidth
              error={!!errors.make}
              helperText={errors.make?.message}
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

          {/* Seventh Row - Model and Style */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Model
            </MDTypography>
            <VhoozhtInput
              {...register('model', { required: 'Model is required' })}
              placeholder="Enter vehicle model"
              variant="outlined"
              fullWidth
              error={!!errors.model}
              helperText={errors.model?.message}
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
            <VhoozhtSelect
              {...register('style', { required: 'Style is required' })}
              label="Style"
              placeholder="Select vehicle body style"
              size="small"
              error={!!errors.style}
              helperText={errors.style?.message}
              options={[
                { value: 'sedan', label: 'Sedan' },
                { value: 'suv', label: 'SUV' },
                { value: 'truck', label: 'Truck' },
                { value: 'coupe', label: 'Coupe' },
                { value: 'convertible', label: 'Convertible' },
                { value: 'hatchback', label: 'Hatchback' },
                { value: 'wagon', label: 'Wagon' }
              ]}
            />
          </Grid>

          {/* Eighth Row - Odometer Mileage */}
          <Grid item xs={12} md={6}>
            <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
              Odometer Mileage
            </MDTypography>
            <VhoozhtInput
              {...register('odometerMileage', { required: 'Odometer mileage is required' })}
              placeholder="Enter current mileage"
              variant="outlined"
              fullWidth
              error={!!errors.odometerMileage}
              helperText={errors.odometerMileage?.message}
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
        </Grid>

        <MDBox display="flex" justifyContent="space-between" mt={4}>
          <MDButton
            variant="outlined"
            color="secondary"
            onClick={onBack}
            sx={{
              borderColor: '#16a085',
              color: '#16a085',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#138d75',
                color: '#138d75',
                backgroundColor: 'rgba(22, 160, 133, 0.04)',
              },
            }}
          >
            Back to Income Information
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
            Continue to Photos & Documents
          </MDButton>
        </MDBox>
      </MDBox>
      </MDBox>
    </Card>
  );
};

export default Step3Vehicle;

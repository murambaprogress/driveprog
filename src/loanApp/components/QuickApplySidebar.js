import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Grid, 
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { VhoozhtInput, VhoozhtSelect } from 'components/VhoozhtForms';
// import TextField from '@mui/material/TextField'; // Replaced with VhoozhtInput
// import MenuItem from '@mui/material/MenuItem'; // Replaced with VhoozhtSelect options
// import Select from '@mui/material/Select'; // Replaced with VhoozhtSelect
// import FormControl from '@mui/material/FormControl'; // Replaced with VhoozhtSelect
// import FormHelperText from '@mui/material/FormHelperText'; // Handled by VhoozhtInput/VhoozhtSelect
import { DirectionsCar, AccountCircle, MonetizationOn } from '@mui/icons-material';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const QuickApplySidebar = ({ onStartApplication }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Pass the quick data to the main application
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    onStartApplication(data);
    setIsSubmitting(false);
  };

  return (
    <Card 
      sx={{ 
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(22, 160, 133, 0.1)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <MDBox mb={3}>
          <MDTypography variant="h5" fontWeight="bold" color="dark" mb={1}>
            Quick Apply
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Get started with your loan application in minutes
          </MDTypography>
        </MDBox>

        <MDBox component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information Section */}
          <MDBox mb={3}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <AccountCircle sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
              <MDTypography variant="h6" fontWeight="medium" color="dark">
                Personal Info
              </MDTypography>
            </MDBox>
            
            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Full Name
              </MDTypography>
              <VhoozhtInput
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="Enter your full name"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Phone Number
              </MDTypography>
              <VhoozhtInput
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="Enter phone number"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Email Address
              </MDTypography>
              <VhoozhtInput
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="Enter email address"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#16a085',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#16a085',
                    },
                  }
                }}
              />
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 2, borderColor: 'rgba(22, 160, 133, 0.1)' }} />

          {/* Loan Information Section */}
          <MDBox mb={3}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <MonetizationOn sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
              <MDTypography variant="h6" fontWeight="medium" color="dark">
                Loan Details
              </MDTypography>
            </MDBox>
            
            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Loan Amount Needed
              </MDTypography>
              <VhoozhtInput
                {...register('loanAmount', { required: 'Loan amount is required' })}
                placeholder="Enter loan amount"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.loanAmount}
                helperText={errors.loanAmount?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#16a085',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#16a085',
                    },
                  }
                }}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Annual Income
              </MDTypography>
              <VhoozhtInput
                {...register('annualIncome', { required: 'Annual income is required' })}
                placeholder="Enter annual income"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.annualIncome}
                helperText={errors.annualIncome?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#16a085',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#16a085',
                    },
                  }
                }}
              />
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 2, borderColor: 'rgba(22, 160, 133, 0.1)' }} />

          {/* Vehicle Information Section */}
          <MDBox mb={3}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <DirectionsCar sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
              <MDTypography variant="h6" fontWeight="medium" color="dark">
                Vehicle Info
              </MDTypography>
            </MDBox>
            
            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Vehicle Year
              </MDTypography>
              <VhoozhtInput
                {...register('vehicleYear', { required: 'Vehicle year is required' })}
                placeholder="Enter vehicle year"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.vehicleYear}
                helperText={errors.vehicleYear?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#16a085',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#16a085',
                    },
                  }
                }}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Vehicle Make
              </MDTypography>
              <VhoozhtInput
                {...register('vehicleMake', { required: 'Vehicle make is required' })}
                placeholder="Enter vehicle make"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.vehicleMake}
                helperText={errors.vehicleMake?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#16a085',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#16a085',
                    },
                  }
                }}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Vehicle Model
              </MDTypography>
              <VhoozhtInput
                {...register('vehicleModel', { required: 'Vehicle model is required' })}
                placeholder="Enter vehicle model"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.vehicleModel}
                helperText={errors.vehicleModel?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#16a085',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#16a085',
                    },
                  }
                }}
              />
            </MDBox>
          </MDBox>

          {/* Submit Button */}
          <MDButton
            variant="gradient"
            color="info"
            type="submit"
            fullWidth
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#16a085',
              color: 'white',
              padding: '12px 0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)',
              '&:hover': {
                backgroundColor: '#138d75',
                boxShadow: '0 6px 16px rgba(22, 160, 133, 0.4)',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#666',
                boxShadow: 'none',
              },
            }}
          >
            {isSubmitting ? 'Starting Application...' : 'Start Full Application'}
          </MDButton>

          <MDBox mt={2} textAlign="center">
            <MDTypography variant="caption" color="text">
              Complete application takes 5-10 minutes
            </MDTypography>
          </MDBox>
        </MDBox>
      </CardContent>
    </Card>
  );
};

export default QuickApplySidebar;

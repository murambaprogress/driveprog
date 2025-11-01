import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import VhoozhtSelect from "components/VhoozhtSelect";

import { FormContext } from "../context/FormContext";

export default function Condition() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const { formData, update, setStepCompletion } = useContext(FormContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    const subscription = watch((value) => {
      update({ condition: value });
    });
    return () => subscription.unsubscribe();
  }, [watch, update]);

  React.useEffect(() => {
    // Pre-fill form if data exists
    if (formData.condition) {
      Object.keys(formData.condition).forEach((key) => {
        setValue(key, formData.condition[key]);
      });
    }
  }, [formData.condition, setValue]);

  const onSubmit = (values) => {
    update({ condition: values });
    setStepCompletion({ loanId: formData.id, step: 'condition', completed: true });
  navigate(`/loan/apply/${formData.id}/photos`);
  };

  const goBack = () => {
  navigate(`/loan/apply/${formData.id}/vehicle`);
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
            Vehicle Condition Assessment
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Please answer all questions about your vehicle's condition
          </MDTypography>
        </MDBox>

        <MDBox component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <VhoozhtSelect
                fullWidth
                size="small"
                label="Are any Airbags Deployed?"
                placeholder="Select yes or no"
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' }
                ]}
                {...register("airbagsDeployed", { required: "This field is required" })}
                error={!!errors.airbagsDeployed}
                helperText={errors.airbagsDeployed?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <VhoozhtSelect
                fullWidth
                size="small"
                label="Overall Vehicle Condition"
                placeholder="Select vehicle condition"
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' }
                ]}
                {...register("overallCondition", { required: "This field is required" })}
                error={!!errors.overallCondition}
                helperText={errors.overallCondition?.message}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <MDBox display="flex" justifyContent="space-between" mt={4}>
            <MDButton
              variant="outlined"
              color="secondary"
              onClick={goBack}
              sx={{
                borderColor: '#d1d5db',
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  borderColor: '#9ca3af',
                },
              }}
            >
              Back
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              type="submit"
              sx={{
                backgroundColor: '#16a085',
                '&:hover': {
                  backgroundColor: '#138d75',
                },
              }}
            >
              Continue to Photos
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

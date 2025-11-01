import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import { FormContext } from "../context/FormContext";

export default function StepNavigation({ 
  currentStep, 
  nextPath, 
  prevPath, 
  onNext, 
  isFormValid = true,
  stepName 
}) {
  const navigate = useNavigate();
  const { isStepComplete } = useContext(FormContext);
  
  const canProceed = isFormValid;
  const isPreviousStepComplete = currentStep === 1 || isStepComplete(getPreviousStepName(currentStep));
  
  function getPreviousStepName(step) {
    const stepNames = ["personal", "income", "vehicle", "condition", "photos"];
    return stepNames[step - 2]; // step - 1 - 1 (to get previous step index)
  }

  const handlePrevious = () => {
    if (prevPath) {
      navigate(prevPath);
    }
  };

  const handleNext = () => {
    if (canProceed) {
      if (onNext) {
        onNext(); // This should handle form submission and navigation
      } else if (nextPath) {
        navigate(nextPath);
      }
    }
  };

  return (
    <MDBox>
      {/* Step completion status */}
      {stepName && (
        <MDBox mb={2}>
          <MDTypography variant="caption" color="text">
            Step Status: {' '}
            {isStepComplete(stepName) ? (
              <span className="text-green-600 font-medium">✓ Complete</span>
            ) : (
              <span className="text-yellow-600 font-medium">In Progress</span>
            )}
          </MDTypography>
        </MDBox>
      )}

      {/* Validation message */}
      {!canProceed && (
        <MDBox mb={2} p={2} bgcolor="error.light" borderRadius="8px">
          <MDTypography variant="body2" color="white">
            Please fill in all required fields before proceeding to the next step.
          </MDTypography>
        </MDBox>
      )}

      {/* Navigation buttons */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <div>
          {prevPath && currentStep > 1 && (
            <MDButton
              variant="outlined"
              color="info"
              onClick={handlePrevious}
            >
              ← Previous
            </MDButton>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Progress indicator */}
          <MDTypography variant="caption" color="text">
            Step {currentStep} of 4
          </MDTypography>
          
          {nextPath && (
            <MDButton
              type="submit"
              variant="gradient"
              color={canProceed ? "info" : "secondary"}
              disabled={!canProceed}
              onClick={currentStep === 4 ? handleNext : undefined} // Only handle click for final step
            >
              {currentStep === 4 ? "Submit Application" : "Next →"}
            </MDButton>
          )}
        </div>
      </MDBox>

      {/* Helper text */}
      <MDBox mt={2}>
        <MDTypography variant="caption" color="text">
          {currentStep < 4 
            ? "Complete all required fields to unlock the next step." 
            : "Review your information and submit your application."
          }
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

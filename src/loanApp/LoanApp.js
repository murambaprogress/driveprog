import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from 'react';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Loan Application components
import { FormProvider, FormContext } from "./context/FormContext";
import LandingPage from "./pages/LandingPage";
import Step1 from "./pages/Step1Personal";
import Step2 from "./pages/Step2Income";
import CoApplicant from "./pages/CoApplicant";
import Vehicle from "./pages/Vehicle";
import Condition from "./pages/Condition";
import Photos from "./pages/Photos";
import Submit from "./pages/Submit";
import LoanApplicationService from "./services/LoanApplicationService";
import Review from "./steps/Review";
// QuickApplySidebar removed from loan steps to provide full-width application flow

const STEP_DEFINITIONS = [
  { number: 1, label: "Personal", slug: "step-1", stepName: "personal" },
  { number: 2, label: "Income", slug: "step-2", stepName: "income" },
  { number: 3, label: "Vehicle", slug: "vehicle", stepName: "vehicle" },
  { number: 4, label: "Photos", slug: "photos", stepName: "photos" },
  { number: 5, label: "Review", slug: "review", stepName: "review" },
  { number: 6, label: "Submit", slug: "submit", stepName: "submit" },
];

const STEP_SEGMENTS = new Set([
  ...STEP_DEFINITIONS.map((step) => step.slug),
  "step-3",
  "step-4",
  "co-applicant",
  "condition",
]);

// Stepper Component with Sequential Validation
function StepperWithValidation({ currentStep, navigate, currentLoanId, isStepComplete }) {

  const basePath = currentLoanId ? `/loan/apply/${currentLoanId}` : "/loan/apply";
  const buildStepPath = (slug) => `${basePath}/${slug}`;

  const canAccessStep = (stepNumber) => {
    if (stepNumber === 1) return true;
    for (let i = 0; i < stepNumber - 1; i++) {
      if (!isStepComplete(STEP_DEFINITIONS[i].stepName, currentLoanId)) return false;
    }
    return true;
  };

  return (
    <MDBox px={3} pb={3}>
      <Grid container spacing={1} alignItems="center">
        {STEP_DEFINITIONS.map((step) => (
          <Grid item key={step.number}>
            <MDButton
              variant={currentStep === step.number ? "contained" : "outlined"}
              color={currentStep === step.number ? "info" : "dark"}
              onClick={() => canAccessStep(step.number) && navigate(buildStepPath(step.slug))}
            >
              {step.label}
            </MDButton>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
}

// ProtectedRoute ensures users cannot access steps ahead of completion
function ProtectedRoute({ children, requiredStep, isStepComplete }) {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const basePath = loanId ? `/loan/apply/${loanId}` : "/loan/apply";

  console.log('ProtectedRoute - loanId:', loanId, 'requiredStep:', requiredStep);

  // If trying to access a future step without completing previous ones
  let allPreviousStepsComplete = true;
  for (let i = 0; i < requiredStep - 1; i++) {
    const stepName = STEP_DEFINITIONS[i].stepName;
    const isComplete = isStepComplete(stepName, loanId);
    console.log(`Checking step ${stepName}:`, isComplete);
    if (!isComplete) {
      allPreviousStepsComplete = false;
      break;
    }
  }

  if (!allPreviousStepsComplete) {
    const firstIncompleteStep = STEP_DEFINITIONS.find(step => !isStepComplete(step.stepName, loanId));
    const fallbackSlug = firstIncompleteStep ? firstIncompleteStep.slug : "step-1";
    console.log('Blocking access - first incomplete step:', firstIncompleteStep?.stepName);
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={4} textAlign="center">
                  <MDTypography variant="h5" color="error" mb={2}>
                    Step Not Available
                  </MDTypography>
                  <MDTypography variant="body1" mb={3}>
                    You must complete all previous steps before accessing this one.
                  </MDTypography>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => {
                      navigate(`${basePath}/${fallbackSlug}`);
                    }}
                  >
                    {firstIncompleteStep ? `Go to ${firstIncompleteStep.label}` : 'Go to First Step'}
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        );
      }

  return children;
}

// Main App Component with Context Wrapper
function LoanAppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, setActiveLoan, isStepComplete, updateLoanStatus } = useContext(FormContext);
  const [showAlert, setShowAlert] = useState(false);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const potentialLoanId = pathSegments.length > 2 ? pathSegments[2] : null;
  const currentLoanId = potentialLoanId && !STEP_SEGMENTS.has(potentialLoanId) ? potentialLoanId : null;

  // Determine current step for stepper
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path === "/loan/apply" || path === "/loan/apply/") return 0; // Landing page
    if (path.includes("step-1")) return 1;
    if (path.includes("step-2") || path.includes("co-applicant")) return 2;
    if (path.includes("vehicle") || path.includes("condition")) return 3;
    if (path.includes("photos")) return 4;
    if (path.includes("review")) return 5;
    if (path.includes("submit")) return 6;
    return 0; // Default to landing page
  };

  const currentStep = getCurrentStep();

  useEffect(() => {
    if (!currentLoanId) return;
    if (state.activeLoanId === currentLoanId) return;
    
    // Only set active loan if it exists in state, otherwise redirect to landing
    if (state.loans && state.loans[currentLoanId]) {
      console.log('Setting active loan from URL:', currentLoanId);
      if (setActiveLoan) setActiveLoan(currentLoanId);
    } else {
      console.warn('Loan ID from URL not found in state, redirecting to landing:', currentLoanId);
      navigate('/loan/apply', { replace: true });
    }

    // Fetch loan status from backend
    const fetchLoanStatus = async () => {
      try {
        const status = await LoanApplicationService.getLoanStatus(currentLoanId);
        console.log('Fetched loan status:', status);
        if (updateLoanStatus) {
          updateLoanStatus({ loanId: currentLoanId, status });
          if (status === 'query') {
            setShowAlert(true);
          }
        }
      } catch (error) {
        console.error('Error fetching loan status:', error);
      }
    };

    if (currentLoanId && setActiveLoan && updateLoanStatus) {
      setActiveLoan(currentLoanId);
      fetchLoanStatus();
    }
  }, [currentLoanId, setActiveLoan, state.activeLoanId, state.loans, navigate, updateLoanStatus]);

  const basePath = currentLoanId ? `/loan/apply/${currentLoanId}` : "/loan/apply";
  const stepPath = (slug) => `${basePath}/${slug}`;

  const renderRoutes = () => (
    <Routes>
      {/* Landing page (no loan id) */}
      <Route index element={<LandingPage />} />

      {/* Canonical routes under :loanId to avoid duplication */}
      <Route path=":loanId">
        <Route path="step-1" element={<Step1 />} />
        <Route
          path="step-2"
          element={
            <ProtectedRoute requiredStep={2} isStepComplete={isStepComplete}>
              <Step2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="co-applicant"
          element={
            <ProtectedRoute requiredStep={2} isStepComplete={isStepComplete}>
              <CoApplicant />
            </ProtectedRoute>
          }
        />
        <Route
          path="vehicle"
          element={
            <ProtectedRoute requiredStep={3} isStepComplete={isStepComplete}>
              <Vehicle />
            </ProtectedRoute>
          }
        />
        <Route
          path="condition"
          element={
            <ProtectedRoute requiredStep={3} isStepComplete={isStepComplete}>
              <Condition />
            </ProtectedRoute>
          }
        />
        <Route
          path="photos"
          element={
            <ProtectedRoute requiredStep={4} isStepComplete={isStepComplete}>
              <Photos />
            </ProtectedRoute>
          }
        />
        <Route
          path="review"
          element={
            <ProtectedRoute requiredStep={5} isStepComplete={isStepComplete}>
              <Review />
            </ProtectedRoute>
          }
        />
        <Route
          path="submit"
          element={
            <ProtectedRoute requiredStep={5} isStepComplete={isStepComplete}>
              <Submit loanId={currentLoanId} loanStatus={state.loans[currentLoanId]?.status} />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback to the landing page */}
      <Route path="*" element={<Navigate to="/loan/apply" replace />} />
    </Routes>
  );

  return (
    <MDBox py={3}>
      {/* Main Content with left sidebar on application steps */}
      <Grid container spacing={3}>
        {currentStep > 0 ? (
          <>
            {/* Left Sidebar - reserved for navigation (summary moved below the loan card) */}
            <Grid item xs={12} md={4} lg={3}>
              <MDBox sx={{ position: 'sticky', top: 96, alignSelf: 'flex-start', p: 2 }}>
                {/* Sidebar intentionally simplified for a cleaner look. Navigation is available in the header stepper. */}
                <List>
                  {STEP_DEFINITIONS.map((step) => (
                    <ListItem key={step.number} button onClick={() => navigate(stepPath(step.slug))} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <MDTypography sx={{ width: 24, textAlign: 'center' }}>{step.number}</MDTypography>
                      </ListItemIcon>
                      <ListItemText primary={step.label} />
                    </ListItem>
                  ))}
                </List>
              </MDBox>
            </Grid>

            {/* Right: header card then main step content */}
            <Grid item xs={12} md={8} lg={9}>
              {showAlert && (
                <MDAlert color="warning" dismissible onClose={() => setShowAlert(false)}>
                  Your loan application has been flagged with a query. Please review and edit the
                  indicated sections.
                </MDAlert>
              )}
              <Card sx={{ mb: 2 }}>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h4" fontWeight="medium">
                    Car Title Loan Application
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={3}>
                    Complete the following steps to apply for your loan
                  </MDTypography>
                </MDBox>
                {/* Enhanced Stepper with Sequential Navigation */}
                <StepperWithValidation currentStep={currentStep} navigate={navigate} currentLoanId={currentLoanId} isStepComplete={isStepComplete} />
              </Card>

              {/* Application Summary removed per request. */}

              <MDBox>
                {renderRoutes()}
              </MDBox>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            {renderRoutes()}
          </Grid>
        )}
      </Grid>
    </MDBox>
  );
}

export default function LoanApp() {
  return (
    <FormProvider>
      <LoanAppContent />
    </FormProvider>
  );
}

import React from 'react';
import MDBox from '../../components/MDBox';
import MDTypography from '../../components/MDTypography';
import MDProgress from '../../components/MDProgress';
import { useFormContext } from '../context/FormContext';
import { useParams } from 'react-router-dom';

const STEPS = [
  { 
    key: 'personal', 
    title: 'Personal Information',
    description: 'Basic personal details, contact info, and identification',
    icon: '👤'
  },
  { 
    key: 'income', 
    title: 'Income & Employment',
    description: 'Employment status, income details, and financial information',
    icon: '💼'
  },
  { 
    key: 'vehicle', 
    title: 'Vehicle Information',
    description: 'Vehicle details, VIN, condition, and specifications',
    icon: '🚗'
  },
  { 
    key: 'photos', 
    title: 'Photos & Documents',
    description: 'Vehicle photos, ID documents, and income verification',
    icon: '📸'
  },
  { 
    key: 'review', 
    title: 'Review & Submit',
    description: 'Final review of all information before submission',
    icon: '✅'
  }
];

function LoanProgressTracker({ currentStep = 'personal' }) {
  const { state } = useFormContext();
  const { loanId } = useParams();
  const loan = state.loans[loanId];

  const getStepStatus = (stepKey) => {
    if (!loan) return 'pending';
    if (loan.stepCompletion && loan.stepCompletion[stepKey]) return 'completed';
    if (stepKey === currentStep) return 'active';
    return 'pending';
  };

  const getCompletionPercentage = () => {
    if (!loan || !loan.stepCompletion) return 0;
    const completedSteps = Object.values(loan.stepCompletion).filter(Boolean).length;
    return (completedSteps / STEPS.length) * 100;
  };

  const getDataCaptured = () => {
    if (!loan) return {};
    
    return {
      personal: {
        filled: loan.personal && Object.keys(loan.personal).length > 0,
        fields: loan.personal ? Object.keys(loan.personal).length : 0,
        lastSaved: loan.personal ? new Date(loan.updatedAt).toLocaleString() : null
      },
      income: {
        filled: loan.income && Object.keys(loan.income).length > 0,
        fields: loan.income ? Object.keys(loan.income).length : 0,
        lastSaved: loan.income ? new Date(loan.updatedAt).toLocaleString() : null
      },
      vehicle: {
        filled: loan.vehicles && loan.vehicles.length > 0,
        count: loan.vehicles ? loan.vehicles.length : 0,
        lastSaved: loan.vehicles && loan.vehicles.length > 0 ? new Date(loan.updatedAt).toLocaleString() : null
      },
      photos: {
        filled: loan.documents && loan.documents.length > 0,
        count: loan.documents ? loan.documents.length : 0,
        vehiclePhotos: loan.vehicles ? loan.vehicles.reduce((sum, v) => sum + (v.photos?.length || 0), 0) : 0,
        lastSaved: loan.documents && loan.documents.length > 0 ? new Date(loan.updatedAt).toLocaleString() : null
      }
    };
  };

  const dataCaptured = getDataCaptured();

  return (
    <MDBox 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 2, 
        p: 3, 
        mb: 3,
        color: 'white'
      }}
    >
      {/* Overall Progress */}
      <MDBox mb={3}>
        <MDTypography variant="h5" color="white" fontWeight="bold" gutterBottom>
          Loan Application Progress
        </MDTypography>
        <MDBox display="flex" alignItems="center" gap={2}>
          <MDProgress 
            value={getCompletionPercentage()} 
            color="white" 
            variant="gradient" 
            sx={{ flexGrow: 1, height: 8 }}
          />
          <MDTypography variant="body2" color="white" fontWeight="medium">
            {Math.round(getCompletionPercentage())}%
          </MDTypography>
        </MDBox>
        {loan && (
          <MDTypography variant="caption" color="white" mt={1}>
            Application ID: {loanId} • Last saved: {new Date(loan.updatedAt).toLocaleString()}
          </MDTypography>
        )}
      </MDBox>

      {/* Step by Step Progress */}
      <MDBox>
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.key);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const data = dataCaptured[step.key];

          return (
            <MDBox
              key={step.key}
              display="flex"
              alignItems="center"
              py={1.5}
              px={2}
              mb={1}
              sx={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: 1,
                border: isActive ? '1px solid rgba(255,255,255,0.3)' : 'none',
              }}
            >
              {/* Step Icon */}
              <MDBox
                display="flex"
                alignItems="center"
                justifyContent="center"
                width={40}
                height={40}
                borderRadius="50%"
                sx={{
                  backgroundColor: isCompleted ? '#4caf50' : isActive ? '#2196f3' : 'rgba(255,255,255,0.2)',
                  mr: 2
                }}
              >
                <MDTypography variant="h6">
                  {isCompleted ? '✓' : step.icon}
                </MDTypography>
              </MDBox>

              {/* Step Content */}
              <MDBox flexGrow={1}>
                <MDTypography 
                  variant="subtitle1" 
                  color="white" 
                  fontWeight={isActive ? "bold" : "medium"}
                >
                  {step.title}
                </MDTypography>
                <MDTypography variant="caption" color="white" opacity={0.8}>
                  {step.description}
                </MDTypography>
                
                {/* Data Captured Info */}
                {data && data.filled && (
                  <MDBox mt={0.5}>
                    <MDTypography variant="caption" color="white" opacity={0.9}>
                      {step.key === 'vehicle' && `${data.count} vehicle(s) added`}
                      {step.key === 'photos' && `${data.count} documents, ${data.vehiclePhotos} vehicle photos`}
                      {(step.key === 'personal' || step.key === 'income') && `${data.fields} fields completed`}
                      {data.lastSaved && ` • Saved: ${data.lastSaved}`}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>

              {/* Status Indicator */}
              <MDBox ml={2}>
                {isCompleted && (
                  <MDTypography variant="caption" color="white" fontWeight="bold">
                    COMPLETE
                  </MDTypography>
                )}
                {isActive && (
                  <MDTypography variant="caption" color="white" fontWeight="bold">
                    IN PROGRESS
                  </MDTypography>
                )}
                {status === 'pending' && (
                  <MDTypography variant="caption" color="white" opacity={0.6}>
                    PENDING
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          );
        })}
      </MDBox>

      {/* Auto-Save Status */}
      <MDBox mt={2} pt={2} borderTop="1px solid rgba(255,255,255,0.2)">
        <MDTypography variant="caption" color="white" display="flex" alignItems="center">
          💾 Auto-save enabled • All changes are automatically saved to local storage
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

export default LoanProgressTracker;
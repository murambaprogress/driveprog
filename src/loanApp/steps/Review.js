import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Grid, Divider, Collapse, Alert } from '@mui/material';
import Icon from '@mui/material/Icon';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import MDTypography from '../../components/MDTypography';
import { useFormContext } from '../context/FormContext';
import { putLoan, submitLoanApplication } from '../api/loans';

export default function Review() {
  const { loanId } = useParams();
  const { state, setStepCompletion } = useFormContext();
  const loan = state.loans[loanId];
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loan) return <MDBox p={3}><MDTypography variant="h5">No loan data found</MDTypography></MDBox>;

  // Log the loan data for debugging
  console.log('Review Page - Full Loan Data:', loan);
  console.log('Review Page - Vehicles:', loan.vehicles);
  console.log('Review Page - Vehicle (singular):', loan.vehicle);
  console.log('Review Page - Documents:', loan.documents);
  console.log('Review Page - Photos:', loan.photos);
  console.log('Review Page - Personal:', loan.personal);
  console.log('Review Page - Income:', loan.income);

  // Validation function to check all required fields
  const validateRequiredFields = () => {
    const errors = [];
    const personal = loan.personal || {};
    const income = loan.income || {};
    const vehicle = loan.vehicle || {};

    // Personal Information - Required Fields (Step 1)
    if (!personal.fullName && !personal.firstName) {
      errors.push({ field: 'Full Name or First Name', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.email) {
      errors.push({ field: 'Email Address', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.phoneNumber && !personal.phone) {
      errors.push({ field: 'Phone Number', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.dob && !personal.dateOfBirth) {
      errors.push({ field: 'Date of Birth', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.ssn && !personal.socialSecurity) {
      errors.push({ field: 'Social Security Number', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.driverLicense && !personal.idNumber && !personal.identificationNumber) {
      errors.push({ field: 'ID Number', step: 1, stepName: 'Personal Information' });
    }

    // Address Information - Required Fields (Step 1)
    if (!personal.homeAddress && !personal.streetAddress && !personal.address) {
      errors.push({ field: 'Street Address', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.city) {
      errors.push({ field: 'City', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.state) {
      errors.push({ field: 'State', step: 1, stepName: 'Personal Information' });
    }
    if (!personal.zipCode && !personal.postalCode) {
      errors.push({ field: 'ZIP Code', step: 1, stepName: 'Personal Information' });
    }

    // Financial Information - Required Fields (Step 2)
    if (!income.employmentStatus && !personal.employmentStatus) {
      errors.push({ field: 'Employment Status', step: 2, stepName: 'Income & Employment' });
    }
    if (!income.monthlyIncome && !personal.monthlyIncome && !income.grossMonthlyIncome) {
      errors.push({ field: 'Monthly Income', step: 2, stepName: 'Income & Employment' });
    }

    // Loan Details - Required Fields (Step 1)
    if (!personal.loanAmount && !loan.amount) {
      errors.push({ field: 'Loan Amount', step: 1, stepName: 'Personal Information' });
    }

    // Vehicle Information - Required Fields (Step 3)
    if (!vehicle.make) {
      errors.push({ field: 'Vehicle Make', step: 3, stepName: 'Vehicle Information' });
    }
    if (!vehicle.model) {
      errors.push({ field: 'Vehicle Model', step: 3, stepName: 'Vehicle Information' });
    }
    if (!vehicle.year) {
      errors.push({ field: 'Vehicle Year', step: 3, stepName: 'Vehicle Information' });
    }
    if (!vehicle.vin) {
      errors.push({ field: 'Vehicle VIN', step: 3, stepName: 'Vehicle Information' });
    }
    if (!vehicle.odometerMileage && !vehicle.mileage) {
      errors.push({ field: 'Vehicle Mileage', step: 3, stepName: 'Vehicle Information' });
    }

    return errors;
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate click');
      return;
    }

    // Validate all required fields before submission
    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      const fieldsList = missingFields.map(f => `• ${f.field} (${f.stepName})`).join('\n');
      alert(`Please complete the following required fields before submitting:\n\n${fieldsList}\n\nGo back to the previous steps to fill in the missing information.`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate mandatory documents before submission (first 8 photos only)
      const mandatoryFields = {
        'govIdFront': 'Government ID (Front)',
        'govIdBack': 'Government ID (Back)',
        'title': 'Vehicle Title - Front',
        'backOfTitle': 'Vehicle Title - Back',
        'vinFromTitle': 'VIN from Title',
        'vinFromDash': 'VIN from Dashboard',
        'vinFromSticker': 'VIN from Door Sticker',
        'odometer': 'Odometer Reading'
      };
      
      const missingDocuments = [];
      
      // Check loan.photos for mandatory documents
      for (const [fieldName, label] of Object.entries(mandatoryFields)) {
        const hasPhotoInPhotos = loan.photos && loan.photos[fieldName] && loan.photos[fieldName].length > 0;
        const hasPhotoInDocuments = loan.documents && loan.documents.some(doc => 
          doc.kind === fieldName || doc.field === fieldName
        );
        
        if (!hasPhotoInPhotos && !hasPhotoInDocuments) {
          missingDocuments.push(label);
        }
      }
      
      if (missingDocuments.length > 0) {
        alert(`Please upload the following mandatory documents before submitting:\n\n${missingDocuments.join('\n')}`);
        setIsSubmitting(false);
        return;
      }
      
      // Get the backend ID from previous saves (if any)
      // loan.backendId should be set from previous saves in other steps
      let currentBackendId = loan.backendId;
      
      // If we don't have a backend ID yet, save first to get one
      if (!currentBackendId) {
        console.log('No backend ID found, creating initial draft...');
        const initialSave = await putLoan(loan);
        if (!initialSave.ok) {
          alert('Failed to save loan application. Please try again.');
          console.error('Initial save error:', initialSave.error);
          setIsSubmitting(false);
          return;
        }
        currentBackendId = initialSave.backendId || initialSave.data?.id;
        console.log('Got backend ID from initial save:', currentBackendId);
      }
      
      // Step 1: Update the loan application with accept_terms set to true
      const finalLoan = {
        ...loan,
        status: 'draft', // Keep as draft until actually submitted
        accept_terms: true, // User is submitting, so they accept terms
        signature: loan.personal?.fullName || 'Electronic Signature', // Auto-sign with user's name
        backendId: currentBackendId, // Use the backend ID for PATCH update
      };
      
      console.log('Final loan object before save:', finalLoan);
      console.log('Backend ID:', finalLoan.backendId);
      
      const saveResult = await putLoan(finalLoan);
      
      // Check if the save was successful
      if (!saveResult.ok) {
        alert('Failed to save loan application. Please try again.');
        console.error('Save error:', saveResult.error);
        setIsSubmitting(false);
        return;
      }

      // Get the application ID from the backend response (not from frontend loan.id)
      // The backend returns either 'application_id' or 'id' as the UUID
      console.log('Save result data:', saveResult.data);
      console.log('Response keys:', saveResult.data ? Object.keys(saveResult.data) : 'no data');
      console.log('Save result backendId:', saveResult.backendId);
      
      // Try multiple sources for the application ID
      const applicationId = saveResult.backendId 
        || saveResult.data?.application_id 
        || saveResult.data?.id
        || loan.backendId;
      
      if (!applicationId) {
        alert('Failed to get application ID from server. Please try again.');
        console.error('No application ID found in response:', saveResult.data);
        console.error('Save result:', JSON.stringify(saveResult, null, 2));
        console.error('Loan object:', JSON.stringify(loan, null, 2));
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting application with ID:', applicationId);

      // Step 2: Upload all photos if they exist
      if (loan.photos && Object.keys(loan.photos).length > 0) {
        console.log('Uploading photos...', loan.photos);
        try {
          for (const [fieldName, files] of Object.entries(loan.photos)) {
            if (files && files.length > 0) {
              for (const file of files) {
                if (file instanceof File) {
                  console.log(`Uploading ${fieldName}: ${file.name}`);
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('field_name', fieldName);
                  formData.append('document_type', fieldName);
                  
                  // Upload to backend
                  const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/loans/applications/${applicationId}/upload_document/`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: formData
                  });
                  
                  if (!uploadResponse.ok) {
                    console.warn(`Failed to upload ${fieldName}: ${file.name}`);
                  } else {
                    console.log(`Successfully uploaded ${fieldName}: ${file.name}`);
                  }
                }
              }
            }
          }
          console.log('All photos uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading photos:', uploadError);
          // Don't fail the submission if photo upload fails
        }
      }

      // Step 2b: Upload documents from Step4Photos (loan.documents array)
      if (loan.documents && loan.documents.length > 0) {
        console.log('Uploading documents from Step4Photos...', loan.documents);
        try {
          for (const doc of loan.documents) {
            // Check if the document has a File object (not just a blob URL)
            if (doc.file instanceof File) {
              console.log(`Uploading document: ${doc.filename}`);
              const formData = new FormData();
              formData.append('file', doc.file);
              formData.append('field_name', doc.kind || 'other');
              formData.append('document_type', doc.kind || 'other');
              formData.append('title', doc.filename);
              
              // Upload to backend
              const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/loans/applications/${applicationId}/upload_document/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
              });
              
              if (!uploadResponse.ok) {
                console.warn(`Failed to upload document: ${doc.filename}`);
              } else {
                console.log(`Successfully uploaded document: ${doc.filename}`);
              }
            } else {
              console.warn('Document does not have a File object:', doc);
            }
          }
          console.log('All documents uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading documents:', uploadError);
          // Don't fail the submission if document upload fails
        }
      }

      // Step 3: Submit the application to change status from draft to pending
      const submitResult = await submitLoanApplication(applicationId);
      
      if (!submitResult) {
        alert('Failed to submit loan application. Please try again.');
        console.error('Submission error:', submitResult);
        setIsSubmitting(false);
        return;
      }
      
      // Only mark steps complete and show success if backend responded successfully
      ['personal','income','vehicle','condition','photos'].forEach((s) => setStepCompletion({ loanId, step: s, completed: true }));
      alert('Loan application submitted successfully!');
      navigate('/loans');
    } catch (error) {
      console.error('Error submitting loan application:', error);
      alert('Failed to submit loan application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const InfoRow = ({ label, value, required = false, step = null }) => {
    const isMissing = required && (!value || value === 'N/A' || value === 'Not specified' || value === 'Not provided');
    
    return (
      <MDBox 
        display="flex" 
        justifyContent="space-between" 
        py={1} 
        alignItems="flex-start"
        sx={{
          backgroundColor: isMissing ? 'rgba(255, 0, 0, 0.05)' : 'transparent',
          borderRadius: isMissing ? 1 : 0,
          px: isMissing ? 1 : 0,
        }}
      >
        <MDTypography 
          variant="button" 
          fontWeight="regular" 
          color={isMissing ? "error" : "text"} 
          sx={{ minWidth: '150px' }}
        >
          {label}{required && ' *'}:
        </MDTypography>
        <MDBox sx={{ textAlign: 'right', flex: 1, wordBreak: 'break-word' }}>
          <MDTypography 
            variant="button" 
            fontWeight="medium" 
            color={isMissing ? "error" : "dark"} 
          >
            {value || (isMissing ? 'REQUIRED - Missing' : 'N/A')}
          </MDTypography>
          {isMissing && step && (
            <MDButton
              variant="text"
              color="error"
              size="small"
              onClick={() => navigate(`/loan/apply/${loanId}/step-${step}`)}
              sx={{ 
                display: 'block',
                textTransform: 'none', 
                p: 0, 
                mt: 0.5,
                fontSize: '0.75rem',
                minWidth: 'auto',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'underline',
                  backgroundColor: 'transparent'
                }
              }}
            >
              → Fill this field
            </MDButton>
          )}
        </MDBox>
      </MDBox>
    );
  };

  const SectionCard = ({ title, children }) => (
    <Card sx={{ height: '100%' }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          {title}
        </MDTypography>
        <Divider />
        <MDBox mt={2}>
          {children}
        </MDBox>
      </MDBox>
    </Card>
  );

  // Check for missing fields on page load
  const missingRequiredFields = validateRequiredFields();
  const hasErrors = missingRequiredFields.length > 0;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold" gutterBottom>
              Review Your Application
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Please review all information below. You can edit any section before submitting.
            </MDTypography>
          </MDBox>
          <MDBox>
            <MDTypography variant="caption" color="text" display="block">
              Application ID
            </MDTypography>
            <MDTypography variant="h6" color="info" fontWeight="medium">
              {loan.backendId || 'Not yet assigned'}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Missing Fields Warning */}
        {hasErrors && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <MDTypography variant="h6" fontWeight="bold" color="error" mb={1}>
              Required Information Missing
            </MDTypography>
            <MDTypography variant="body2" color="error" mb={2}>
              The following required fields are incomplete. Click to edit:
            </MDTypography>
            <MDBox component="ul" sx={{ mb: 0, pl: 2 }}>
              {missingRequiredFields.map((item, index) => (
                <li key={index}>
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <MDTypography variant="body2" color="error">
                      {item.field} -
                    </MDTypography>
                    <MDButton
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => navigate(`/loan/apply/${loanId}/step-${item.step}`)}
                      sx={{ 
                        textTransform: 'none', 
                        p: 0, 
                        minWidth: 'auto',
                        textDecoration: 'underline',
                        '&:hover': {
                          textDecoration: 'underline',
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      Go to {item.stepName}
                    </MDButton>
                  </MDBox>
                </li>
              ))}
            </MDBox>
          </Alert>
        )}

        {/* Scrollable Content Area */}
        <MDBox 
          sx={{ 
            maxHeight: 'calc(100vh - 400px)', 
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
              '&:hover': {
                background: '#555',
              },
            },
          }}
        >
          <Grid container spacing={3}>
        {/* Loan Details */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Loan Details">
            <InfoRow 
              label="Requested Amount" 
              required={true}
              step={1}
              value={
                loan.personal?.loanAmount || loan.amount
                  ? `$${parseFloat(loan.personal?.loanAmount || loan.amount).toLocaleString()}`
                  : null
              } 
            />
            <InfoRow 
              label="Loan Term" 
              value={
                loan.personal?.loanTerm || loan.term
                  ? `${loan.personal?.loanTerm || loan.term} months`
                  : null
              } 
            />
            <InfoRow label="Loan Purpose" value={loan.personal?.loanPurpose || loan.purpose} />
            <InfoRow label="Application Status" value={loan.status || 'Draft'} />
            {loan.backendId && <InfoRow label="Application ID" value={loan.backendId} />}
          </SectionCard>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Personal Information">
            {loan.personal ? (
              <>
                <InfoRow 
                  label="Full Name" 
                  required={true}
                  step={1}
                  value={loan.personal?.fullName || `${loan.personal?.firstName || ''} ${loan.personal?.lastName || ''}`.trim() || null} 
                />
                <InfoRow label="Email" required={true} step={1} value={loan.personal?.email} />
                <InfoRow label="Phone" required={true} step={1} value={loan.personal?.phoneNumber || loan.personal?.phone} />
                <InfoRow label="Date of Birth" required={true} step={1} value={loan.personal?.dob || loan.personal?.dateOfBirth} />
                <InfoRow 
                  label="SSN" 
                  required={true}
                  step={1}
                  value={loan.personal?.ssn || loan.personal?.socialSecurity ? `***-**-${(loan.personal.ssn || loan.personal.socialSecurity).slice(-4)}` : null} 
                />
                <InfoRow 
                  label="ID Number" 
                  required={true}
                  step={1}
                  value={loan.personal?.driverLicense || loan.personal?.idNumber || loan.personal?.identificationNumber} 
                />
                <InfoRow label="Bank Name" value={loan.personal?.bankName} />
                
                {/* Address Information */}
                <MDBox mt={2} mb={1}>
                  <MDTypography variant="button" fontWeight="bold" color="info">
                    Address Information
                  </MDTypography>
                </MDBox>
                <InfoRow 
                  label="Street Address" 
                  required={true}
                  step={1}
                  value={loan.personal?.homeAddress || loan.personal?.streetAddress || loan.personal?.address} 
                />
                <InfoRow label="City" required={true} step={1} value={loan.personal?.city} />
                <InfoRow label="State" required={true} step={1} value={loan.personal?.state} />
                <InfoRow 
                  label="ZIP Code" 
                  required={true}
                  step={1}
                  value={loan.personal?.zipCode || loan.personal?.postalCode} 
                />
                
                {/* Display any other fields that might have been added dynamically */}
                {Object.keys(loan.personal).filter(key => !['fullName', 'firstName', 'lastName', 'email', 'phoneNumber', 'phone', 'dob', 'dateOfBirth', 'ssn', 'socialSecurity', 'driverLicense', 'idNumber', 'bankName', 'homeAddress', 'streetAddress', 'city', 'state', 'zipCode', 'postalCode'].includes(key)).map(key => {
                  const value = loan.personal[key];
                  if (value && value !== '' && value !== 'N/A') {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                    return <InfoRow key={key} label={label} value={value} />;
                  }
                  return null;
                })}
              </>
            ) : (
              <MDTypography variant="body2" color="text">No personal information provided</MDTypography>
            )}
          </SectionCard>
        </Grid>

        {/* Vehicle Information */}
        <Grid item xs={12}>
          <SectionCard title="Vehicle Information">
            {/* Check if there's vehicle data in loan.vehicle (singular) */}
            {loan.vehicle && typeof loan.vehicle === 'object' && Object.keys(loan.vehicle).length > 0 ? (
              <MDBox>
                {/* Core vehicle information */}
                <InfoRow label="Make" required={true} step={3} value={loan.vehicle?.make} />
                <InfoRow label="Model" required={true} step={3} value={loan.vehicle?.model} />
                <InfoRow label="Year" required={true} step={3} value={loan.vehicle?.year} />
                <InfoRow label="VIN" required={true} step={3} value={loan.vehicle?.vin} />
                <InfoRow 
                  label="Mileage" 
                  required={true}
                  step={3}
                  value={
                    loan.vehicle?.odometerMileage || loan.vehicle?.mileage
                      ? `${parseFloat(loan.vehicle?.odometerMileage || loan.vehicle?.mileage).toLocaleString()} miles`
                      : null
                  } 
                />
                <InfoRow label="Color" value={loan.vehicle?.vehicleColor || loan.vehicle?.color} />
                <InfoRow label="License Plate" value={loan.vehicle?.licensePlate} />
                <InfoRow label="Registration State" value={loan.vehicle?.registrationState} />
                <InfoRow label="Estimated Value" value={
                  loan.vehicle?.estimatedCarValue || loan.vehicle?.estimatedValue
                    ? `$${parseFloat(loan.vehicle?.estimatedCarValue || loan.vehicle?.estimatedValue).toLocaleString()}`
                    : null
                } />
                <InfoRow label="Title Issue Date" value={loan.vehicle?.titleIssueDate} />
                
                {/* Display any other vehicle fields dynamically */}
                {Object.keys(loan.vehicle).filter(key => {
                  const standardFields = ['make', 'model', 'year', 'vin', 'odometerMileage', 'mileage', 'vehicleColor', 'color', 'licensePlate', 'registrationState', 'estimatedCarValue', 'estimatedValue', 'titleIssueDate', 'photos'];
                  if (standardFields.includes(key)) return false;
                  const value = loan.vehicle[key];
                  return value && value !== '' && value !== 'N/A';
                }).map(key => {
                  const value = loan.vehicle[key];
                  // Format specific field types
                  let displayValue = value;
                  if (key.toLowerCase().includes('mileage') || key.toLowerCase().includes('odometer')) {
                    displayValue = !isNaN(value) ? `${parseFloat(value).toLocaleString()} miles` : value;
                  } else if (key.toLowerCase().includes('value') || key.toLowerCase().includes('price')) {
                    displayValue = !isNaN(value) ? `$${parseFloat(value).toLocaleString()}` : value;
                  } else if (key.includes('Date')) {
                    displayValue = value;
                  }
                  
                  // Format label
                  const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                  return <InfoRow key={key} label={label} value={displayValue} />;
                })}
              </MDBox>
            ) : loan.vehicles && Array.isArray(loan.vehicles) && loan.vehicles.length > 0 ? (
              loan.vehicles.map((vehicle, idx) => (
                <MDBox key={vehicle.id || idx} mb={idx < loan.vehicles.length - 1 ? 2 : 0}>
                  {loan.vehicles.length > 1 && (
                    <MDTypography variant="button" fontWeight="bold" color="info" mb={1} display="block">
                      Vehicle {idx + 1}
                    </MDTypography>
                  )}
                  {vehicle?.vin && <InfoRow label="VIN" required={true} value={vehicle.vin} />}
                  {vehicle?.make && <InfoRow label="Make" required={true} value={vehicle.make} />}
                  {vehicle?.model && <InfoRow label="Model" value={vehicle.model} />}
                  {vehicle?.year && <InfoRow label="Year" value={vehicle.year} />}
                  
                  {/* Display any other vehicle fields that might have been added */}
                  {vehicle && Object.keys(vehicle).filter(key => {
                    // Exclude already shown fields and internal fields
                    if (['id', 'vin', 'make', 'model', 'year', 'photos'].includes(key)) return false;
                    // Only show fields with actual values
                    const value = vehicle[key];
                    return value && value !== '' && value !== 'N/A';
                  }).map(key => {
                    const value = vehicle[key];
                    const displayValue = (key.toLowerCase().includes('mileage') || key.toLowerCase().includes('odometer')) && value && !isNaN(value)
                      ? `${parseFloat(value).toLocaleString()} miles`
                      : value;
                    return <InfoRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} value={displayValue} />;
                  })}
                  
                  {/* Vehicle Photos */}
                  {vehicle?.photos && vehicle.photos.length > 0 && (
                    <MDBox mt={2} pt={2} borderTop={1} borderColor="grey.300">
                      <MDTypography variant="button" color="text" fontWeight="bold" display="block" mb={1}>
                        Vehicle Photos ({vehicle.photos.length})
                      </MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {vehicle.photos.map((photo, pIdx) => (
                          <MDBox key={photo.id || pIdx} sx={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1, 
                            p: 1,
                            width: '200px'
                          }}>
                            {photo.url && (
                              <img 
                                src={photo.url} 
                                alt={photo.filename || `Photo ${pIdx + 1}`}
                                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            )}
                            <MDTypography variant="caption" color="dark" display="block" mt={0.5}>
                              {photo.filename || `Photo ${pIdx + 1}`}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              {photo.size ? `${(photo.size / 1024).toFixed(1)} KB` : ''}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    </MDBox>
                  )}
                  
                  {idx < loan.vehicles.length - 1 && <Divider sx={{ my: 2 }} />}
                </MDBox>
              ))
            ) : (
              <MDTypography variant="body2" color="text">No vehicle information provided</MDTypography>
            )}
          </SectionCard>
        </Grid>

        {/* Vehicle Condition */}
        {loan.condition && Object.keys(loan.condition).some(key => loan.condition[key]) && (
          <Grid item xs={12}>
            <SectionCard title="Vehicle Condition">
              {Object.keys(loan.condition).map(key => {
                const value = loan.condition[key];
                // Format boolean values
                const displayValue = typeof value === 'boolean'
                  ? (value ? 'Yes' : 'No')
                  : value;
                
                // For longer text fields, display differently
                if (key.toLowerCase().includes('details') || key.toLowerCase().includes('notes')) {
                  return (
                    <MDBox key={key} mt={1} py={1} borderTop={1} borderColor="grey.300">
                      <MDTypography variant="caption" color="text" fontWeight="bold" display="block">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                      </MDTypography>
                      <MDTypography variant="caption" color="text" display="block" mt={0.5}>
                        {displayValue}
                      </MDTypography>
                    </MDBox>
                  );
                }
                
                return <InfoRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} value={displayValue} />;
              })}
            </SectionCard>
          </Grid>
        )}

        {/* Income Information */}
        <Grid item xs={12}>
          <SectionCard title="Income & Employment Information">
            {loan.income && typeof loan.income === 'object' && Object.keys(loan.income).length > 0 ? (
              <>
                {/* Core employment fields */}
                <InfoRow 
                  label="Employment Status" 
                  required={true}
                  step={2}
                  value={loan.income?.employmentStatus || loan.personal?.employmentStatus} 
                />
                <InfoRow 
                  label="Monthly Income" 
                  required={true}
                  step={2}
                  value={
                    loan.income?.monthlyIncome || loan.personal?.monthlyIncome || loan.income?.grossMonthlyIncome
                      ? `$${parseFloat(loan.income?.monthlyIncome || loan.personal?.monthlyIncome || loan.income?.grossMonthlyIncome).toLocaleString()}`
                      : null
                  } 
                />
                <InfoRow label="Pay Frequency" value={loan.income?.payFrequency || loan.personal?.payFrequency} />
                <InfoRow label="Next Pay Date" value={loan.income?.nextPayDate || loan.personal?.nextPayDate} />
                <InfoRow label="Last Pay Date" value={loan.income?.lastPayDate || loan.personal?.lastPayDate} />
                <InfoRow label="Direct Deposit" value={loan.income?.directDeposit || loan.personal?.directDeposit} />
                <InfoRow label="Active Bankruptcy" value={loan.income?.activeBankruptcy || loan.personal?.activeBankruptcy} />
                
                {/* Display any other income fields dynamically */}
                {Object.keys(loan.income).filter(key => {
                  const standardFields = ['employmentStatus', 'employerName', 'employer', 'yearsEmployed', 'monthlyIncome', 'annualIncome', 'income', 'grossMonthlyIncome', 'incomeSource', 'payFrequency', 'nextPayDate', 'lastPayDate', 'directDeposit', 'activeBankruptcy', 'militaryStatus', 'creditScore'];
                  const hiddenFields = ['employerName', 'employer', 'yearsEmployed', 'annualIncome', 'income', 'incomeSource', 'militaryStatus', 'creditScore'];
                  if (standardFields.includes(key) || hiddenFields.includes(key)) return false;
                  const value = loan.income[key];
                  return value && value !== '' && value !== 'N/A';
                }).map(key => {
                  const value = loan.income[key];
                  // Format monetary values
                  const displayValue = (key.toLowerCase().includes('income') || key.toLowerCase().includes('salary')) && value && !isNaN(value)
                    ? `$${parseFloat(value).toLocaleString()}`
                    : value;
                  // Format label
                  const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                  return <InfoRow key={key} label={label} value={displayValue} />;
                })}
              </>
            ) : (
              <MDTypography variant="body2" color="text">No income information provided</MDTypography>
            )}
          </SectionCard>
        </Grid>

        {/* Co-Applicant Information */}
        {loan.coApplicant && Object.keys(loan.coApplicant).some(key => loan.coApplicant[key]) && (
          <Grid item xs={12}>
            <SectionCard title="Co-Applicant Information">
              {Object.keys(loan.coApplicant).map(key => {
                const value = key === 'ssn' && loan.coApplicant[key]
                  ? '***-**-' + loan.coApplicant[key].slice(-4)
                  : loan.coApplicant[key];
                return <InfoRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} value={value} />;
              })}
            </SectionCard>
          </Grid>
        )}

        {/* Documents */}
        <Grid item xs={12}>
          <SectionCard title="Uploaded Documents & Photos">
            {/* Check both loan.documents (from Step4Photos) and loan.photos (from Photos.js) */}
            {loan.photos && typeof loan.photos === 'object' && Object.keys(loan.photos).length > 0 ? (
              <MDBox>
                <MDBox display="flex" flexWrap="wrap" gap={2}>
                  {Object.entries(loan.photos).map(([fieldName, files]) => (
                    files && files.length > 0 && files.map((file, idx) => (
                      <MDBox key={`${fieldName}-${idx}`} sx={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1, 
                        p: 1.5,
                        width: '200px',
                        bgcolor: 'white'
                      }}>
                        {/* Image preview */}
                        {file instanceof File && (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name}
                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                          />
                        )}
                        
                        {/* File info */}
                        <MDBox display="flex" alignItems="flex-start" gap={1}>
                          <MDTypography variant="button" fontWeight="medium" color="success" sx={{ mt: 0.5 }}>
                            ✓
                          </MDTypography>
                          <MDBox flex={1}>
                            <MDTypography variant="caption" fontWeight="bold" color="info" display="block">
                              {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                            </MDTypography>
                            <MDTypography variant="button" fontWeight="medium" color="dark" sx={{ wordBreak: 'break-word' }}>
                              {file.name || `File ${idx + 1}`}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              Size: {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    ))
                  ))}
                </MDBox>
                <MDBox mt={2} pt={2} borderTop={1} borderColor="grey.300">
                  <MDTypography variant="button" color="info" fontWeight="bold">
                    Total Documents: {Object.values(loan.photos).flat().length}
                  </MDTypography>
                </MDBox>
              </MDBox>
            ) : loan.documents && loan.documents.length > 0 ? (
              <MDBox>
                <MDBox display="flex" flexWrap="wrap" gap={2}>
                  {loan.documents.map((doc, idx) => (
                    <MDBox key={doc.id || idx} sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      p: 1.5,
                      width: '200px',
                      bgcolor: 'white'
                    }}>
                      {/* Image preview or file icon */}
                      {doc.url && doc.mimeType?.startsWith('image/') ? (
                        <img 
                          src={doc.url} 
                          alt={doc.filename || `Document ${idx + 1}`}
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                        />
                      ) : (
                        <MDBox sx={{ 
                          width: '100%', 
                          height: '120px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          bgcolor: '#f5f5f5', 
                          borderRadius: '4px',
                          marginBottom: '8px',
                          fontSize: '48px'
                        }}>
                          📄
                        </MDBox>
                      )}
                      
                      {/* File info */}
                      <MDBox display="flex" alignItems="flex-start" gap={1}>
                        <MDTypography variant="button" fontWeight="medium" color="success" sx={{ mt: 0.5 }}>
                          ✓
                        </MDTypography>
                        <MDBox flex={1}>
                          <MDTypography variant="button" fontWeight="medium" color="dark" sx={{ wordBreak: 'break-word' }}>
                            {doc.filename || `Document ${idx + 1}`}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            Type: {doc.kind || 'other'}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            Size: {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'N/A'}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  ))}
                </MDBox>
                <MDBox mt={2} pt={2} borderTop={1} borderColor="grey.300">
                  <MDTypography variant="button" color="info" fontWeight="bold">
                    Total Documents: {loan.documents.length}
                  </MDTypography>
                </MDBox>
              </MDBox>
            ) : (
              <MDTypography variant="body2" color="text">No documents uploaded yet</MDTypography>
            )}
          </SectionCard>
        </Grid>
          </Grid>

          {/* Debug Section - Toggle to see raw data */}
          <MDBox mt={3}>
            <MDButton 
              variant="text" 
              color="secondary" 
              size="small"
              onClick={() => setShowDebug(!showDebug)}
            >
              {showDebug ? 'Hide' : 'Show'} Raw Data (Debug)
            </MDButton>
            <Collapse in={showDebug}>
              <Card sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
                <MDBox p={2}>
                  <MDTypography variant="h6" mb={2}>Raw Loan Data</MDTypography>
                  <pre style={{ 
                    overflow: 'auto', 
                    maxHeight: '400px', 
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {JSON.stringify(loan, null, 2)}
                  </pre>
                </MDBox>
              </Card>
            </Collapse>
          </MDBox>
        </MDBox>

      {/* Action Buttons */}
      <MDBox 
        mt={4}
        pt={3}
        display="flex" 
        justifyContent="space-between"
        sx={{
          borderTop: '2px solid #e0e0e0',
        }}
      >
          <MDButton variant="outlined" color="dark" onClick={() => navigate(-1)} disabled={isSubmitting}>
            <Icon sx={{ mr: 1 }}>edit</Icon>
            Back to Edit
          </MDButton>
          <MDButton 
            variant="gradient" 
            color="info" 
            onClick={handleSubmit}
            disabled={isSubmitting || hasErrors}
            size="large"
          >
            {isSubmitting ? (
              <>
                <Icon sx={{ mr: 1 }}>hourglass_empty</Icon>
                Submitting...
              </>
            ) : (
              <>
                <Icon sx={{ mr: 1 }}>check_circle</Icon>
                Submit Application
              </>
            )}
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

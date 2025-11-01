/**
 * API-powered Customer Profile Component
 * Uses real-time data from backend APIs
 */

import React, { useEffect, useState } from 'react';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';
import { checkApiHealth } from '../../services/apiService';

// MDX components imports
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import RefreshIcon from "@mui/icons-material/Refresh";
import ApiIcon from "@mui/icons-material/Api";

const ApiCustomerProfile = ({ userId, enableRealTime = false }) => {
  const [apiStatus, setApiStatus] = useState('checking');
  
  const { 
    profile, 
    loading, 
    error, 
    updating, 
    lastUpdated,
    refreshProfile 
  } = useCustomerProfile(userId, {
    enablePolling: enableRealTime,
    pollingInterval: 30000,
    fallbackToStatic: true
  });

  // Check API connectivity on mount
  useEffect(() => {
    const checkApi = async () => {
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? 'connected' : 'disconnected');
    };
    checkApi();
  }, []);

  if (loading) {
    return (
      <Card>
        <MDBox p={3} textAlign="center">
          <CircularProgress color="info" />
          <MDTypography variant="h6" sx={{ mt: 2 }}>
            Loading Customer Profile...
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Fetching data from APIs
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (error && !profile) {
    return (
      <Card>
        <MDBox p={3}>
          <MDAlert color="error">
            <strong>Error loading profile:</strong> {error}
          </MDAlert>
          <MDBox mt={2} textAlign="center">
            <MDButton 
              variant="gradient" 
              color="info" 
              onClick={refreshProfile}
              startIcon={<RefreshIcon />}
            >
              Retry
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <MDBox p={3} textAlign="center">
          <MDTypography variant="h6">
            No Profile Data Available
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      {/* API Status Header */}
      <Card sx={{ mb: 2 }}>
        <MDBox p={2}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <ApiIcon color={apiStatus === 'connected' ? 'success' : 'error'} />
            </Grid>
            <Grid item xs>
              <MDTypography variant="body2">
                API Status: <strong>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</strong>
                {lastUpdated && (
                  <span> • Last updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
              </MDTypography>
            </Grid>
            <Grid item>
              <MDButton 
                size="small" 
                variant="outlined" 
                color="info"
                onClick={refreshProfile}
                disabled={updating}
                startIcon={<RefreshIcon />}
              >
                {updating ? 'Updating...' : 'Refresh'}
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Card>

      {/* Error Alert */}
      {error && (
        <MDAlert color="warning" sx={{ mb: 2 }}>
          <strong>Warning:</strong> {error}. Showing cached or fallback data.
        </MDAlert>
      )}

      {/* Customer Information Cards */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" gutterBottom>
                Personal Information
              </MDTypography>
              <MDBox component="dl">
                <ProfileField 
                  label="Customer ID" 
                  value={profile.customerId}
                  isApiData={!!profile.customerId}
                />
                <ProfileField 
                  label="Full Name" 
                  value={profile.personalInfo.fullName}
                  isApiData={!!profile.personalInfo.firstName}
                />
                <ProfileField 
                  label="Date of Birth" 
                  value={profile.personalInfo.dateOfBirth}
                  isApiData={!!profile.personalInfo.dateOfBirth}
                />
                <ProfileField 
                  label="SSN" 
                  value={profile.personalInfo.ssn}
                  isApiData={!!profile.personalInfo.ssn}
                />
                <ProfileField 
                  label="Account Status" 
                  value={profile.accountStatus}
                  isApiData={true}
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" gutterBottom>
                Contact Information
              </MDTypography>
              <MDBox component="dl">
                <ProfileField 
                  label="Email" 
                  value={profile.contact.email}
                  isApiData={!!profile.contact.email}
                />
                <ProfileField 
                  label="Phone" 
                  value={profile.contact.phone}
                  isApiData={!!profile.contact.phone}
                />
                <ProfileField 
                  label="Address" 
                  value={`${profile.contact.address}, ${profile.contact.city}, ${profile.contact.state} ${profile.contact.zipCode}`}
                  isApiData={!!(profile.contact.city && profile.contact.state)}
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Employment Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" gutterBottom>
                Employment Information
              </MDTypography>
              <MDBox component="dl">
                <ProfileField 
                  label="Employer" 
                  value={profile.employment.employer}
                  isApiData={!!profile.employment.employer}
                />
                <ProfileField 
                  label="Monthly Income" 
                  value={`$${profile.employment.monthlyIncome?.toLocaleString() || '0'}`}
                  isApiData={!!profile.employment.monthlyIncome}
                />
                <ProfileField 
                  label="Employment Length" 
                  value={profile.employment.employmentLength}
                  isApiData={!!profile.employment.employmentLength}
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Membership Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" gutterBottom>
                Membership Details
              </MDTypography>
              <MDBox component="dl">
                <ProfileField 
                  label="Member Since" 
                  value={profile.membership.customerSince}
                  isApiData={!!profile.membership.joinDate}
                />
                <ProfileField 
                  label="Credit Score" 
                  value={profile.membership.creditScore || 'Not Available'}
                  isApiData={!!profile.membership.creditScore}
                />
                <ProfileField 
                  label="Risk Category" 
                  value={profile.membership.riskCategory}
                  isApiData={!!profile.membership.riskCategory}
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Active Loans */}
        {profile.titleLoans && profile.titleLoans.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" gutterBottom>
                  Active Loans
                </MDTypography>
                {profile.titleLoans.map((loan, index) => (
                  <MDBox key={index} mb={2} p={2} bgcolor="grey.100" borderRadius="lg">
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <ProfileField 
                          label="Loan Number" 
                          value={loan.loanNumber}
                          isApiData={true}
                        />
                        <ProfileField 
                          label="Status" 
                          value={loan.status}
                          isApiData={true}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <ProfileField 
                          label="Loan Amount" 
                          value={`$${loan.loanAmount?.toLocaleString()}`}
                          isApiData={!!loan.loanAmount}
                        />
                        <ProfileField 
                          label="Current Balance" 
                          value={`$${loan.currentBalance?.toLocaleString()}`}
                          isApiData={!!loan.currentBalance}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <ProfileField 
                          label="Vehicle" 
                          value={`${loan.collateralVehicle?.year} ${loan.collateralVehicle?.make} ${loan.collateralVehicle?.model}`}
                          isApiData={!!(loan.collateralVehicle?.make && loan.collateralVehicle?.model)}
                        />
                        <ProfileField 
                          label="Next Payment" 
                          value={loan.nextPaymentDue}
                          isApiData={!!loan.nextPaymentDue}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>
        )}
      </Grid>
    </MDBox>
  );
};

// Helper component for displaying profile fields with API data indicators
const ProfileField = ({ label, value, isApiData = false }) => (
  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
    <MDTypography variant="body2" color="text">
      {label}:
    </MDTypography>
    <MDBox display="flex" alignItems="center">
      <MDTypography variant="body2" fontWeight="medium">
        {value || 'Not Available'}
      </MDTypography>
      {isApiData && (
        <MDBox 
          component="span" 
          sx={{ 
            ml: 1, 
            width: 8, 
            height: 8, 
            bgcolor: 'success.main', 
            borderRadius: '50%',
            display: 'inline-block'
          }}
          title="Data from API"
        />
      )}
    </MDBox>
  </MDBox>
);

export default ApiCustomerProfile;
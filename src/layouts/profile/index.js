/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025 Market Maker Zw

Coded by Market Maker Softwares

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";

// Profile page components
import Header from "layouts/profile/components/Header";
import UploadInstructions from "layouts/profile/components/UploadInstructions";
import ApiCustomerProfile from "components/ApiCustomerProfile";

// Hooks and services
import { useState, useEffect } from "react";
import userProfileService from "services/userProfileService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userProfileService.getUserProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
          <MDTypography variant="h6">Loading profile...</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
          <MDBox textAlign="center">
            <MDTypography variant="h6" color="error" mb={2}>{error}</MDTypography>
            <MDTypography variant="button" color="text" onClick={loadProfile} sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Retry
            </MDTypography>
          </MDBox>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Extract data from API response
  const user = profile?.user || {};
  const personalInfo = profile?.personal_info || {};
  const address = profile?.address || {};
  const employment = profile?.employment || {};
  const banking = profile?.banking || {};
  const vehicle = profile?.vehicle || {};
  const loanSummary = profile?.loan_summary || {};
  const latestApp = profile?.latest_application || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <UploadInstructions />
      <Header profile={profile}>
        <MDBox mt={5} mb={3}>
          <MDBox mt={3}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={6} xl={6} sx={{ display: "flex" }}>
                <ProfileInfoCard
                  title="Profile Information"
                  description="Welcome to your DriveCash profile. Manage your personal information and track your loan applications."
                  info={{
                    "Full Name": user.full_name || `${user.first_name} ${user.last_name}`.trim() || 'N/A',
                    "Email": user.email || personalInfo.email || 'N/A',
                    "Phone": user.phone_number || personalInfo.phone || 'N/A',
                    "Date of Birth": formatDate(user.date_of_birth || personalInfo.dob),
                    "Location": `${address.city || ''}, ${address.state || ''}`.trim() || 'N/A',
                    "Member Since": formatDate(user.created_at),
                    "Account Status": user.is_verified ? 'Verified' : 'Pending Verification',
                  }}
                social={[
                  {
                    link: "https://www.facebook.com/",
                    icon: <FacebookIcon />,
                    color: "facebook",
                  },
                  {
                    link: "https://twitter.com/",
                    icon: <TwitterIcon />,
                    color: "twitter",
                  },
                  {
                    link: "https://www.instagram.com/",
                    icon: <InstagramIcon />,
                    color: "instagram",
                  },
                ]}
                action={{ route: "#", tooltip: "Edit Profile" }}
                shadow={false}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={6}>
              <ProfileInfoCard
                title="Loan Summary"
                description="Overview of your loan applications and approvals."
                info={{
                  "Total Applications": loanSummary.total_applications || 0,
                  "Approved Loans": loanSummary.approved_count || 0,
                  "Pending Applications": loanSummary.pending_count || 0,
                  "Active Loans": loanSummary.active_loans || 0,
                  "Total Approved Amount": formatCurrency(loanSummary.total_approved_amount),
                  "Latest Application": latestApp.status ? latestApp.status.toUpperCase() : 'N/A',
                  "Latest Amount": latestApp.amount ? formatCurrency(latestApp.amount) : 'N/A',
                  "Applied On": formatDate(latestApp.created_at),
                }}
                social={[]}
                action={{ route: "/loans", tooltip: "View All Loans" }}
                shadow={false}
              />
            </Grid>
          </Grid>
          </MDBox>
        </MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Vehicle Information
          </MDTypography>
          <MDBox mb={1}>
            <MDTypography variant="button" color="text">
              Collateral Vehicle Details
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox p={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} xl={3}>
              <MDBox p={2} borderRadius="lg" border="1px solid" borderColor="grey.300">
                <MDTypography variant="caption" color="text" textTransform="uppercase">
                  Vehicle
                </MDTypography>
                <MDTypography variant="h6" fontWeight="medium">
                  {vehicle.year && vehicle.make && vehicle.model 
                    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` 
                    : 'No vehicle on file'}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  {vehicle.vin ? `VIN: ${vehicle.vin}` : 'No VIN available'}
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <MDBox p={2} borderRadius="lg" border="1px solid" borderColor="grey.300">
                <MDTypography variant="caption" color="text" textTransform="uppercase">
                  Employment
                </MDTypography>
                <MDTypography variant="h6" fontWeight="medium">
                  {employment.employment_status || 'Not specified'}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  {employment.income_source || 'Income source not specified'} - {formatCurrency(employment.gross_monthly_income || 0)}/month
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <MDBox p={2} borderRadius="lg" border="1px solid" borderColor="grey.300">
                <MDTypography variant="caption" color="text" textTransform="uppercase">
                  Loan Statistics
                </MDTypography>
                <MDTypography variant="h6" fontWeight="medium">
                  {loanSummary.total_applications || 0} Application{loanSummary.total_applications !== 1 ? 's' : ''}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  {loanSummary.approved_count || 0} approved, {loanSummary.pending_count || 0} pending
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <MDBox p={2} borderRadius="lg" border="1px solid" borderColor="grey.300">
                <MDTypography variant="caption" color="text" textTransform="uppercase">
                  Banking
                </MDTypography>
                <MDTypography variant="h6" fontWeight="medium">
                  {banking.bank_name || 'No bank on file'}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Direct deposit {banking.direct_deposit ? 'enabled' : 'not enabled'}
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Profile;

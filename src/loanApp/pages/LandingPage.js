import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormContext } from "../context/FormContext";
import { Card } from "@mui/material";
import {
  AccountCircle,
  MonetizationOn,
  DirectionsCar,
  PhotoCamera,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const LandingPage = () => {
  const { createLoan, setActiveLoan } = useContext(FormContext);
  const navigate = useNavigate();
  const isNavigatingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      label: "Personal Information",
      description: "Tell us about yourself so we can pull relevant info.",
      icon: <AccountCircle sx={{ fontSize: 28 }} />,
      timeEstimate: "3-5 min",
      fields: ["Name", "DOB", "SSN"],
      requirements: ["ID", "Proof of address"],
    },
    {
      label: "Income & Employment",
      description: "Your employment details help us determine eligibility.",
      icon: <MonetizationOn sx={{ fontSize: 28 }} />,
      timeEstimate: "3-5 min",
      fields: ["Income", "Employer"],
      requirements: ["Recent pay stub"],
    },
    {
      label: "Vehicle Details",
      description: "Information about the vehicle you want to finance.",
      icon: <DirectionsCar sx={{ fontSize: 28 }} />,
      timeEstimate: "2-4 min",
      fields: ["Make", "Model", "Year"],
      requirements: ["VIN", "Title if available"],
    },
    {
      label: "Photos & Documents",
      description: "Upload photos or documents to finish your application.",
      icon: <PhotoCamera sx={{ fontSize: 28 }} />,
      timeEstimate: "2-4 min",
      fields: ["Photos", "Documents"],
      requirements: ["Vehicle photos", "Driver license"],
    },
  ];

  const handleStartApplication = (e) => {
    // eslint-disable-next-line no-console
    console.log("Start button clicked!");
    
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (isNavigatingRef.current) {
      // eslint-disable-next-line no-console
      console.log("Navigation already in progress, skipping...");
      return;
    }

    // Lock navigation and show loading immediately
    isNavigatingRef.current = true;
    setLoading(true);

    try {
      // Create loan synchronously - createLoan returns string ID immediately
      const id = createLoan ? createLoan({}) : `new-${Date.now()}`;
      
      // eslint-disable-next-line no-console
      console.log("Loan created with ID:", id);
      
      // Set active loan
      if (setActiveLoan) {
        setActiveLoan(id);
      }

      // eslint-disable-next-line no-console
      console.log("Navigating to:", `/loan/apply/${id}/step-1`);
      
      // Navigate to step-1 immediately
      navigate(`/loan/apply/${id}/step-1`);

      // Fallback: if SPA navigation didn't change the location (e.g. router mismatch or blocking overlay),
      // force a full-page navigation after a short delay to guarantee the user reaches step-1.
      setTimeout(() => {
        try {
          const expected = `/loan/apply/${id}/step-1`;
          if (!window.location.pathname.includes(expected)) {
            // eslint-disable-next-line no-console
            console.warn('SPA navigate failed — forcing full-page navigation to', expected);
            window.location.href = expected;
          }
        } catch (e) {
          // ignore
        }
      }, 150);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Start application failed:", err);
      // Fallback: navigate with generated id
      const fallbackId = `new-${Date.now()}`;
      if (setActiveLoan) {
        setActiveLoan(fallbackId);
      }
      navigate(`/loan/apply/${fallbackId}/step-1`);
    } finally {
      // Reset navigation lock and loading after a short delay
      setTimeout(() => {
        isNavigatingRef.current = false;
        setLoading(false);
      }, 100);
    }
  };

  return (
    <MDBox
      sx={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f7fafa 0%, #ffffff 100%)",
        py: 6,
        px: { xs: 2, md: 6 },
      }}
    >
      <Card
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 980,
          width: "100%",
          mx: "auto",
          boxShadow: "0 8px 32px rgba(6,78,59,0.08)",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <MDBox
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          mb={3}
          sx={{ width: "100%" }}
        >
          <MDTypography
            variant="h4"
            fontWeight="bold"
            color="dark"
            gutterBottom
            align="center"
          >
            Apply for a Loan
          </MDTypography>
          {/* Temporary developer helper: clear saved drafts */}
          <MDBox sx={{ position: 'absolute', right: 24, top: 24 }}>
            <MDButton
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                try {
                  localStorage.removeItem('multiLoanDraft');
                  sessionStorage.removeItem('multiLoanDraft');
                } catch (e) {
                  console.warn('Failed to clear storage', e);
                }
                if (setActiveLoan) setActiveLoan(null);
                console.log('Cleared saved drafts and reloading');
                window.location.reload();
              }}
            >
              Clear Drafts
            </MDButton>
          </MDBox>
          <MDTypography
            variant="body1"
            color="text"
            sx={{ maxWidth: 720 }}
            align="center"
          >
            A few simple steps to get you approved. Complete your application in about 10 minutes.
          </MDTypography>
        </MDBox>

        <MDTypography
          variant="subtitle1"
          fontWeight="medium"
          color="text"
          textAlign="center"
          mb={2}
          align="center"
        >
          Steps to complete
        </MDTypography>

        <MDBox sx={{ width: "100%", maxWidth: 880, mx: "auto" }}>
          {steps.map((step, index) => (
            <MDBox
              key={index}
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              gap={2}
              mb={2}
              width="100%"
            >
              <MDBox
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ minWidth: 72, flex: "0 0 72px" }}
              >
                <MDBox
                  sx={{
                    backgroundColor: "#ecf8f6",
                    color: "#138d75",
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {React.cloneElement(step.icon, { sx: { fontSize: 20 } })}
                </MDBox>
                {index < steps.length - 1 && (
                  <MDBox
                    sx={{
                      width: 2,
                      height: 32,
                      backgroundColor: "#16a085",
                      borderRadius: 1,
                      mt: 1,
                    }}
                  />
                )}
              </MDBox>

              <Card
                sx={{
                  p: { xs: 2, md: 2.5 },
                  backgroundColor: "transparent",
                  border: "1px solid rgba(11, 107, 90, 0.06)",
                  width: "100%",
                }}
                elevation={0}
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="medium">
                      {step.label}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {step.description}
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="right">
                    <MDTypography variant="caption" color="text">
                      {step.timeEstimate}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </MDBox>
          ))}
        </MDBox>

        <MDBox mt={3} width="100%" display="flex" justifyContent="center">
          <MDButton
            type="button"
            variant="gradient"
            color="success"
            size="large"
            onClick={handleStartApplication}
            onMouseDown={(e) => {
              // ensure immediate response on mouse press
              if (e && e.preventDefault) e.preventDefault();
              if (!isNavigatingRef.current && !loading) handleStartApplication(e);
            }}
            onKeyDown={(e) => {
              // support keyboard activation (Enter/Space)
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isNavigatingRef.current && !loading) handleStartApplication(e);
              }
            }}
            tabIndex={0}
            disabled={loading}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(22, 160, 133, 0.4)',
              },
            }}
          >
            {loading ? "Starting..." : "Start Your Loan Application"}
          </MDButton>
        </MDBox>
      </Card>
    </MDBox>
  );
};

export default LandingPage;
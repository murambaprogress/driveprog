import React, { useState, useEffect } from "react";
import adminDataService from "services/adminDataService";
import { 
  Grid, 
  Card, 
  CardContent, 
  Slider, 
  // TextField, // Replaced with VhoozhtInput
  // MenuItem, // Replaced with VhoozhtSelect options
  // Select, // Replaced with VhoozhtSelect
  // FormControl, // Replaced with VhoozhtSelect
  // InputLabel, // Replaced with VhoozhtSelect labels
  Chip,
  Alert,
  Divider,
  Box
} from "@mui/material";
import { 
  AccountBalanceWallet, 
  DirectionsCar, 
  Calculate,
  TrendingUp,
  AccessTime,
  MonetizationOn
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// DriveCash Form Components
import { VhoozhtInput, VhoozhtSelect } from "components/VhoozhtForms";

import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// App Data Context
import { useCalculatorData, useUserData } from "context/AppDataContext";

function Calculator() {
  // Get calculator and user data from global context
  const { calculator, updateResults, setPreferences } = useCalculatorData();
  const { user, updateProfile } = useUserData();
  const [settings, setSettings] = useState({
    maxLoanAmount: 50000,
    minLoanAmount: 1000,
    defaultInterestRate: 12.5,
    maxLoanTerm: 60,
  });

  // Initialize state with context data or defaults
  const [loanAmount, setLoanAmount] = useState(
    calculator.preferences.defaultLoanAmount || settings.minLoanAmount
  );
  const [interestRate, setInterestRate] = useState(settings.defaultInterestRate || 15);
  const [loanTerm, setLoanTerm] = useState(settings.maxLoanTerm || 30);
  const [vehicleValue, setVehicleValue] = useState(calculator.preferences.defaultVehicleValue || 10000);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [maxLoanAmount, setMaxLoanAmount] = useState(settings.maxLoanAmount);
  const [titleApplicationFee, setTitleApplicationFee] = useState(33);
  const [monthlyServicingCharge, setMonthlyServicingCharge] = useState(0);
  const [paymentToExtendLoan, setPaymentToExtendLoan] = useState(0);

  useEffect(() => {
    const adminSettings = adminDataService.getSettings();
    if (adminSettings) {
      setSettings(adminSettings);
    }

    const onAdminUpdate = (e) => {
      const newSettings = (e && e.detail) ? e.detail : adminDataService.getSettings();
      if (newSettings) setSettings(newSettings);
    };

    // Listen for admin settings updates (same-window)
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('adminSettingsUpdated', onAdminUpdate);
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('adminSettingsUpdated', onAdminUpdate);
      }
    };
  }, []);

  // Calculate loan metrics for 30-day title loan
  useEffect(() => {
    const calculateLoan = () => {
      const principal = parseFloat(loanAmount);
      const rate = parseFloat(interestRate) / 100;
      const term = parseInt(loanTerm); // 30 days fixed
      const appFee = parseFloat(titleApplicationFee);

      if (principal > 0 && rate > 0) {
        // For 30-day title loan: Interest = Principal × Rate
        const totalInterestCalc = principal * rate;
        
        // Monthly servicing charge (15% of borrowed amount)
        const monthlyServicingChargeCalc = principal * 0.15;
        
        // Payment to extend loan (10% of borrowed amount)
        const paymentToExtendLoanCalc = principal * 0.10;
        
        // Total payment = Principal + Interest + Application Fee
        const totalPaymentCalc = principal + totalInterestCalc + appFee;
        
  // For display purposes, monthly extension is the total payment (since it's 30 days)
        const monthlyPaymentCalc = totalPaymentCalc;

        setTotalInterest(totalInterestCalc);
        setTotalPayment(totalPaymentCalc);
        setMonthlyPayment(monthlyPaymentCalc);
        setMonthlyServicingCharge(monthlyServicingChargeCalc);
        setPaymentToExtendLoan(paymentToExtendLoanCalc);
        
        // Update global context with calculation results
        const calculationResults = {
          loanAmount: principal,
          interestRate: rate * 100,
          loanTerm: term,
          vehicleValue,
          monthlyPayment: monthlyPaymentCalc,
          totalInterest: totalInterestCalc,
          totalPayment: totalPaymentCalc,
          titleApplicationFee: appFee,
          monthlyServicingCharge: monthlyServicingChargeCalc,
          paymentToExtendLoan: paymentToExtendLoanCalc,
          calculationType: '30-day-title-loan'
        };
        
        updateResults(calculationResults);
      } else {
        setTotalInterest(0);
        setTotalPayment(0);
        setMonthlyPayment(0);
        setMonthlyServicingCharge(0);
        setPaymentToExtendLoan(0);
      }
    };

    calculateLoan();
  }, [loanAmount, interestRate, loanTerm, titleApplicationFee, vehicleValue, updateResults]);

  // Calculate max loan amount based on vehicle value (80% instead of 50%)
  useEffect(() => {
    const maxFromVehicle = Math.min(vehicleValue * 0.8, settings.maxLoanAmount);
    setMaxLoanAmount(maxFromVehicle);
    if (loanAmount > maxFromVehicle) {
      setLoanAmount(maxFromVehicle);
    }
  }, [vehicleValue, loanAmount, settings.maxLoanAmount]);

  // Save calculator preferences when they change
  useEffect(() => {
    setPreferences({
      defaultLoanAmount: loanAmount,
      defaultVehicleValue: vehicleValue,
      showAdvancedOptions: calculator.preferences.showAdvancedOptions
    });
  }, [loanAmount, vehicleValue, setPreferences, calculator.preferences.showAdvancedOptions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleApplyNow = () => {
    // Store calculator results and navigate to application
    const calculatorData = {
      loanAmount,
      interestRate,
      loanTerm,
      vehicleValue,
      monthlyPayment,
      totalInterest,
      totalPayment,
      titleApplicationFee,
      monthlyServicingCharge,
      paymentToExtendLoan,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('calculatorResults', JSON.stringify(calculatorData));
    // Navigate to loan application
    try {
    // try to use FormContext to create a loan first
    // eslint-disable-next-line global-require
    const ctx = require('../../loanApp/context/FormContext');
      if (ctx && ctx.useFormContext) {
        const { createLoan, setActiveLoan } = ctx.useFormContext();
        const id = createLoan ? createLoan({}) : null;
        if (id && setActiveLoan) setActiveLoan(id);
        if (id) {
          window.location.href = `/loan/apply/${id}/step-1`;
          return;
        }
      }
    } catch (e) {
      // fallback
    }
    window.location.href = '/loan/apply';
  };

  const presetAmounts = [500, 1000, 2500, 5000, 10000, 15000, 20000, 25000];
  const termOptions = [
    { value: settings.maxLoanTerm, label: `${settings.maxLoanTerm} days (Fixed)` },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <MDBox mb={4} textAlign="center">
              <MDTypography variant="h3" fontWeight="bold" color="dark" mb={2}>
                Title Loan Calculator
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={1}>
                Calculate your potential loan amount and monthly extensions
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Get instant estimates based on your vehicle's value with transparent, competitive rates
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Calculator Input Section */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 4 }}>
                <MDBox mb={3}>
                  <MDTypography variant="h5" fontWeight="medium" color="dark" mb={1}>
                    Loan Parameters
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Adjust the parameters below to see your loan estimates
                  </MDTypography>
                </MDBox>

                <Grid container spacing={4}>
                  {/* Vehicle Value */}
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <DirectionsCar sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
                        <MDTypography variant="h6" fontWeight="medium" color="dark">
                          Vehicle Market Value
                        </MDTypography>
                      </MDBox>
                      <VhoozhtInput
                        label="Estimated Vehicle Value"
                        value={vehicleValue}
                        onChange={(e) => setVehicleValue(Math.max(0, parseInt(e.target.value) || 0))}
                        type="number"
                        placeholder="Enter your vehicle's market value"
                        InputProps={{
                          startAdornment: <MDTypography sx={{ mr: 1 }}>$</MDTypography>,
                        }}
                        showLabel={false}
                      />
                      <MDTypography variant="caption" color="text" mt={1}>
                        Maximum loan amount: 80% of vehicle value (up to {formatCurrency(settings.maxLoanAmount)})
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  {/* Loan Amount */}
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <MonetizationOn sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
                        <MDTypography variant="h6" fontWeight="medium" color="dark">
                          Loan Amount: {formatCurrency(loanAmount)}
                        </MDTypography>
                      </MDBox>
                      <Slider
                        value={loanAmount}
                        onChange={(e, newValue) => setLoanAmount(newValue)}
                        min={settings.minLoanAmount}
                        max={maxLoanAmount}
                        step={250}
                        marks={[
                          { value: settings.minLoanAmount, label: formatCurrency(settings.minLoanAmount) },
                          {
                            value: maxLoanAmount * 0.5,
                            label: `${Math.round((maxLoanAmount * 0.5) / 1000)}K`,
                          },
                          { value: maxLoanAmount, label: `${Math.round(maxLoanAmount / 1000)}K` },
                        ]}
                        sx={{
                          color: '#16a085',
                          height: 8,
                          '& .MuiSlider-track': {
                            border: 'none',
                          },
                          '& .MuiSlider-thumb': {
                            height: 24,
                            width: 24,
                            backgroundColor: '#fff',
                            border: '2px solid #16a085',
                          },
                        }}
                      />
                      <MDBox display="flex" gap={1} mt={2} flexWrap="wrap">
                        {presetAmounts
                          .filter(
                            (amount) =>
                              amount >= settings.minLoanAmount && amount <= settings.maxLoanAmount
                          )
                          .map((amount) => (
                            <Chip
                              key={amount}
                              label={formatCurrency(amount)}
                            onClick={() => setLoanAmount(amount)}
                            color={loanAmount === amount ? "primary" : "default"}
                            variant={loanAmount === amount ? "filled" : "outlined"}
                            size="small"
                          />
                        ))}
                      </MDBox>
                    </MDBox>
                  </Grid>

                  {/* Interest Rate - Fixed */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <TrendingUp sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
                        <MDTypography variant="h6" fontWeight="medium" color="dark">
                          Interest Rate (Fixed)
                        </MDTypography>
                      </MDBox>
                      <VhoozhtInput
                        label="Annual Percentage Rate"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 15))}
                        type="number"
                        fullWidth
                        disabled
                        InputProps={{
                          endAdornment: <MDTypography sx={{ ml: 1 }}>%</MDTypography>,
                          inputProps: {
                            min: settings.defaultInterestRate,
                            max: settings.defaultInterestRate,
                            step: 0.1,
                          },
                        }}
                      />
                      <MDTypography variant="caption" color="text" mt={1}>
                        Fixed at {settings.defaultInterestRate}% for all title loans
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  {/* Title Application Fee - Fixed */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <MonetizationOn sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
                        <MDTypography variant="h6" fontWeight="medium" color="dark">
                          Title Application Fee (Fixed)
                        </MDTypography>
                      </MDBox>
                      <VhoozhtInput
                        label="Application Fee"
                        value={titleApplicationFee}
                        type="number"
                        fullWidth
                        disabled
                        InputProps={{
                          startAdornment: <MDTypography sx={{ mr: 1 }}>$</MDTypography>,
                        }}
                      />
                      <MDTypography variant="caption" color="text" mt={1}>
                        Fixed application fee for all loans
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  {/* Loan Term - Fixed */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <AccessTime sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
                        <MDTypography variant="h6" fontWeight="medium" color="dark">
                          Loan Term (Fixed)
                        </MDTypography>
                      </MDBox>
                      <VhoozhtSelect
                        label="Repayment Period"
                        fullWidth
                        disabled
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(e.target.value)}
                        options={termOptions}
                      />
                      <MDTypography variant="caption" color="text" mt={1}>
                        Fixed {settings.maxLoanTerm}-day term for all title loans
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  {/* Monthly Servicing Charge Display */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <Calculate sx={{ color: '#16a085', fontSize: 20, mr: 1 }} />
                        <MDTypography variant="h6" fontWeight="medium" color="dark">
                          Monthly Servicing Charge
                        </MDTypography>
                      </MDBox>
                      <VhoozhtInput
                        label="15% of Borrowed Amount"
                        value={formatCurrency(monthlyServicingCharge)}
                        fullWidth
                        disabled
                      />
                      <MDTypography variant="caption" color="text" mt={1}>
                        Fixed at 15% of loan amount
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>

                {/* Loan Eligibility Alert */}
                {vehicleValue < 2000 && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    <MDTypography variant="body2">
                      Vehicle value should be at least $2,000 to qualify for a title loan.
                    </MDTypography>
                  </Alert>
                )}

                {loanAmount > maxLoanAmount && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    <MDTypography variant="body2">
                      Loan amount cannot exceed 80% of vehicle value or{" "}
                      {formatCurrency(settings.maxLoanAmount)} maximum.
                    </MDTypography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} lg={5}>
            <Grid container spacing={3}>
              {/* Loan Summary Card */}
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <MDBox display="flex" alignItems="center" mb={3}>
                      <Calculate sx={{ fontSize: 32, mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h5" fontWeight="bold" color="white">
                          Your Loan Summary
                        </MDTypography>
                        <MDTypography variant="body2" color="rgba(255,255,255,0.8)">
                          Based on your inputs
                        </MDTypography>
                      </MDBox>
                    </MDBox>

                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <MDBox textAlign="center">
                          <MDTypography variant="h4" fontWeight="bold" color="white">
                            {formatCurrency(paymentToExtendLoan)}
                          </MDTypography>
                          <MDTypography variant="body2" color="rgba(255,255,255,0.8)">
                            Payment To Extend Loan
                          </MDTypography>
                          <MDTypography variant="caption" color="rgba(255,255,255,0.6)">
                            (10% of borrowed amount)
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={6}>
                        <MDBox textAlign="center">
                          <MDTypography variant="h4" fontWeight="bold" color="white">
                            {formatCurrency(loanAmount)}
                          </MDTypography>
                          <MDTypography variant="body2" color="rgba(255,255,255,0.8)">
                            Loan Amount
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={6}>
                        <MDBox textAlign="center">
                          <MDTypography variant="h5" fontWeight="bold" color="white">
                            {formatCurrency(totalInterest)}
                          </MDTypography>
                          <MDTypography variant="body2" color="rgba(255,255,255,0.8)">
                            Total Interest
                          </MDTypography>
                          <MDTypography variant="caption" color="rgba(255,255,255,0.6)">
                            ({interestRate}% of loan amount)
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={6}>
                        <MDBox textAlign="center">
                          <MDTypography variant="h5" fontWeight="bold" color="white">
                            {formatCurrency(titleApplicationFee)}
                          </MDTypography>
                          <MDTypography variant="body2" color="rgba(255,255,255,0.8)">
                            Title Application Fee
                          </MDTypography>
                          <MDTypography variant="caption" color="rgba(255,255,255,0.6)">
                            (Fixed)
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.3)' }} />

                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDBox>
                        <MDTypography variant="body2" color="rgba(255,255,255,0.8)">
                          Total Payment
                        </MDTypography>
                        <MDTypography variant="h5" fontWeight="bold" color="white">
                          {formatCurrency(totalPayment)}
                        </MDTypography>
                      </MDBox>
                      <MDBox textAlign="right">
                        <MDTypography variant="body2" color="rgba(255,255,255,0.8)">
                          Term
                        </MDTypography>
                        <MDTypography variant="h5" fontWeight="bold" color="white">
                          {loanTerm} days
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <MDBox textAlign="center">
                      <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
                        Ready to Apply?
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={3}>
                        Get approved in minutes and receive funds in as little as 48 hours
                      </MDTypography>
                      
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="large"
                        fullWidth
                        onClick={handleApplyNow}
                        sx={{
                          backgroundColor: '#16a085',
                          padding: '12px 0',
                          mb: 2,
                          fontSize: '1rem',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#138d75',
                          }
                        }}
                      >
                        Apply for This Loan
                      </MDButton>

                      <MDBox display="flex" justifyContent="space-between" mt={2}>
                        <MDButton
                          variant="outlined"
                          color="dark"
                          size="small"
                          onClick={() => {
                            setLoanAmount(5000);
                            setInterestRate(11.5);
                            setLoanTerm(24);
                            setVehicleValue(10000);
                          }}
                        >
                          Reset Calculator
                        </MDButton>
                        <MDButton
                          variant="text"
                          color="info"
                          size="small"
                          onClick={() => window.print()}
                        >
                          Print Results
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>

              {/* Benefits */}
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
                      Why Choose DriveCash?
                    </MDTypography>
                    <MDBox>
                      {[
                        '✓ No hidden fees beyond application fee',
                        '✓ Keep driving your vehicle',
                        '✓ Fast approval in minutes',
                        '✓ Fixed 15% interest rate',
                        '✓ Simple 30-day terms',
                        '✓ Up to 80% of vehicle value'
                      ].map((benefit, index) => (
                        <MDTypography
                          key={index}
                          variant="body2"
                          color="text"
                          sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
                        >
                          {benefit}
                        </MDTypography>
                      ))}
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Disclaimer */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <MDTypography variant="body2">
                <strong>Important:</strong> This calculator provides estimates for {settings.maxLoanTerm}-day
                title loans only. Interest rate is fixed at {settings.defaultInterestRate}%, title
                application fee is $33, and loan term is fixed at {settings.maxLoanTerm} days. Maximum
                loan amount is {formatCurrency(settings.maxLoanAmount)} or 80% of vehicle value,
                whichever is lower. Monthly servicing charge of 15% applies. Payment to extend loan
                is 10% of borrowed amount.
              </MDTypography>
            </Alert>
          </Grid>
        </Grid>

        <Footer />
      </MDBox>
    </DashboardLayout>
  );
}

export default Calculator;

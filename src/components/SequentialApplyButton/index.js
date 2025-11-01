import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FormContext } from "../../loanApp/context/FormContext";
import MDButton from "components/MDButton";

// Sequential Apply Button Component
export default function SequentialApplyButton({ 
  children, 
  variant = "gradient", 
  color = "success", 
  component = null,
  ...props 
}) {
  const { clearForm, createLoan, setActiveLoan } = useContext(FormContext);
  const navigate = useNavigate();

  const handleApplyClick = (e) => {
    e.preventDefault();

    // Start fresh application - clear any existing data
    clearForm && clearForm();

    // Create a new loan, set active, then navigate including loan id
    const id = createLoan ? createLoan({}) : null;
    if (id && setActiveLoan) setActiveLoan(id);
    if (id) {
      navigate(`/loan/apply/${id}/step-1`);
    } else {
      // Fallback to generic path
      navigate("/loan/apply/step-1");
    }
  };

  return (
    <MDButton
      component={component}
      variant={variant}
      color={color}
      onClick={handleApplyClick}
      {...props}
    >
      {children}
    </MDButton>
  );
}

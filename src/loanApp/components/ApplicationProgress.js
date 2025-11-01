import React, { useContext } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";

import { FormContext } from "../context/FormContext";

export default function ApplicationProgress() {
  const { getCompletionPercentage, isStepComplete } = useContext(FormContext);
  
  const steps = [
    { name: "Personal Information", key: "personal" },
    { name: "Income Details", key: "income" },
    { name: "Vehicle Information", key: "vehicle" },
    { name: "Photos & Documents", key: "photos" },
  ];

  const completionPercentage = getCompletionPercentage();

  return (
    <MDBox mb={3}>
      <MDTypography variant="h6" mb={2}>
        Application Progress ({completionPercentage}% Complete)
      </MDTypography>
      
      <MDProgress 
        value={completionPercentage} 
        color="info" 
        variant="gradient"
        label={false}
      />
      
      <MDBox mt={2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`p-3 rounded-lg border ${
                isStepComplete(step.key)
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}
            >
              <div className="flex items-center space-x-2">
                {isStepComplete(step.key) ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : (
                  <span className="text-gray-400">{index + 1}</span>
                )}
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            </div>
          ))}
        </div>
      </MDBox>
    </MDBox>
  );
}

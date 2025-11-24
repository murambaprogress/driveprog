

import React, { useState, useEffect, useCallback } from 'react';
import { saveFormProgress, loadFormProgress, saveUploadedDocument, loadUploadedDocuments } from '../utils/formPersistence';



type FormData = {
  loanAmount: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  socialSecurity: string;
  identificationType: string;
  idIssuingAgency: string;
  identificationNo: string;
  dateOfBirth: string;
  banksName: string;
  homeStreetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  incomeSource: string;
  employmentLength: string;
  grossMonthlyIncome: string;
  payFrequency: string;
  nextPayDate: string;
  lastPayDate: string;
  activeBankruptcy: string;
  directDeposit: string;
  coappIdentificationNo: string;
  coappDateOfBirth: string;
  militaryStatus: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleVIN: string;
  vehicleMileage: string;
  vehicleColor: string;
  licensePlate: string;
  registrationState: string;
};

type UploadedDoc = { id: string; name: string; uploaded: string; status: string; type?: string };

const steps = [
  'Personal',
  'Income',
  'Vehicle',
  'Pictures Required',
];

const initialFormData: FormData = {
  loanAmount: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  socialSecurity: '',
  identificationType: '',
  idIssuingAgency: '',
  identificationNo: '',
  dateOfBirth: '',
  banksName: '',
  homeStreetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  incomeSource: '',
  employmentLength: '',
  grossMonthlyIncome: '',
  payFrequency: '',
  nextPayDate: '',
  lastPayDate: '',
  activeBankruptcy: '',
  directDeposit: '',
  coappIdentificationNo: '',
  coappDateOfBirth: '',
  militaryStatus: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleVIN: '',
  vehicleMileage: '',
  vehicleColor: '',
  licensePlate: '',
  registrationState: '',
};


// Stepper UI
const Stepper: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center mb-8 gap-2">
    {steps.map((label, idx) => (
      <div key={label} className="flex items-center">
        <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-sm ${
          idx === step ? 'bg-drivecash-primary' : idx < step ? 'bg-drivecash-accent' : 'bg-gray-300'
        }`}>
          {idx + 1}
        </div>
  <div className={`ml-2 mr-4 font-semibold ${idx === step ? 'text-drivecash-primary' : 'text-gray-500'}`}>{label}</div>
        {idx < steps.length - 1 && <div className="w-8 h-1 bg-gray-300 rounded-full" />}
      </div>
    ))}
  </div>
);

// Placeholder components for steps not yet implemented
const VehicleInfo: React.FC = () => null;
const PicturesRequired: React.FC = () => null;

// Step 1: Personal Information
const PersonalInfo: React.FC<{
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBack: (e: React.FormEvent) => void;
  handleNext: (e: React.FormEvent) => void;
}> = ({ formData, handleInputChange, handleBack, handleNext }) => (
  <form onSubmit={handleNext} className="space-y-8">
  <h3 className="text-2xl font-semibold text-drivecash-primary mb-6">Personal Information</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">How much do you want to borrow</label>
  <input type="number" name="loanAmount" value={formData.loanAmount || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Amount" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">First Name</label>
  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter First Name" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Last Name</label>
  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Last Name" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Email Address</label>
  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Email Address" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Social Security No</label>
  <input type="text" name="socialSecurity" value={formData.socialSecurity || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Social Security No" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Identification Type</label>
  <select name="identificationType" value={formData.identificationType || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg">
          <option value="">Select Identification Type</option>
          <option value="Driver License">Driver License</option>
          <option value="Passport">Passport</option>
          <option value="State ID">State ID</option>
        </select>
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Phone No</label>
  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Phone No" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">ID Issuing Agency</label>
  <select name="idIssuingAgency" value={formData.idIssuingAgency || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg">
          <option value="">Select ID Issuing Agency</option>
          <option value="DMV">DMV</option>
          <option value="SSA">SSA</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Identification No</label>
  <input type="text" name="identificationNo" value={formData.identificationNo || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Identification No" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Date of Birth</label>
  <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Banks Name</label>
  <input type="text" name="banksName" value={formData.banksName || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Banks Name" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Home Street Address</label>
  <input type="text" name="homeStreetAddress" value={formData.homeStreetAddress || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Home Street Address" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Select Your City</label>
  <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Select Your City" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Select Your State</label>
  <input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Select Your State" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">zip code</label>
  <input type="text" name="zipCode" value={formData.zipCode || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter zip code" />
      </div>
    </div>
    <div className="flex justify-between mt-8">
      <button type="button" onClick={handleBack} className="px-6 py-2 border-2 border-drivecash-primary text-drivecash-primary font-bold rounded-full hover:bg-drivecash-primary hover:text-white transition-colors">Back</button>
      <button type="submit" className="px-6 py-2 border-2 border-drivecash-primary bg-drivecash-primary text-white font-bold rounded-full hover:bg-drivecash-accent transition-colors">Next</button>
    </div>
    <div className="mt-8">
      <span className="text-red-600 font-bold">Note*</span>
      <p className="text-xs text-gray-600 mt-1">Under personal information add email address Add disclosure-- You authorize CashTitle and its affiliates to contact you by email using the email address you give above for business purposes and the marketing of products and services. Please provide a phone number and email address that is personal to you, not a shared work or phone number or email address.</p>
    </div>
  </form>
);

// Step 2: Income Information
const IncomeInfo: React.FC<{
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedDocs: UploadedDoc[];
  handleBack: (e: React.FormEvent) => void;
  handleNext: (e: React.FormEvent) => void;
}> = ({ formData, handleInputChange, handleFileUpload, uploadedDocs, handleBack, handleNext }) => (
  <form onSubmit={handleNext} className="space-y-8">
  <h3 className="text-2xl font-semibold text-drivecash-primary mb-6">Income Information</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Income Source</label>
  <input type="text" name="incomeSource" value={formData.incomeSource} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Employer/Income Source" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">How long have you been employed</label>
  <input type="date" name="employmentLength" value={formData.employmentLength} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Total gross monthly income?</label>
  <input type="number" name="grossMonthlyIncome" value={formData.grossMonthlyIncome} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Amount" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">How often are you paid?</label>
  <input type="text" name="payFrequency" value={formData.payFrequency} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Amount" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Next pay Date?</label>
  <input type="date" name="nextPayDate" value={formData.nextPayDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Last pay Date?</label>
  <input type="date" name="lastPayDate" value={formData.lastPayDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" />
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Are you in Active Bankruptcy?</label>
  <select name="activeBankruptcy" value={formData.activeBankruptcy} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg">
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div>
  <label className="block text-sm font-medium text-drivecash-dark mb-2">Do you have Direct Deposit? (Yes / No)</label>
  <select name="directDeposit" value={formData.directDeposit} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg">
          <option value="">Option to Choose One</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div>
          <label className="block text-sm font-medium text-drivecash-dark mb-2">Identification No</label>
          <input type="text" name="coappIdentificationNo" value={formData.coappIdentificationNo} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" placeholder="Enter Identification No" />
      </div>
      <div>
          <label className="block text-sm font-medium text-drivecash-dark mb-2">Date of Birth</label>
          <input type="date" name="coappDateOfBirth" value={formData.coappDateOfBirth} onChange={handleInputChange} className="w-full px-4 py-3 border border-drivecash-accent/30 rounded-lg" />
      </div>
    </div>
    <div className="mt-8">
      <div className="font-semibold mb-2">Please select one of the following :</div>
      <div className="flex flex-col gap-2">
        <div>
          <label className="block text-sm font-medium text-drivecash-dark mb-2">VIN Plate/Sticker</label>
          <input type="file" name="photoVIN" accept="image/*" className="w-full px-4 py-2 border border-drivecash-accent/30 rounded-lg bg-white" onChange={handleFileUpload} />
        </div>
        <div>
          <label className="block text-sm font-medium text-drivecash-dark mb-2">Driver's License (front)</label>
          <input type="file" name="photoLicense" accept="image/*" className="w-full px-4 py-2 border border-drivecash-accent/30 rounded-lg bg-white" onChange={handleFileUpload} />
        </div>
        <div>
          <label className="block text-sm font-medium text-drivecash-dark mb-2">Proof of Insurance</label>
          <input type="file" name="photoInsurance" accept="image/*" className="w-full px-4 py-2 border border-drivecash-accent/30 rounded-lg bg-white" onChange={handleFileUpload} />
        </div>
      </div>
    </div>
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-2">Uploaded Documents</h4>
        <ul className="list-disc pl-6 space-y-1">
          {uploadedDocs.map(doc => (
            <li key={doc.id} className="text-drivecash-dark">{doc.name} <span className="text-xs text-gray-500">({doc.status})</span></li>
          ))}
        </ul>
      </div>
    <div className="flex justify-between mt-8">
  <button type="button" onClick={handleBack} className="px-6 py-2 border-2 border-drivecash-primary text-drivecash-primary font-bold rounded-full hover:bg-drivecash-primary hover:text-white transition-colors">Back</button>
  <button type="submit" className="px-6 py-2 border-2 border-drivecash-primary bg-drivecash-primary text-white font-bold rounded-full hover:bg-drivecash-accent transition-colors">Next</button>
    </div>
  </form>
);

// Step 5: Review & Submit
const ReviewSubmit: React.FC<{
  formData: FormData;
  handleBack: (e: React.FormEvent) => void;
  handleSubmit: (e: React.FormEvent) => void;
  submitStatus: 'idle' | 'loading' | 'success' | 'error';
  submitMessage: string;
}> = ({ formData, handleBack, handleSubmit, submitStatus, submitMessage }) => (
  <form onSubmit={handleSubmit} className="space-y-8">
    <h3 className="text-2xl font-semibold text-drivecash-primary mb-6">Review & Submit</h3>
    <div className="bg-drivecash-light rounded-xl p-6 border border-drivecash-accent/20">
      <h4 className="text-lg font-bold mb-4 text-drivecash-primary">Please review your information before submitting:</h4>
      <div className="grid md:grid-cols-3 gap-6 text-drivecash-dark">
        <div>
          <div className="mb-2 font-bold text-drivecash-primary">Personal Info</div>
          <div className="mb-2"><span className="font-semibold">Loan Amount:</span> {formData.loanAmount}</div>
          <div className="mb-2"><span className="font-semibold">First Name:</span> {formData.firstName}</div>
          <div className="mb-2"><span className="font-semibold">Last Name:</span> {formData.lastName}</div>
          <div className="mb-2"><span className="font-semibold">Email:</span> {formData.email}</div>
          <div className="mb-2"><span className="font-semibold">Phone:</span> {formData.phone}</div>
          <div className="mb-2"><span className="font-semibold">Social Security:</span> {formData.socialSecurity}</div>
          <div className="mb-2"><span className="font-semibold">Identification Type:</span> {formData.identificationType}</div>
          <div className="mb-2"><span className="font-semibold">ID Issuing Agency:</span> {formData.idIssuingAgency}</div>
          <div className="mb-2"><span className="font-semibold">Identification No:</span> {formData.identificationNo}</div>
          <div className="mb-2"><span className="font-semibold">Date of Birth:</span> {formData.dateOfBirth}</div>
          <div className="mb-2"><span className="font-semibold">Banks Name:</span> {formData.banksName}</div>
          <div className="mb-2"><span className="font-semibold">Home Street Address:</span> {formData.homeStreetAddress}</div>
          <div className="mb-2"><span className="font-semibold">City:</span> {formData.city}</div>
          <div className="mb-2"><span className="font-semibold">State:</span> {formData.state}</div>
          <div className="mb-2"><span className="font-semibold">Zip Code:</span> {formData.zipCode}</div>
        </div>
        <div>
          <div className="mb-2 font-bold text-drivecash-primary">Income & Military</div>
          <div className="mb-2"><span className="font-semibold">Income Source:</span> {formData.incomeSource}</div>
          <div className="mb-2"><span className="font-semibold">Employment Length:</span> {formData.employmentLength}</div>
          <div className="mb-2"><span className="font-semibold">Gross Monthly Income:</span> {formData.grossMonthlyIncome}</div>
          <div className="mb-2"><span className="font-semibold">Pay Frequency:</span> {formData.payFrequency}</div>
          <div className="mb-2"><span className="font-semibold">Next Pay Date:</span> {formData.nextPayDate}</div>
          <div className="mb-2"><span className="font-semibold">Last Pay Date:</span> {formData.lastPayDate}</div>
          <div className="mb-2"><span className="font-semibold">Active Bankruptcy:</span> {formData.activeBankruptcy}</div>
          <div className="mb-2"><span className="font-semibold">Direct Deposit:</span> {formData.directDeposit}</div>
          <div className="mb-2"><span className="font-semibold">Coapp Identification No:</span> {formData.coappIdentificationNo}</div>
          <div className="mb-2"><span className="font-semibold">Coapp Date of Birth:</span> {formData.coappDateOfBirth}</div>
          <div className="mb-2"><span className="font-semibold">Military Status:</span> {formData.militaryStatus}</div>
        </div>
        <div>
          <div className="mb-2 font-bold text-drivecash-primary">Vehicle Info</div>
          <div className="mb-2"><span className="font-semibold">Vehicle Year:</span> {formData.vehicleYear}</div>
          <div className="mb-2"><span className="font-semibold">Vehicle Make:</span> {formData.vehicleMake}</div>
          <div className="mb-2"><span className="font-semibold">Vehicle Model:</span> {formData.vehicleModel}</div>
          <div className="mb-2"><span className="font-semibold">Vehicle VIN:</span> {formData.vehicleVIN}</div>
          <div className="mb-2"><span className="font-semibold">Vehicle Mileage:</span> {formData.vehicleMileage}</div>
          <div className="mb-2"><span className="font-semibold">Vehicle Color:</span> {formData.vehicleColor}</div>
          <div className="mb-2"><span className="font-semibold">License Plate:</span> {formData.licensePlate}</div>
          <div className="mb-2"><span className="font-semibold">Registration State:</span> {formData.registrationState}</div>
        </div>
      </div>
    </div>
    {submitStatus === 'error' && (
      <div className="text-red-600 font-bold text-center">{submitMessage}</div>
    )}
    {submitStatus === 'success' && (
      <div className="text-green-600 font-bold text-center">{submitMessage}</div>
    )}
    <div className="flex justify-between mt-8">
  <button type="button" onClick={handleBack} className="px-6 py-2 border-2 border-drivecash-primary text-drivecash-primary font-bold rounded-full hover:bg-drivecash-primary hover:text-white transition-colors">Back</button>
  <button type="submit" className="px-6 py-2 border-2 border-drivecash-primary bg-drivecash-primary text-white font-bold rounded-full hover:bg-drivecash-accent transition-colors" disabled={submitStatus==='loading'}>
        {submitStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
      </button>
    </div>
  </form>
);

const ApplicationForm: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadFormProgress();
    if (saved) setFormData({ ...initialFormData, ...saved });
    setUploadedDocs(loadUploadedDocuments());
  }, []);

  // Auto-save progress on formData change
  useEffect(() => {
    saveFormProgress(formData);
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setSubmitMessage('');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setSubmitMessage('Your application has been submitted successfully!');
      // Optionally reset form or close modal here
      // setFormData(initialFormData);
      // setStep(0);
  } catch {
      setSubmitStatus('error');
      setSubmitMessage('There was an error submitting your application. Please try again.');
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  // Handle file uploads and store in uploadedDocs
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const doc = {
        id: `${name}_${Date.now()}`,
        name: file.name,
        uploaded: new Date().toISOString(),
        status: 'Pending',
        type: file.type,
      };
      saveUploadedDocument(doc);
      setUploadedDocs(loadUploadedDocuments());
    }
  }, []);

  const handleNext = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, []);

  const handleBack = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <section id="apply" className="py-20 bg-drivecash-light scroll-mt-16 md:scroll-mt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Stepper step={step} />
  <div className="bg-drivecash-white rounded-2xl shadow-2xl p-8 lg:p-12 border border-drivecash-light animate-fade-in-up">
          {step === 0 && (
            <PersonalInfo
              formData={formData}
              handleInputChange={handleInputChange}
              handleBack={handleBack}
              handleNext={handleNext}
            />
          )}
          {step === 1 && (
            <IncomeInfo
              formData={formData}
              handleInputChange={handleInputChange}
              handleFileUpload={handleFileUpload}
              uploadedDocs={uploadedDocs}
              handleBack={handleBack}
              handleNext={handleNext}
            />
          )}
          {step === 2 && <VehicleInfo />}
          {step === 3 && <PicturesRequired />}
          {step === 4 && (
            <ReviewSubmit
              formData={formData}
              handleBack={handleBack}
              handleSubmit={handleSubmit}
              submitStatus={submitStatus}
              submitMessage={submitMessage}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ApplicationForm;
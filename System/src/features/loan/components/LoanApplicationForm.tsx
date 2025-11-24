import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanApplicationSchema, type LoanApplicationFormData } from '../../../utils/validation';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

interface LoanApplicationFormProps {
  onSubmit: (data: LoanApplicationFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string;
  submitSuccess?: boolean;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  onSubmit,
  isSubmitting = false,
  submitError,
  submitSuccess = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      amount: 10000,
      term: 12,
      purpose: '',
      income: 50000,
      employmentStatus: 'employed',
      employmentLength: 1,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      creditScore: 700,
      acceptTerms: false,
    },
  });

  const handleFormSubmit = async (data: LoanApplicationFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch {
      // Error handling is done via the submitError prop
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Application</h2>
      <p className="text-gray-600 mb-6">Fill out the form below to apply for a loan.</p>
      
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Application submitted</h3>
            <p className="text-green-700 text-sm">Your loan application has been received and will be reviewed shortly.</p>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">There was a problem</h3>
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className={`w-full px-4 py-2 border ${
                  errors.firstName ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className={`w-full px-4 py-2 border ${
                  errors.lastName ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-2 border ${
                  errors.email ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className={`w-full px-4 py-2 border ${
                  errors.phone ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                placeholder="(123) 456-7890"
                {...register('phone')}
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="dob" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                className={`w-full px-4 py-2 border ${
                  errors.dob ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.dob ? 'true' : 'false'}
                aria-describedby={errors.dob ? 'dob-error' : undefined}
                {...register('dob')}
              />
              {errors.dob && (
                <p id="dob-error" className="mt-1 text-sm text-red-600">
                  {errors.dob.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="amount" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Loan Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                className={`w-full px-4 py-2 border ${
                  errors.amount ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.amount ? 'true' : 'false'}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                min="1000"
                max="100000"
                step="500"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p id="amount-error" className="mt-1 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="term" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Loan Term (months)
              </label>
              <select
                id="term"
                className={`w-full px-4 py-2 border ${
                  errors.term ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.term ? 'true' : 'false'}
                aria-describedby={errors.term ? 'term-error' : undefined}
                {...register('term', { valueAsNumber: true })}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
                <option value={48}>48 months</option>
                <option value={60}>60 months</option>
                <option value={72}>72 months</option>
              </select>
              {errors.term && (
                <p id="term-error" className="mt-1 text-sm text-red-600">
                  {errors.term.message}
                </p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label 
                htmlFor="purpose" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Loan Purpose
              </label>
              <select
                id="purpose"
                className={`w-full px-4 py-2 border ${
                  errors.purpose ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.purpose ? 'true' : 'false'}
                aria-describedby={errors.purpose ? 'purpose-error' : undefined}
                {...register('purpose')}
              >
                <option value="">Select a purpose</option>
                <option value="Home improvement">Home improvement</option>
                <option value="Debt consolidation">Debt consolidation</option>
                <option value="Business expansion">Business expansion</option>
                <option value="Education">Education</option>
                <option value="Medical expenses">Medical expenses</option>
                <option value="Vehicle purchase">Vehicle purchase</option>
                <option value="Wedding expenses">Wedding expenses</option>
                <option value="Other">Other</option>
              </select>
              {errors.purpose && (
                <p id="purpose-error" className="mt-1 text-sm text-red-600">
                  {errors.purpose.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="income" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Annual Income ($)
              </label>
              <input
                id="income"
                type="number"
                className={`w-full px-4 py-2 border ${
                  errors.income ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.income ? 'true' : 'false'}
                aria-describedby={errors.income ? 'income-error' : undefined}
                min="20000"
                step="1000"
                {...register('income', { valueAsNumber: true })}
              />
              {errors.income && (
                <p id="income-error" className="mt-1 text-sm text-red-600">
                  {errors.income.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="employmentStatus" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Employment Status
              </label>
              <select
                id="employmentStatus"
                className={`w-full px-4 py-2 border ${
                  errors.employmentStatus ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.employmentStatus ? 'true' : 'false'}
                aria-describedby={errors.employmentStatus ? 'employmentStatus-error' : undefined}
                {...register('employmentStatus')}
              >
                <option value="employed">Employed</option>
                <option value="self-employed">Self-employed</option>
                <option value="retired">Retired</option>
                <option value="unemployed">Unemployed</option>
              </select>
              {errors.employmentStatus && (
                <p id="employmentStatus-error" className="mt-1 text-sm text-red-600">
                  {errors.employmentStatus.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="employmentLength" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Years at Current Employment
              </label>
              <input
                id="employmentLength"
                type="number"
                className={`w-full px-4 py-2 border ${
                  errors.employmentLength ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.employmentLength ? 'true' : 'false'}
                aria-describedby={errors.employmentLength ? 'employmentLength-error' : undefined}
                min="0"
                step="0.5"
                {...register('employmentLength', { valueAsNumber: true })}
              />
              {errors.employmentLength && (
                <p id="employmentLength-error" className="mt-1 text-sm text-red-600">
                  {errors.employmentLength.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="creditScore" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Credit Score (estimated)
              </label>
              <input
                id="creditScore"
                type="number"
                className={`w-full px-4 py-2 border ${
                  errors.creditScore ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.creditScore ? 'true' : 'false'}
                aria-describedby={errors.creditScore ? 'creditScore-error' : undefined}
                min="300"
                max="850"
                {...register('creditScore', { valueAsNumber: true })}
              />
              {errors.creditScore && (
                <p id="creditScore-error" className="mt-1 text-sm text-red-600">
                  {errors.creditScore.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label 
                htmlFor="street" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street Address
              </label>
              <input
                id="street"
                type="text"
                className={`w-full px-4 py-2 border ${
                  errors.address?.street ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.address?.street ? 'true' : 'false'}
                aria-describedby={errors.address?.street ? 'street-error' : undefined}
                {...register('address.street')}
              />
              {errors.address?.street && (
                <p id="street-error" className="mt-1 text-sm text-red-600">
                  {errors.address.street.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="city" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                className={`w-full px-4 py-2 border ${
                  errors.address?.city ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.address?.city ? 'true' : 'false'}
                aria-describedby={errors.address?.city ? 'city-error' : undefined}
                {...register('address.city')}
              />
              {errors.address?.city && (
                <p id="city-error" className="mt-1 text-sm text-red-600">
                  {errors.address.city.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="state" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>
              <input
                id="state"
                type="text"
                className={`w-full px-4 py-2 border ${
                  errors.address?.state ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.address?.state ? 'true' : 'false'}
                aria-describedby={errors.address?.state ? 'state-error' : undefined}
                {...register('address.state')}
              />
              {errors.address?.state && (
                <p id="state-error" className="mt-1 text-sm text-red-600">
                  {errors.address.state.message}
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="zipCode" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Zip Code
              </label>
              <input
                id="zipCode"
                type="text"
                className={`w-full px-4 py-2 border ${
                  errors.address?.zipCode ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.address?.zipCode ? 'true' : 'false'}
                aria-describedby={errors.address?.zipCode ? 'zipCode-error' : undefined}
                {...register('address.zipCode')}
              />
              {errors.address?.zipCode && (
                <p id="zipCode-error" className="mt-1 text-sm text-red-600">
                  {errors.address.zipCode.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                type="checkbox"
                className={`w-4 h-4 border ${
                  errors.acceptTerms ? 'border-red-300 ring-red-300' : 'border-gray-300'
                } rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={errors.acceptTerms ? 'true' : 'false'}
                aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined}
                {...register('acceptTerms')}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="text-gray-700">
                I agree to the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a> and <a href="#" className="text-blue-600 hover:underline">privacy policy</a>
              </label>
              {errors.acceptTerms && (
                <p id="acceptTerms-error" className="mt-1 text-sm text-red-600">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-3 ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center text-lg`}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplicationForm;

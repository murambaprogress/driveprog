/**
 * Enhanced Loan Application API Service
 * Handles comprehensive data capture and submission to Django backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class LoanApplicationService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  /**
   * Get authorization headers
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  /**
   * Create a new draft loan application
   * Allows creation without authentication for guest users
   * @param {object} initialData - Initial loan data
   * @returns {Promise<object>} Created application with ID
   */
  async createDraftApplication(initialData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/applications/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          status: 'draft',
          is_draft: true,
          amount: initialData.amount || 10000,
          term: initialData.term || 36,
          raw_form_data: {
            created_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
            initial_data: initialData
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create application: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating draft application:', error);
      throw error;
    }
  }

  /**
   * Save personal information step
   * @param {string} applicationId - Application UUID
   * @param {object} personalData - Personal information data
   * @returns {Promise<object>} Updated application
   */
  async savePersonalInformation(applicationId, personalData) {
    try {
      // Transform frontend data to backend format
      const backendData = {
        personal_info: {
          first_name: personalData.firstName,
          last_name: personalData.lastName,
          email: personalData.email,
          phone: personalData.phone,
          dob: personalData.dateOfBirth,
          social_security: personalData.socialSecurity?.replace(/\D/g, ''), // Remove formatting
          banks_name: personalData.bankName
        },
        identification_info: {
          identification_type: personalData.identificationType,
          identification_no: personalData.identificationNumber,
          id_issuing_agency: personalData.idIssuingState
        },
        address: {
          street: personalData.streetAddress + (personalData.addressLine2 ? ` ${personalData.addressLine2}` : ''),
          city: personalData.city,
          state: personalData.state,
          zip_code: personalData.zipCode
        },
        raw_form_data: {
          personal_step: {
            ...personalData,
            completed_at: new Date().toISOString(),
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent
          }
        }
      };

      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        throw new Error(`Failed to save personal information: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving personal information:', error);
      throw error;
    }
  }

  /**
   * Save income and employment information
   * @param {string} applicationId - Application UUID
   * @param {object} incomeData - Income and employment data
   * @returns {Promise<object>} Updated application
   */
  async saveIncomeInformation(applicationId, incomeData) {
    try {
      const backendData = {
        financial_profile: {
          income: parseFloat(incomeData.annualIncome || 0),
          employment_status: incomeData.employmentStatus,
          employment_length: parseFloat(incomeData.employmentLength || 0),
          income_source: incomeData.employer,
          gross_monthly_income: parseFloat(incomeData.monthlyIncome || 0),
          pay_frequency: incomeData.payFrequency,
          next_pay_date: incomeData.nextPayDate,
          last_pay_date: incomeData.lastPayDate,
          active_bankruptcy: incomeData.activeBankruptcy ? 'Yes' : 'No',
          direct_deposit: incomeData.directDeposit ? 'Yes' : 'No',
          military_status: incomeData.militaryStatus
        },
        raw_form_data: {
          income_step: {
            ...incomeData,
            completed_at: new Date().toISOString(),
            calculated_dti: this.calculateDebtToIncome(incomeData),
            user_agent: navigator.userAgent
          }
        }
      };

      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        throw new Error(`Failed to save income information: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving income information:', error);
      throw error;
    }
  }

  /**
   * Save vehicle information
   * @param {string} applicationId - Application UUID
   * @param {object} vehicleData - Vehicle information data
   * @returns {Promise<object>} Updated application
   */
  async saveVehicleInformation(applicationId, vehicleData) {
    try {
      const backendData = {
        vehicle_info: {
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          vin: vehicleData.vin,
          mileage: parseInt(vehicleData.mileage || 0),
          color: vehicleData.color,
          license_plate: vehicleData.licensePlate,
          registration_state: vehicleData.registrationState
        },
        // Store additional vehicle details in raw data
        raw_form_data: {
          vehicle_step: {
            ...vehicleData,
            completed_at: new Date().toISOString(),
            estimated_value: vehicleData.estimatedValue,
            loan_amount_requested: vehicleData.loanAmount,
            user_agent: navigator.userAgent
          }
        }
      };

      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        throw new Error(`Failed to save vehicle information: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving vehicle information:', error);
      throw error;
    }
  }

  /**
   * Upload document/photo with comprehensive metadata
   * @param {string} applicationId - Application UUID
   * @param {object} file - File object or data URL
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Upload response
   */
  async uploadDocument(applicationId, file, metadata = {}) {
    try {
      const formData = new FormData();
      
      // Convert data URL to blob if necessary
      let fileToUpload = file;
      if (typeof file === 'string' && file.startsWith('data:')) {
        fileToUpload = this.dataURLtoFile(file, metadata.filename || 'upload.jpg');
      }

      formData.append('file', fileToUpload);
      formData.append('document_type', metadata.category || 'other');
      formData.append('title', metadata.title || fileToUpload.name);
      formData.append('description', metadata.description || '');
      
      // Add comprehensive metadata
      const uploadMetadata = {
        upload_timestamp: new Date().toISOString(),
        file_size: fileToUpload.size,
        mime_type: fileToUpload.type,
        original_filename: fileToUpload.name,
        category: metadata.category,
        device_info: {
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        ...metadata
      };

      formData.append('metadata', JSON.stringify(uploadMetadata));

      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/upload_document/`, {
        method: 'POST',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Submit completed application for review
   * @param {string} applicationId - Application UUID
   * @param {object} finalData - Final submission data
   * @returns {Promise<object>} Submission response
   */
  async submitApplication(applicationId, finalData = {}) {
    try {
      const submissionData = {
        status: 'pending',
        is_draft: false,
        raw_form_data: {
          submission: {
            submitted_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ip_address: await this.getClientIP(),
            final_review_data: finalData,
            submission_method: 'web_application'
          }
        }
      };

      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/submit/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit application: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Unsubmit a loan application, changing its status back to draft for editing.
   * @param {string} applicationId - Application UUID
   * @returns {Promise<object>} Updated application
   */
  async unsubmitApplication(applicationId) {
    try {
      const unsubmissionData = {
        status: 'draft',
        is_draft: true,
        raw_form_data: {
          unsubmission: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ip_address: await this.getClientIP(),
            action: 'unsubmitted_by_user'
          }
        }
      };

      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(unsubmissionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to unsubmit application: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error unsubmitting application:', error);
      throw error;
    }
  }

  /**
   * Get application details with all related data
   * @param {string} applicationId - Application UUID
   * @returns {Promise<object>} Complete application data
   */
  async getApplicationDetails(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get application: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting application details:', error);
      throw error;
    }
  }

  /**
   * Get loan status
   * @param {string} applicationId - Application UUID
   * @returns {Promise<string>} Loan status
   */
  async getLoanStatus(applicationId) {
   try {
     const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/status/`, {
       headers: this.getHeaders()
     });

     if (!response.ok) {
       throw new Error(`Failed to get loan status: ${response.status}`);
     }

     const data = await response.json();
     return data.status;
   } catch (error) {
     console.error('Error getting loan status:', error);
     throw error;
   }
 }

  /**
   * Auto-save draft data periodically
   * @param {string} applicationId - Application UUID
   * @param {object} draftData - Current form data
   * @returns {Promise<object>} Save response
   */
  async autoSaveDraft(applicationId, draftData) {
    try {
      const saveData = {
        raw_form_data: {
          auto_save: {
            timestamp: new Date().toISOString(),
            data: draftData,
            user_agent: navigator.userAgent
          }
        }
      };

      const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        throw new Error(`Failed to auto-save: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error auto-saving draft:', error);
      // Don't throw error for auto-save failures
      return null;
    }
  }

  // Helper methods

  /**
   * Convert data URL to File object
   */
  dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Calculate debt-to-income ratio
   */
  calculateDebtToIncome(incomeData) {
    const monthlyIncome = parseFloat(incomeData.monthlyIncome || 0);
    const monthlyDebts = parseFloat(incomeData.monthlyDebtPayments || 0);
    return monthlyIncome > 0 ? (monthlyDebts / monthlyIncome) * 100 : 0;
  }

  /**
   * Get client IP address (approximate)
   */
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Validate VIN number
   */
  validateVIN(vin) {
    if (!vin) return false;
    const cleanVIN = vin.replace(/\s/g, '').toUpperCase();
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVIN);
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Export singleton instance
export default new LoanApplicationService();
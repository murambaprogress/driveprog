import React, { createContext, useReducer, useEffect, useRef, useContext } from "react";
import { putLoan } from "../api/loans";

/**
 * JSDoc types
 * @typedef {Object} Upload
 * @property {string} id
 * @property {'vehicle'|'identity'|'income'|'other'} kind
 * @property {string} filename
 * @property {string} mimeType
 * @property {number} size
 * @property {string} [url]
 *
 * @typedef {Object} Vehicle
 * @property {string} id
 * @property {string} vin
 * @property {string} year
 * @property {string} make
 * @property {string} model
 * @property {Upload[]} photos
 *
 * @typedef {Object} Loan
 * @property {string} id
 * @property {'draft'|'pending'|'approved'|'declined'|'query'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {Object} personal
 * @property {Object} income
 * @property {Vehicle[]} vehicles
 * @property {Upload[]} documents
 * @property {Record<string,boolean>} stepCompletion
 *
 * @typedef {Object} State
 * @property {string|null} activeLoanId
 * @property {Record<string,Loan>} loans
 */

export const FormContext = createContext(null);

// Load initial state from localStorage synchronously
function getInitialState() {
  try {
    const raw = localStorage.getItem('multiLoanDraft');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.loans) {
        console.log('Initializing state from localStorage:', {
          loanCount: Object.keys(parsed.loans).length,
          loanIds: Object.keys(parsed.loans),
          activeLoanId: parsed.activeLoanId
        });
        
        // Validate that activeLoanId exists in loans
        if (parsed.activeLoanId && !parsed.loans[parsed.activeLoanId]) {
          console.warn('Active loan ID not found in loans, clearing localStorage to prevent issues');
          localStorage.removeItem('multiLoanDraft');
          return {
            activeLoanId: null,
            loans: {},
          };
        }
        
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load initial state from localStorage', e);
  }
  console.log('Starting with empty loan state');
  return {
    activeLoanId: null,
    loans: {},
  };
}

const initialState = getInitialState();

const STEP_KEYS = ["personal", "income", "vehicle", "condition", "photos", "review", "submit"];

function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).slice(2,9)}`;
}

export function reducer(state, action) {
  console.log('Reducer action:', action.type, action.payload);
  switch (action.type) {
    case 'CREATE_LOAN': {
      const id = action.payload.id || generateId('loan_');
      const now = new Date().toISOString();
      const loan = {
        id,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        personal: action.payload.personal || {},
        income: action.payload.income || {},
        vehicle: action.payload.vehicle || {},
        vehicles: action.payload.vehicles || [],
        documents: action.payload.documents || [],
        photos: action.payload.photos || {},
        condition: action.payload.condition || {},
        coApplicant: action.payload.coApplicant || {},
        stepCompletion: action.payload.stepCompletion || {},
      };
      console.log('CREATE_LOAN - Creating loan:', loan);
      const newState = { ...state, loans: { ...state.loans, [id]: loan }, activeLoanId: id };
      console.log('CREATE_LOAN - New state loans:', Object.keys(newState.loans));
      return newState;
    }
    case 'SET_ACTIVE_LOAN':
      return { ...state, activeLoanId: action.payload };
    case 'UPDATE_LOAN_SECTION': {
      const { loanId, section, patch } = action.payload;
      const loan = state.loans[loanId];
      if (!loan) return state;
      const updated = { ...loan, [section]: { ...(loan[section] || {}), ...patch }, updatedAt: new Date().toISOString() };
      return { ...state, loans: { ...state.loans, [loanId]: updated } };
    }
    case 'ADD_VEHICLE': {
      const { loanId, vehicle } = action.payload;
      const loan = state.loans[loanId];
      if (!loan) return state;
      const v = { id: vehicle.id || generateId('veh_'), photos: [], ...vehicle };
      const updated = { ...loan, vehicles: [...(loan.vehicles || []), v], updatedAt: new Date().toISOString() };
      return { ...state, loans: { ...state.loans, [loanId]: updated } };
    }
    case 'UPDATE_VEHICLE': {
      const { loanId, vehicleId, patch } = action.payload;
      const loan = state.loans[loanId];
      if (!loan) return state;
      const vehicles = (loan.vehicles || []).map(v => v.id === vehicleId ? { ...v, ...patch } : v);
      const updated = { ...loan, vehicles, updatedAt: new Date().toISOString() };
      return { ...state, loans: { ...state.loans, [loanId]: updated } };
    }
    case 'REMOVE_VEHICLE': {
      const { loanId, vehicleId } = action.payload;
      const loan = state.loans[loanId];
      if (!loan) return state;
      const vehicles = (loan.vehicles || []).filter(v => v.id !== vehicleId);
      const updated = { ...loan, vehicles, updatedAt: new Date().toISOString() };
      return { ...state, loans: { ...state.loans, [loanId]: updated } };
    }
    case 'ADD_UPLOAD': {
      const { loanId, section, upload } = action.payload;
      const loan = state.loans[loanId];
      if (!loan) return state;
      const dest = section === 'vehicle' && upload.vehicleId ? loan.vehicles.map(v => v.id === upload.vehicleId ? { ...v, photos: [...(v.photos || []), upload] } : v) : null;
      let updated;
      if (dest) {
        updated = { ...loan, vehicles: dest, updatedAt: new Date().toISOString() };
      } else {
        updated = { ...loan, documents: [...(loan.documents || []), upload], updatedAt: new Date().toISOString() };
      }
      return { ...state, loans: { ...state.loans, [loanId]: updated } };
    }
    case 'REMOVE_UPLOAD': {
      const { loanId, uploadId } = action.payload;
      const loan = state.loans[loanId];
      if (!loan) return state;
      const vehicles = (loan.vehicles || []).map(v => ({ ...v, photos: (v.photos || []).filter(u => u.id !== uploadId) }));
      const documents = (loan.documents || []).filter(u => u.id !== uploadId);
      const updated = { ...loan, vehicles, documents, updatedAt: new Date().toISOString() };
      return { ...state, loans: { ...state.loans, [loanId]: updated } };
    }
    case 'SET_STEP_COMPLETION': {
      const { loanId, step, completed } = action.payload;
      console.log('SET_STEP_COMPLETION action:', { loanId, step, completed });
      const loan = state.loans[loanId];
      if (!loan) {
        console.warn('Loan not found for loanId:', loanId, 'Available loans:', Object.keys(state.loans));
        return state;
      }
      const stepCompletion = { ...(loan.stepCompletion || {}), [step]: completed };
      const updated = { ...loan, stepCompletion, updatedAt: new Date().toISOString() };
      console.log('Updated loan stepCompletion:', updated.stepCompletion);
      return { ...state, loans: { ...state.loans, [loanId]: updated } };
    }
    case 'DELETE_LOAN': {
      const { loanId } = action.payload;
      const loans = { ...state.loans };
      delete loans[loanId];
      const activeLoanId = state.activeLoanId === loanId ? null : state.activeLoanId;
      return { ...state, loans, activeLoanId };
    }
    case 'MERGE_LOAN_FIELDS': {
      const { loanId, patch } = action.payload;
      const loan = state.loans[loanId];
      if (!loan) return state;
      const updated = { ...loan, ...patch, updatedAt: new Date().toISOString() };
      return {
        ...state,
        loans: {
          ...state.loans,
          [loanId]: updated,
        },
      };
    }
    case 'HYDRATE_LOANS': {
      // Restore loans from localStorage, merging with any existing loans
      console.log('HYDRATE_LOANS action - restoring loans from storage');
      const { loans, activeLoanId } = action.payload;
      // Merge: existing loans take precedence over stored ones (in case new loans were created)
      const mergedLoans = { ...loans, ...state.loans };
      // Only set activeLoanId from storage if we don't have one set already
      const newActiveLoanId = state.activeLoanId || activeLoanId;
      console.log('HYDRATE_LOANS - Current loans:', Object.keys(state.loans), 'Restored loan IDs:', Object.keys(loans || {}), 'Merged:', Object.keys(mergedLoans), 'activeLoanId:', newActiveLoanId);
      return { 
        ...state, 
        loans: mergedLoans, 
        activeLoanId: newActiveLoanId
      };
    }
   case 'UPDATE_LOAN_STATUS': {
     const { loanId, status } = action.payload;
     const loan = state.loans[loanId];
     if (!loan) return state;
     const updated = { ...loan, status, updatedAt: new Date().toISOString() };
     return { ...state, loans: { ...state.loans, [loanId]: updated } };
   }
   default:
     return state;
  }
}

export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimer = useRef(null);

  // Autosave to localStorage immediately on state change
  useEffect(() => {
    try {
      localStorage.setItem('multiLoanDraft', JSON.stringify(state));
      console.log('State persisted to localStorage:', { 
        activeLoanId: state.activeLoanId, 
        loanCount: Object.keys(state.loans || {}).length,
        loanIds: Object.keys(state.loans || {})
      });
      
      // DISABLED: Auto-sync to backend on every change
      // The application will only be submitted when user clicks "Submit" on Review page
      // This prevents multiple unnecessary API calls during form filling
      
      // Old code (now disabled):
      // if (state.activeLoanId && state.loans[state.activeLoanId]) {
      //   const currentLoan = state.loans[state.activeLoanId];
      //   putLoan(currentLoan).then((result) => {
      //     if (result.ok && result.backendId && !currentLoan.backendId) {
      //       console.log('Loan saved to backend with ID:', result.backendId);
      //       dispatch({ 
      //         type: 'UPDATE_LOAN_SECTION', 
      //         payload: { 
      //           loanId: state.activeLoanId, 
      //           section: 'backendId', 
      //           patch: result.backendId 
      //         } 
      //       });
      //     }
      //   }).catch((e) => {
      //     console.log('Background sync skipped (backend not available)');
      //   });
      // }
    } catch (e) {
      console.error('Autosave failed', e);
    }
  }, [state]);

  // Migration helper: map legacy single formData to new loan model
  function migrateLegacy(legacy) {
    const id = generateId('loan_');
    dispatch({ type: 'CREATE_LOAN', payload: { id, personal: legacy.personal || {}, income: legacy.income || {} } });
    return id;
  }

  const api = {
    state,
    dispatch,
    isStepComplete: (step, loanId = state.activeLoanId) => {
      if (!step) return false;
      const id = loanId || state.activeLoanId;
      const availableLoans = Object.keys(state.loans);
      console.log('isStepComplete check:', { 
        step, 
        loanId, 
        id, 
        activeLoanId: state.activeLoanId, 
        availableLoans,
        lookingForLoan: id,
        actualLoanIds: availableLoans
      });
      
      // Log each loan to see what we have
      availableLoans.forEach(lId => {
        console.log(`Loan ${lId}:`, { hasStepCompletion: !!state.loans[lId].stepCompletion, steps: state.loans[lId].stepCompletion });
      });
      
      if (!id) {
        console.warn('isStepComplete: No loan ID available');
        return false;
      }
      const loan = state.loans[id];
      if (!loan || !loan.stepCompletion) {
        console.warn('isStepComplete: Loan not found or no stepCompletion:', { 
          id, 
          loanExists: !!loan, 
          stepCompletion: loan?.stepCompletion,
          allLoanIds: availableLoans,
          allLoansDetailed: Object.entries(state.loans).map(([k, v]) => ({ id: k, hasPersonal: !!v.personal }))
        });
        return false;
      }
      const result = Boolean(loan.stepCompletion[step]);
      console.log(`isStepComplete result for ${step}:`, result);
      return result;
    },
    getCompletionPercentage: (loanId = state.activeLoanId) => {
      const id = loanId || state.activeLoanId;
      if (!id) return 0;
      const loan = state.loans[id];
      if (!loan || !loan.stepCompletion) return 0;
      const completed = STEP_KEYS.filter((step) => loan.stepCompletion[step]).length;
      if (STEP_KEYS.length === 0) return 0;
      return Math.round((completed / STEP_KEYS.length) * 100);
    },
    createLoan: (payload = {}) => {
      const id = payload.id || generateId('loan_');
      console.log('createLoan called with id:', id, 'payload:', payload);

      // Dispatch to reducer - state will auto-persist via useEffect
      dispatch({ type: 'CREATE_LOAN', payload: { ...payload, id } });
      console.log('CREATE_LOAN dispatched for', id);

      return id;
    },
    setActiveLoan: (id) => dispatch({ type: 'SET_ACTIVE_LOAN', payload: id }),
    updateLoanSection: ({ loanId, section, patch }) => dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section, patch } }),
    addVehicle: ({ loanId, vehicle }) => dispatch({ type: 'ADD_VEHICLE', payload: { loanId, vehicle } }),
    updateVehicle: ({ loanId, vehicleId, patch }) => dispatch({ type: 'UPDATE_VEHICLE', payload: { loanId, vehicleId, patch } }),
    removeVehicle: ({ loanId, vehicleId }) => dispatch({ type: 'REMOVE_VEHICLE', payload: { loanId, vehicleId } }),
    addUpload: ({ loanId, section, upload }) => dispatch({ type: 'ADD_UPLOAD', payload: { loanId, section, upload } }),
    removeUpload: ({ loanId, uploadId }) => dispatch({ type: 'REMOVE_UPLOAD', payload: { loanId, uploadId } }),
    setStepCompletion: ({ loanId, step, completed }) => {
      dispatch({ type: 'SET_STEP_COMPLETION', payload: { loanId, step, completed } });
      console.log('SET_STEP_COMPLETION dispatched:', { loanId, step, completed });
    },
    deleteLoan: (loanId) => dispatch({ type: 'DELETE_LOAN', payload: { loanId } }),
   mergeLoanFields: ({ loanId, patch }) => dispatch({ type: 'MERGE_LOAN_FIELDS', payload: { loanId, patch } }),
   updateLoanStatus: ({ loanId, status }) => dispatch({ type: 'UPDATE_LOAN_STATUS', payload: { loanId, status } }),
    migrateLegacy,
    // legacy compatibility helpers
    clearForm: () => {
      // remove active loan's data
      if (!state.activeLoanId) return;
      dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId: state.activeLoanId, section: 'personal', patch: {} } });
      dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId: state.activeLoanId, section: 'income', patch: {} } });
      dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId: state.activeLoanId, section: 'documents', patch: [] } });
      dispatch({ type: 'SET_STEP_COMPLETION', payload: { loanId: state.activeLoanId, step: 'personal', completed: false } });
    },
    clearFormData: () => {
      // convenience: delete active loan completely
      if (!state.activeLoanId) return;
      const id = state.activeLoanId;
      dispatch({ type: 'DELETE_LOAN', payload: { loanId: id } });
    },
    // Backwards compatibility: expose formData shaped like the old API
    get formData() {
      if (!state.activeLoanId) {
        console.log('formData getter: No activeLoanId');
        return { personal: {}, income: {}, vehicles: [], documents: [] };
      }
      const loan = state.loans[state.activeLoanId];
      if (!loan) {
        console.log('formData getter: Loan not found for activeLoanId:', state.activeLoanId);
      } else {
        console.log('formData getter: Returning loan data:', { 
          id: loan.id, 
          hasPersonal: !!loan.personal,
          personalKeys: Object.keys(loan.personal || {}),
          hasIncome: !!loan.income 
        });
      }
      return loan || { personal: {}, income: {}, vehicles: [], documents: [] };
    },
    updateFormData: (patch = {}) => {
      const loanId = state.activeLoanId;
      console.log('updateFormData called:', { loanId, patch, hasLoan: !!state.loans[loanId] });
      if (!loanId) {
        console.warn('updateFormData: No activeLoanId');
        return;
      }

      // Dispatch updates - state will auto-persist via useEffect
      Object.keys(patch).forEach((section) => {
        const p = patch[section];
        console.log('Updating section:', section, 'with data:', p);
        dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section, patch: p } });
      });
    },
    update: (patch) => {
      const loanId = state.activeLoanId;
      if (!loanId) {
        // Fallback for legacy usage: create a new loan
        const newLoanId = migrateLegacy(patch);
        dispatch({ type: 'SET_ACTIVE_LOAN', payload: newLoanId });
        return;
      }
      // Distribute the patch across different sections
      const { personal, income, vehicles, vehicle, documents, photos, condition, coApplicant, ...rest } = patch;
      if (personal) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'personal', patch: personal } });
      if (income) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'income', patch: income } });
      if (vehicles) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'vehicles', patch: vehicles } });
      if (vehicle) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'vehicle', patch: vehicle } });
      if (documents) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'documents', patch: documents } });
      if (photos) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'photos', patch: photos } });
      if (condition) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'condition', patch: condition } });
      if (coApplicant) dispatch({ type: 'UPDATE_LOAN_SECTION', payload: { loanId, section: 'coApplicant', patch: coApplicant } });
      if (Object.keys(rest).length > 0) {
        console.warn('Unhandled keys in update patch:', rest);
      }
    },
  };

  return <FormContext.Provider value={api}>{children}</FormContext.Provider>;
}

export const useFormContext = () => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useFormContext must be used within FormProvider');
  return ctx;
};

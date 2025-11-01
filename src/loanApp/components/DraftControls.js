import React, { useContext, useState, useEffect } from 'react';
import MDButton from 'components/MDButton';
import { FormContext } from '../context/FormContext';

export default function DraftControls({ inline = true, mergeValues = {} }) {
  const { formData, update, reset } = useContext(FormContext);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('loanApplicationDraft');
    setHasDraft(!!saved);
  }, []);

  const saveDraft = () => {
    try {
      const merged = { ...(formData || {}), ...(mergeValues && Object.keys(mergeValues).length ? mergeValues : {}) };
      // if mergeValues corresponds to partial step data
      // prefer merging into corresponding keys
      localStorage.setItem('loanApplicationDraft', JSON.stringify(merged));
      setHasDraft(true);
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  };

  const resumeDraft = () => {
    const saved = localStorage.getItem('loanApplicationDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        update(parsed);
        // navigation should be handled by the page using getCurrentStep; DraftControls keeps concern minimal
      } catch (e) {
        console.error('Failed to resume draft', e);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('loanApplicationDraft');
    reset();
    setHasDraft(false);
  };

  return (
    <>
      <MDButton variant="outlined" color="info" onClick={saveDraft}>
        Save Draft
      </MDButton>
      <MDButton variant="text" color="dark" onClick={resumeDraft} disabled={!hasDraft}>
        Resume Draft
      </MDButton>
      <MDButton variant="text" color="error" onClick={clearDraft} disabled={!hasDraft}>
        Clear Draft
      </MDButton>
    </>
  );
}

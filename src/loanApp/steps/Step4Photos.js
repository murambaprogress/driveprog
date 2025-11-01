import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import Uploader from '../components/Uploader';
import { useFormContext } from '../context/FormContext';

export default function Step4Photos() {
  const { loanId } = useParams();
  const { state, addUpload } = useFormContext();
  const navigate = useNavigate();
  const loan = state.loans[loanId];

  console.log('Step4Photos - Current loan:', loan);
  console.log('Step4Photos - Documents:', loan?.documents);

  const onUploadComplete = (upload) => {
    console.log('Step4Photos - Upload completed:', upload);
    // attach to loan documents
    addUpload({ loanId, section: 'documents', upload });
    console.log('Step4Photos - After addUpload, documents:', state.loans[loanId]?.documents);
  };

  return (
    <MDBox p={3}>
      <h3>Photos & Documents</h3>
      <MDBox mb={2}>
        <p>Upload photos of your vehicle and any supporting documents.</p>
      </MDBox>
      
      <Uploader onUploadComplete={onUploadComplete} kind="other" label="Upload Files" />
      
      {/* Show uploaded documents */}
      {loan?.documents && loan.documents.length > 0 && (
        <MDBox mt={3} p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <h4>Uploaded Documents ({loan.documents.length})</h4>
          <MDBox display="flex" flexWrap="wrap" gap={2} mt={2}>
            {loan.documents.map((doc, idx) => (
              <MDBox key={doc.id || idx} sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                p: 1,
                width: '150px',
                textAlign: 'center'
              }}>
                {doc.url && doc.mimeType?.startsWith('image/') && (
                  <img 
                    src={doc.url} 
                    alt={doc.filename}
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                )}
                {doc.url && !doc.mimeType?.startsWith('image/') && (
                  <div style={{ width: '100%', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    📄
                  </div>
                )}
                <div style={{ fontSize: '12px', marginTop: '4px', wordBreak: 'break-word' }}>
                  {doc.filename}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ''}
                </div>
              </MDBox>
            ))}
          </MDBox>
        </MDBox>
      )}
      
      <MDBox mt={3} display="flex" gap={2}>
        <MDButton onClick={() => navigate(-1)}>Back</MDButton>
        <MDButton onClick={() => navigate(`/loan/apply/${loanId}/review`)}>Next - Review</MDButton>
      </MDBox>
    </MDBox>
  );
}

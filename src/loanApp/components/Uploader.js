import React, { useCallback, useState } from 'react';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';

/**
 * Uploader props:
 * - onUploadComplete(upload)
 * - kind: 'vehicle'|'identity'|'income'|'other'
 * - maxSize (bytes)
 */
export default function Uploader({ onUploadComplete, kind = 'other', maxSize = 5 * 1024 * 1024, label = "Select files" }) {
  const [files, setFiles] = useState([]);

  const onFiles = useCallback((fileList) => {
    const arr = Array.from(fileList).map((f) => {
      const isValid = f.size <= maxSize && f.type;
      const id = `up_${Math.random().toString(36).slice(2,9)}`;
      const upload = { id, kind, filename: f.name, mimeType: f.type, size: f.size };
      if (!isValid) upload.invalid = true;
      return { file: f, preview: URL.createObjectURL(f), upload };
    });
    setFiles((prev) => [...prev, ...arr]);
    // start fake upload
    arr.forEach((item, idx) => {
      setTimeout(() => {
        onUploadComplete && onUploadComplete({ ...item.upload, url: item.preview });
      }, 400 + Math.random() * 600);
    });
  }, [kind, maxSize, onUploadComplete]);

  const handleDrop = (e) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const handleSelect = (e) => {
    onFiles(e.target.files);
  };

  return (
    <MDBox className="uploader" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <input aria-label="file-input" type="file" multiple onChange={handleSelect} className="sr-only" id="uploader_input" />
      <MDBox display="flex" gap={2} mt={2}>
        <label htmlFor="uploader_input">
          <MDButton variant="contained" color="info">{label}</MDButton>
        </label>
        <MDButton variant="outlined" color="dark" aria-label="Enable drag and drop">Drag & drop here</MDButton>
      </MDBox>
      <MDBox mt={2} display="flex" gap={2} flexWrap="wrap">
        {files.map((f) => (
          <div key={f.upload.id} style={{ width: 120 }}>
            <img src={f.preview} alt={f.upload.filename} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
            <div style={{ fontSize: 12 }}>{f.upload.filename}</div>
          </div>
        ))}
      </MDBox>
    </MDBox>
  );
}

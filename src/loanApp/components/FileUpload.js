import React, { useState } from "react";

function isValidFile(file) {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  return allowed.includes(file.type) && file.size <= 5 * 1024 * 1024;
}

export default function FileUpload({
  name,
  onFileChange,
  accept = "image/*,application/pdf",
  capture,
  multiple = false,
  maxFiles = multiple ? 10 : 1,
}) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);

    // Validate files
    const invalidFiles = newFiles.filter((f) => !isValidFile(f));
    if (invalidFiles.length > 0) {
      setError("Some files are invalid. Only JPG, PNG, PDF under 5MB are allowed.");
      return;
    }

    // Check total file count
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed.`);
      return;
    }

    setError("");

    // Create file objects with preview
    const fileObjects = newFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      id: Date.now() + Math.random(),
    }));

    const updatedFiles = [...files, ...fileObjects];
    setFiles(updatedFiles);

    if (onFileChange) {
      onFileChange(updatedFiles);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);

    if (onFileChange) {
      onFileChange(updatedFiles);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="flex gap-3">
        <label htmlFor={`capture_${name || 'file'}`} className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium">
          Capture
        </label>
        <input
          id={`capture_${name || 'file'}`}
          accept={accept}
          capture={capture}
          type="file"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          multiple={multiple}
          aria-label="Capture file input"
        />

        <label htmlFor={`attach_${name || 'file'}`} className="border-2 border-dashed border-gray-300 hover:border-teal-500 text-gray-600 hover:text-teal-600 px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium">
          Attach File
        </label>
        <input
          id={`attach_${name || 'file'}`}
          accept={accept}
          type="file"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          multiple={multiple}
          aria-label="Attach file input"
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="relative group">
                <div className="w-full h-24 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <div className="text-red-600 text-xs font-medium mb-1">PDF</div>
                      <div className="text-xs text-gray-500 truncate">{fileObj.name}</div>
                    </div>
                  )}
                </div>

                {/* File Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="truncate">{fileObj.name}</div>
                  <div>{formatFileSize(fileObj.size)}</div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(fileObj.id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-gray-500">
        <div>• Accepted formats: JPG, PNG, PDF</div>
        <div>• Maximum file size: 5MB</div>
        {multiple && <div>• Maximum {maxFiles} files allowed</div>}
      </div>
    </div>
  );
}

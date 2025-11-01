import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Grid, IconButton, Dialog, DialogContent, DialogActions } from '@mui/material';
import { PhotoCamera, Upload, Delete, Visibility, Check, Warning } from '@mui/icons-material';
import MDBox from '../../components/MDBox';
import MDButton from '../../components/MDButton';
import MDTypography from '../../components/MDTypography';
import MDProgress from '../../components/MDProgress';
import { useFormContext } from '../context/FormContext';
import { useParams } from 'react-router-dom';

const PHOTO_CATEGORIES = {
  vehicle_exterior: {
    title: 'Vehicle Exterior Photos',
    icon: '🚗',
    description: 'Take photos of all 4 sides of your vehicle',
    required: true,
    maxPhotos: 8,
    requirements: [
      'Front view - showing license plate and headlights',
      'Rear view - showing license plate and taillights', 
      'Driver side - showing entire side profile',
      'Passenger side - showing entire side profile',
      'Additional angles showing any damage or unique features'
    ]
  },
  vehicle_interior: {
    title: 'Vehicle Interior Photos',
    icon: '🪑',
    description: 'Interior condition and features',
    required: true,
    maxPhotos: 6,
    requirements: [
      'Dashboard and steering wheel',
      'Front seats',
      'Rear seats (if applicable)',
      'Console and controls',
      'Odometer reading clearly visible'
    ]
  },
  vehicle_engine: {
    title: 'Engine Bay & Mechanical',
    icon: '⚙️',
    description: 'Engine and mechanical components',
    required: false,
    maxPhotos: 4,
    requirements: [
      'Engine bay overview',
      'VIN plate (if visible)',
      'Any mechanical issues or modifications'
    ]
  },
  documents_id: {
    title: 'Identification Documents',
    icon: '🆔',
    description: 'Government-issued photo ID',
    required: true,
    maxPhotos: 2,
    requirements: [
      'Front of ID - clear and readable',
      'Back of ID (if applicable)'
    ]
  },
  documents_income: {
    title: 'Income Verification',
    icon: '💰',
    description: 'Proof of income documents',
    required: true,
    maxPhotos: 4,
    requirements: [
      'Recent pay stubs (last 2-3)',
      'Bank statements',
      'Employment letter (if applicable)',
      'Tax documents (if self-employed)'
    ]
  },
  documents_other: {
    title: 'Additional Documents',
    icon: '📄',
    description: 'Insurance, registration, etc.',
    required: false,
    maxPhotos: 4,
    requirements: [
      'Vehicle registration',
      'Insurance documents',
      'Vehicle title (if available)',
      'Other relevant documents'
    ]
  }
};

function PhotoUploadSection({ category, categoryKey }) {
  const { state, addUpload, removeUpload } = useFormContext();
  const { loanId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();

  const loan = state.loans[loanId];
  const existingPhotos = loan?.documents?.filter(doc => doc.category === categoryKey) || [];

  // Dropzone for drag and drop
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      alert('Some files were rejected. Please ensure files are images under 10MB.');
      return;
    }

    setUploading(true);
    
    for (const file of acceptedFiles) {
      await processFile(file);
    }
    
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: category.maxPhotos - existingPhotos.length
  });

  const processFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Create upload object with metadata
        const upload = {
          id: `${categoryKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: categoryKey,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl: event.target.result,
          uploadedAt: new Date().toISOString(),
          
          // Metadata
          metadata: {
            originalName: file.name,
            fileSize: file.size,
            dimensions: null, // Will be populated when image loads
            location: null, // Could be populated with GPS if available
            deviceInfo: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          }
        };

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          upload.metadata.dimensions = {
            width: img.width,
            height: img.height
          };
          
          addUpload({ loanId, section: 'documents', upload });
          resolve();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    onDrop(files, []);
  };

  const handleCameraCapture = (event) => {
    const files = Array.from(event.target.files);
    onDrop(files, []);
  };

  const handleRemovePhoto = (photoId) => {
    removeUpload({ loanId, section: 'documents', uploadId: photoId });
  };

  const getCompletionStatus = () => {
    const photoCount = existingPhotos.length;
    const minRequired = category.required ? Math.min(2, category.maxPhotos) : 0;
    
    if (photoCount >= minRequired) return 'complete';
    if (photoCount > 0) return 'partial';
    return 'empty';
  };

  const completionStatus = getCompletionStatus();
  const progressPercentage = Math.min((existingPhotos.length / category.maxPhotos) * 100, 100);

  return (
    <Card sx={{ mb: 3 }}>
      <MDBox p={3}>
        {/* Section Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <MDBox>
            <MDBox display="flex" alignItems="center" mb={1}>
              <MDTypography variant="h6" color="dark" mr={1}>
                {category.icon} {category.title}
              </MDTypography>
              {category.required && (
                <MDTypography variant="caption" color="error" fontWeight="bold">
                  REQUIRED
                </MDTypography>
              )}
              {completionStatus === 'complete' && (
                <Check color="success" sx={{ ml: 1 }} />
              )}
            </MDBox>
            <MDTypography variant="body2" color="text">
              {category.description}
            </MDTypography>
          </MDBox>
          
          <MDBox textAlign="center" minWidth={80}>
            <MDTypography variant="h6" color={completionStatus === 'complete' ? 'success' : 'dark'}>
              {existingPhotos.length}/{category.maxPhotos}
            </MDTypography>
            <MDProgress 
              value={progressPercentage} 
              color={completionStatus === 'complete' ? 'success' : 'info'}
              sx={{ mt: 0.5 }}
            />
          </MDBox>
        </MDBox>

        {/* Upload Area */}
        {existingPhotos.length < category.maxPhotos && (
          <MDBox
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'info.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: isDragActive ? 'grey.50' : 'transparent',
              cursor: 'pointer',
              mb: 2,
              transition: 'all 0.2s ease'
            }}
          >
            <input {...getInputProps()} />
            <Upload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            
            {uploading ? (
              <MDTypography variant="body1" color="info">
                📸 Processing photos...
              </MDTypography>
            ) : (
              <>
                <MDTypography variant="body1" color="dark" fontWeight="bold">
                  {isDragActive ? 'Drop photos here!' : 'Drag photos here or click to select'}
                </MDTypography>
                <MDTypography variant="body2" color="text" mt={1}>
                  Accepts: JPEG, PNG, HEIC, WebP • Max size: 10MB each
                </MDTypography>
              </>
            )}

            {/* Action Buttons */}
            <MDBox display="flex" justifyContent="center" gap={2} mt={2}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
              <input
                type="file"
                ref={cameraInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
              />
              
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Choose Files
              </MDButton>
              <MDButton
                variant="outlined"
                color="success"
                size="small"
                onClick={() => cameraInputRef.current?.click()}
              >
                📷 Take Photo
              </MDButton>
            </MDBox>
          </MDBox>
        )}

        {/* Requirements List */}
        <MDBox mb={2}>
          <MDTypography variant="subtitle2" color="dark" mb={1}>
            📋 Photo Requirements:
          </MDTypography>
          {category.requirements.map((req, index) => (
            <MDBox key={index} display="flex" alignItems="center" mb={0.5}>
              <MDTypography variant="body2" color="text">
                • {req}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>

        {/* Uploaded Photos Grid */}
        {existingPhotos.length > 0 && (
          <Grid container spacing={2}>
            {existingPhotos.map((photo) => (
              <Grid item xs={6} sm={4} md={3} key={photo.id}>
                <MDBox position="relative">
                  <img
                    src={photo.dataUrl}
                    alt={photo.filename}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setPreviewImage(photo)}
                  />
                  
                  {/* Photo Actions */}
                  <MDBox 
                    position="absolute" 
                    top={5} 
                    right={5}
                    display="flex"
                    gap={0.5}
                  >
                    <IconButton
                      size="small"
                      sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                      onClick={() => setPreviewImage(photo)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                      onClick={() => handleRemovePhoto(photo.id)}
                    >
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </MDBox>

                  {/* Photo Info */}
                  <MDBox mt={1}>
                    <MDTypography variant="caption" color="text">
                      {photo.filename}
                    </MDTypography>
                    <br />
                    <MDTypography variant="caption" color="text">
                      {(photo.size / 1024 / 1024).toFixed(1)}MB • {new Date(photo.uploadedAt).toLocaleString()}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Completion Status */}
        <MDBox mt={2} p={2} sx={{ 
          backgroundColor: completionStatus === 'complete' ? 'success.50' : 
                         completionStatus === 'partial' ? 'warning.50' : 'grey.50',
          borderRadius: 1 
        }}>
          <MDTypography variant="body2" color="text">
            {completionStatus === 'complete' && '✅ Section Complete - All required photos uploaded'}
            {completionStatus === 'partial' && '⚠️ In Progress - Some photos uploaded'}
            {completionStatus === 'empty' && category.required && '❌ Required - Please upload photos'}
            {completionStatus === 'empty' && !category.required && 'ℹ️ Optional - You can add photos here'}
          </MDTypography>
        </MDBox>
      </MDBox>

      {/* Image Preview Dialog */}
      <Dialog 
        open={!!previewImage} 
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        {previewImage && (
          <>
            <DialogContent>
              <img
                src={previewImage.dataUrl}
                alt={previewImage.filename}
                style={{ width: '100%', height: 'auto' }}
              />
              <MDBox mt={2}>
                <MDTypography variant="h6">{previewImage.filename}</MDTypography>
                <MDTypography variant="body2" color="text">
                  Size: {(previewImage.size / 1024 / 1024).toFixed(2)}MB<br />
                  Dimensions: {previewImage.metadata?.dimensions?.width} × {previewImage.metadata?.dimensions?.height}<br />
                  Uploaded: {new Date(previewImage.uploadedAt).toLocaleString()}
                </MDTypography>
              </MDBox>
            </DialogContent>
            <DialogActions>
              <MDButton onClick={() => setPreviewImage(null)}>Close</MDButton>
              <MDButton 
                color="error" 
                onClick={() => {
                  handleRemovePhoto(previewImage.id);
                  setPreviewImage(null);
                }}
              >
                Delete Photo
              </MDButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
}

export default function Step4PhotosEnhanced() {
  const { state } = useFormContext();
  const { loanId } = useParams();
  const loan = state.loans[loanId];

  const getTotalPhotos = () => {
    return loan?.documents?.length || 0;
  };

  const getRequiredSectionStatus = () => {
    const requiredCategories = Object.keys(PHOTO_CATEGORIES).filter(key => 
      PHOTO_CATEGORIES[key].required
    );
    
    return requiredCategories.map(key => {
      const photos = loan?.documents?.filter(doc => doc.category === key) || [];
      const minRequired = Math.min(2, PHOTO_CATEGORIES[key].maxPhotos);
      return {
        category: key,
        complete: photos.length >= minRequired,
        count: photos.length
      };
    });
  };

  const requiredStatus = getRequiredSectionStatus();
  const allRequiredComplete = requiredStatus.every(status => status.complete);

  return (
    <MDBox py={3}>
      {/* Overall Progress */}
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="dark">
                📸 Photos & Documents
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Upload all required photos and documents. Every photo is automatically saved with metadata.
              </MDTypography>
            </MDBox>
            <MDBox textAlign="center">
              <MDTypography variant="h6" color={allRequiredComplete ? 'success' : 'warning'}>
                {getTotalPhotos()} Photos Uploaded
              </MDTypography>
              <MDTypography variant="body2" color={allRequiredComplete ? 'success' : 'error'}>
                {allRequiredComplete ? '✅ All Required Complete' : '⚠️ Missing Required Photos'}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      {/* Photo Categories */}
      {Object.entries(PHOTO_CATEGORIES).map(([key, category]) => (
        <PhotoUploadSection 
          key={key} 
          categoryKey={key} 
          category={category} 
        />
      ))}

      {/* Data Capture Summary */}
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" color="dark" mb={2}>
            📊 Data Capture Summary
          </MDTypography>
          <Grid container spacing={3}>
            {Object.entries(PHOTO_CATEGORIES).map(([key, category]) => {
              const photos = loan?.documents?.filter(doc => doc.category === key) || [];
              return (
                <Grid item xs={12} md={6} key={key}>
                  <MDBox p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <MDTypography variant="subtitle2" color="dark">
                      {category.icon} {category.title}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {photos.length} photos • {photos.reduce((sum, p) => sum + p.size, 0) / 1024 / 1024 | 0}MB total
                    </MDTypography>
                    {photos.length > 0 && (
                      <MDTypography variant="caption" color="text">
                        Last upload: {new Date(Math.max(...photos.map(p => new Date(p.uploadedAt)))).toLocaleString()}
                      </MDTypography>
                    )}
                  </MDBox>
                </Grid>
              );
            })}
          </Grid>
          
          <MDBox mt={3} p={2} sx={{ backgroundColor: 'info.50', borderRadius: 1 }}>
            <MDTypography variant="body2" color="text">
              <strong>🔒 Data Security:</strong> All photos are captured with timestamps, device information, and metadata. 
              Images are stored securely and can be reviewed by admins. Original file names and upload times are preserved 
              for audit purposes.
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
    </MDBox>
  );
}
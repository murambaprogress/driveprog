import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Camera as CameraIcon, Close as CloseIcon } from '@mui/icons-material';
import MDButton from '../../components/MDButton';

const CameraCapture = ({ open, onClose, onCapture, title = 'Capture Photo' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize camera
  useEffect(() => {
    if (!open) return;

    const initCamera = async () => {
      try {
        setLoading(true);
        setError(null);

        // Request camera access
        const constraints = {
          video: {
            facingMode: 'environment', // Use rear camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCameraActive(true);
          };
        }

        setLoading(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings.'
            : err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : `Camera error: ${err.message}`
        );
        setLoading(false);
      }
    };

    initCamera();

    return () => {
      // Cleanup: stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    };
  }, [open]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;

      // Set canvas dimensions to match video
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0);

      // Convert canvas to blob
      canvasRef.current.toBlob((blob) => {
        // Create a File object from the blob
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `photo-${timestamp}.jpg`, {
          type: 'image/jpeg',
        });

        // Call the onCapture callback with the file
        onCapture([file]);

        // Stop camera and close dialog
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setCameraActive(false);
        onClose();
      }, 'image/jpeg', 0.95);
    }
  };

  const handleClose = () => {
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
        }}
      >
        <CameraIcon sx={{ color: '#16a085' }} />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
            gap={2}
          >
            <CircularProgress size={48} sx={{ color: '#16a085' }} />
            <Typography color="text" align="center">
              Initializing camera...
            </Typography>
          </Box>
        )}

        {!error && cameraActive && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingBottom: '75%', // 4:3 aspect ratio
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              playsInline
              muted
            />
          </Box>
        )}

        {/* Hidden canvas for capturing frames */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!loading && error && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
          >
            <Typography color="error" variant="body2" align="center">
              Cannot access camera. Please check your browser permissions or use
              the "Attach File" button to upload a photo instead.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: '#666',
            borderColor: '#ddd',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Cancel
        </Button>
        <MDButton
          onClick={handleCapture}
          variant="gradient"
          color="info"
          disabled={!cameraActive || loading}
          sx={{
            minWidth: 100,
          }}
        >
          Capture Photo
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default CameraCapture;

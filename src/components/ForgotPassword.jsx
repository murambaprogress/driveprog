import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Grid,
  Link
} from '@mui/material';

import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1 for email, 2 for otp and new password

  const textFieldStyles = {
    '& label.Mui-focused': {
      color: 'white',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.7)',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
      '& input': {
        color: 'white',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/password-reset-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== password2) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp_code: otp,
          password,
          password2,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Password reset failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {step === 1 ? (
        <form onSubmit={handleRequestOtp}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
            Forgot Password
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={textFieldStyles}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2" sx={{ color: 'white' }}>
                Back to Login
              </Link>
            </Grid>
          </Grid>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
            Reset Password
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          <TextField
            fullWidth
            margin="normal"
            label="OTP Code"
            name="otp"
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="password2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            sx={textFieldStyles}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;

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

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    password: '',
    password2: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setUserId(data.user_id);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          otp_code: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || 'OTP verification failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {!userId ? (
        <form onSubmit={handleRegister}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
            Create Account
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            name="password2"
            type="password"
            value={formData.password2}
            onChange={handleInputChange}
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
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2" sx={{ color: 'white' }}>
                {"Already have an account? Sign In"}
              </Link>
            </Grid>
          </Grid>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
            Verify OTP
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography sx={{ color: 'white', textAlign: 'center', mb: 2 }}>
            An OTP has been sent to your email address. Please enter it below.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="OTP Code"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
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
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default Register;

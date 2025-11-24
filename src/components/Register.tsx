import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defenderImage from '../assets/defender.jpg';
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

  const glassStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 3,
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 16px 48px rgba(2,6,23,0.6)',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-40%',
      top: '-60%',
      width: '200%',
      height: '220%',
      background: 'linear-gradient(120deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06) 100%)',
      transform: 'rotate(20deg)',
      opacity: { xs: 0.12, md: 0.55 },
      pointerEvents: 'none',
      animation: { xs: 'none', md: 'shimmer 9s linear infinite' }
    },
    '@keyframes shimmer': {
      '0%': { transform: 'translateX(-12%) rotate(18deg)' },
      '50%': { transform: 'translateX(6%) rotate(18deg)' },
      '100%': { transform: 'translateX(-12%) rotate(18deg)' }
    }
  };

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

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
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

    // Validate age - must be 18 or older
    if (formData.date_of_birth) {
      const age = calculateAge(formData.date_of_birth);
      if (age < 18) {
        setError(`You must be at least 18 years old to register. Your current age is ${age} years.`);
        setLoading(false);
        return;
      }
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/accounts/register/`, {
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
        // Handle validation errors
        if (data.date_of_birth) {
          setError(data.date_of_birth[0] || data.date_of_birth);
        } else if (data.error) {
          setError(data.error);
        } else {
          // Display all field errors
          const errorMessages = Object.entries(data)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join(', ');
          setError(errorMessages || 'Registration failed.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/accounts/verify-otp/`, {
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
    <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 4, md: 6 }, fontFamily: 'Poppins, Roboto, sans-serif' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
              backgroundImage: `linear-gradient(180deg, rgba(8,10,20,0.28), rgba(0,0,0,0.48)), url('${defenderImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
      />
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 3 }}>
        <Box sx={{ ...glassStyle, p: 4, borderRadius: 2 }}>
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
                label="Date of Birth (Must be 18+)"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0], // Prevent future dates
                  min: new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0] // Max 120 years old
                }}
                helperText="You must be at least 18 years old"
                sx={{
                  ...textFieldStyles,
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                  }
                }}
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
        </Box>
      </Container>
    </Box>
  );
};

export default Register;

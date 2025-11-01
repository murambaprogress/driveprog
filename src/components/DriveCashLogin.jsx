import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid,
  Link
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Menu,
  Settings
} from '@mui/icons-material';
import { useUserData } from '../context/AppDataContext';
import BrandNeon from './BrandNeon';

import AuthLayout from './AuthLayout';

const DriveCashLogin = () => {
  const navigate = useNavigate();
  const { updateProfile } = useUserData();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [adminLoginStep, setAdminLoginStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const isAdminLogin = formData.email === '9999999999' && formData.password === 'drivecash';

    if (isAdminLogin) {
      if (adminLoginStep === 1) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/accounts/admin/login/step1/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.email,
              password: formData.password,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setUserId(data.user_id);
            setAdminLoginStep(2);
          } else {
            setError(data.error || 'Admin login failed.');
          }
        } catch (err) {
          setError('An error occurred. Please try again.');
        } finally {
          setLoading(false);
        }
      } else { // adminLoginStep === 2
        try {
          const response = await fetch('http://127.0.0.1:8000/api/accounts/admin/login/step2/', {
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
            // Normalize token storage: save raw access token for API client
            const accessToken = (data && data.tokens && data.tokens.access) || data.access || data.token || null;
            const refreshToken = (data && data.tokens && data.tokens.refresh) || data.refresh || null;
            if (accessToken) {
              localStorage.setItem('authToken', accessToken);
            }
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
            }
            const adminProfile = {
              email: formData.email,
              role: 'admin',
              isAuthenticated: true
            };
            localStorage.setItem('mockUserProfile', JSON.stringify(adminProfile));
            updateProfile({ role: 'admin' });
            navigate('/admin', { replace: true });
          } else {
            setError(data.error || 'OTP verification failed.');
          }
        } catch (err) {
          setError('An error occurred. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } else { // User login
      try {
        const response = await fetch('http://127.0.0.1:8000/api/accounts/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Normalize token storage: save raw access token for API client
          const accessToken = (data && data.tokens && data.tokens.access) || data.access || data.token || null;
          const refreshToken = (data && data.tokens && data.tokens.refresh) || data.refresh || null;
          if (accessToken) {
            localStorage.setItem('authToken', accessToken);
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          const userProfile = {
            email: data.user.email,
            role: 'user',
            isAuthenticated: true
          };
          localStorage.setItem('mockUserProfile', JSON.stringify(userProfile));
          updateProfile({ role: 'user' });
          navigate('/dashboard', { replace: true });
        } else {
          setError(data.error || 'Login failed.');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthLayout>
      <Typography 
        variant="h5" 
        sx={{ 
          textAlign: 'center',
          fontWeight: 700,
          color: '#ffffff',
          mb: 0.5,
          fontSize: { xs: '1.25rem', md: '1.5rem' }
        }}
      >
        Log into your account
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {adminLoginStep === 2 ? (
          <TextField
            fullWidth
            placeholder="OTP Code"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            variant="outlined"
            sx={{ 
              mb: 2,
                '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fff',
                color: '#0f172a',
                '& fieldset': {
                  borderColor: 'rgba(15,23,42,0.12)',
                },
                '&:hover fieldset': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                }
              }
            }}
          />
        ) : (
          <>
            <TextField
              fullWidth
              placeholder="Email Address or Admin Username"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleInputChange}
              required
              variant="outlined"
              sx={{ 
                mb: 2,
                  '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  color: '#0f172a',
                  '& fieldset': {
                    borderColor: 'rgba(15,23,42,0.12)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  }
                }
              }}
            />

            <TextField
              fullWidth
              placeholder="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#64748b' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  color: '#0f172a',
                  '& fieldset': {
                    borderColor: 'rgba(15,23,42,0.12)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  }
                }
              }}
            />
          </>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
            sx={{
            py: 1.15,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            color: '#fff',
            borderRadius: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            mb: 2.5,
            textTransform: 'none',
            boxShadow: '0 3px 10px rgba(59, 130, 246, 0.10)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              boxShadow: '0 5px 12px rgba(59, 130, 246, 0.14)',
            }
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            adminLoginStep === 2 ? 'Verify OTP' : 'Log In'
          )}
        </Button>
      </form>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Link 
          href="/forgot-password" 
          sx={{ 
            color: '#3b82f6', 
            textDecoration: 'none',
            fontWeight: 600,
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Forgot Password?
        </Link>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Don't have an account?{' '}
          <Link 
            href="/register" 
            sx={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default DriveCashLogin;

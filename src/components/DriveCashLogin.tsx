import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Dashboard
} from '@mui/icons-material';
import { useUserData } from '../context/AppDataContext';

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

  // Admin credentials for portal differentiation
  const adminCredentials = {
    email: 'admin@drivecash.com',
    password: 'admin123'
  };

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

    try {
      // Check if admin credentials
      const isAdmin = formData.email === adminCredentials.email && 
                     formData.password === adminCredentials.password;

      if (isAdmin) {
        // Admin login - call real API
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/accounts/login/`, {
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
          // Save tokens
          const accessToken = (data && data.tokens && data.tokens.access) || data.access || null;
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
            profile: { role: 'admin' },
            user: { profile: { role: 'admin' } }
          };
          localStorage.setItem('mockUserProfile', JSON.stringify(adminProfile));
          updateProfile({ role: 'admin' });
          navigate('/admin', { replace: true });
        } else {
          setError(data.error || 'Admin login failed');
        }
      } else if (formData.email && formData.password) {
        // User login - call real API
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/accounts/login/`, {
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
          // Save tokens
          const accessToken = (data && data.tokens && data.tokens.access) || data.access || null;
          const refreshToken = (data && data.tokens && data.tokens.refresh) || data.refresh || null;
          if (accessToken) {
            localStorage.setItem('authToken', accessToken);
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          const userProfile = {
            email: formData.email,
            role: 'user',
            profile: { role: 'user' },
            user: { profile: { role: 'user' } }
          };
          localStorage.setItem('mockUserProfile', JSON.stringify(userProfile));
          updateProfile({ role: 'user' });
          navigate('/dashboard', { replace: true });
        } else {
          setError(data.error || 'Login failed');
        }
      } else {
        setError('Please enter valid email and password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={24} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              textAlign: 'center',
              py: 4,
              px: 2
            }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              DriveCash
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Car Title Loans Made Simple
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" textAlign="center" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
              Sign in to access your portal
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  mb: 3
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Portal Access
              </Typography>
            </Divider>

            <Box display="flex" gap={2} justifyContent="center">
              <Box textAlign="center" sx={{ opacity: 0.7 }}>
                <Dashboard sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="caption" display="block">
                  User Portal
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Any valid credentials
                </Typography>
              </Box>
              
              <Box textAlign="center" sx={{ opacity: 0.7 }}>
                <AdminPanelSettings sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="caption" display="block">
                  Admin Portal
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  admin@drivecash.com
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default DriveCashLogin;

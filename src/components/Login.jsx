import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';
import { apiClient } from 'utils/apiClient';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

// ... (imports)

const Login = () => {
  // ... (state variables)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/token/', { email, password });
      const { access, refresh } = response.data;
      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);
      // Fetch user profile after login to get role
  const profileResponse = await apiClient.get('/accounts/profile/');
      localStorage.setItem('userProfile', JSON.stringify(profileResponse.data));
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the component)
};

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

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Card sx={{ p: 3, ...glassStyle }}>
          <MDBox display="flex" flexDirection="column" alignItems="center" mb={2}>
            <MDTypography variant="h5">Welcome back</MDTypography>
            <MDTypography variant="caption" color="textSecondary">Sign in to continue</MDTypography>
          </MDBox>
          <form onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </MDBox>

            {error && (
              <MDBox mb={2}><MDTypography color="error">{error}</MDTypography></MDBox>
            )}

            <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </MDButton>

            <MDBox mt={2} textAlign="center">
              <MDButton variant="text" onClick={() => navigate('/signup')}>Create account</MDButton>
            </MDBox>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;

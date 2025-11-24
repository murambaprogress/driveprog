import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Container,
  Grid
} from '@mui/material';
import BrandNeon from './BrandNeon';
import defenderImage from '../assets/defender.jpg';

// Reusable liquid-glass styling for cards/panels
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

const AuthLayout = ({ children }) => {
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 4, md: 6 }, fontFamily: 'Poppins, Roboto, sans-serif' }}>
      {/* Full-screen Background */}
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

      {/* Main Content Container */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 3 }}>
        <Grid container spacing={0} sx={{ alignItems: 'flex-start' }}>
          {/* Left Side - Brand Content */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: { md: 'center', lg: 'center' }, pr: 4, pt: { xs: 4, md: 0 }, minHeight: { md: '80vh' } }}>
            <Box sx={{ maxWidth: 500, mx: { md: 0, lg: 0 } }}>
              <Box sx={{
                ...glassStyle,
                background: 'rgba(18,24,36,0.44)',
                backdropFilter: 'blur(10px) saturate(120%)',
                p: { xs: 2, md: 4 },
                color: '#ffffff',
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 20px 42px rgba(2,6,23,0.58)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <BrandNeon color="#10b981">
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontFamily: 'Poppins, Roboto, sans-serif',
                      fontSize: { xs: '2.6rem', md: '3.8rem' },
                      fontWeight: 900,
                      color: '#24348b',
                      mb: 1,
                      lineHeight: 0.92,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    DriveCash
                  </Typography>
                </BrandNeon>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Poppins, Roboto, sans-serif',
                    color: 'rgba(255,255,255,0.92)',
                    fontWeight: 600,
                    mb: 3,
                    fontSize: { xs: '1rem', md: '1.1rem' }
                  }}
                >
                  The smarter, safer choice.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: '0.95rem', md: '1.02rem' },
                    lineHeight: 1.6,
                    mb: 3.25,
                    maxWidth: 450,
                    fontFamily: 'Poppins, Roboto, sans-serif'
                  }}
                >
                  Texas-based Title loans with competitive rates. Whether you're applying for the first time, refinancing or looking for a title loan buyout- we've got you covered.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Form Card */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', px: { xs: 2, md: 3 }, pt: { xs: 2, md: 4 } }}>
            <Box 
              sx={{ 
                ...glassStyle,
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(12px) saturate(120%)',
                borderRadius: 2,
                color: '#ffffff',
                width: '100%',
                maxWidth: { xs: '100%', sm: 420, md: 360 },
                p: { xs: 0.5, md: 0.5 },
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Box sx={{ p: { xs: 1.5, md: 2.25 } }}>
                {children}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthLayout;

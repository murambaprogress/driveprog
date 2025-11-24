import React, { useCallback } from 'react';
import SignUp from './SignUp';
import useSafeNavigate from '../utils/useSafeNavigate';

interface AuthHandlerProps {
  mode: 'login' | 'signup';
  onAuthSuccess?: (isAdmin: boolean) => void;
  preselectedRole?: 'user' | 'admin' | null;
}

const AuthHandler: React.FC<AuthHandlerProps> = ({ mode, onAuthSuccess, preselectedRole = null }) => {
  const navigate = useSafeNavigate();
  const handleAuthSuccess = useCallback(
    (isAdmin: boolean) => {
      if (onAuthSuccess) {
        onAuthSuccess(isAdmin);
      } else {
        navigate(isAdmin ? '/admin' : '/dashboard');
      }
    },
    [navigate, onAuthSuccess]
  );
  if (mode === 'signup') {
    return <SignUp onAuthSuccess={handleAuthSuccess} preselectedRole={preselectedRole} />;
  }
  // Login page removed
  return null;
};

export default AuthHandler;

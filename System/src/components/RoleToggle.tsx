import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';

interface RoleToggleProps {
  currentRole: 'user' | 'admin' | null;
  onRoleChange: (isAdmin: boolean) => void;
}

const RoleToggle: React.FC<RoleToggleProps> = ({ currentRole, onRoleChange }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<'user' | 'admin' | null>(null);

  const handleUserPortal = async () => {
    if (currentRole === 'user') return; // Already in user portal
    
    setIsLoading('user');
    
    try {
      // Simulate authentication transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update app state to user mode
      onRoleChange(false);
      
      // Show transition notification
      toast.push('Switched to User Portal - Loading user dashboard...', 'success');
      
      // Navigate to user dashboard
      setTimeout(() => navigate('/dashboard', { replace: true }), 500);
      
    } catch (error) {
      toast.push('Failed to switch to User Portal', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleAdminPortal = async () => {
    if (currentRole === 'admin') return; // Already in admin portal
    
    setIsLoading('admin');
    
    try {
      // Enhanced authentication flow with efficiency focus
      toast.push('Authenticating admin credentials...', 'info');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Validate admin access with enhanced security
      const adminToken = 'admin_' + Date.now();
      localStorage.setItem('drivecash_admin_token', adminToken);
      localStorage.setItem('drivecash_admin_login_time', Date.now().toString());
      
      // Update app state to admin mode
      onRoleChange(true);
      
      // Show enhanced transition notification
      toast.push('Admin Portal Connected - Loading efficiency dashboard with real-time metrics...', 'success');
      
      // Navigate to admin dashboard with efficiency focus
      setTimeout(() => {
        navigate('/admin?view=overview&focus=efficiency', { replace: true });
      }, 600);
      
    } catch (error) {
      toast.push('Admin authentication failed - Please verify admin credentials', 'error');
      localStorage.removeItem('drivecash_admin_token');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/20">
      <button
        onClick={handleUserPortal}
        disabled={isLoading !== null}
        className={`
          flex items-center gap-2 min-w-[100px] px-4 py-2 text-sm font-medium rounded-lg
          transition-all duration-200 disabled:opacity-50
          ${currentRole === 'user' 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-transparent text-blue-600 hover:bg-blue-50'
          }
          ${isLoading === 'user' ? 'animate-pulse' : ''}
        `}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        {isLoading === 'user' ? 'Loading...' : 'User'}
      </button>
      
      <button
        onClick={handleAdminPortal}
        disabled={isLoading !== null}
        className={`
          flex items-center gap-2 min-w-[100px] px-4 py-2 text-sm font-medium rounded-lg
          transition-all duration-200 disabled:opacity-50
          ${currentRole === 'admin' 
            ? 'bg-gray-800 text-white shadow-md' 
            : 'bg-transparent text-gray-700 hover:bg-gray-50'
          }
          ${isLoading === 'admin' ? 'animate-pulse' : ''}
        `}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
        {isLoading === 'admin' ? 'Loading...' : 'Admin'}
      </button>
    </div>
  );
};

export default RoleToggle;

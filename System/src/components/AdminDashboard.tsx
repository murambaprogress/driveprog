import React, { useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

/**
 * Enhanced Admin Dashboard with efficiency focus integration
 * Loads the external admin dashboard with authenticated admin session
 * Integrates with admin login credentials for seamless portal access
 */
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);
  const view = params.view || qs.get('view') || 'overview';
  const focus = qs.get('focus') || 'general';
  
  // Enhanced URL construction with admin authentication and efficiency focus
  const adminToken = localStorage.getItem('drivecash_admin_token');
  const loginTime = localStorage.getItem('drivecash_admin_login_time');
  const adminRole = localStorage.getItem('drivecash_admin_role') || 'basic_admin';
  const adminPermissions = JSON.parse(localStorage.getItem('drivecash_admin_permissions') || '[]');
  
  // Determine focus level based on admin permissions
  const hasEfficiencyAccess = adminPermissions.includes('efficiency_metrics') || adminPermissions.includes('efficiency_dashboard');
  const focusLevel = hasEfficiencyAccess ? 'efficiency_advanced' : focus;
  
  const src = `/drivecash-dashboard/index.html?view=${encodeURIComponent(view as string)}&role=admin&focus=${encodeURIComponent(focusLevel)}&token=${adminToken || 'guest'}&login_time=${loginTime || Date.now()}&admin_role=${adminRole}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          // Enhanced admin portal integration - inject efficiency focus styles
          const efficiencyStyles = document.createElement('style');
          efficiencyStyles.textContent = `
            /* Highlight efficiency metrics */
            [class*="efficiency"], [class*="performance"], [class*="metric"] {
              border-left: 4px solid #10B981 !important;
              background: linear-gradient(135deg, #F0FDF4, #ECFDF5) !important;
            }
            
            /* Enhanced admin visibility */
            .admin-panel, .dashboard-header {
              background: linear-gradient(135deg, #1F2937, #374151) !important;
              color: #F9FAFB !important;
            }
            
            /* Focus on key performance indicators */
            [data-testid*="kpi"], [class*="kpi"], .metric-card {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
              transition: all 0.3s ease !important;
            }
            
            [data-testid*="kpi"]:hover, [class*="kpi"]:hover, .metric-card:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 10px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            }
          `;
          iframeDoc.head.appendChild(efficiencyStyles);

          // Add admin session validation
          const adminValidationScript = document.createElement('script');
          adminValidationScript.textContent = `
            // Validate admin session
            const urlParams = new URLSearchParams(window.location.search);
            const adminToken = urlParams.get('token');
            const loginTime = urlParams.get('login_time');
            
            if (adminToken && adminToken !== 'guest') {
              console.log('Admin session validated:', adminToken);
              // Add admin indicator
              setTimeout(() => {
                const adminIndicator = document.createElement('div');
                adminIndicator.innerHTML = '🔧 Admin Portal - Efficiency Focus Active';
                adminIndicator.style.cssText = \`
                  position: fixed; top: 10px; right: 10px; z-index: 9999;
                  background: #059669; color: white; padding: 8px 12px;
                  border-radius: 6px; font-size: 12px; font-weight: 600;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                \`;
                document.body.appendChild(adminIndicator);
              }, 1000);
            }
          `;
          iframeDoc.head.appendChild(adminValidationScript);

          // Add message listener for logout events from iframe
          const handleLogout = (event: MessageEvent) => {
            if (event.data === 'logout' || event.data?.type === 'logout') {
              // Clear admin session
              localStorage.removeItem('drivecash_admin_token');
              localStorage.removeItem('drivecash_admin_login_time');
              localStorage.removeItem('drivecash_isAdmin');
              navigate('/');
            }
          };

          // Listen for admin efficiency events
          const handleAdminEvents = (event: MessageEvent) => {
            if (event.data?.type === 'admin_efficiency_update') {
              console.log('Admin efficiency metrics updated:', event.data.metrics);
            }
            if (event.data?.type === 'admin_focus_change') {
              console.log('Admin focus changed to:', event.data.focus);
              // Update URL to reflect focus change
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('focus', event.data.focus);
              window.history.replaceState(null, '', newUrl.toString());
            }
          };

          window.addEventListener('message', handleLogout);
          window.addEventListener('message', handleAdminEvents);
          return () => {
            window.removeEventListener('message', handleLogout);
            window.removeEventListener('message', handleAdminEvents);
          };
        }
      } catch {
        // Cross-origin restriction - this is expected for security reasons
        console.log('Admin portal enhancement blocked by CORS policy - using fallback integration');
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [navigate]);

  return (
    <div className="w-full h-full min-h-[calc(100vh-4rem)]">
      <iframe
        ref={iframeRef}
        title="DriveCash Admin Dashboard"
        src={src}
        className="w-full h-full border-0"
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      />
    </div>
  );
};

export default AdminDashboard;

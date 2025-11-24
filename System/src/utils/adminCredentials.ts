/**
 * Admin Authentication Configuration
 * Enhanced admin credentials for efficiency-focused portal access
 */

export interface AdminCredential {
  email: string;
  password: string;
  role: string;
  description: string;
  permissions: string[];
}

export const ADMIN_CREDENTIALS: AdminCredential[] = [
  {
    email: 'admin@demo.com',
    password: 'admin1234',
    role: 'demo_admin',
    description: 'Demo Admin Account',
    permissions: ['view_all', 'edit_users', 'manage_loans', 'system_settings']
  },
  {
    email: 'admin@drivecash.com',
    password: 'AdminEfficiency2025',
    role: 'super_admin',
    description: 'Super Admin with Full System Access',
    permissions: ['full_access', 'efficiency_metrics', 'advanced_analytics', 'system_administration']
  },
  {
    email: 'manager@drivecash.com',
    password: 'Manager2025',
    role: 'manager',
    description: 'Operations Manager',
    permissions: ['view_metrics', 'manage_applications', 'customer_support', 'reports']
  },
  {
    email: 'efficiency@drivecash.com',
    password: 'Efficiency2025!',
    role: 'efficiency_specialist',
    description: 'Efficiency Metrics Specialist',
    permissions: ['efficiency_dashboard', 'performance_metrics', 'optimization_tools', 'reporting']
  }
];

export const validateAdminCredentials = (email: string, password: string): AdminCredential | null => {
  const credential = ADMIN_CREDENTIALS.find(
    cred => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
  );
  return credential || null;
};

export const getAdminPermissions = (email: string): string[] => {
  const credential = ADMIN_CREDENTIALS.find(
    cred => cred.email.toLowerCase() === email.toLowerCase()
  );
  return credential ? credential.permissions : [];
};

export const isEfficiencySpecialist = (email: string): boolean => {
  const permissions = getAdminPermissions(email);
  return permissions.includes('efficiency_dashboard') || permissions.includes('efficiency_metrics');
};

export const getEfficiencyDashboardUrl = (adminEmail: string, baseUrl: string): string => {
  const isEfficiencyAdmin = isEfficiencySpecialist(adminEmail);
  const focusParam = isEfficiencyAdmin ? 'efficiency_advanced' : 'efficiency';
  return `${baseUrl}?focus=${focusParam}&admin_type=${getAdminRole(adminEmail)}`;
};

export const getAdminRole = (email: string): string => {
  const credential = ADMIN_CREDENTIALS.find(
    cred => cred.email.toLowerCase() === email.toLowerCase()
  );
  return credential ? credential.role : 'basic_admin';
};

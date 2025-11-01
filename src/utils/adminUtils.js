/**
 * Admin Utilities - Lazy loaded admin functionality
 * These functions are only loaded when admin features are needed
 */

// Lazy load admin services to keep them out of the main user bundle
export const loadAdminApi = () => import('../services/adminApi');
export const loadAdminDataService = () => import('../services/adminDataService');

// Admin role check utility
export const isAdmin = (userRole) => userRole === 'admin';

// Admin route filter utility
export const filterAdminRoutes = (routes, userRole) => {
  return routes.filter(route => !route.adminOnly || isAdmin(userRole));
};

// Admin navigation guard
export const canAccessAdmin = (userRole) => {
  return isAdmin(userRole);
};

// Admin component lazy loader with error boundary
export const loadAdminComponent = async (componentPath) => {
  try {
    const component = await import(componentPath);
    return component.default || component;
  } catch (error) {
    console.error(`Failed to load admin component: ${componentPath}`, error);
    throw new Error(`Admin component not available: ${error.message}`);
  }
};

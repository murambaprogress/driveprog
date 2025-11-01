import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useUserData } from 'context/AppDataContext';

/**
 * ProtectedRoute
 * Props:
 * - children: element to render when allowed
 * - allowedRoles: array of roles allowed to view (e.g. ['admin'])
 */
export default function ProtectedRoute({ children, allowedRoles = ['admin'] }) {
  const { user } = useUserData();
  
  // Compute the effective role on every render so localStorage changes (logout) are respected immediately
  let effectiveRole;
  try {
    const contextRole = user?.profile?.role;
    const stored = localStorage.getItem('mockUserProfile');
    let localRole = null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // check multiple common shapes
        localRole = parsed.role || parsed.profile?.role || parsed.user?.profile?.role || null;
      } catch (e) {
        localRole = null;
      }
    }

    effectiveRole = localRole || contextRole || 'user';
  } catch (e) {
    effectiveRole = user?.profile?.role || 'user';
  }
  
  console.debug('[ProtectedRoute] effectiveRole=', effectiveRole, 'allowedRoles=', allowedRoles);

  // if user is not allowed, return null to prevent rendering
  // Let the parent portal handle routing instead of causing navigation loops
  if (!allowedRoles.includes(effectiveRole)) {
    console.debug('[ProtectedRoute] Access denied, effectiveRole:', effectiveRole, 'allowedRoles:', allowedRoles);
    return null;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.element.isRequired,
  allowedRoles: PropTypes.array,
};

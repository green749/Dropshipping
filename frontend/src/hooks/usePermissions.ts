import { useMemo } from 'react';
import { useAppSelector } from '../store';
import type { UserRole } from '../types';

interface Permissions {
  isDropshipper: boolean;
  isDealer: boolean;
  isMarketing: boolean;
  isSales: boolean;
  canManageBusinesses: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageReturns: boolean;
  canManageCampaigns: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

/**
 * Role-based permission helper hook.
 *
 * @example
 * const { canManageBusinesses, isDealer } = usePermissions();
 * if (!canManageBusinesses) return <Forbidden />;
 */
export function usePermissions(): Permissions {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;

  return useMemo((): Permissions => {
    const hasRole = (...roles: UserRole[]) => !!role && roles.includes(role);

    return {
      isDropshipper: role === 'DROPSHIPPER',
      isDealer: role === 'DEALER',
      isMarketing: role === 'MARKETING',
      isSales: role === 'SALES',
      canManageBusinesses: hasRole('DROPSHIPPER'),
      canManageProducts: hasRole('DROPSHIPPER', 'DEALER'),
      canManageOrders: hasRole('DROPSHIPPER', 'DEALER', 'SALES'),
      canManageReturns: hasRole('DROPSHIPPER', 'DEALER', 'SALES'),
      canManageCampaigns: hasRole('DROPSHIPPER', 'MARKETING'),
      canViewAnalytics: hasRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'),
      canManageUsers: hasRole('DROPSHIPPER'),
      hasRole,
    };
  }, [role]);
}

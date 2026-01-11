/**
 * Hook para gerenciamento de permissões no frontend
 */

import { useAuth } from './auth-context';
import {
  PermissionCode,
  hasPermission as checkPermission,
  hasAllPermissions as checkAllPermissions,
  hasAnyPermission as checkAnyPermission,
  isAdmin as checkIsAdmin,
} from './permissions';

export function usePermissions() {
  const { user } = useAuth();

  const userPermissions = user?.permissions || [];
  const userRole = user?.role;

  /**
   * Verifica se o usuário é ADMIN
   */
  const isAdmin = () => {
    return checkIsAdmin(userRole || '');
  };

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const hasPermission = (permission: PermissionCode): boolean => {
    return checkPermission(userPermissions, permission, userRole);
  };

  /**
   * Verifica se o usuário tem todas as permissões especificadas
   */
  const hasAllPermissions = (permissions: PermissionCode[]): boolean => {
    return checkAllPermissions(userPermissions, permissions, userRole);
  };

  /**
   * Verifica se o usuário tem pelo menos uma das permissões especificadas
   */
  const hasAnyPermission = (permissions: PermissionCode[]): boolean => {
    return checkAnyPermission(userPermissions, permissions, userRole);
  };

  /**
   * Verifica se o usuário pode acessar configurações
   * (apenas ADMIN)
   */
  const canAccessSettings = (): boolean => {
    return isAdmin();
  };

  return {
    isAdmin,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessSettings,
    userPermissions,
    userRole,
  };
}

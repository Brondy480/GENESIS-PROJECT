import { useMemo } from 'react';
import useAuthStore from '../store/authStore';

/**
 * Custom hook to determine user permissions based on their role
 * @returns {Object} - Permission flags for the current user
 */
const useRolePermissions = () => {
    const user = useAuthStore((state) => state.user);

    const permissions = useMemo(() => {
        // Support both 'role' and 'userType' fields for flexibility
        const role = (user?.role || user?.userType || '').toLowerCase();

        return {
            // Base permissions (all authenticated users)
            canViewProjects: true,
            canLike: true,
            canComment: true,
            canSave: true,

            // Backer permissions
            isBacker: role === 'backer',
            canFundProject: role === 'backer',

            // Investor permissions
            isInvestor: role === 'investor',
            canInvestInProject: role === 'investor',
            canNegotiate: role === 'investor',

            // Admin permissions
            isAdmin: role === 'admin',
            canValidateProjects: role === 'admin',
            canRejectProjects: role === 'admin',
            canSuspendComments: role === 'admin',
            canSuspendUsers: role === 'admin',
            canViewAnalytics: role === 'admin',
            canManageEscrow: role === 'admin',

            // Creator permissions
            isCreator: role === 'creator',
            canEditOwnProjects: role === 'creator',
            canDeleteOwnProjects: role === 'creator',

            // Current role
            role,

            // Helper methods
            isAuthenticated: !!user,
            isGuest: !user,
        };
    }, [user]);

    return permissions;
};

export default useRolePermissions;

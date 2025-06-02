import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

export const useUserRoles = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

    const roles = user?.roles || []

    const hasRole = (role: string): boolean => roles.includes(role)

    const hasAnyRole = (rolesToCheck: string[]): boolean =>
        rolesToCheck.some(role => roles.includes(role))

    const hasAllRoles = (rolesToCheck: string[]): boolean =>
        rolesToCheck.every(role => roles.includes(role))

    return {
        roles,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        isAdmin: () => hasRole('admin') || hasRole('administrator'),
        isUser: () => hasRole('user'),
        isModerator: () => hasRole('moderator'),
        isAuthenticated,
    }
}

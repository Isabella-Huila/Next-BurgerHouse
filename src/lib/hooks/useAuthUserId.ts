import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const useAuthUserId = (): string | null => {
  return useSelector((state: RootState) => state.auth.user?.id || null);
};
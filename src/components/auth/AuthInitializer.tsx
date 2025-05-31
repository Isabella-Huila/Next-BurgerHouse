'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks/redux';
import { initializeAuth } from '../../lib/redux/slices/authSlice';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      dispatch(initializeAuth());
    }
  }, [dispatch]);
  return <>{children}</>;
}
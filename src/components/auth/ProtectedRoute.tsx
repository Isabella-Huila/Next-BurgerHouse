'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../lib/hooks/redux';
import { initializeAuth } from '../../lib/redux/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true
}: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await dispatch(initializeAuth());
      setIsInitialized(true);
    };
    
    if (!isInitialized) {
      initAuth();
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    if (isInitialized && !isLoading && requireAuth && !isAuthenticated) {
      router.push('/');
    }
  }, [isInitialized, isLoading, isAuthenticated, requireAuth, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
'use client';

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UsersManagement from "@/components/user/UsersManagement";



export default function AdminUsersPage() {
  return (
    <ProtectedRoute>
      <UsersManagement />
    </ProtectedRoute>
  );
}
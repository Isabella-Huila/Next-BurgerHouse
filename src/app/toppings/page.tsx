'use client';

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import ToppingsManagement from "../../components/topping/ToppingsManagement";

export default function AdminToppingsPage() {
  return (
    <ProtectedRoute>
      <ToppingsManagement />
    </ProtectedRoute>
  );
}
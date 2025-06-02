"use client";
import { useUserRoles } from "@/lib/hooks/useUserRoles";
import { logout } from "@/lib/redux/slices/authSlice";
import { isTokenValid } from "@/middleware";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard": ["customer", "admin", "delivery"], 
  "/profile": ["customer", "admin", "delivery"], 
  "/orders": ["customer", "admin"],
  "/cart": ["customer", "admin"],
  "/reports": ["admin"],
};

export function AuthChecker() {
  const dispatch = useDispatch();
  const { hasAnyRole, isAuthenticated } = useUserRoles();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route => 
      currentPath.startsWith(route)
    );

    if (matchedRoute) {
      // Verificar token válido
      if (!token || !isTokenValid(token)) {
        dispatch(logout());
        redirect("/login");
        return;
      }

      // Verificar roles requeridos
      const requiredRoles = ROUTE_PERMISSIONS[matchedRoute];
      
      if (!isAuthenticated) {
        dispatch(logout());
        redirect("/login");
        return;
      }

      if (requiredRoles && !hasAnyRole(requiredRoles)) {
        // Redirigir a página de "no autorizado" o dashboard según el caso
        redirect("/unauthorized");
        return;
      }
    }
  }, [dispatch, hasAnyRole, isAuthenticated]);

  return null;
}

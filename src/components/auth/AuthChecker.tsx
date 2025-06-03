"use client";

import { useUserRoles } from "../../lib/hooks/useUserRoles";
import { logout } from "../../lib/redux/slices/authSlice";
import { clearCart } from "../../lib/redux/slices/cartSlice";
import { isTokenValid } from "../../middleware";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";

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
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const prevUserId = useRef<string | undefined>(undefined);

  
  useEffect(() => {
  
    if (prevUserId.current === undefined) {
      prevUserId.current = userId;
      return;
    }

    if (prevUserId.current !== userId) {
      dispatch(clearCart());
      prevUserId.current = userId;
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const currentPath = window.location.pathname;

    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route =>
      currentPath.startsWith(route)
    );

    if (matchedRoute) {
      if (!token || !isTokenValid(token)) {
        dispatch(logout());
        redirect("/login");
        return;
      }

      const requiredRoles = ROUTE_PERMISSIONS[matchedRoute];

      if (!isAuthenticated) {
        dispatch(logout());
        redirect("/login");
        return;
      }

      if (requiredRoles && !hasAnyRole(requiredRoles)) {
        redirect("/unauthorized");
        return;
      }
    }
  }, [dispatch, hasAnyRole, isAuthenticated]);

  return null;
}
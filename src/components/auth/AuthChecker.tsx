"use client";
import { logout } from "@/lib/redux/slices/authSlice";
import { isTokenValid } from "@/middleware";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function AuthChecker() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    const protectedPaths = ["/dashboard", "/profile", "/orders", "/cart"];

    const isProtectedPath = protectedPaths.some(path => 
      currentPath.startsWith(path)
    );

    if (isProtectedPath && (!token || !isTokenValid(token))) {
      dispatch(logout());
      redirect("/");
    }
  }, []);

  return null;
}
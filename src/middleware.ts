import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function isTokenValid(token: string): boolean {
  try {
    console.log("Validating token:", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    console.log("Token expiration time:", exp);
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/login", "/register", "/forgot-password"];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }



  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

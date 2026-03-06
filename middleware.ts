import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    // Update the session and get the response with refreshed cookies
    const { response, user } = await updateSession(request);

    const { nextUrl } = request;
    const isAuthRoute = nextUrl.pathname.startsWith("/auth");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

    // Allow callback route to always pass through
    if (nextUrl.pathname.startsWith("/auth/callback")) {
        return response;
    }

    if (isDashboardRoute && !user) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Public files (svg, png, jpg, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

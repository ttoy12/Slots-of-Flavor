import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const protectedPaths = ['/', '/profile'];
    const userSession = request.cookies.get('user');

    // console.log('Request Pathname: ', pathname);
    // console.log('User session: ', userSession);

    if (protectedPaths.includes(pathname) && !userSession) {
        const url = request.nextUrl.clone();
        url.pathname = '/welcome';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
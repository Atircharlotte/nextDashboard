import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

//initializing NextAuth.js with the authConfig object and exporting the auth property
export default NextAuth(authConfig).auth;

//using matcher option from Middleware to specify that it should run on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

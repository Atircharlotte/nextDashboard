import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

//create getUser function that queries the user from the database
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

//to spread my authConfig object
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  //add providers option
  //provider is an array where you list different login options eg. google, github
  providers: [
    Credentials({
      //use authorize function to handle the authentication logic
      //use zod to validate the email and password before checking if the user exists in the database
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          //call bcrypt.compare to check if the passwords match
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null; // return null to prevent the user from logging in (if password doesn't match)
      },
    }),
  ],
});

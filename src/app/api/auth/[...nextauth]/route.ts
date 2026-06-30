// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const { handlers } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { type: "text" },
        name: { type: "text" },
        email: { type: "email" },
      },
      async authorize(credentials) {
        // Si nos llegan las credenciales validadas, creamos la sesión de NextAuth de inmediato
        if (credentials?.email && credentials?.name) {
          return { 
            id: credentials.id as string, 
            name: credentials.name as string, 
            email: credentials.email as string 
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
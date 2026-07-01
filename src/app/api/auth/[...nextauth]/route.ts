import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

// 1. Definimos la configuración primero
const authOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { type: "text" },
        name: { type: "text" },
        email: { type: "email" },
      },
      async authorize(credentials) {
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
  pages: { signIn: '/login' },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
};

// 2. Usamos la estructura oficial de Auth.js v5
const { handlers } = NextAuth(authOptions);

export const { GET, POST } = handlers;
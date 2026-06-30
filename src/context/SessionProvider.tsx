// src/context/SessionProvider.tsx
'use client';

import { SessionProvider as AuthProvider } from "next-auth/react";
import React from "react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
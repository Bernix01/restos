import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [GitHub],
});

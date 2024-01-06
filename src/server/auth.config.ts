import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db";
import { logger } from "@/lib/log";
import type { OpenIDTokenEndpointResponse } from "oauth4webapi";
import { type TokenSet } from "@auth/core/types";

import type { DefaultSession, NextAuthConfig } from "next-auth";
import { env } from "@/env";
import type { PrismaClient } from "@prisma/client/edge";

const log = logger.child({ module: "auth" });

declare module "@auth/core/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token: string;
    error?: string;
  }
}

declare module "@auth/core/types" {
  interface Account extends Partial<OpenIDTokenEndpointResponse> {
    expires_in: number;
    refresh_token_expires_in: number;
  }
  interface Session extends DefaultSession {
    error?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    error?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface Account extends Partial<OpenIDTokenEndpointResponse> {
    expires_in: number;
    refresh_token_expires_in: number;
  }
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  logger: {
    error(error) {
      log.error(error);
    },
    warn(code) {
      log.warn(code);
    },
    debug(message, metadata) {
      log.debug(metadata, message);
    },
  },
  session: {
    strategy: "database",
  },
  adapter: PrismaAdapter(db as unknown as PrismaClient),
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      log.debug("authorized cb", auth);
      const isLoggedIn = !!auth?.user;
      const inOnHome = nextUrl.pathname === "/";
      const isOnLogin = nextUrl.pathname === "/login";
      if (inOnHome || (isOnLogin && !isLoggedIn)) {
        log.debug("all good, on home or login and not logged in");
        return true;
      } else if (isLoggedIn && isOnLogin) {
        log.debug("redirecting to home, you are already logged in");
        return Response.redirect(new URL("/", nextUrl));
      }
      log.debug("you are what you are", isLoggedIn);
      return isLoggedIn;
    },
    // TODO: implement refresh token when supported by next-auth
    // async jwt({ token, account }) {
    //   if (account) {
    //     // Save the access token and refresh token in the JWT on the initial login
    //     return {
    //       access_token: account.access_token,
    //       expires_at: Math.floor(Date.now() / 1000 + account.expires_in),
    //       refresh_token: account.refresh_token,
    //     };
    //   } else if (Date.now() < (token.expires_at as number) * 1000) {
    //     // If the access token has not expired yet, return it
    //     return token;
    //   } else {
    //     // If the access token has expired, try to refresh it
    //     log.debug("Refreshing access token");
    //     try {
    //       // https://accounts.google.com/.well-known/openid-configuration
    //       // We need the `token_endpoint`.
    //       const response = await fetch(
    //         "https://github.com/login/oauth/access_token",
    //         {
    //           headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //           body: new URLSearchParams({
    //             client_id: env.AUTH_GITHUB_ID,
    //             client_secret: env.AUTH_GITHUB_SECRET,
    //             grant_type: "refresh_token",
    //             refresh_token: token.refresh_token as string,
    //           }),
    //           method: "POST",
    //         },
    //       );
    //       const tokens: TokenSet = (await response.json()) as TokenSet;

    //       if (!response.ok) throw tokens;
    //       log.debug("Refreshed access token");
    //       return {
    //         ...token, // Keep the previous token properties
    //         access_token: tokens.access_token,
    //         expires_at: Math.floor(
    //           Date.now() / 1000 + (tokens.expires_in ?? 0),
    //         ),
    //         // Fall back to old refresh token, but note that
    //         // many providers may only allow using a refresh token once.
    //         refresh_token: tokens.refresh_token ?? token.refresh_token,
    //       };
    //     } catch (error) {
    //       log.error("Error refreshing access token", error);
    //       // The error property will be used client-side to handle the refresh token error
    //       return { ...token, error: "RefreshAccessTokenError" as const };
    //     }
    //   }
    // },
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
  },
  providers: [], // Add providers with an empty array for now
};

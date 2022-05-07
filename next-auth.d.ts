import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth/jwt" {
  interface JWT {
    twitter:
      | (DefaultJWT & { accessToken: string; accessSecret: string })
      | undefined;
    google:
      | (DefaultJWT & {
          id: string;
          accessToken: string | undefined;
        })
      | undefined;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    google?: DefaultSession["user"] & { id: string };
  }
}

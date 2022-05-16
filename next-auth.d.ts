import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
    } & DefaultSession["user"];
  }
}

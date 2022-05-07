import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth/jwt" {
  interface JWT {
    twitter:
      | (DefaultJWT & { accessToken: string; accessSecret: string })
      | undefined;
    google: (DefaultJWT & { accessToken: string }) | undefined;
  }
}

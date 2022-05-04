import { NextApiHandler } from "next";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider, {
  type TwitterLegacyProfile,
} from "next-auth/providers/twitter";

const secret = process.env.NEXTAUTH_SECRET;

const auth: NextApiHandler<unknown> = async (req, res) => {
  const token = await getToken({ req, secret });

  // For more information on each option (and a full list of options) go to
  // https://next-auth.js.org/configuration/options
  return NextAuth(req, res, {
    secret: process.env.NEXTAUTH_SECRET,
    // https://next-auth.js.org/configuration/providers/oauth
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        authorization: {
          params: {
            scope:
              "openid email profile https://www.googleapis.com/auth/tasks.readonly",
            access_type: "offline",
          },
        },
      }),
      TwitterProvider({
        clientId: process.env.TWITTER_ID,
        clientSecret: process.env.TWITTER_SECRET,
      }),
    ],
    theme: {
      colorScheme: "light",
    },
    callbacks: {
      async jwt({ token: nextToken, user, account, profile }) {
        if (account && user && profile) {
          switch (account.provider) {
            case "twitter": {
              nextToken.twitter = {
                ...nextToken,
                id: user.id,
                screenName: (profile as unknown as TwitterLegacyProfile)
                  .screen_name,
                accessToken: account.oauth_token as string,
                accessSecret: account.oauth_token_secret as string,
              };
              nextToken.google = token?.google;
              break;
            }
            case "google": {
              nextToken.google = {
                ...nextToken,
                id: user.id,
                accessToken: account.access_token,
              };
              nextToken.twitter = token?.twitter;
              break;
            }
          }
        }
        return nextToken;
      },
      async session({ session, token }) {
        session.twitter = token.twitter && {
          ...token.twitter,
          image: token.twitter.picture,
        };
        session.google = token.google && {
          ...token.google,
          image: token.google.picture,
        };
        return session;
      },
    },
  });
};

export default auth;

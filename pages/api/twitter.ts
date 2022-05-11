import { PrismaClient } from "@prisma/client";
import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";
import { ApiResponseError, TwitterApi, type UserV2 } from "twitter-api-v2";

type User = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

const prisma = new PrismaClient();

const handler: NextApiHandler<User> = async (req, res) => {
  const session = await getSession({ req });

  if (session) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "twitter" },
    });

    if (account) {
      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_ID,
        appSecret: process.env.TWITTER_SECRET,
        accessToken: account.oauth_token!,
        accessSecret: account.oauth_token_secret!,
      });

      try {
        const user = (
          await twitterClient.v2.me({
            "user.fields": ["profile_image_url", "protected"],
          })
        ).data as User;

        res.status(200).json(user);
      } catch (error) {
        if (error instanceof ApiResponseError && error.code === 401) {
          res.status(401).end();
        } else {
          console.error(error);
          res.status(500).end();
        }
      }
    } else {
      res.status(401).end();
    }
  } else {
    res.status(401).end();
  }
};

export default handler;

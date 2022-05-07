import type { NextApiHandler } from "next";
import { getToken } from "next-auth/jwt";
import { ApiResponseError, TwitterApi, type UserV2 } from "twitter-api-v2";

type User = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

const secret = process.env.NEXTAUTH_SECRET;

const handler: NextApiHandler<User> = async (req, res) => {
  const token = await getToken({ req, secret });

  if (token?.twitter) {
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_ID,
      appSecret: process.env.TWITTER_SECRET,
      accessToken: token.twitter.accessToken,
      accessSecret: token.twitter.accessSecret,
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
        console.log(error);
        res.status(500).end();
      }
    }
  } else {
    res.status(401).end();
  }
};

export default handler;

import assert from "assert";
import type { NextApiHandler } from "next";
import { TwitterApi } from "twitter-api-v2";
import generateName from "../../lib/generateName";
import prisma from "../../lib/prisma";

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
        res.status(401).end();
        return;
      }

      const rules = await prisma.rule.findMany({
        where: { enabled: true },
        include: { user: { select: { accounts: true } } },
      });

      for (const rule of rules) {
        const twitter = rule.user.accounts.find(
          ({ provider }) => provider === "twitter"
        );
        const google = rule.user.accounts.find(
          ({ provider }) => provider === "google"
        );

        if (!twitter || !google) continue;

        const twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_ID,
          appSecret: process.env.TWITTER_SECRET,
          accessToken: twitter.oauth_token!,
          accessSecret: twitter.oauth_token_secret!,
        });

        const { scope } = google;
        assert(scope !== null);

        const generatedName = await generateName({
          credentials: { ...google, scope },
          rule,
        });

        const user = (await twitterClient.v2.me()).data;
        if (user.name === generatedName) continue;

        if (user.name !== rule.lastGeneratedName) {
          await prisma.rule.update({
            where: { userId: rule.userId },
            data: { enabled: false },
          });
        } else {
          await twitterClient.v1.updateAccountProfile({
            name: generatedName,
          });
          await prisma.rule.update({
            where: { userId: rule.userId },
            data: { lastGeneratedName: generatedName },
          });
        }
      }

      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end();
  }
};

export default handler;

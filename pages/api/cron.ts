import assert from "assert";
import { GaxiosError } from "googleapis-common";
import type { NextApiHandler } from "next";
import { ApiResponseError, TwitterApi } from "twitter-api-v2";
import disableRule from "../../lib/disableRule";
import generateName from "../../lib/generateName";
import prisma from "../../lib/prisma";

const handler: NextApiHandler<void> = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
        res.status(401).end();
        return;
      }

      const rules = await prisma.rule.findMany({
        where: { generatedName: { not: null } },
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

        try {
          const generatedName = await generateName({
            credentials: { ...google, scope },
            rule,
          });

          const user = (await twitterClient.v2.me()).data;
          if (user.name === generatedName) continue;

          if (user.name !== rule.generatedName) {
            await disableRule(rule.userId);
            continue;
          }

          await twitterClient.v1.updateAccountProfile({
            name: generatedName,
          });
          await prisma.rule.update({
            where: { userId: rule.userId },
            data: { generatedName },
          });
        } catch (error) {
          if (
            (error instanceof GaxiosError &&
              error.response?.status !== undefined &&
              [400, 401, 403].includes(error.response.status)) ||
            (error instanceof ApiResponseError && error.code === 401)
          ) {
            await disableRule(rule.userId);
            continue;
          }

          throw error;
        }
      }

      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end();
  }
};

export default handler;

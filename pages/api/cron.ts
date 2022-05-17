import assert from "assert";
import { google } from "googleapis";
import type { NextApiHandler } from "next";
import { TwitterApi } from "twitter-api-v2";
import constructName from "../../lib/constructName";
import prisma from "../../lib/prisma";

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.tasks({
  version: "v1",
  auth: oAuth2Client,
});

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

        const { scope } = google;
        assert(scope !== null);
        oAuth2Client.setCredentials({ ...google, scope });

        const twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_ID,
          appSecret: process.env.TWITTER_SECRET,
          accessToken: twitter.oauth_token!,
          accessSecret: twitter.oauth_token_secret!,
        });

        const tasks = (await service.tasks.list({ tasklist: rule.tasklist }))
          .data.items;

        assert(tasks !== undefined);

        await twitterClient.v1.updateAccountProfile({
          name: constructName({ tasks, rule }),
        });
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

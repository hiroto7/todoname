// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import assert from "assert";
import { google } from "googleapis";
import type { NextApiHandler } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { TwitterApi } from "twitter-api-v2";

const prisma = new PrismaClient();

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.tasks({
  version: "v1",
  auth: oAuth2Client,
});

const handler: NextApiHandler<void> = async (req, res) => {
  if (req.method === "POST") {
    const session = await getSession({ req });

    if (session) {
      const accounts = await prisma.account.findMany({
        where: { userId: session.user.id },
      });
      const twitter = accounts.find(({ provider }) => provider === "twitter");
      const google = accounts.find(({ provider }) => provider === "google");

      if (twitter && google) {
        oAuth2Client.setCredentials({
          access_token: google.access_token,
          scope: "https://www.googleapis.com/auth/tasks.readonly",
          token_type: "Bearer",
        });

        const twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_ID,
          appSecret: process.env.TWITTER_SECRET,
          accessToken: twitter.oauth_token!,
          accessSecret: twitter.oauth_token_secret!,
        });

        const { tasklist, normalName, beginningText, separator, endText } =
          req.body;
        const tasks = (await service.tasks.list({ tasklist })).data.items;

        assert(tasks !== undefined);

        if (tasks.length > 0) {
          const sorted = tasks.sort((a, b) => {
            assert(typeof a.position === "string");
            assert(typeof b.position === "string");
            return a.position.localeCompare(b.position);
          });
          const taskNames = sorted.map(({ title }) => title);

          await twitterClient.v1.updateAccountProfile({
            name: `${beginningText}${taskNames.join(separator)}${endText}`,
          });
        } else {
          await twitterClient.v1.updateAccountProfile({
            name: normalName,
          });
        }

        res.status(200).end();
      } else {
        res.status(401).end();
      }
    } else {
      res.status(401).end();
    }
  } else {
    res.status(405).end();
  }
};

export default handler;

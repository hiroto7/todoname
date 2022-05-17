// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { Rule } from "@prisma/client";
import assert from "assert";
import { google } from "googleapis";
import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";
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

const handler: NextApiHandler<Rule> = async (req, res) => {
  switch (req.method) {
    case "GET": {
      const session = await getSession({ req });

      if (!session) {
        res.status(401).end();
        return;
      }

      const rule = await prisma.rule.findFirst({
        where: { userId: session.user.id },
      });

      if (rule) res.status(200).json(rule);
      else res.status(404).end();

      return;
    }
    case "PUT": {
      const session = await getSession({ req });

      if (!session) {
        res.status(401).end();
        return;
      }

      const accounts = await prisma.account.findMany({
        where: { userId: session.user.id },
      });
      const twitter = accounts.find(({ provider }) => provider === "twitter");
      const google = accounts.find(({ provider }) => provider === "google");

      if (!twitter || !google) {
        res.status(401).end();
        return;
      }

      const { scope } = google;
      assert(scope !== null);
      oAuth2Client.setCredentials({ ...google, scope });

      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_ID,
        appSecret: process.env.TWITTER_SECRET,
        accessToken: twitter.oauth_token!,
        accessSecret: twitter.oauth_token_secret!,
      });

      const {
        tasklist,
        normalName,
        beginningText,
        separator,
        endText,
      }: Pick<
        Rule,
        "tasklist" | "normalName" | "beginningText" | "separator" | "endText"
      > = req.body;

      const tasks = (await service.tasks.list({ tasklist })).data.items;

      assert(tasks !== undefined);

      await twitterClient.v1.updateAccountProfile({
        name: constructName({
          tasks,
          rule: { normalName, beginningText, separator, endText },
        }),
      });

      const rule = await prisma.rule.upsert({
        where: { userId: session.user.id },
        create: {
          enabled: true,
          tasklist,
          normalName,
          beginningText,
          separator,
          endText,
          userId: session.user.id,
        },
        update: {
          enabled: true,
          tasklist,
          normalName,
          beginningText,
          separator,
          endText,
        },
      });

      res.status(200).json(rule);
      return;
    }
    default: {
      res.status(405).end();
    }
  }
};

export default handler;

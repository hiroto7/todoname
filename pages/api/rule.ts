import type { Rule } from "@prisma/client";
import assert from "assert";
import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";
import { TwitterApi } from "twitter-api-v2";
import generateName from "../../lib/generateName";
import prisma from "../../lib/prisma";

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
      const rule = { tasklist, normalName, beginningText, separator, endText };

      const { scope } = google;
      assert(scope !== null);

      const generatedName = await generateName({
        credentials: { ...google, scope },
        rule,
      });

      await twitterClient.v1.updateAccountProfile({ name: generatedName });

      await prisma.rule.upsert({
        where: { userId: session.user.id },
        create: { ...rule, userId: session.user.id, generatedName },
        update: { ...rule, generatedName },
      });

      res.status(204).end();
      return;
    }
    default: {
      res.status(405).end();
    }
  }
};

export default handler;

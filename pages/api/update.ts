// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import assert from "assert";
import { google } from "googleapis";
import type { NextApiHandler } from "next";
import { getToken } from "next-auth/jwt";
import { TwitterApi } from "twitter-api-v2";

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.tasks({
  version: "v1",
  auth: oAuth2Client,
});

const secret = process.env.NEXTAUTH_SECRET;

const handler: NextApiHandler<void> = async (req, res) => {
  if (req.method === "POST") {
    const token = await getToken({ req, secret });

    if (token?.twitter && token.google) {
      oAuth2Client.setCredentials({
        access_token: token.google.accessToken,
        scope: "https://www.googleapis.com/auth/tasks.readonly",
        token_type: "Bearer",
      });

      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_ID,
        appSecret: process.env.TWITTER_SECRET,
        accessToken: token.twitter.accessToken,
        accessSecret: token.twitter.accessSecret,
      });

      const { tasklist, normalName, beginningText, separator, endText } =
        req.body;
      const tasks = (await service.tasks.list({ tasklist })).data.items;

      assert(tasks !== undefined);

      if (tasks.length > 0) {
        const taskNames = tasks.map(({ title }) => title);

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
    res.status(405).end();
  }
};

export default handler;

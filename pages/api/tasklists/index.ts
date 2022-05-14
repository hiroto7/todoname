import assert from "assert";
import { google, type tasks_v1 } from "googleapis";
import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.tasks({ version: "v1", auth: oAuth2Client });

const handler: NextApiHandler<tasks_v1.Schema$TaskList[]> = async (
  req,
  res
) => {
  const session = await getSession({ req });

  if (session) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
    });

    if (account) {
      oAuth2Client.setCredentials({
        access_token: account.access_token,
        scope: "https://www.googleapis.com/auth/tasks.readonly",
        token_type: "Bearer",
      });

      const tasklists = (await service.tasklists.list()).data.items;
      assert(tasklists !== undefined);
      res.status(200).json(tasklists);
    } else {
      res.status(401).end();
    }
  } else {
    res.status(401).end();
  }
};

export default handler;

import assert from "assert";
import { google, type tasks_v1 } from "googleapis";
import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.tasks({ version: "v1", auth: oAuth2Client });

const handler: NextApiHandler<tasks_v1.Schema$Task[]> = async (req, res) => {
  const { tasklist } = req.query;
  assert(typeof tasklist === "string");
  
  const session = await getSession({ req });

  if (session) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
    });

    if (account) {
      const { scope } = account;
      assert(scope !== null);
      oAuth2Client.setCredentials({ ...account, scope });

      const tasks = (await service.tasks.list({ tasklist })).data.items;

      assert(tasks !== undefined);
      const sorted = tasks.sort((a, b) => {
        assert(typeof a.position === "string");
        assert(typeof b.position === "string");
        return a.position.localeCompare(b.position);
      });

      res.status(200).json(sorted);
    } else {
      res.status(401).end();
    }
  } else {
    res.status(401).end();
  }
};

export default handler;

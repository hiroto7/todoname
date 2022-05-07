import assert from "assert";
import { google, type tasks_v1 } from "googleapis";
import type { NextApiHandler } from "next";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.tasks({ version: "v1", auth: oAuth2Client });

const handler: NextApiHandler<tasks_v1.Schema$TaskList[]> = async (
  req,
  res
) => {
  const token = await getToken({ req, secret });

  if (token?.google) {
    oAuth2Client.setCredentials({
      access_token: token.google.accessToken,
      scope: "https://www.googleapis.com/auth/tasks.readonly",
      token_type: "Bearer",
    });

    const tasklists = (await service.tasklists.list()).data.items;
    assert(tasklists !== undefined);
    res.status(200).json(tasklists);
  } else {
    res.status(401).end();
  }
};

export default handler;

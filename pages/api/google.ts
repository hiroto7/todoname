import { PrismaClient } from "@prisma/client";
import { GaxiosError } from "gaxios";
import { google, type oauth2_v2 } from "googleapis";
import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.oauth2({ version: "v2", auth: oAuth2Client });

const handler: NextApiHandler<oauth2_v2.Schema$Userinfo> = async (req, res) => {
  const session = await getSession({ req });

  if (session) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
    });

    if (account) {
      oAuth2Client.setCredentials({
        access_token: account.access_token,
        token_type: "Bearer",
      });

      try {
        const [userinfoResponse, tokeninfoResponse] = await Promise.all([
          service.userinfo.get(),
          service.tokeninfo(),
        ]);

        const userinfo = userinfoResponse.data;
        const tokeninfo = tokeninfoResponse.data;

        if (
          tokeninfo.scope
            ?.split(" ")
            .includes("https://www.googleapis.com/auth/tasks.readonly")
        ) {
          res.status(200).json(userinfo);
        } else {
          res.status(403).end();
        }
      } catch (error) {
        if (error instanceof GaxiosError && error.response?.status === 401) {
          res.status(401).end();
        } else {
          console.error(error);
          res.status(500).end();
        }
      }
    } else {
      res.status(401).end();
    }
  } else {
    res.status(401).end();
  }
};

export default handler;

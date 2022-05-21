import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";
import disableRule from "../../../lib/disableRule";

const handler: NextApiHandler<void> = async (req, res) => {
  if (req.method === "POST") {
    const session = await getSession({ req });

    if (session) {
      await disableRule(session.user.id);
      res.status(204).end();
    } else {
      res.status(401).end();
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end();
  }
};

export default handler;

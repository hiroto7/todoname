import type { Rule } from "@prisma/client";
import assert from "assert";
import type { Credentials } from "google-auth-library";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
});

const service = google.tasks({
  version: "v1",
  auth: oAuth2Client,
});

const generateName = async ({
  credentials,
  rule,
}: Readonly<{
  credentials: Credentials;
  rule: Pick<
    Rule,
    "beginningText" | "separator" | "endText" | "normalName" | "tasklist"
  >;
}>) => {
  oAuth2Client.setCredentials(credentials);

  const {tasklist, beginningText, separator, endText, normalName} = rule

  const tasks = (await service.tasks.list({ tasklist })).data
    .items;
  assert(tasks !== undefined);

  if (tasks.length > 0) {
    const sorted = tasks.sort((a, b) => {
      assert(typeof a.position === "string" && typeof b.position === "string");
      return a.position.localeCompare(b.position);
    });
    const taskNames = sorted.map(({ title }) => title);

    return `${beginningText}${taskNames.join(separator)}${endText}`;
  } else {
    return normalName;
  }
};

export default generateName;

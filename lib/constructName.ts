import type { tasks_v1 } from "googleapis";
import type { Rule } from "@prisma/client";
import assert from "assert";

const constructName = ({
  tasks,
  rule,
}: {
  tasks: tasks_v1.Schema$Task[];
  rule: Pick<Rule, "beginningText" | "separator" | "endText" | "normalName">;
}) => {
  if (tasks.length > 0) {
    const { beginningText, separator, endText } = rule;
    const sorted = tasks.sort((a, b) => {
      assert(typeof a.position === "string");
      assert(typeof b.position === "string");
      return a.position.localeCompare(b.position);
    });
    const taskNames = sorted.map(({ title }) => title);

    return `${beginningText}${taskNames.join(separator)}${endText}`;
  } else {
    return rule.normalName;
  }
};

export default constructName;

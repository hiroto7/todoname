import prisma from "./prisma";

const disableRule = async (userId: string) =>
  await prisma.rule.update({
    where: { userId },
    data: { generatedName: null },
  });

export default disableRule;

const prisma = require("../config/conn.js");
const { Decimal } = require("@prisma/client");

module.exports = {
  monthlyAmout: async () => {
    const amount = await prisma.contributionType.findFirst({
      where: {
        category: "monthly",
      },
      select: {
        defaultAmount: true,
      },
    });

    if (!amount) throw new Error("No default monthly amount found!");

    return new Decimal(amount.defaultAmount ?? 0);
  },
};

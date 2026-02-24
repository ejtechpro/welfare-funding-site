if (data.contributionType === "monthly_contribution") {
//TODO: Update balance account directly.

        const now = new Date();
        const thisMonth = now.getMonth() + 1;
        const thisYear = now.getFullYear();

        const balance = await tx.balance.upsert({
          where: { memberId: data.memberId },
          update: {},
          create: {
            memberId: data.memberId,
            prepaid: new Decimal(0),
            due: new Decimal(0),
            currentMonth: thisMonth,
            currentYear: thisYear,
            status: "open",
          },
        });

        let prepaid = new Decimal(balance.prepaid);
        let due = new Decimal(balance.due);
        let status = balance.status;
        let remaining = new Decimal(paymentAmount);

        // ✅ STEP 1: If month/year changed → roll forward first
        const isSameMonth =
          balance.currentMonth === thisMonth &&
          balance.currentYear === thisYear;

        if (!isSameMonth) {
          // apply monthly charge
          if (prepaid.greaterThanOrEqualTo(MONTHLY_AMOUNT)) {
            prepaid = prepaid.minus(MONTHLY_AMOUNT);
            status = "paid";
          } else {
            const shortfall = MONTHLY_AMOUNT.minus(prepaid);
            prepaid = new Decimal(0);
            due = due.plus(shortfall);
            status = "open";
          }

          await tx.balance.update({
            where: { memberId: data.memberId },
            data: {
              prepaid,
              due,
              currentMonth: thisMonth,
              currentYear: thisYear,
              status,
            },
          });
        }

        console.log("Before payment", {
          prepaid: prepaid.toString(),
          due: due.toString(),
          status,
        });

        // ✅ STEP 2: Pay existing due first
        if (due.greaterThan(0)) {
          if (remaining.greaterThanOrEqualTo(due)) {
            remaining = remaining.minus(due);
            due = new Decimal(0);
            status = "paid";
          } else {
            due = due.minus(remaining);
            remaining = new Decimal(0);
          }
        }

        // ✅ STEP 2.5: Close current month if payment can fully cover it
        if (
          status === "open" &&
          remaining.greaterThanOrEqualTo(MONTHLY_AMOUNT)
        ) {
          remaining = remaining.minus(MONTHLY_AMOUNT);
          status = "paid";
        }

        // ✅ STEP 3: If month still open and payment < monthly → create due
        if (
          status === "open" &&
          remaining.greaterThan(0) &&
          remaining.lessThan(MONTHLY_AMOUNT)
        ) {
          const shortfall = MONTHLY_AMOUNT.minus(remaining);
          due = due.plus(shortfall);
          remaining = new Decimal(0);
        }

        // ✅ STEP 4: Anything extra goes to prepaid
        if (remaining.greaterThan(0)) {
          prepaid = prepaid.plus(remaining);
        }

        // ✅ STEP 5: Save
        const updatedBalance = await tx.balance.update({
          where: { memberId: data.memberId },
          data: {
            prepaid,
            due,
            status,
          },
        });

        console.log("After payment", {
          prepaid: prepaid.toString(),
          due: due.toString(),
          status,
        });

        return {
          contributionId: contribution.id,
          balance: updatedBalance,
        };
      }

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { inngest } from "./client";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);


export const spendingInsights = inngest.createFunction(
  { name: "Generate Spending Insights", id: "generate-spending-insights" },
  [
    { cron: "0 8 1 * *" }, // 1 st of every month at 08:00
    { event: "app/spending.insights" }, // manual trigger for testing / on-demand
  ],
  async ({ step }) => {
    /* ─── 1. Pull users with expenses this month ────────────────────── */
    const users = await step.run("Fetch users with expenses", async () => {
      return await convex.query(api.inngest.getUsersWithExpenses);
    });

    /* ─── 2. Iterate users & send insight email ─────────────────────── */
    const results = [];

    for (const user of users) {
      /* a. Pull last-month expenses (skip if none) */
      const expenses = await step.run(`Expenses · ${user._id}`, () =>
        convex.query(api.inngest.getUserMonthlyExpenses, { userId: user._id })
      );
      if (!expenses?.length) continue;

      /* b. Build JSON blob for the prompt */
      const expenseData = JSON.stringify({
        expenses,
        totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
        categories: expenses.reduce((cats, e) => {
          cats[e.category ?? "uncategorised"] =
            (cats[e.category] ?? 0) + e.amount;
          return cats;
        }, {}),
      });

      /* c. Prompt + AI call using step.ai.wrap (retry-aware) */
      const prompt = `
As a financial analyst, review this user's spending data for the past month and provide insightful observations and suggestions.
Focus on spending patterns, category breakdowns, and actionable advice for better financial management.
Use Indian Rupees (₹) as the currency symbol for all amounts mentioned.
Use a friendly, encouraging tone. Format your response in HTML for an email.

User spending data:
${expenseData}

Provide your analysis in these sections:
1. Monthly Overview
2. Top Spending Categories
3. Unusual Spending Patterns (if any)
4. Saving Opportunities
5. Recommendations for Next Month
      `.trim();

      try {
        const htmlText = await step.ai.wrap(
          `gemini · ${user._id}`,
          async (p) => {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const candidateModels = [
              "gemini-3.5-flash-lite",
              "gemini-3.5-flash",
              "gemini-2.5-pro",
            ];
            let lastErr = null;
            for (const m of candidateModels) {
              try {
                const model = genAI.getGenerativeModel({ model: m });
                const res = await model.generateContent(p);
                return res.response.text() || "";
              } catch (err) {
                console.warn(
                  `Gemini model ${m} failed (${err.message}). Trying fallback in 1s...`
                );
                lastErr = err;
                await new Promise((res) => setTimeout(res, 1000));
              }
            }
            throw lastErr;
          },
          prompt
        );

        // Clean up markdown code fences if Gemini wraps output in ```html ... ```
        const htmlBody = (htmlText || "")
          .replace(/^```html\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();

        /* d. Send the email */
        await step.run(`Email · ${user._id}`, () =>
          convex.action(api.email.sendEmail, {
            to: user.email,
            subject: "Your Monthly Spending Insights",
            html: `
              <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <h1 style="color: #4F46E5;">Your Monthly Financial Insights</h1>
                <p>Hi ${user.name},</p>
                <p>Here's your personalized spending analysis for the past month:</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                ${htmlBody}
              </div>
            `,
          })
        );

        results.push({ userId: user._id, success: true });
      } catch (err) {
        console.error(`Failed to process insights for ${user.email}:`, err);
        results.push({
          userId: user._id,
          success: false,
          error: err.message,
        });
      }
    }

    /* ─── 3. Summary for the cron log ───────────────────────────────── */
    return {
      processed: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }
);

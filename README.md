# Splitr – AI-Powered Expense Sharing App

Splitr is a modern, high-performance web application engineered to eliminate the social friction and mathematical complexity of shared finances. Designed for roommates, travelers, and friend groups, it provides a seamless, visual platform for tracking collective spending, sending automated payment reminders, and delivering AI-driven monthly financial insights.

![splitr](https://github.com/user-attachments/assets/11e138c4-efcf-4a85-8586-f2993da118d8)

---

## ✨ Features

- 💸 **Smart Expense Sharing**: Split bills, track group balances, and settle up with ease.
- 🧠 **AI Spending Insights**: Monthly financial reports powered by Google Gemini AI (`gemini-3.5-flash`).
- 📧 **Automated Email Notifications**: Free, reliable email delivery using Nodemailer & Gmail SMTP for payment reminders and spending summaries.
- ⚡ **Real-Time Data**: Powered by Convex for instant database sync and serverless actions.
- 🔒 **Authentication**: Secure user authentication via Clerk.
- ⏱️ **Scheduled Workflows**: Automated cron jobs managed by Inngest.

---

## 🚀 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Convex Deployment
CONVEX_DEPLOYMENT=your-convex-deployment-name
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_JWT_ISSUER_DOMAIN=your-clerk-jwt-domain
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Email Delivery (Gmail SMTP via Nodemailer)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password

# Google Gemini AI Key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the Next.js development server**:
   ```bash
   npm run dev
   ```

3. **Run Convex backend**:
   ```bash
   npx convex dev
   ```

4. **Run Inngest Dev Server**:
   ```bash
   npx inngest-cli@latest dev
   ```

---

## ☁️ Deployment

- **Vercel**: Simply connect your GitHub repository to Vercel for automatic deployments on push.
- **Convex Production**: Sync production environment variables and deploy functions:
  ```bash
  npx convex deploy -y
  ```

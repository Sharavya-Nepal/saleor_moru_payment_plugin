# Moru Payment App - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your Moru credentials:

```bash
cp .env.example .env
```

**Important:** Update these values in `.env`:
- `MORU_API_URL` - Moru API endpoint (default: test environment)
- `MORU_AUTH_KEY` - Your Moru AUTH_KEY (format: `test_xxx` for test, `live_xxx` for production)
- `APP_API_BASE_URL` - Your app's public URL (needed for payment callbacks)

### 3. Generate GraphQL Types (Optional during development)
```bash
pnpm generate
```

**Note:** This will fail until you connect to a Saleor instance. You can skip this step for initial setup.

### 4. Start Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 5. Expose Your Local Server

Use ngrok or localtunnel to expose your local server:

```bash
# Using ngrok
ngrok http 3000

# OR using localtunnel
npx localtunnel --port 3000
```

Save the public URL (e.g., `https://abc123.ngrok.io`)

### 6. Install in Saleor

1. Go to your Saleor Dashboard
2. Navigate to **Apps** → **Install external app**
3. Enter: `https://your-tunnel-url/api/manifest`
4. Click **Install**

## 📋 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm generate` - Generate GraphQL types
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler check
- `pnpm test` - Run tests

## 🔧 VS Code Tasks

Press `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows/Linux) to see available tasks:

- **Start Development Server** (default)
- Generate GraphQL Types
- Build for Production
- Type Check
- Lint Code
- Run Tests

## 🏗️ Project Structure

```
src/
├── pages/
│   ├── api/
│   │   ├── webhooks/          # Webhook handlers
│   │   ├── manifest.ts        # App manifest
│   │   └── register.ts        # App registration
│   ├── index.tsx              # Home page
│   └── data-privacy.tsx       # Privacy policy
├── lib/
│   └── moru-payment-service.ts # Moru API integration
└── saleor-app.ts              # Saleor app configuration
```

## 🔌 Webhook Endpoints

The app implements these Saleor webhooks:

- `POST /api/webhooks/transaction-initialize-session` - Initialize payment
- `POST /api/webhooks/transaction-process-session` - Check payment status
- `POST /api/webhooks/transaction-charge-requested` - Verify completed payment
- `POST /api/webhooks/transaction-refund-requested` - Returns not supported (use Moru dashboard)
- `POST /api/webhooks/transaction-cancel-requested` - Returns not supported (user cancels in UI)
- `GET /api/webhooks/payment-callback` - Receives Moru payment callbacks

## ⚠️ Important Moru API Limitations

Moru Payment Gateway currently supports:
- ✅ Payment initiation
- ✅ Payment status checking
- ✅ User-driven cancellation (in payment interface)

Not supported via API:
- ❌ Programmatic refunds (use Moru dashboard)
- ❌ Programmatic cancellations (users cancel in payment UI)
- ❌ Separate charge/capture (payment is direct)

## 🐛 Troubleshooting

### GraphQL Generation Fails
This is normal if you haven't connected to a Saleor instance yet. You can:
- Update the schema URL in `codegen.ts`
- Or skip this step until you have a Saleor instance

### App Installation Fails
- Ensure your tunnel is running
- Check the manifest URL is accessible
- Verify environment variables are set

### Webhooks Not Working
- Check Saleor Dashboard → Apps → Your App → Webhooks
- Verify webhook URLs match your tunnel URL
- Review app logs for errors

## 📚 Next Steps

1. **Test Payments**: Create a test order in Saleor and process payment
2. **Customize UI**: Update the home page in `src/pages/index.tsx`
3. **Add Features**: Extend webhook handlers for your needs
4. **Deploy**: Deploy to Vercel, Railway, or your preferred platform

## 🔒 Security Notes

- Never commit `.env` file
- Use HTTPS in production
- Rotate API keys regularly
- Enable webhook signature verification

## 📖 Documentation

- [Saleor Payment Apps](https://docs.saleor.io/developer/extending/apps/building-payment-app)
- [Saleor App SDK](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/overview)
- [Next.js Docs](https://nextjs.org/docs)

## 💡 Tips

- Use VS Code tasks for common operations
- Check the console for detailed logs
- Review README.md for comprehensive documentation
- Join Saleor Discord for community support

---

**Happy coding! 🎉**

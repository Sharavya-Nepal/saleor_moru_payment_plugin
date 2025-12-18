# Moru Payment App for Saleor

Saleor Payment App for Moru Payment Wallet integration using Next.js and TypeScript.

## Overview

This app integrates Moru Payment Wallet with Saleor, enabling secure payment processing through the Moru Payment Gateway. It implements all necessary Saleor transaction webhooks for complete payment lifecycle management.

## Features

- ✅ **Transaction Initialization** - Initialize payments with Moru Gateway
- ✅ **Payment Processing** - Process and confirm payments via Moru interface
- ✅ **Payment Status Checking** - Real-time payment status verification
- ✅ **Webhook Integration** - Saleor transaction webhook support
- ✅ **Secure Communication** - AUTH_KEY based authentication
- ✅ **Return URL Handling** - Payment callback processing

**Note:** Moru Gateway API currently supports:
- Payment initiation (`/v2/initiate`)
- Payment status checking (`/v2/check`)
- User-driven cancellation (in payment interface)

Refunds and programmatic cancellations must be handled through the Moru dashboard.

## Prerequisites

Before you start, ensure you have:

- **Node.js** >= 18.17.0 <= 20
- **pnpm** >= 9
- **Moru Payment Gateway Account** with API credentials
- **Saleor Instance** (Cloud or self-hosted)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Saleor Configuration
APL=file

# Moru Payment Gateway Configuration
# Get your AUTH_KEY from Moru Dashboard at https://moru.com.np
MORU_API_URL=https://test.moru-gateway.pnpl.com.np/gateway
MORU_AUTH_KEY=your_moru_auth_key_here

# App Configuration
APP_DEBUG=false
APP_API_BASE_URL=https://your-app-domain.com
```U_MERCHANT_ID=your_merchant_id_here
MORU_SECRET_KEY=your_secret_key_here

# App Configuration
APP_DEBUG=false
SECRET_KEY=your_secret_key_for_signing
```

### 3. Generate GraphQL Types

```bash
pnpm generate
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 5. Expose Local Environment (for development)

Use a tunneling service to expose your local server:

```bash
# Using ngrok
ngrok http 3000

# Using localtunnel
npx localtunnel --port 3000
```

### 6. Install in Saleor Dashboard

1. Go to your Saleor Dashboard
2. Navigate to **Apps** → **Install external app**
3. Enter the manifest URL:
   ```
   https://your-tunnel-url.com/api/manifest
   ```
4. Click **Install**

## Storefront Integration

After installing the Payment App, you need to integrate it with your storefront to complete the payment flow and create orders.

**📖 See [STOREFRONT_INTEGRATION.md](./STOREFRONT_INTEGRATION.md) for detailed implementation guide.**

### Quick Summary

The complete payment flow requires these steps:

1. Call `transactionInitialize` mutation when user clicks "Pay Now"
2. Redirect user to Moru payment URL from response
3. User completes payment on Moru
4. **Call `transactionProcess` mutation after redirect back** (finalizes transaction)
5. **Call `checkoutComplete` mutation to create the order** (converts checkout to order)

Without steps 4 and 5, payment will succeed but order won't be created!

## Project Structure

```
moru-saleor/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── transaction-initialize-session.ts
│   │   │   │   ├── transaction-process-session.ts
│   │   │   │   ├── transaction-charge-requested.ts
│   │   │   │   ├── transaction-refund-requested.ts
│   │   │   │   └── transaction-cancel-requested.ts
│   │   │   ├── manifest.ts
│   │   │   └── register.ts
│   │   ├── index.tsx
│   │   ├── data-privacy.tsx
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   ├── lib/
│   │   └── moru-payment-service.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── Home.module.css
│   └── saleor-app.ts
├── graphql/
│   └── *.graphql
├── generated/
│   └── graphql.ts (auto-generated)
├── package.json
├── tsconfig.json
├── next.config.ts
├── codegen.ts
└── README.md
```

## Webhook Handlers

The app implements the following Saleor synchronous webhooks:

### TRANSACTION_INITIALIZE_SESSION
Triggered when a payment is initiated. Creates a payment session with Moru Gateway.

### TRANSACTION_PROCESS_SESSION
Processes and confirms the payment after customer action.

### TRANSACTION_CHARGE_REQUESTED
Captures an authorized payment.

### TRANSACTION_REFUND_REQUESTED
Returns REFUND_FAILURE as Moru doesn't support programmatic refunds. Process refunds manually through Moru dashboard.

### TRANSACTION_CANCEL_REQUESTED
Returns CANCEL_FAILURE as Moru doesn't support programmatic cancellation. Users can cancel in the Moru payment interface.

## Moru Payment Service
## Moru Payment Service

The `MoruPaymentService` class (`src/lib/moru-payment-service.ts`) handles all communication with Moru Payment Gateway:

- `initiatePayment()` - Initialize a payment session
- `checkPaymentStatus()` - Check current payment status

### API Endpoints

Based on Moru API documentation (https://test.moru-gateway.pnpl.com.np/gateway):

- `POST /v2/initiate` - Initiate payment and get payment URL
- `POST /v2/check` - Check transaction status

### Payment Flow

1. **Initialize**: Create payment session with amount and return URL
2. **Redirect**: Send customer to Moru payment interface
3. **User Action**: Customer logs in to Moru and confirms payment
4. **Callback**: Moru redirects back to your return URL with status
5. **Verify**: Check payment status via API to confirm

### Unsupported Operations

The following operations are **not available** via Moru API:
- Programmatic refunds (handled via Moru dashboard)
- Programmatic cancellations (users cancel in payment interface)
- Separate charge/capture operations (payment is direct)
## Development

### Run Development Server

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Run Type Checking

```bash
pnpm type-check
```

### Run Linting

```bash
pnpm lint
```

### Run Tests

```bash
pnpm test
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:

- Railway
- Render
- Heroku
- Digital Ocean App Platform
- AWS Amplify

## APL (Auth Persistence Layer)

The app supports different APL backends for storing authentication data:

### File APL (Development)
```env
APL=file
```
Stores auth data in a local JSON file. **Not recommended for production.**

### Upstash APL (Production)
```env
APL=upstash
UPSTASH_URL=your_upstash_redis_url
UPSTASH_TOKEN=your_upstash_token
```
Uses Upstash Redis for auth storage. **Recommended for production.**

## Security

- All webhook requests are verified using Saleor's signature
- API keys and secrets are stored in environment variables
- HTTPS is required for production deployment
- Payment data is encrypted in transit

## Troubleshooting

### App Installation Fails
- Verify the manifest URL is accessible
- Check that the tunneling service is running
- Ensure environment variables are set correctly

### Webhooks Not Received
- Verify webhook URLs in Saleor Dashboard
- Check that bodyParser is disabled in webhook handlers
- Review app logs for errors

### Moru API Errors
- Verify API credentials in `.env`
- Check Moru API documentation for endpoint changes
- Review network connectivity

## Support

For issues and questions:
- Moru Support: support@moru.example.com
- Saleor Documentation: https://docs.saleor.io

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

## References

- [Saleor Payment Apps Documentation](https://docs.saleor.io/developer/extending/apps/building-payment-app)
- [Saleor App SDK](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/overview)
- [Saleor Transactions API](https://docs.saleor.io/developer/payments/transactions)
- [Next.js Documentation](https://nextjs.org/docs)

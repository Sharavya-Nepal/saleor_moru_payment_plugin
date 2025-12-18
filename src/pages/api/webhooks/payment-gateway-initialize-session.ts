import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { PaymentGatewayInitializeSessionPayloadFragment } from "../../../../generated/graphql";
import { gql } from "urql";

const PaymentGatewayInitializeSessionPayload = gql`
  fragment PaymentGatewayInitializeSessionPayload on PaymentGatewayInitializeSession {
    sourceObject {
      ... on Checkout {
        id
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      ... on Order {
        id
        total {
          gross {
            amount
            currency
          }
        }
      }
    }
    amount
    data
  }
`;

const PaymentGatewayInitializeSessionSubscription = gql`
  ${PaymentGatewayInitializeSessionPayload}
  subscription PaymentGatewayInitializeSession {
    event {
      ...PaymentGatewayInitializeSessionPayload
    }
  }
`;

export const paymentGatewayInitializeSessionWebhook =
  new SaleorSyncWebhook<PaymentGatewayInitializeSessionPayloadFragment>({
    name: "Payment Gateway Initialize Session",
    webhookPath: "/api/webhooks/payment-gateway-initialize-session",
    event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: PaymentGatewayInitializeSessionSubscription,
  });

export default paymentGatewayInitializeSessionWebhook.createHandler(async (req, res, ctx) => {
  const { payload } = ctx;

  console.log("Payment Gateway Initialize Session received:", {
    amount: payload.amount,
    sourceObject: payload.sourceObject,
  });

  try {
    // Return the payment gateway configuration
    // This tells the storefront that Moru is available as a payment method
    return res.status(200).json({
      data: {
        paymentGatewayId: "moru.payment.app",
        name: "Moru Wallet",
        currencies: ["NPR", "USD"], // Supported currencies
        config: [
          {
            field: "description",
            value: "Pay securely with your Moru digital wallet",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error in payment gateway initialize session:", error);

    return res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

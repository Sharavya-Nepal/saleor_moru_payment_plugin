import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { TransactionInitializeSessionPayloadFragment } from "../../../../generated/graphql";
import { getMoruService } from "../../../lib/moru-payment-service";
import { gql } from "urql";

const TransactionInitializeSessionPayload = gql`
  fragment TransactionInitializeSessionPayload on TransactionInitializeSession {
    action {
      amount
      currency
      actionType
    }
    merchantReference
    data
    sourceObject {
      ... on Checkout {
        id
        user {
          id
          email
          firstName
          lastName
        }
        billingAddress {
          firstName
          lastName
          streetAddress1
          city
          postalCode
          country {
            code
          }
        }
      }
      ... on Order {
        id
        user {
          id
          email
          firstName
          lastName
        }
        billingAddress {
          firstName
          lastName
          streetAddress1
          city
          postalCode
          country {
            code
          }
        }
      }
    }
  }
`;

const TransactionInitializeSessionSubscription = gql`
  ${TransactionInitializeSessionPayload}
  subscription TransactionInitializeSession {
    event {
      ...TransactionInitializeSessionPayload
    }
  }
`;

export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionPayloadFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "/api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionSubscription,
  });

export default transactionInitializeSessionWebhook.createHandler(async (req, res, ctx) => {
  const { payload } = ctx;

  console.log("Transaction Initialize Session received:", {
    amount: payload.action.amount,
    currency: payload.action.currency,
    merchantReference: payload.merchantReference,
  });

  try {
    const moruService = getMoruService();

    // Extract customer information
    const sourceObject = payload.sourceObject;
    const user = sourceObject?.user;
    const billingAddress = sourceObject?.billingAddress;

    // Get checkout or order ID from sourceObject
    const checkoutOrOrderId = sourceObject?.id;

    // Generate unique transaction ID
    const transactionId = payload.merchantReference || `saleor_${crypto.randomUUID()}`;

    // Build return URL - redirect directly to storefront
    const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";
    const returnUrl = checkoutOrOrderId 
      ? `${storefrontUrl}/checkout/${encodeURIComponent(checkoutOrOrderId)}/paymentsuccess/`
      : `${storefrontUrl}/checkout?payment=success`;

    // Initialize payment with Moru
    const moruResponse = await moruService.initiatePayment({
      return_url: returnUrl,
      amount: payload.action.amount.toString(),
      transaction_id: transactionId,
      merchant_info: {
        email: user?.email || "customer@example.com",
        name: user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
          : billingAddress
          ? `${billingAddress.firstName || ""} ${billingAddress.lastName || ""}`.trim()
          : undefined,
      },
      additional_fields: {},
    });

    if (moruResponse.code !== "0000") {
      // Return failure if Moru initialization fails
      return res.status(200).json({
        result: "CHARGE_FAILURE",
        amount: payload.action.amount,
        message: moruResponse.message || "Failed to initialize payment with Moru",
      });
    }

    // Return action required for payment confirmation
    return res.status(200).json({
      result: "CHARGE_ACTION_REQUIRED",
      amount: payload.action.amount,
      pspReference: moruResponse.data.mpi,
      data: {
        paymentUrl: moruResponse.data.payment_url,
        transactionId: moruResponse.data.transaction_id,
        mpi: moruResponse.data.mpi,
        msi: moruResponse.data.msi,
      },
    });
  } catch (error) {
    console.error("Error in transaction initialize session:", error);

    return res.status(200).json({
      result: "CHARGE_FAILURE",
      amount: payload.action.amount,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

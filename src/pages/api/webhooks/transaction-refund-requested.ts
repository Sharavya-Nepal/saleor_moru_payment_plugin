import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { TransactionRefundRequestedPayloadFragment } from "../../../../generated/graphql";
import { gql } from "urql";

const TransactionRefundRequestedPayload = gql`
  fragment TransactionRefundRequestedPayload on TransactionRefundRequested {
    action {
      amount
      currency
      actionType
    }
    transaction {
      id
      pspReference
      refundedAmount {
        amount
        currency
      }
    }
    grantedRefund {
      id
      amount {
        amount
        currency
      }
    }
  }
`;

const TransactionRefundRequestedSubscription = gql`
  ${TransactionRefundRequestedPayload}
  subscription TransactionRefundRequested {
    event {
      ...TransactionRefundRequestedPayload
    }
  }
`;

export const transactionRefundRequestedWebhook =
  new SaleorSyncWebhook<TransactionRefundRequestedPayloadFragment>({
    name: "Transaction Refund Requested",
    webhookPath: "/api/webhooks/transaction-refund-requested",
    event: "TRANSACTION_REFUND_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionRefundRequestedSubscription,
  });

export default transactionRefundRequestedWebhook.createHandler(async (req, res, ctx) => {
  const { payload } = ctx;

  console.log("Transaction Refund Requested:", {
    amount: payload.action.amount,
    currency: payload.action.currency,
    pspReference: payload.transaction?.pspReference,
  });

  try {
    // Moru Gateway does not support refund operations through API
    // Refunds must be processed manually through Moru dashboard
    console.log("Refund requested but not supported by Moru API:", {
      transactionId: payload.transaction?.pspReference,
      amount: payload.action.amount,
    });

    return res.status(200).json({
      result: "REFUND_FAILURE",
      amount: payload.action.amount,
      message:
        "Refunds are not supported through Moru API. Please process refunds manually through Moru dashboard.",
    });
  } catch (error) {
    console.error("Error in transaction refund requested:", error);

    return res.status(200).json({
      result: "REFUND_FAILURE",
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

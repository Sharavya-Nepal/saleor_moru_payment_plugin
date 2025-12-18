import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { TransactionCancelationRequestedPayloadFragment } from "../../../../generated/graphql";
import { gql } from "urql";

const TransactionCancelationRequestedPayload = gql`
  fragment TransactionCancelationRequestedPayload on TransactionCancelationRequested {
    action {
      amount
      currency
      actionType
    }
    transaction {
      id
      pspReference
      canceledAmount {
        amount
        currency
      }
    }
  }
`;

const TransactionCancelationRequestedSubscription = gql`
  ${TransactionCancelationRequestedPayload}
  subscription TransactionCancelationRequested {
    event {
      ...TransactionCancelationRequestedPayload
    }
  }
`;

export const transactionCancelRequestedWebhook =
  new SaleorSyncWebhook<TransactionCancelationRequestedPayloadFragment>({
    name: "Transaction Cancelation Requested",
    webhookPath: "/api/webhooks/transaction-cancel-requested",
    event: "TRANSACTION_CANCELATION_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionCancelationRequestedSubscription,
  });

export default transactionCancelRequestedWebhook.createHandler(async (req, res, ctx) => {
  const { payload } = ctx;

  console.log("Transaction Cancel Requested:", {
    amount: payload.action.amount,
    currency: payload.action.currency,
    pspReference: payload.transaction?.pspReference,
  });

  try {
    // Moru Gateway does not support cancel operations through API
    // Users can cancel payments in the Moru payment interface
    console.log("Cancel requested but handled by user in Moru interface:", {
      transactionId: payload.transaction?.pspReference,
      amount: payload.action.amount,
    });

    return res.status(200).json({
      result: "CANCEL_FAILURE",
      amount: payload.action.amount,
      message:
        "Cancellations are handled by users in the Moru payment interface. Cannot cancel programmatically.",
    });
  } catch (error) {
    console.error("Error in transaction cancel requested:", error);

    return res.status(200).json({
      result: "CANCEL_FAILURE",
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

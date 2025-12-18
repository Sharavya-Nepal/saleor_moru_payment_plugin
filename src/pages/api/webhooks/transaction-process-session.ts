import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { TransactionProcessSessionPayloadFragment } from "../../../../generated/graphql";
import { getMoruService } from "../../../lib/moru-payment-service";
import { gql } from "urql";

const TransactionProcessSessionPayload = gql`
  fragment TransactionProcessSessionPayload on TransactionProcessSession {
    action {
      amount
      currency
      actionType
    }
    merchantReference
    transaction {
      id
      pspReference
    }
    data
    sourceObject {
      ... on Checkout {
        id
      }
      ... on Order {
        id
      }
    }
  }
`;

const TransactionProcessSessionSubscription = gql`
  ${TransactionProcessSessionPayload}
  subscription TransactionProcessSession {
    event {
      ...TransactionProcessSessionPayload
    }
  }
`;

export const transactionProcessSessionWebhook =
  new SaleorSyncWebhook<TransactionProcessSessionPayloadFragment>({
    name: "Transaction Process Session",
    webhookPath: "/api/webhooks/transaction-process-session",
    event: "TRANSACTION_PROCESS_SESSION",
    apl: saleorApp.apl,
    query: TransactionProcessSessionSubscription,
  });

export default transactionProcessSessionWebhook.createHandler(async (req, res, ctx) => {
  const { payload } = ctx;

  console.log("Transaction Process Session received:", {
    amount: payload.action.amount,
    currency: payload.action.currency,
    pspReference: payload.transaction?.pspReference,
  });

  try {
    const moruService = getMoruService();

    // Get transaction ID from data or pspReference
    const transactionId = (payload.data as { transactionId?: string })?.transactionId || payload.transaction?.pspReference;

    if (!transactionId) {
      throw new Error("Transaction ID not found in payload");
    }

    // Check payment status with Moru
    const moruResponse = await moruService.checkPaymentStatus({
      transaction_id: transactionId,
    });

    // Handle different payment states
    if (moruResponse.code === "0000" && moruResponse.data.state === "Completed") {
      return res.status(200).json({
        result: "CHARGE_SUCCESS",
        amount: payload.action.amount,
        pspReference: moruResponse.data.moru_txn_identifier,
        message: "Payment completed successfully",
      });
    } else if (moruResponse.data.state === "Pending") {
      // Payment is still pending
      return res.status(200).json({
        result: "CHARGE_ACTION_REQUIRED",
        amount: payload.action.amount,
        pspReference: moruResponse.data.moru_txn_identifier,
        message: "Payment is pending",
      });
    } else if (moruResponse.data.state === "Canceled") {
      // Payment was canceled
      return res.status(200).json({
        result: "CHARGE_FAILURE",
        amount: payload.action.amount,
        pspReference: moruResponse.data.moru_txn_identifier,
        message: "Payment was canceled by user",
      });
    } else {
      // Payment failed
      return res.status(200).json({
        result: "CHARGE_FAILURE",
        amount: payload.action.amount,
        pspReference: moruResponse.data.moru_txn_identifier,
        message: moruResponse.message || "Payment failed",
      });
    }
  } catch (error) {
    console.error("Error in transaction process session:", error);

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

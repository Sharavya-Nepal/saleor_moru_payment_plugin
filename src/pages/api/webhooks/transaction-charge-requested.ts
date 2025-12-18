import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { TransactionChargeRequestedPayloadFragment } from "../../../../generated/graphql";
import { getMoruService } from "../../../lib/moru-payment-service";
import { gql } from "urql";

const TransactionChargeRequestedPayload = gql`
  fragment TransactionChargeRequestedPayload on TransactionChargeRequested {
    action {
      amount
      currency
      actionType
    }
    transaction {
      id
      pspReference
      chargedAmount {
        amount
        currency
      }
    }
  }
`;

const TransactionChargeRequestedSubscription = gql`
  ${TransactionChargeRequestedPayload}
  subscription TransactionChargeRequested {
    event {
      ...TransactionChargeRequestedPayload
    }
  }
`;

export const transactionChargeRequestedWebhook =
  new SaleorSyncWebhook<TransactionChargeRequestedPayloadFragment>({
    name: "Transaction Charge Requested",
    webhookPath: "/api/webhooks/transaction-charge-requested",
    event: "TRANSACTION_CHARGE_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionChargeRequestedSubscription,
  });

export default transactionChargeRequestedWebhook.createHandler(async (req, res, ctx) => {
  const { payload } = ctx;

  console.log("Transaction Charge Requested:", {
    amount: payload.action.amount,
    currency: payload.action.currency,
    pspReference: payload.transaction?.pspReference,
  });

  try {
    const moruService = getMoruService();

    const transactionId = payload.transaction?.pspReference;
    if (!transactionId) {
      throw new Error("Transaction PSP reference not found");
    }

    // Check payment status (Moru doesn't support separate charge operation)
    const moruResponse = await moruService.checkPaymentStatus({
      transaction_id: transactionId,
    });

    if (moruResponse.code === "0000" && moruResponse.data.state === "Completed") {
      return res.status(200).json({
        result: "CHARGE_SUCCESS",
        amount: payload.action.amount,
        pspReference: moruResponse.data.moru_txn_identifier,
      });
    } else {
      return res.status(200).json({
        result: "CHARGE_FAILURE",
        amount: payload.action.amount,
        pspReference: moruResponse.data.moru_txn_identifier,
        message: moruResponse.message || "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error in transaction charge requested:", error);

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

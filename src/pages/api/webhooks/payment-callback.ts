import { NextApiRequest, NextApiResponse } from "next";
import { getMoruService } from "../../../lib/moru-payment-service";

/**
 * Moru Payment Gateway Callback Handler
 * This endpoint receives callbacks from Moru after payment completion
 * 
 * Callback format: ?state=Pending&transaction_id=txn3&moru_txn_identifier=xxx
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { state, transaction_id, moru_txn_identifier, checkout } = req.query;

  console.log("Moru payment callback received:", {
    state,
    transaction_id,
    moru_txn_identifier,
    checkout,
  });

  try {
    if (!transaction_id) {
      throw new Error("Transaction ID is required");
    }

    // Verify payment status with Moru
    const moruService = getMoruService();
    const statusResponse = await moruService.checkPaymentStatus({
      transaction_id: transaction_id as string,
    });

    console.log("Payment status check result:", statusResponse);

    // Redirect user to appropriate page based on payment status
    const paymentStatus = statusResponse.data.state;

    // Get the storefront URL from environment variables
    const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";

    // Build redirect URL with checkout ID if available, and add query params for transaction_id and status

    // Build redirect URL with /status/{status}/ and query params for state and transaction_id
    const buildRedirectUrl = (status: string) => {
      let url;
      if (checkout) {
        url = `${storefrontUrl}/checkout/${encodeURIComponent(checkout as string)}/status/${status}/`;
      } else {
        url = `${storefrontUrl}/status/${status}/`;
      }
      const params = new URLSearchParams();
      if (typeof state === 'string') params.set('state', state);
      if (transaction_id) params.set('transaction_id', transaction_id as string);
      return params.toString() ? `${url}?${params.toString()}` : url;
    };

    if (paymentStatus === "Completed") {
      // Payment successful - redirect back to storefront to complete checkout
      res.redirect(buildRedirectUrl('success'));
      return;
    } else if (paymentStatus === "Pending") {
      res.redirect(buildRedirectUrl('pending'));
      return;
    } else if (paymentStatus === "Canceled") {
      res.redirect(buildRedirectUrl('canceled'));
      return;
    } else {
      res.redirect(buildRedirectUrl('error'));
      return;
    }
  } catch (error) {
    console.error("Error processing payment callback:", error);

    // Redirect to storefront with error
    const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";

    if (checkout) {
      res.redirect(`${storefrontUrl}/checkout/${encodeURIComponent(checkout as string)}/payment/error/`);
    } else {
      res.redirect(`${storefrontUrl}/payment/error/`);
    }
    return;
  }
}

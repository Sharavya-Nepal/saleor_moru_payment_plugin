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

    // Build redirect URL with checkout ID if available
    const buildRedirectUrl = (status: string) => {
      const params = new URLSearchParams({
        payment: status,
        transaction_id: transaction_id as string,
      });
      
      if (checkout) {
        params.append('checkout', checkout as string);
      }
      
      return `${storefrontUrl}/checkout?${params.toString()}`;
    };

    // You can customize these redirect URLs based on your frontend
    if (paymentStatus === "Completed") {
      // Payment successful - redirect back to storefront to complete checkout
      // The storefront will call transactionProcess and checkoutComplete mutations
      res.redirect(buildRedirectUrl('success'));
      return;
    } else if (paymentStatus === "Pending") {
      // Payment pending - redirect to storefront
      res.redirect(buildRedirectUrl('pending'));
      return;
    } else if (paymentStatus === "Canceled") {
      // Payment canceled - redirect to storefront
      res.redirect(buildRedirectUrl('canceled'));
      return;
    } else {
      // Unknown payment status - redirect with error
      res.redirect(buildRedirectUrl('error'));
      return;
    }
  } catch (error) {
    console.error("Error processing payment callback:", error);
    
    // Redirect to storefront with error
    const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";
    
    const params = new URLSearchParams({
      payment: 'error',
      transaction_id: (transaction_id as string) || 'unknown',
      error: error instanceof Error ? error.message : "Unknown error"
    });
    
    if (checkout) {
      params.append('checkout', checkout as string);
    }
    
    res.redirect(`${storefrontUrl}/checkout?${params.toString()}`);
    return;
  }
}

import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function PaymentError() {
  const router = useRouter();
  const { transaction_id, error } = router.query;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "64px",
              color: "#dc2626",
              marginBottom: "20px",
            }}
          >
            ⚠
          </div>
          <h1 style={{ color: "#dc2626" }}>Payment Error</h1>
          <p style={{ fontSize: "18px", marginTop: "20px" }}>
            An error occurred while processing your payment.
          </p>
          {error && (
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                marginTop: "10px",
                maxWidth: "600px",
                margin: "10px auto",
              }}
            >
              Error: {error}
            </p>
          )}
          {transaction_id && transaction_id !== "unknown" && (
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              Transaction ID: {transaction_id}
            </p>
          )}
          <p style={{ fontSize: "16px", marginTop: "30px" }}>
            Please try again or contact our support team if you need assistance.
          </p>
          <button
            onClick={() => {
              window.location.href =
                process.env.NEXT_PUBLIC_STOREFRONT_URL || "/";
            }}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Return to Shop
          </button>
        </div>
      </main>
    </div>
  );
}

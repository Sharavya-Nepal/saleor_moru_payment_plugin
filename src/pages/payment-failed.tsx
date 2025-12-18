import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function PaymentFailed() {
  const router = useRouter();
  const { transaction_id, status: _status } = router.query;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "64px",
              color: "#ef4444",
              marginBottom: "20px",
            }}
          >
            ✕
          </div>
          <h1 style={{ color: "#ef4444" }}>Payment Failed</h1>
          <p style={{ fontSize: "18px", marginTop: "20px" }}>
            Unfortunately, your payment could not be processed.
          </p>
          {transaction_id && (
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              Transaction ID: {transaction_id}
            </p>
          )}
          <p style={{ fontSize: "16px", marginTop: "30px" }}>
            Please try again or contact support if the problem persists.
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

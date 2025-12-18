import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function PaymentCanceled() {
  const router = useRouter();
  const { transaction_id, status: _status } = router.query;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "64px",
              color: "#6b7280",
              marginBottom: "20px",
            }}
          >
            ⊘
          </div>
          <h1 style={{ color: "#6b7280" }}>Payment Canceled</h1>
          <p style={{ fontSize: "18px", marginTop: "20px" }}>
            Your payment has been canceled.
          </p>
          {transaction_id && (
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              Transaction ID: {transaction_id}
            </p>
          )}
          <p style={{ fontSize: "16px", marginTop: "30px" }}>
            No charges have been made to your account.
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

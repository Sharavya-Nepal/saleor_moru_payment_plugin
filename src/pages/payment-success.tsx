import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

export default function PaymentSuccess() {
  const router = useRouter();
  const { transaction_id, status: _status } = router.query;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirect to storefront after countdown
          window.location.href = process.env.NEXT_PUBLIC_STOREFRONT_URL || "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "64px",
              color: "#22c55e",
              marginBottom: "20px",
            }}
          >
            ✓
          </div>
          <h1 style={{ color: "#22c55e" }}>Payment Successful!</h1>
          <p style={{ fontSize: "18px", marginTop: "20px" }}>
            Your payment has been processed successfully.
          </p>
          {transaction_id && (
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              Transaction ID: {transaction_id}
            </p>
          )}
          <p style={{ fontSize: "16px", marginTop: "30px" }}>
            Redirecting you to the storefront in {countdown} seconds...
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
            Return to Shop Now
          </button>
        </div>
      </main>
    </div>
  );
}

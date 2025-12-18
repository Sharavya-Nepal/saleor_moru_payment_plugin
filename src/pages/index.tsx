import Head from "next/head";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>Moru Payment App for Saleor</title>
        <meta name="description" content="Saleor Payment App for Moru Payment Wallet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Moru Payment App</h1>
          <p className={styles.description}>
            Saleor Payment App for Moru Payment Wallet integration
          </p>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2>Features</h2>
              <ul>
                <li>✓ Transaction initialization</li>
                <li>✓ Payment processing</li>
                <li>✓ Charge/capture payments</li>
                <li>✓ Refund support</li>
                <li>✓ Cancel transactions</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h2>Status</h2>
              <p>App is installed and ready to process payments</p>
              <p className={styles.badge}>Active</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

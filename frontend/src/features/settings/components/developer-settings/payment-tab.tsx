"use client";

import type { PaymentData } from "./developer-settings-types";
import styles from "./developer-settings.module.css";

const BILLING_SUMMARY = [
  { label: "Total Earned", value: "$12,400", icon: "dollar-sign", color: "#5BC8A0" },
  { label: "Pending Payout", value: "$1,800", icon: "hourglass-half", color: "#C4973A" },
  { label: "Last Payment", value: "$3,200", icon: "check-circle", color: "#7C5CBF" },
];

export function PaymentTab({
  payData,
  onChangePayData,
  paySaved,
  onSave,
}: {
  payData: PaymentData;
  onChangePayData: (patch: Partial<PaymentData>) => void;
  paySaved: boolean;
  onSave: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>
          <i className="fas fa-credit-card" /> Payment &amp; Billing
        </span>
      </div>

      <div className={styles.sectionDivider}>Payment Method</div>
      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label>Preferred Method</label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["bank", "paypal", "stripe"].map((m) => (
              <button
                key={m}
                onClick={() => onChangePayData({ method: m })}
                style={{
                  padding: "0.5rem 1.2rem",
                  borderRadius: "8px",
                  border: `1.5px solid ${payData.method === m ? "#5BC8A0" : "rgba(255,255,255,0.08)"}`,
                  background:
                    payData.method === m ? "rgba(91,200,160,0.12)" : "rgba(255,255,255,0.03)",
                  color: payData.method === m ? "#5BC8A0" : "#a0a0a0",
                  fontWeight: payData.method === m ? 700 : 400,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                <i
                  className={`fas fa-${m === "bank" ? "university" : m === "paypal" ? "paypal" : "credit-card"}`}
                  style={{ marginRight: "0.4rem" }}
                />
                {m === "bank" ? "Bank Transfer" : m === "paypal" ? "PayPal" : "Stripe"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {payData.method === "bank" && (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Account Name</label>
            <input
              type="text"
              value={payData.accountName}
              onChange={(e) => onChangePayData({ accountName: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Account Number</label>
            <input
              type="text"
              value={payData.accountNumber}
              onChange={(e) => onChangePayData({ accountNumber: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Bank Name</label>
            <input
              type="text"
              value={payData.bankName}
              onChange={(e) => onChangePayData({ bankName: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Currency</label>
            <select
              value={payData.currency}
              onChange={(e) => onChangePayData({ currency: e.target.value })}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>PKR</option>
            </select>
          </div>
        </div>
      )}

      {payData.method === "paypal" && (
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label>PayPal Email</label>
            <input
              type="email"
              value={payData.paypal}
              onChange={(e) => onChangePayData({ paypal: e.target.value })}
            />
          </div>
        </div>
      )}

      {payData.method === "stripe" && (
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label>Stripe Account Email</label>
            <input type="email" placeholder="your@email.com" />
          </div>
        </div>
      )}

      <div className={styles.sectionDivider}>Billing Summary</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {BILLING_SUMMARY.map((item) => (
          <div
            key={item.label}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "1rem 1.2rem",
            }}
          >
            <div style={{ color: "#666", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
              <i
                className={`fas fa-${item.icon}`}
                style={{ marginRight: "0.4rem", color: item.color }}
              />
              {item.label}
            </div>
            <div style={{ color: item.color, fontSize: "1.4rem", fontWeight: 700 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cardFooter}>
        <button
          className={`${styles.saveBtn} ${paySaved ? styles.saveBtnSaved : ""}`}
          onClick={onSave}
        >
          {paySaved ? (
            <>
              <i className="fas fa-check" /> Saved!
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Save Payment Info
            </>
          )}
        </button>
      </div>
    </div>
  );
}

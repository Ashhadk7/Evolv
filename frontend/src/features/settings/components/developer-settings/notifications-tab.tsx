"use client";

import type { DeveloperNotificationPrefs } from "@/features/settings/data/developer-settings-data";
import styles from "./developer-settings.module.css";

const NOTIFICATION_ITEMS: Record<keyof DeveloperNotificationPrefs, { label: string; sub: string }> =
  {
    newMatch: {
      label: "New AI Match Found",
      sub: "Get notified when our AI finds a new startup match for you",
    },
    applicationUpdate: {
      label: "Application Status Update",
      sub: "When your application is accepted or moved forward",
    },
    blueprintPublished: {
      label: "New Blueprint Published",
      sub: "When a founder publishes a public blueprint in Discover",
    },
    connectionRequest: {
      label: "New Connection Request",
      sub: "When someone sends you a connection or message request",
    },
    connectionAccepted: {
      label: "Connection Accepted",
      sub: "When someone accepts your connection request",
    },
    messageReceived: {
      label: "New Message Received",
      sub: "When founders or developers message you",
    },
    weeklyDigest: {
      label: "Weekly Digest",
      sub: "A summary of your activity and new opportunities every Monday",
    },
    founderViewed: {
      label: "Profile Viewed by Founder",
      sub: "When a founder views your developer profile",
    },
    marketingEmails: {
      label: "Marketing & Product Updates",
      sub: "News, tips, and announcements from Evolv",
    },
    sound: {
      label: "Notification Sound",
      sub: "Play a short sound when a new notification arrives",
    },
  };

export function NotificationsTab({
  notifications,
  onToggle,
  saved,
  onSave,
}: {
  notifications: DeveloperNotificationPrefs;
  onToggle: (key: keyof DeveloperNotificationPrefs) => void;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>
          <i className="fas fa-bell" /> Notification Preferences
        </span>
      </div>
      <div className={styles.notifList}>
        {(
          Object.entries(NOTIFICATION_ITEMS) as [
            keyof DeveloperNotificationPrefs,
            { label: string; sub: string },
          ][]
        ).map(([key, { label, sub }]) => (
          <div key={key} className={styles.notifItem}>
            <div>
              <div className={styles.notifLabel}>{label}</div>
              <div className={styles.notifSub}>{sub}</div>
            </div>
            <div
              className={`${styles.toggle} ${notifications[key] ? styles.toggleOn : ""}`}
              onClick={() => onToggle(key)}
            >
              <div className={styles.toggleKnob} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.cardFooter}>
        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ""}`}
          onClick={onSave}
        >
          {saved ? (
            <>
              <i className="fas fa-check" /> Saved!
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}

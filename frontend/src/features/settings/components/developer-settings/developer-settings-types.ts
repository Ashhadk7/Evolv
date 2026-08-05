export type SettingsTab = "profile" | "payment" | "notifications" | "security";

export type PaymentData = {
  method: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  paypal: string;
};

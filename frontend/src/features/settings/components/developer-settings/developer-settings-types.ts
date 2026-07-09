export type SettingsTab = "profile" | "payment" | "notifications" | "security" | "preferences";

export type PaymentData = {
  method: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  paypal: string;
};

export type PasswordData = {
  current: string;
  newPass: string;
  confirm: string;
};

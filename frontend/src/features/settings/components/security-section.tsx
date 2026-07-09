"use client";

import { useState } from "react";
import { Check, LockKey, ShieldCheck } from "@phosphor-icons/react";
import { MID, TEXT_BODY, TEXT_MUTED } from "@/features/settings/lib/settings-theme";
import { Field } from "./field";

export function SecuritySection() {
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  const save = () => {
    setSaved(true);
    setPasswords({ current: "", next: "", confirm: "" });
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="flex flex-col gap-6">
      <section
        className="max-w-2xl bg-white p-6 sm:p-8"
        style={{
          border: "1.5px solid #d4e4db",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(26,49,44,0.04)",
        }}
      >
        <div className="mb-6 flex items-center gap-2">
          <LockKey size={18} weight="bold" style={{ color: MID }} />
          <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>
            Security Settings
          </h4>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>
                  Current Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link sent to your email.")}
                  className="cursor-pointer text-[11px] font-bold transition-colors hover:text-[#2e7d5c]"
                  style={{ color: "#428475", background: "none", border: "none", padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords((current) => ({ ...current, current: e.target.value }))
                }
                placeholder="Enter current password"
                className="w-full rounded-lg px-4 py-2.5 text-[13px] transition outline-none focus:border-[#428475] focus:ring-2 focus:ring-[#89d7b7]/30"
                style={{ background: "#f8faf8", border: "1px solid #d4e4db", color: "#1a2e26" }}
              />
            </div>
          </div>

          <Field
            label="New Password"
            type="password"
            value={passwords.next}
            onChange={(value) => setPasswords((current) => ({ ...current, next: value }))}
            placeholder="Enter new password"
          />

          <Field
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={(value) => setPasswords((current) => ({ ...current, confirm: value }))}
            placeholder="Confirm new password"
          />
        </div>

        <div
          className="flex items-start gap-3 rounded-lg px-4 py-3.5"
          style={{ background: "#f8faf8", border: "1px solid #edf1ee", marginTop: 24 }}
        >
          <ShieldCheck size={16} weight="bold" style={{ color: MID, marginTop: 1 }} />
          <p className="text-[11.5px] leading-5" style={{ color: TEXT_MUTED }}>
            Protect your founder workspace, saved blueprints, activity logs, and team conversations.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          className="bp-gradient-btn flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-6 text-[13px] font-extrabold transition-all hover:opacity-90 active:scale-95"
          style={{ marginTop: 24 }}
        >
          <Check size={15} weight="bold" />
          {saved ? "Password Updated" : "Update Password"}
        </button>
      </section>
    </div>
  );
}

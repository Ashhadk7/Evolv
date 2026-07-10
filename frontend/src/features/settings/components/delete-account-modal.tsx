"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { clearAllUserData } from "@/features/auth/lib/session";
import { deleteAccount } from "@/features/settings/lib/account-api";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  const handleDelete = async () => {
    setError("");
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount(password);
      clearAllUserData();
      window.location.href = "/sign-in";
    } catch (err) {
      setError(getApiErrorMessage(err));
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 id="delete-account-title" className="text-[16px] font-extrabold text-[#1a2e26]">
          Delete account
        </h3>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[#5b6f66]">
          This permanently deletes your account, profile, messages, and all related data. This
          action cannot be undone. Enter your current password to confirm.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-600"
          >
            {error}
          </p>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Current password"
          aria-label="Current password"
          className="mt-4 w-full rounded-lg border border-[#d4e4db] bg-[#f8faf8] px-4 py-2.5 text-[13px] text-[#1a2e26] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#89d7b7]/30"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="h-10 rounded-lg border border-[#d4e4db] bg-white px-4 text-[13px] font-bold text-[#5b6f66] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || !password}
            className="h-10 rounded-lg bg-[#e02424] px-4 text-[13px] font-bold text-white transition hover:bg-[#c81e1e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}
